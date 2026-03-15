import express from 'express';
import {
  createContactMessage,
  getAllContactMessages,
  updateContactMessageStatus,
  deleteContactMessage,
} from '../controllers/contact.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';

const router = express.Router();

// Public route - anyone can send a message
router.post('/', createContactMessage);

// Admin routes
router.get('/', authenticate, requireAdmin, getAllContactMessages);
router.patch('/:id/status', authenticate, requireAdmin, updateContactMessageStatus);
router.delete('/:id', authenticate, requireAdmin, deleteContactMessage);

export default router;
