import Joi, { number } from 'joi';
import jwt from 'jsonwebtoken';
import User from '../models/user';
import { validate } from './common/errorhandle';

export const register = async (req, res, next) => {
  const schema = Joi.object({
    userNum: Joi.string().required(),
    nick: Joi.string().min(1).max(10).required(),
    age: Joi.number().integer().min(0).required(),
    gender: Joi.string().valid('MALE', 'FEMALE', 'OTHER').required(),
    job: Joi.string()
      .valid('STUDENT', 'HOUSEWIFE', 'WORKER', 'PROFESSIONAL', 'OTHER')
      .required(),
    favorite: Joi.array().items(Joi.string().min(1).max(30)).max(3),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });
  }

  const { userNum, nick, age, gender, job, favorite } = req.body;

  try {
    let exists = await User.findOne({ userNum });
    if (exists) {
      return res
        .status(409)
        .json({ success: false, message: '이미 가입된 회원입니다.' });
    }

    exists = await User.findOne({ nick });
    if (exists) {
      return res
        .status(409)
        .json({ success: false, message: '이미 존재하는 닉네임입니다.' });
    }

    const newUser = new User({ userNum, nick, age, gender, job, favorite });
    await newUser.save();

    const token = generateToken(userNum);

    return res.status(200).json({ success: true, message: token });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
};

export const checkNickname = async (req, res, next) => {
  const schema = Joi.object({
    nickName: Joi.string().min(1).max(10).required(),
  });

  const { error } = schema.validate(req.params); // req.params로 변경

  if (error) {
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });
  }

  const { nickName } = req.params;

  try {
    const exist = await User.findOne({ nick: nickName });

    if (exist) {
      return res
        .status(200)
        .json({ success: true, message: '이미 존재하는 닉네임입니다.' });
    }

    return res
      .status(200)
      .json({ success: true, message: '사용가능한 닉네임입니다.' });
  } catch (error) {
    console.error('Error occurred while checking nickname:', error);
    return res
      .status(500)
      .json({ success: false, message: '[서버오류] 관리자에게 문의하세요.' });
  }
};

export const checkExistUser = async (req, res, next) => {
  const { userNum } = req.params;

  try {
    const exist = await User.findOne({ userNum });
    let response = { exists: false, token: null };

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
            const decoded = generateToken(userNum);

            const now = Math.floor(Date.now() / 1000);

            if (decoded.exp - now < 60 * 60 * 24) {
              response.token = generateToken(userNum);
            }
          } catch (e) {
            if (e.name === 'TokenExpiredError') {
              response.token = generateToken(userNum);
            } else {
              return res
                .status(401)
                .json({ success: false, message: 'Invalid token' });
            }
          }
        }
      } else {
        response.token = generateToken(userNum);
      }
    }

    res.status(200).json({ success: true, message: response });
  } catch (e) {
    console.error('Error occurred while checking user existence:', e);
    return res
      .status(500)
      .json({ success: false, message: '[서버오류] 관리자에게 문의하세요.' });
  }
};

const generateToken = ({ userNum }) => {
  return jwt.sign({ userNum }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};
