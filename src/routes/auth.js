import * as auth from '../controller/auth.js';
import { Router } from 'express';

const router = Router();

// POST /auth/register
router.post('/register', auth.register);

// GET /auth/check-nickname
router.get('/check-nickname/:nickName', auth.checkNickname);

// GET /auth/check-existUser
router.get('/check-existUser/:userNum', auth.checkExistUser);

// Get /auth/user/:userNum
router.get('/user/:userNum', auth.getUserInfo);

// DELETE /auth/deleteUser
router.delete('/deleteUser', auth.deleteUser);

export default router;
