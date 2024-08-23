import * as comments from '../controller/comments';
import { Router } from 'express';

const router = Router();

// POST /comments
router.post('', comments.createComment);

// POST /comments/:commentId/replies
router.post('/:commentId/replies', comments.createReplies);

export default router;
