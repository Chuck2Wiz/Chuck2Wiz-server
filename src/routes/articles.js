import * as articles from '../controller/articles.js';
import { Router } from 'express';

const router = Router();

// POST /articles
router.post('', articles.createArticle);

export default router;
