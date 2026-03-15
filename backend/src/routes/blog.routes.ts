import { Router } from 'express';
import { body } from 'express-validator';
import * as blogController from '../controllers/blog.controller';
import { authenticate, authorizeAdmin } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.get('/', blogController.getAllBlogs);
router.get('/slug/:slug', blogController.getBlogBySlug);
router.get('/:id', blogController.getBlogById);
router.get('/:id/stats', blogController.getBlogStats);
router.post('/:id/rate', blogController.rateBlog);
router.post('/:id/view', blogController.trackBlogView);

// Protected routes
router.post(
  '/',
  authenticate,
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('content').notEmpty().withMessage('Content is required'),
    body('categoryId').notEmpty().withMessage('Category is required'),
  ],
  blogController.createBlog
);

router.put('/:id', authenticate, blogController.updateBlog);
router.delete('/:id', authenticate, blogController.deleteBlog);
router.post('/:id/like', authenticate, blogController.likeBlog);
router.post('/:id/publish', authenticate, authorizeAdmin, blogController.publishBlog);

export default router;
