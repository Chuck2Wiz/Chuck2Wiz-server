require('dotenv').config();
import mongoose from 'mongoose';
import express from 'express';
import authRouter from './routes/auth';
import morgan from 'morgan';

const { PORT, MONGO_URI } = process.env;

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

app.use(morgan('dev'));
app.use(express.json());

app.use('/api/v1/auth', authRouter);

app.listen(app.get('port'), () => {
  console.log(app.get('port'), '번 포트에서 대기 중');
});
