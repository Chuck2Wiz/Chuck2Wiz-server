import * as articles from '../controller/articles.js';
import { Router } from 'express';

const router = Router();

// POST /articles
router.post('', articles.createArticle);

// GET /articles (with pagination)
router.get('/:page/:userNum', articles.getArticles);

// PUT /articles/:articleId
router.put('/:articleId', articles.updatedArticle);

// DELETE /articles/:articleId
router.delete('/:articleId', articles.deleteArticle);

// POST /articles/:articleId/like
router.post('/:articleId/like', articles.likeArticle);

// POST /articles/:articleId/unlike
router.post('/:articleId/unlike', articles.unlikeArticle);

// GET /articles/id/:articleId
router.get('/id/:articleId/:userNum', articles.getArticle);

// Get /articles/my/:page/:userNum
router.get('/my/:page/:userNum', articles.getArticleByUser);

export default router;
