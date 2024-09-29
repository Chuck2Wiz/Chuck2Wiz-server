import Joi from 'joi';
import Post from '../models/post';
import Comment from '../models/comment';
import { handleError, validate } from './common/errorhandle';
import { baseResponse } from './common/baseResponse';

export const createComment = async (req, res, next) => {
  const schema = Joi.object({
    postId: Joi.string().required(),
    author: Joi.object({
      userNum: Joi.string().required(),
      nick: Joi.string().required(),
    }).required(),
    content: Joi.string().min(1).required(),
  });

  const { error } = validate(schema, req.body);
  if (error) return res.status(400).json({ success: false, message: error });

  const { postId, author, content } = req.body;

  try {
    const post = await Post.findById(postId);

    if (!post) {
      return baseResponse(res, false, '게시글을 찾을 수 없습니다.');
    }

    const comment = new Comment({ postId, author, content, replies: [] });
    await comment.save();

    post.comments.push(comment._id);
    await post.save();

    return baseResponse(res, true, '댓글이 정상적으로 등록되었습니다.');
  } catch (e) {
    console.error(e);
    return handleError(res, e);
  }
};

export const createReplies = async (req, res, next) => {
  const { commentId } = req.params;
  const schema = Joi.object({
    author: Joi.object({
      userNum: Joi.string().required(),
      nick: Joi.string().required(),
    }).required(),
    content: Joi.string().min(1),
  });

  const { error } = validate(schema, req.params);
  if (error) return baseResponse(res, false, { error });

  const parentComment = await Comment.findById(commentId);
  if (!parentComment) {
    return baseResponse(res, false, '댓글을 찾을 수 없습니다.');
  }

  const { author, content } = req.body;

  try {
    const reply = new Comment({
      postId: parentComment.postId,
      author,
      content,
      replies: [],
    });

    await reply.save();

    parentComment.replies.push(reply._id);
    await parentComment.save();

    return baseResponse(res, true, '답글이 성공적으로 등록되었습니다.');
  } catch (e) {
    console.error(e);
    return handleError(res, e);
  }
};

export const deleteComment = async (req, res, next) => {
  const { commentId } = req.params;
  const schema = Joi.object({
    userNum: Joi.string().required(),
  });

  const { error } = validate(schema, req.params);
  if (error) return baseResponse(res, false, { error });

  const { userNum } = req.body;

  try {
    const comment = await Comment.findById(commentId);

    if (!comment) {
      return baseResponse(res, false, '댓글을 찾을 수 없습니다.');
    }

    if (comment.author.userNum !== userNum) {
      return baseResponse(res, false, '권한이 없습니다.');
    }

    // 답글이 있는지 확인
    if (comment.replies.length > 0) {
      // 답글이 있으면 댓글 내용을 "삭제된 댓글입니다"로 변경
      comment.content = '삭제된 댓글입니다';
      await comment.save();
      return baseResponse(res, true, '댓글이 삭제상태가 되었습니다.');
    } else {
      // 답글이 없으면 댓글을 삭제
      await comment.remove();
      return baseResponse(res, true, '댓글이 정상적으로 삭제되었습니다.');
    }
  } catch (e) {
    console.error(e);
    return handleError(res, e);
  }
};

export const updateComment = async (req, res, next) => {
  const { commentId } = req.params;
  const schema = Joi.object({
    userNum: Joi.string().required(),
    content: Joi.string().min(1).required(),
  });

  const { error } = validate(schema, req.params);
  if (error) return baseResponse(res, false, { error });

  const { userNum, content } = req.body;

  try {
    const comment = await Comment.findById(commentId);

    if (!comment) {
      return baseResponse(res, false, '댓글을 찾을 수 없습니다.');
    }

    if (comment.author.userNum !== userNum) {
      return baseResponse(res, false, '권한이 없습니다.');
    }

    comment.content = content || comment.content;

    await comment.save();

    return baseResponse(res, true, '댓글이 성공적으로 수정되었습니다.');
  } catch (e) {
    console.error(e);
    return handleError(res, e);
  }
};
