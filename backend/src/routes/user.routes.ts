import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { authenticate, authorizeAdmin } from '../middleware/auth.middleware';

const router = Router();

router.get('/profile', authenticate, userController.getProfile);
router.put('/profile', authenticate, userController.updateProfile);
router.post('/set-password', authenticate, userController.setPassword);
router.get('/', authenticate, authorizeAdmin, userController.getAllUsers);
router.put('/:id/role', authenticate, authorizeAdmin, userController.updateUserRole);
router.delete('/:id', authenticate, authorizeAdmin, userController.deleteUser);

export default router;

