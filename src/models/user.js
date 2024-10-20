import mongoose, { Schema } from 'mongoose';

const userSchema = new Schema(
  {
    userNum: { type: String, required: true, unique: true },
    nick: { type: String, required: true, unique: true },
    age: { type: Number, required: true, min: 0 },
    gender: { type: String, enum: ['MALE', 'FEMALE', 'OTHER'], required: true },
    job: {
      type: String,
      enum: ['STUDENT', 'HOUSEWIFE', 'WORKER', 'PROFESSIONAL', 'OTHER'],
      required: true,
    },
    favorite: [{ type: String, minlength: 1, maxlength: 30 }],
    aiReport: [
      {
        data: {
          selectOption: { type: String },
          formData: [{ type: String }],
          answerData: [{ type: String }],
          reportValue: { type: String },
        },
      },
    ],
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);

export default User;
