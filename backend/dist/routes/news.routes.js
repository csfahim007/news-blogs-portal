"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const auth_middleware_1 = require("../middleware/auth.middleware");
const news_controller_1 = require("../controllers/news.controller");
const router = (0, express_1.Router)();
router.get('/', auth_middleware_1.optionalAuth, news_controller_1.getAllNews);
router.get('/slug/:slug', auth_middleware_1.optionalAuth, news_controller_1.getNewsBySlug);
router.get('/:id', auth_middleware_1.optionalAuth, news_controller_1.getNewsById);
router.post('/', auth_middleware_1.authenticate, [
    (0, express_validator_1.body)('title').notEmpty().withMessage('Title is required'),
    (0, express_validator_1.body)('content').notEmpty().withMessage('Content is required'),
    (0, express_validator_1.body)('categoryId').notEmpty().withMessage('Category is required'),
], news_controller_1.createNews);
router.put('/:id', auth_middleware_1.authenticate, [
    (0, express_validator_1.body)('title').optional().notEmpty(),
    (0, express_validator_1.body)('content').optional().notEmpty(),
], news_controller_1.updateNews);
router.delete('/:id', auth_middleware_1.authenticate, news_controller_1.deleteNews);
router.post('/:id/view', auth_middleware_1.optionalAuth, news_controller_1.trackNewsView);
router.post('/:id/rate', auth_middleware_1.optionalAuth, [(0, express_validator_1.body)('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5')], news_controller_1.rateNews);
router.patch('/:id/featured', auth_middleware_1.authenticate, news_controller_1.toggleFeatured);
exports.default = router;
