import Joi, { number } from 'joi';
import Post from '../models/post';
import { handleError, validate } from './common/errorhandle';

export const createArticle = async (req, res, next) => {
  const schema = Joi.object({
    title: Joi.string().min(1).required(),
    content: Joi.string().min(1).required(),
    author: Joi.object({
      userNum: Joi.string().required(),
      nick: Joi.string().required(),
    }).required(),
  });

  const { error } = validate(schema, req.body);
  if (error) return res.status(400).json({ error });

  const { title, content, author } = req.body;

  try {
    const newArticle = new Post({ title, content, author });

    await newArticle.save();
    res.status(201).json({ message: '게시글이 정상적으로 등록되었습니다.' });
  } catch (e) {
    return handleError(res, e);
  }
};

export const updatedArticle = async (req, res, next) => {
  const { articleId } = req.params;

  const schema = Joi.object({
    title: Joi.string().min(1).required(),
    content: Joi.string().min(1).required(),
    userNum: Joi.string().required(),
  });

  const { error } = validate(schema, req.body);
  if (error) return res.status(400).json({ error });

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
    return handleError(res, e);
  }
};

export const getArticles = async (req, res, next) => {
  const { page = 1 } = req.query;
  const limit = 10;

  const schema = Joi.object({
    userNum: Joi.string().required(),
  });

  const { error } = validate(schema, req.body);
  if (error) return res.status(400).json({ error });

  const { userNum } = req.body;

  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * 10)
      .limit(limit)
      .populate({
        path: 'comments',
        populate: {
          path: 'replies',
          model: 'Comment',
        },
      })
      .exec();

    const totalPosts = await Post.countDocuments();

    const sanitizedPosts = posts.map((post) => {
      const userLiked = post.likes.some((like) => like.userNum === userNum);

      return {
        _id: post._id,
        title: post.title,
        content: post.content,
        author: {
          nick: post.author.nick,
        },
        likes: post.likes.length,
        isLikedByUser: userLiked, // 현재 사용자가 좋아요를 눌렀는지 여부
        comments: post.comments.map((comment) => ({
          ...comment.toObject(),
          author: {
            nick: comment.author.nick,
          },
          isMyComment: comment.author.userNum === userNum,
          replies: comment.replies.map((reply) => ({
            ...reply.toObject(),
            author: {
              nick: reply.author.nick,
            },
            isMyReply: reply.author.userNum === userNum,
          })),
        })),
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        isMyArticle: post.author.userNum === userNum, // 현재 사용자가 작성자인지 여부
      };
    });

    res.status(200).json({
      message: '게시글이 정상적으로 조회되었습니다',
      sanitizedPosts,
      currentPage: page,
      totalPage: Math.ceil(totalPosts / limit),
    });
  } catch (e) {
    console.error(e);
    return handleError(res, e);
  }
};

export const deleteArticle = async (req, res, next) => {
  const { articleId } = req.params;

  const schema = Joi.object({
    userNum: Joi.string().required(),
  });

  const { error } = validate(schema, req.body);
  if (error) return res.status(400).json({ error });

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
    return handleError(res, e);
  }
};

export const likeArticle = async (req, res, next) => {
  const { articleId } = req.params;
  const schema = Joi.object({
    userNum: Joi.string().required(),
  });

  const { error } = validate(schema, req.body);
  if (error) return res.status(400).json({ error });

  try {
    const post = await Post.findById(articleId);
    const { userNum } = req.body;

    if (!post) {
      return res.status(404).json({ error: '게시글을 찾을 수 없습니다.' });
    }

    // 이미 좋아요를 누른 유저인지 확인
    const hasLiked = post.likes.some((like) => like.userNum === userNum);

    if (hasLiked) {
      return res.status(400).json({ error: '이미 좋아요를 눌렀습니다.' });
    }

    post.likes.push({ userNum });
    await post.save();
    res.status(200).json({ message: '좋아요가 추가되었습니다' });
  } catch (e) {
    console.error(e);
    return handleError(res, e);
  }
};

export const unlikeArticle = async (req, res, next) => {
  const { articleId } = req.params;
  const schema = Joi.object({
    nick: Joi.string().required(),
  });

  const { error } = validate(schema, req.body);
  if (error) return res.status(400).json({ error });

  try {
    const { userNum } = req.body;
    const post = await Post.findById(articleId);

    const likeIndex = post.likes.findIndex((like) => like.userNum === userNum);
    if (likeIndex === -1) {
      return res.status(400).json({ error: '좋아요를 누르지 않았습니다.' });
    }

    post.likes.splice(likeIndex, 1);
    await post.save();
    res.status(200).json({ message: '좋아요가 제거되었습니다.' });
  } catch (e) {
    return handleError(res, e);
  }
};
