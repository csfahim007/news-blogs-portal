import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate, optionalAuth } from '../middleware/auth.middleware';
import {
  getAllNews,
  getNewsById,
  getNewsBySlug,
  createNews,
  updateNews,
  deleteNews,
  trackNewsView,
  rateNews,
  toggleFeatured,
} from '../controllers/news.controller';

const router = Router();

// Public routes
router.get('/', optionalAuth, getAllNews);
router.get('/slug/:slug', optionalAuth, getNewsBySlug);
router.get('/:id', optionalAuth, getNewsById);

// Protected routes (require authentication)
router.post(
  '/',
  authenticate,
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('content').notEmpty().withMessage('Content is required'),
    body('categoryId').notEmpty().withMessage('Category is required'),
  ],
  createNews
);

router.put(
  '/:id',
  authenticate,
  [
    body('title').optional().notEmpty(),
    body('content').optional().notEmpty(),
  ],
  updateNews
);

router.delete('/:id', authenticate, deleteNews);

// View tracking (can be done by authenticated or anonymous users)
router.post('/:id/view', optionalAuth, trackNewsView);

// Rating (can be done by authenticated or anonymous users)
router.post(
  '/:id/rate',
  optionalAuth,
  [body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5')],
  rateNews
);

// Admin only: Toggle featured status
router.patch('/:id/featured', authenticate, toggleFeatured);

export default router;
