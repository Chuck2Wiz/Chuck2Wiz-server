import * as articles from '../controller/articles.js';
import { Router } from 'express';

const router = Router();

// POST /articles
router.post('', articles.createArticle);

// GET /articles/:page
router.get('/:page', articles.getArticles);

// PUT /articles/:articleId
router.put('/:articleId', articles.updatedArticle);

// DELETE /articles/:articleId
router.delete('/:articleId', articles.deleteArticle);

export default router;
