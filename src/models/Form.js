import mongoose, { Schema } from 'mongoose';

const FormSchema = new Schema({
  option: String,
  questions: [String],
});

const Form = mongoose.model('Form', FormSchema);

export default Form;
