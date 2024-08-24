import * as auth from '../controller/auth.js';
import { Router } from 'express';

const router = Router();

// POST /auth/register
router.post('/register', auth.register);

// GET /auth/check-nickname
router.get('/check-nickname', auth.checkNickname);

// GET /auth/check-existUser
router.get('/check-existUser/:userNum', auth.checkExistUser);

export default router;
