import * as auth from '../controller/auth.js';
import { Router } from 'express';

const router = Router();

// POST /auth/register
router.post('/register', auth.register);

// POST /auth/check-nickname
router.get('/check-nickname', auth.checkNickname);

export default router;
