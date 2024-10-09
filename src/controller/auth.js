import Joi from 'joi';
import jwt from 'jsonwebtoken';
import User from '../models/user';
import { handleError } from './common/errorhandle';

export const register = async (req, res, next) => {
  const schema = Joi.object({
    userNum: Joi.string().required(),
    nick: Joi.string().min(1).max(10).required(),
    age: Joi.number().integer().min(0).required(),
    gender: Joi.string().valid('MALE', 'FEMALE', 'OTHER').required(),
    job: Joi.string()
      .valid('STUDENT', 'HOUSEWIFE', 'WORKER', 'PROFESSIONAL', 'OTHER')
      .required(),
    favorite: Joi.array()
      .items(
        Joi.string().valid(
          'TRAFFIC_ACCIDENT',
          'DEFAMATION',
          'RENTAL',
          'DIVORCE',
          'ASSAULT',
          'FRAUD',
          'SEX_CRIME',
          'COPYRIGHT'
        )
      )
      .max(3),
  });

  const { error } = schema.validate(req.body) || {};
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
      data: null,
    });
  }

  const { userNum, nick, age, gender, job, favorite } = req.body;

  try {
    let exists = await User.findOne({ userNum });
    if (exists) {
      return res.status(400).json({
        success: false,
        message: '이미 가입된 회원입니다.',
        data: { token: null },
      });
    }

    exists = await User.findOne({ nick });
    if (exists) {
      return res.status(400).json({
        success: false,
        message: '이미 존재하는 닉네임입니다.',
        data: { token: null },
      });
    }

    const newUser = new User({ userNum, nick, age, gender, job, favorite });
    await newUser.save();

    const token = generateToken(userNum);

    return res.status(200).json({
      success: true,
      message: '회원가입에 성공했습니다.',
      data: { token: token },
    });
  } catch (e) {
    return handleError(res, e);
  }
};

export const checkNickname = async (req, res, next) => {
  const schema = Joi.object({
    nickName: Joi.string().min(1).max(10).required(),
  });

  const { error } = schema.validate(req.params) || {};

  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
      data: null,
    });
  }

  const { nickName } = req.params;

  try {
    const exist = await User.findOne({ nick: nickName });

    if (exist) {
      return res.status(200).json({
        success: true,
        message: '이미 존재하는 닉네임입니다.',
        data: { exists: true },
      });
    }

    return res.status(200).json({
      success: true,
      message: '사용가능한 닉네임입니다.',
      data: { exists: false },
    });
  } catch (e) {
    return handleError(res, e);
  }
};

export const checkExistUser = async (req, res, next) => {
  const { userNum } = req.params;
  let message = '';
  let response = { exists: false, token: null };

  try {
    const exist = await User.findOne({ userNum });

    if (exist) {
      response.exists = true;

      if (req.headers.authorization) {
        const token = req.headers.authorization.split('Bearer ')[1];

        if (token === undefined) {
          response.token = jwt.sign({ userNum }, process.env.JWT_SECRET, {
            expiresIn: '7d',
          });
        } else {
          try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            const now = Math.floor(Date.now() / 1000);

            if (decoded.exp - now < 60 * 60 * 24) {
              response.token = generateToken(userNum);
            }
          } catch (e) {
            if (e.name === 'TokenExpiredError') {
              response.token = generateToken(userNum);
            } else {
              message = '[서버오류] 토큰 생성에 실패했습니다.';
              return res.status(500).json({
                success: false,
                message: message,
                data: { response },
              });
            }
          }
        }
      } else {
        response.token = generateToken(userNum);
      }
    }

    message = '유저정보 조회를 성공했습니다.';
    return res.status(200).json({
      success: true,
      message: message,
      data: { response },
    });
  } catch (e) {
    return handleError(res, e);
  }
};

export const getUserInfo = async (req, res, next) => {
  const { userNum } = req.params;

  try {
    if (userNum !== '') {
      const response = await User.findOne({ userNum: userNum });

      if (!response) {
        return res.status(400).json({
          success: false,
          message: '없는 회원입니다.',
          data: null,
        });
      }

      return res.status(200).json({
        success: true,
        message: '유저조회에 성공했습니다.',
        data: response,
      });
    }
  } catch (e) {
    return handleError(res, e);
  }
};

const generateToken = (userNum) => {
  return jwt.sign({ userNum }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};
