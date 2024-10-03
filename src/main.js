import 'dotenv/config'; // dotenv를 ES 모듈 방식으로 로드
import mongoose from 'mongoose';
import express from 'express';
import authRouter from './routes/auth';
import articlesRouter from './routes/articles';
import commentsRouter from './routes/comments';
import morgan from 'morgan';

const { PORT, MONGO_URI } = process.env;

console.log('MONGO_URI:', process.env.MONGO_URI);

mongoose.set('strictQuery', true);

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((e) => {
    console.error(e);
  });

const app = express();

app.set('port', PORT || 8001);

app.use(morgan('combined'));

app.use(express.json());

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/articles', articlesRouter);
app.use('/api/v1/comments', commentsRouter);

app.listen(app.get('port'), () => {
  console.log(app.get('port'), '번 포트에서 대기 중');
});
