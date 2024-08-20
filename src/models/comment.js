import mongoose, { Schema } from 'mongoose';

const commentSchema = new Schema({
  postId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Post',
  },
  author: {
    userNum: {
      type: String,
      required: true,
      ref: 'User',
    },
    nick: {
      type: String,
      required: true,
    },
  },
  content: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAy: {
    type: Date,
    default: Date.now,
  },
});

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;
