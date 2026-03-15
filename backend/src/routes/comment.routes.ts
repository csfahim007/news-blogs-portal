import { Router } from 'express';
import { body } from 'express-validator';
import * as commentController from '../controllers/comment.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/blog/:blogId', commentController.getCommentsByBlog);
router.post(
  '/',
  authenticate,
  [
    body('content').notEmpty().withMessage('Content is required'),
    body('blogId').notEmpty().withMessage('Blog ID is required'),
  ],
  commentController.createComment
);
router.put('/:id', authenticate, commentController.updateComment);
router.delete('/:id', authenticate, commentController.deleteComment);

export default router;
