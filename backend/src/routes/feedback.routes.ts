import { Router } from 'express';
import * as feedbackController from '../controllers/feedback.controller';
import { authenticate, authorizeAdmin } from '../middleware/auth.middleware';

const router = Router();

// Public routes (allow anonymous)
router.post('/', feedbackController.createFeedback);
router.get('/', feedbackController.getAllFeedback);
router.post('/:id/comment', feedbackController.addFeedbackComment);
router.post('/:id/like', feedbackController.toggleFeedbackLike);

// User routes (edit/delete own comments)
router.put('/:id/comment/:commentId', feedbackController.updateFeedbackComment);
router.delete('/:id/comment/:commentId/user', feedbackController.deleteFeedbackComment);

// Admin only routes
router.delete('/:id', authenticate, authorizeAdmin, feedbackController.deleteFeedback);
router.delete('/:id/comment/:commentId', authenticate, authorizeAdmin, feedbackController.deleteFeedbackComment);

export default router;
