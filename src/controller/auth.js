import Joi from 'joi';
import jwt from 'jsonwebtoken';
import User from '../models/user';

export const register = async (req, res, next) => {
  // 입력 데이터 검증을 위한 Joi 스키마 정의
  const schema = Joi.object({
    userNum: Joi.string().required(),
    nick: Joi.string().min(1).max(10).required(),
    age: Joi.number().integer().min(0).required(),
    gender: Joi.string().valid('MALE', 'FEMALE', 'OTHER').required(), // 특정 값만 허용
    job: Joi.string()
      .valid('STUDENT', 'HOUSEWIFE', 'WORKER', 'PROFESSIONAL', 'OTHER')
      .required(),
    favorite: Joi.array().items(Joi.string().min(1).max(30)).max(3),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const { userNum, nick, age, gender, job, favorite } = req.body;

  try {
    let exists = await User.findOne({ userNum });
    if (exists) {
      return res.status(409).json({ error: '이미 가입된 회원입니다.' });
    }

    exists = await User.findOne({ nick });
    if (exists) {
      return res.status(409).json({ error: '이미 존재하는 닉네임입니다.' });
    }

    const newUser = new User({ userNum, nick, age, gender, job, favorite });
    await newUser.save();

    const token = jwt.sign({ userNum }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    // 응답 반환
    return res.status(200).json({ token });
  } catch (e) {
    // 에러 처리
    return res.status(500).json({ error: e.message });
  }
};

export const checkNickname = async (req, res, next) => {
  const schema = Joi.object({
    nick: Joi.string().min(1).max(10).required(),
  });

  const { error } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const { nick } = req.body;

  try {
    const exist = await User.findOne({ nick });

    if (exist) {
      return res.status(409).json({ error: '이미 존재하는 닉네임입니다.' });
    }

    return res.status(200).json({ message: '사용가능한 닉네임입니다.' });
  } catch (error) {
    console.error('Error occurred while checking nickname:', error);
    return res.status(500).json({ error: '[서버오류] 관리자에게 문의하세요.' });
  }
};
