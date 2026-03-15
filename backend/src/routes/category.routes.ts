import { Router } from 'express';
import * as categoryController from '../controllers/category.controller';
import { authenticate, authorizeAdmin } from '../middleware/auth.middleware';

const router = Router();

router.get('/', categoryController.getAllCategories);
router.post('/', authenticate, categoryController.createCategory);
router.put('/:id', authenticate, authorizeAdmin, categoryController.updateCategory);
router.delete('/:id', authenticate, authorizeAdmin, categoryController.deleteCategory);

export default router;
