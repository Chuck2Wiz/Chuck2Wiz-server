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

  const { error } = validate(schema, req.body);
  if (error) return res.status(400).json({ error });

  const { postId, author, content } = req.body;

  try {
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: '게시글을 찾을 수 없습니다' });
    }

    const comment = new Comment({ postId, author, content, replies: [] });
    await comment.save();

    post.comments.push(comment._id);
    await post.save();

    res.status(201).json({ message: '댓글이 성공적으로 등록되었습니다' });
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

  const { error } = validate(schema, req.body);
  if (error) return res.status(400).json({ error });

  const parentComment = await Comment.findById(commentId);
  if (!parentComment) {
    return res.status(404).json({ message: '댓글을 찾을 수 없습니다' });
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

    res.status(201).json({ message: '답글이 성공적으로 등록되었습니다' });
  } catch (e) {
    console.error(e);
    return handleError(res, e);
  }
};
