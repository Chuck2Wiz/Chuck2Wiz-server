import 'dotenv/config'; // dotenv를 ES 모듈 방식으로 로드
import mongoose from 'mongoose';
import express from 'express';
import authRouter from './routes/auth';
import articlesRouter from './routes/articles';
import commentsRouter from './routes/comments';
import formRouter from './routes/form';
import morgan from 'morgan';

const { PORT, MONGO_URI } = process.env;

console.log('MONGO_URI:', MONGO_URI); // 수정: process.env.MONGO_URI를 MONGO_URI로 변경하여 가독성 향상

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

// morgan 미들웨어 설정: production 환경에서는 combined 포맷 사용
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'));
} else {
  app.use(morgan('dev')); // 개발 환경에서는 dev 포맷 사용
}

app.use(express.json());

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/articles', articlesRouter);
app.use('/api/v1/comments', commentsRouter);
app.use('/api/v1/form', formRouter);

app.listen(app.get('port'), () => {
  console.log(app.get('port'), '번 포트에서 대기 중');
});
