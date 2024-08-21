import * as articles from '../controller/articles.js';
import { Router } from 'express';

const router = Router();

// POST /articles
router.post('', articles.createArticle);

// GET /articles (with pagination)
router.get('', articles.getArticles);

// PUT /articles/:articleId
router.put('/:articleId', articles.updatedArticle);

// DELETE /articles/:articleId
router.delete('/:articleId', articles.deleteArticle);

// POST /article/:articleId/like
router.post('/:articleId/like', articles.likeArticle);

// POST /article/:articleId/unlike
router.post('/:articleId/unlike', articles.unlikeArticle);

export default router;
