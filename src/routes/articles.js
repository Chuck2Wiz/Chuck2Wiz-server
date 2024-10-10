import * as articles from '../controller/articles.js';
import { Router } from 'express';

const router = Router();

// POST /articles
router.post('', articles.createArticle);

// GET /articles (with pagination)
router.get('/:page', articles.getArticles);

// PUT /articles/:articleId
router.put('/:articleId', articles.updatedArticle);

// DELETE /articles/:articleId
router.delete('/:articleId', articles.deleteArticle);

// POST /articles/:articleId/like
router.post('/:articleId/like', articles.likeArticle);

// POST /articles/:articleId/unlike
router.post('/:articleId/unlike', articles.unlikeArticle);

// GET /articles/id/:articleId
router.get('/id/:articleId', articles.getArticle);

export default router;
