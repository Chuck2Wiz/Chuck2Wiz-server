import mongoose, { Schema } from 'mongoose';

const postSchema = new Schema(
  {
    id: { type: String },
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    author: {
      userNum: {
        type: String,
        required: true,
        ref: 'User',
      },
      nick: { type: String, required: true },
    },
    likes: [
      {
        userNum: { type: String, required: true },
      },
    ],
    comments: [
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

postSchema.pre('save', function (next) {
  this.id = this._id.toString(); // _id 값을 id 필드에 복사
  next();
});

const Post = mongoose.model('Post', postSchema);

export default Post;
