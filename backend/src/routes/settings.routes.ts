import { Router } from 'express';
import { getSiteSettings, updateSiteSettings, clearBreakingNews } from '../controllers/settings.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Get site settings (public)
router.get('/', getSiteSettings);

// Update site settings (admin only)
router.put('/', authenticate, updateSiteSettings);

// Clear breaking news (admin only)
router.delete('/breaking-news', authenticate, clearBreakingNews);

export default router;
