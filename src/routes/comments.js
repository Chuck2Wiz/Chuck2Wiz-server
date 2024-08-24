import * as comments from '../controller/comments';
import { Router } from 'express';

const router = Router();

// POST /comments
router.post('', comments.createComment);

// POST /comments/:commentId/replies
router.post('/:commentId/replies', comments.createReplies);

// DELETE /comments/:commentId
router.delete('/:commentId', comments.deleteComment);

// PUT /comments/:commentId
router.put('/:commentId', comments.updateComment);

export default router;
