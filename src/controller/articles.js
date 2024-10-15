import Joi, { valid } from 'joi';
import Post from '../models/post';
import { handleError, validate } from './common/errorhandle';
import { baseResponse } from './common/baseResponse';
import mongoose from 'mongoose';

export const createArticle = async (req, res, next) => {
  const schema = Joi.object({
    title: Joi.string().min(1).required(),
    content: Joi.string().min(1).required(),
    author: Joi.object({
      userNum: Joi.string().required(),
      nick: Joi.string().required(),
    }).required(),
  });

  const { error } = validate(schema, req.body) || {};
  if (error) return baseResponse(res, false, error);

  const { title, content, author } = req.body;

  try {
    const newArticle = new Post({ title, content, author });
    await newArticle.save();
    return baseResponse(res, true, '게시글이 정상적으로 등록되었습니다.');
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

  const { error } = validate(schema, req.params) || {};
  if (error) return baseResponse(res, false, { error });

  const { title, content, userNum } = req.body;

  try {
    const post = await Post.findById(articleId);

    if (!post) {
      return baseResponse(res, false, '게시글을 찾을 수 없습니다.');
    }

    if (post.author.userNum !== userNum) {
      return baseResponse(res, false, '권한이 없습니다.');
    }

    post.title = title || post.title;
    post.content = content || post.content;

    await post.save();
    return baseResponse(res, true, '게시글이 성공적으로 수정되었습니다.');
  } catch (e) {
    console.error(e);
    return handleError(res, e);
  }
};

export const getArticles = async (req, res, next) => {
  const { page = 1 } = req.params;
  const { userNum } = req.params;
  const limit = 10;

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
        id: post.id,
        title: post.title,
        content: post.content,
        author: {
          nick: post.author.nick,
        },
        likes: post.likes.length,
        isLikedByUser: userLiked,
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
        isMyArticle: post.author.userNum === userNum,
      };
    });

    return baseResponse(res, true, '게시글이 정상적으로 조회되었습니다.', {
      sanitizedPosts: sanitizedPosts,
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

  const { error } = validate(schema, req.params) || {};
  if (error) return baseResponse(res, false, error);

  const { userNum } = req.body;

  try {
    const post = await Post.findById(articleId);

    if (post.author.userNum !== userNum) {
      return baseResponse(res, false, '권한이 없습니다.');
    }

    await post.remove();
    return baseResponse(res, true, '게시글이 성공적으로 삭제되었습니다.');
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

  const { error } = validate(schema, req.params) || {};
  if (error) return baseResponse(res, false, error);

  try {
    const post = await Post.findById(articleId);
    const { userNum } = req.body;

    if (!post) {
      return baseResponse(res, false, '게시글을 찾을 수 없습니다.');
    }

    const hasLiked = post.likes.some((like) => like.userNum === userNum);

    if (hasLiked) {
      return baseResponse(res, false, '이미 좋아요를 누른 게시글입니다.');
    }

    post.likes.push({ userNum });
    await post.save();

    return baseResponse(res, true, '게시글에 좋아요가 적용되었습니다.');
  } catch (e) {
    console.error(e);
    return handleError(res, e);
  }
};

export const unlikeArticle = async (req, res, next) => {
  const { articleId } = req.params;
  const schema = Joi.object({
    userNum: Joi.string().required(),
  });

  const { error } = validate(schema, req.params) || {};
  if (error) return baseResponse(res, false, error);

  try {
    const { userNum } = req.body;
    const post = await Post.findById(articleId);

    const likeIndex = post.likes.findIndex((like) => like.userNum === userNum);
    if (likeIndex === -1) {
      return baseResponse(res, false, '좋아요를 누르지 않은 게시글입니다.');
    }

    post.likes.splice(likeIndex, 1);
    await post.save();
    return baseResponse(res, true, '좋아요가 취소되었습니다.');
  } catch (e) {
    console.error(e);
    return handleError(res, e);
  }
};

export const getArticle = async (req, res, next) => {
  const { articleId, userNum } = req.params;

  if (!mongoose.Types.ObjectId.isValid(articleId)) {
    return baseResponse(res, false, '유효하지 않은 게시글 ID입니다.');
  }

  try {
    const post = await Post.findById(articleId)
      .populate({
        path: 'comments',
        populate: {
          path: 'replies',
          model: 'Comment',
        },
      })
      .exec();

    if (!post) {
      return baseResponse(res, false, '게시글을 찾을 수 없습니다.');
    }

    const userLiked = post.likes.some((like) => like.userNum === userNum);

    const sanitizedPost = {
      id: post._id,
      title: post.title,
      content: post.content,
      author: {
        nick: post.author.nick,
      },
      likes: post.likes.length,
      isLikedByUser: userLiked,
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
      isMyArticle: post.author.userNum === userNum,
    };

    return baseResponse(
      res,
      true,
      '게시글이 정상적으로 조회되었습니다.',
      sanitizedPost
    );
  } catch (e) {
    console.error(e);
    return handleError(res, e);
  }
};

export const getArticleByUser = async (req, res, next) => {
  const { userNum } = req.params;
  const { page = 1 } = req.query; // 페이지네이션을 위한 page 매개변수
  const limit = 10; // 한 페이지당 10개의 게시글 조회

  try {
    // userNum을 기반으로 게시글 조회
    const posts = await Post.find({ 'author.userNum': userNum })
      .sort({ createdAt: -1 }) // 최신순 정렬
      .skip((page - 1) * limit) // 페이지네이션 처리
      .limit(limit) // 한 번에 보여줄 게시글 수 제한
      .populate({
        path: 'comments',
        populate: {
          path: 'replies',
          model: 'Comment',
        },
      })
      .exec();

    const totalPosts = await Post.countDocuments({ 'author.userNum': userNum }); // 총 게시글 수

    const sanitizedPosts = posts.map((post) => ({
      id: post._id,
      title: post.title,
      content: post.content,
      author: {
        nick: post.author.nick,
      },
      likes: post.likes.length,
      comments: post.comments.map((comment) => ({
        ...comment.toObject(),
        author: {
          nick: comment.author.nick,
        },
        replies: comment.replies.map((reply) => ({
          ...reply.toObject(),
          author: {
            nick: reply.author.nick,
          },
        })),
      })),
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    }));

    return baseResponse(res, true, '게시글이 정상적으로 조회되었습니다.', {
      posts: sanitizedPosts,
      currentPage: page,
      totalPages: Math.ceil(totalPosts / limit),
    });
  } catch (e) {
    console.error(e);
    return handleError(res, e);
  }
};
