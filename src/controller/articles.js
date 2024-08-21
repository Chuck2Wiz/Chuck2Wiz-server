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
    res.status(201).json({ message: '게시글이 정상적으로 등록되었습니다.' });
  } catch (e) {
    return res.status(500).json({ error: '[서버오류] 관리자에게 문의하세요.' });
  }
};

export const updatedArticle = async (req, res, next) => {
  const { articleId } = req.params;

  const schema = Joi.object({
    title: Joi.string().min(1).required(),
    content: Joi.string().min(1).required(),
    userNum: Joi.string().required(),
  });

  const { error } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const { title, content, userNum } = req.body;

  try {
    const post = await Post.findById(articleId);

    if (!post) {
      return res.status(404).json({ error: '게시글을 찾을 수 없습니다' });
    }

    if (post.author.userNum !== userNum) {
      return res.status(403).json({ error: '권한이 없습니다.' });
    }

    post.title = title || post.title;
    post.content = content || post.content;

    await post.save();

    res.status(200).json({
      message: '게시글이 성공적으로 수정되었습니다.',
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      error: '[서버오류] 게시글 수정에 실패했습니다. 관리자에게 문의하세요.',
    });
  }
};

export const getArticles = async (req, res, next) => {
  const { page = 1 } = req.params;
  const limit = 10;

  const schema = Joi.object({
    userNum: Joi.string().required(),
  });

  const { error } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const { userNum } = req.body;

  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * 10)
      .limit(limit)
      .exec();

    const totalPosts = await Post.countDocuments();

    const sanitizedPosts = posts.map((post) => ({
      _id: post._id,
      title: post.title,
      content: post.content,
      author: {
        nick: post.author.nick,
      },
      likes: post.likes,
      comments: post.comments,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      isMyArticle: post.author.userNum === userNum, // 현재 사용자가 작성자인지 여부
    }));

    res.status(200).json({
      message: '게시글이 정상적으로 조회되었습니다',
      sanitizedPosts,
      currentPage: page,
      totalPage: Math.ceil(totalPosts / limit),
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      error: '[서버오류] 게시글 조회에 실패했습니다. 관리자에게 문의하세요',
    });
  }
};

export const deleteArticle = async (req, res, next) => {
  const { articleId } = req.params;

  const schema = Joi.object({
    userNum: Joi.string().required(),
  });

  const { error } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const { userNum } = req.body;

  try {
    const post = await Post.findById(articleId);

    if (post.author.userNum !== userNum) {
      return res.status(403).json({ error: '권한이 없습니다.' });
    }

    await post.remove();
    res.status(200).json({ message: '게시글이 성공적으로 삭제되었습니다.' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: '[서버오류] 관리자에게 문의하세요.' });
  }
};
