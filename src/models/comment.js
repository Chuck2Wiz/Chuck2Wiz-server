import mongoose, { Schema } from 'mongoose';

const commentSchema = new Schema(
  {
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
    replies: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Comment',
      },
    ],
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  }
);

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;
