import Joi, { number } from 'joi';
import Post from '../models/post';

export const createArticle = async (req, res, next) => {
  const schema = Joi.object({
    title: Joi.string().min(1).required(),
    content: Joi.string().min(1).required(),
    author: Joi.object({
      userNum: Joi.string().required(),
      nick: Joi.string().required(),
    }).required(),
  });

  const { error } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const { title, content, author } = req.body;

  try {
    const newArticle = new Post({ title, content, author });

    await newArticle.save();
    res.status(200).json({ message: '게시글이 정상적으로 등록되었습니다.' });
  } catch (e) {
    return res.status(500).json({ error: '[서버오류] 관리자에게 문의하세요.' });
  }
};
