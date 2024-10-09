import Joi from 'joi';
import Post from '../models/post';
import Comment from '../models/comment';
import { handleError, validate } from './common/errorhandle';

export const createComment = async (req, res, next) => {
  const schema = Joi.object({
    postId: Joi.string().required(),
    author: Joi.object({
      userNum: Joi.string().required(),
      nick: Joi.string().required(),
    }).required(),
    content: Joi.string().min(1).required(),
  });

  const { error } = validate(schema, req.body) || {};
  if (error)
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message, data: null });

  const { postId, author, content } = req.body;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res
        .status(404)
        .json({
          success: false,
          message: '게시글을 찾을 수 없습니다.',
          data: null,
        });
    }

    const comment = new Comment({ postId, author, content, replies: [] });
    await comment.save();

    post.comments.push(comment._id);
    await post.save();

    return res
      .status(201)
      .json({
        success: true,
        message: '댓글이 정상적으로 등록되었습니다.',
        data: { comment },
      });
  } catch (e) {
    console.error(e);
    return res
      .status(500)
      .json({
        success: false,
        message: '서버 오류가 발생했습니다.',
        data: null,
      });
  }
};

export const createReplies = async (req, res, next) => {
  const { commentId } = req.params;
  const schema = Joi.object({
    author: Joi.object({
      userNum: Joi.string().required(),
      nick: Joi.string().required(),
    }).required(),
    content: Joi.string().min(1).required(),
  });

  const { error } = validate(schema, req.body) || {};
  if (error)
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message, data: null });

  try {
    const parentComment = await Comment.findById(commentId);
    if (!parentComment) {
      return res
        .status(404)
        .json({
          success: false,
          message: '댓글을 찾을 수 없습니다.',
          data: null,
        });
    }

    const { author, content } = req.body;

    const reply = new Comment({
      postId: parentComment.postId,
      author,
      content,
      replies: [],
    });

    await reply.save();

    parentComment.replies.push(reply._id);
    await parentComment.save();

    return res
      .status(201)
      .json({
        success: true,
        message: '답글이 성공적으로 등록되었습니다.',
        data: { reply },
      });
  } catch (e) {
    console.error(e);
    return res
      .status(500)
      .json({
        success: false,
        message: '서버 오류가 발생했습니다.',
        data: null,
      });
  }
};

export const deleteComment = async (req, res, next) => {
  const { commentId } = req.params;
  const schema = Joi.object({
    userNum: Joi.string().required(),
  });

  const { error } = validate(schema, req.body) || {};
  if (error)
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message, data: null });

  const { userNum } = req.body;

  try {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res
        .status(404)
        .json({
          success: false,
          message: '댓글을 찾을 수 없습니다.',
          data: null,
        });
    }

    if (comment.author.userNum !== userNum) {
      return res
        .status(403)
        .json({ success: false, message: '권한이 없습니다.', data: null });
    }

    if (comment.replies.length > 0) {
      comment.content = '삭제된 댓글입니다';
      await comment.save();
      return res
        .status(200)
        .json({
          success: true,
          message: '댓글이 삭제상태가 되었습니다.',
          data: { comment },
        });
    } else {
      await comment.remove();
      return res
        .status(200)
        .json({
          success: true,
          message: '댓글이 정상적으로 삭제되었습니다.',
          data: null,
        });
    }
  } catch (e) {
    console.error(e);
    return res
      .status(500)
      .json({
        success: false,
        message: '서버 오류가 발생했습니다.',
        data: null,
      });
  }
};

export const updateComment = async (req, res, next) => {
  const { commentId } = req.params;
  const schema = Joi.object({
    userNum: Joi.string().required(),
    content: Joi.string().min(1).required(),
  });

  const { error } = validate(schema, req.body) || {};
  if (error)
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message, data: null });

  const { userNum, content } = req.body;

  try {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res
        .status(404)
        .json({
          success: false,
          message: '댓글을 찾을 수 없습니다.',
          data: null,
        });
    }

    if (comment.author.userNum !== userNum) {
      return res
        .status(403)
        .json({ success: false, message: '권한이 없습니다.', data: null });
    }

    comment.content = content || comment.content;
    await comment.save();

    return res
      .status(200)
      .json({
        success: true,
        message: '댓글이 성공적으로 수정되었습니다.',
        data: { comment },
      });
  } catch (e) {
    console.error(e);
    return res
      .status(500)
      .json({
        success: false,
        message: '서버 오류가 발생했습니다.',
        data: null,
      });
  }
};
