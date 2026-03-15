"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleFeatured = exports.rateNews = exports.trackNewsView = exports.deleteNews = exports.updateNews = exports.createNews = exports.getNewsBySlug = exports.getNewsById = exports.getAllNews = void 0;
const express_validator_1 = require("express-validator");
const prisma_1 = __importDefault(require("../lib/prisma"));
const getAllNews = async (req, res) => {
    try {
        const { page = 1, limit = 10, search, categoryId, published, featured, includeDrafts } = req.query;
        const where = {};
        const andConditions = [];
        if (search) {
            andConditions.push({
                OR: [
                    { title: { contains: search } },
                    { content: { contains: search } },
                ]
            });
        }
        if (categoryId) {
            where.categoryId = categoryId;
        }
        if (featured === 'true') {
            where.featured = true;
        }
        if (includeDrafts === 'true' && req.userId) {
            if (req.userRole === 'admin') {
                andConditions.push({
                    OR: [
                        { published: true },
                        { published: false }
                    ]
                });
            }
            else {
                andConditions.push({
                    OR: [
                        { published: true },
                        { authorId: req.userId, published: false }
                    ]
                });
            }
        }
        else if (published !== undefined) {
            where.published = published === 'true';
        }
        else {
            where.published = true;
        }
        if (andConditions.length > 0) {
            where.AND = andConditions;
        }
        const skip = (Number(page) - 1) * Number(limit);
        const [news, total] = await Promise.all([
            prisma_1.default.news.findMany({
                where,
                skip,
                take: Number(limit),
                include: {
                    author: {
                        select: { id: true, name: true, email: true, image: true },
                    },
                    category: true,
                    _count: {
                        select: { ratings: true },
                    },
                    ratings: {
                        select: { rating: true },
                    },
                },
                orderBy: { createdAt: 'desc' },
            }),
            prisma_1.default.news.count({ where }),
        ]);
        const newsWithStats = await Promise.all(news.map(async (newsItem) => {
            const avgRating = newsItem.ratings.length > 0
                ? newsItem.ratings.reduce((acc, r) => acc + r.rating, 0) / newsItem.ratings.length
                : 0;
            const firstFeedback = await prisma_1.default.feedback.findFirst({
                where: { mentionedNewsId: newsItem.id },
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    content: true,
                    authorName: true,
                    createdAt: true,
                    user: { select: { name: true } },
                },
            });
            const feedbackCount = await prisma_1.default.feedback.count({
                where: { mentionedNewsId: newsItem.id },
            });
            const { ratings, ...newsData } = newsItem;
            return {
                ...newsData,
                averageRating: parseFloat(avgRating.toFixed(1)),
                views: newsItem.views || 0,
                firstFeedback: firstFeedback || null,
                feedbackCount,
            };
        }));
        res.json({
            news: newsWithStats,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                totalPages: Math.ceil(total / Number(limit)),
            },
        });
    }
    catch (error) {
        console.error('Error fetching news:', error);
        res.status(500).json({ error: 'Failed to fetch news' });
    }
};
exports.getAllNews = getAllNews;
const getNewsById = async (req, res) => {
    try {
        const { id } = req.params;
        const news = await prisma_1.default.news.findUnique({
            where: { id },
            include: {
                author: {
                    select: { id: true, name: true, email: true, image: true, bio: true },
                },
                category: true,
                ratings: {
                    select: { rating: true },
                },
            },
        });
        if (!news) {
            return res.status(404).json({ error: 'News not found' });
        }
        if (!news.published && news.authorId !== req.userId && req.userRole !== 'admin') {
            return res.status(403).json({ error: 'Access denied' });
        }
        const avgRating = news.ratings.length > 0
            ? news.ratings.reduce((acc, r) => acc + r.rating, 0) / news.ratings.length
            : 0;
        const feedbackCount = await prisma_1.default.feedback.count({
            where: { mentionedNewsId: news.id },
        });
        const { ratings, ...newsData } = news;
        res.json({
            ...newsData,
            averageRating: parseFloat(avgRating.toFixed(1)),
            views: news.views || 0,
            feedbackCount,
        });
    }
    catch (error) {
        console.error('Error fetching news:', error);
        res.status(500).json({ error: 'Failed to fetch news' });
    }
};
exports.getNewsById = getNewsById;
const getNewsBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const news = await prisma_1.default.news.findUnique({
            where: { slug },
            include: {
                author: {
                    select: { id: true, name: true, email: true, image: true, bio: true },
                },
                category: true,
                ratings: {
                    select: { rating: true },
                },
            },
        });
        if (!news) {
            return res.status(404).json({ error: 'News not found' });
        }
        if (!news.published && news.authorId !== req.userId && req.userRole !== 'admin') {
            return res.status(403).json({ error: 'Access denied' });
        }
        const avgRating = news.ratings.length > 0
            ? news.ratings.reduce((acc, r) => acc + r.rating, 0) / news.ratings.length
            : 0;
        const feedbackCount = await prisma_1.default.feedback.count({
            where: { mentionedNewsId: news.id },
        });
        const { ratings, ...newsData } = news;
        res.json({
            ...newsData,
            averageRating: parseFloat(avgRating.toFixed(1)),
            views: news.views || 0,
            feedbackCount,
            _count: {
                ratings: news.ratings.length,
            },
        });
    }
    catch (error) {
        console.error('Error fetching news:', error);
        res.status(500).json({ error: 'Failed to fetch news' });
    }
};
exports.getNewsBySlug = getNewsBySlug;
const createNews = async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { title, content, excerpt, coverImage, categoryId, published, featured, slug: providedSlug, titleAlignment, metaTitle, metaDescription, keywords, canonicalUrl, ogImage, noIndex } = req.body;
        let slug = providedSlug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        let finalSlug = slug;
        let slugExists = await prisma_1.default.news.findFirst({ where: { slug } });
        if (slugExists) {
            finalSlug = `${slug}-${Date.now()}`;
        }
        const canSetFeatured = req.userRole === 'admin';
        const news = await prisma_1.default.news.create({
            data: {
                title,
                content,
                excerpt: excerpt || content.substring(0, 200),
                coverImage,
                slug: finalSlug,
                published: published || false,
                featured: canSetFeatured ? (featured || false) : false,
                titleAlignment: titleAlignment || 'left',
                authorId: req.userId,
                categoryId,
                metaTitle: metaTitle || null,
                metaDescription: metaDescription || null,
                keywords: keywords || null,
                canonicalUrl: canonicalUrl || null,
                ogImage: ogImage || null,
                noIndex: noIndex || false,
            },
            include: {
                author: {
                    select: { id: true, name: true, email: true, image: true },
                },
                category: true,
            },
        });
        res.status(201).json(news);
    }
    catch (error) {
        console.error('Error creating news:', error);
        res.status(500).json({ error: 'Failed to create news' });
    }
};
exports.createNews = createNews;
const updateNews = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, excerpt, coverImage, categoryId, published, featured, titleAlignment, metaTitle, metaDescription, keywords, canonicalUrl, ogImage, noIndex } = req.body;
        const news = await prisma_1.default.news.findUnique({ where: { id } });
        if (!news) {
            return res.status(404).json({ error: 'News not found' });
        }
        if (news.authorId !== req.userId && req.userRole !== 'admin') {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        const canSetFeatured = req.userRole === 'admin';
        const updatedNews = await prisma_1.default.news.update({
            where: { id },
            data: {
                title,
                content,
                excerpt,
                coverImage,
                categoryId,
                published,
                featured: canSetFeatured && featured !== undefined ? featured : news.featured,
                titleAlignment: titleAlignment !== undefined ? titleAlignment : news.titleAlignment,
                metaTitle: metaTitle !== undefined ? metaTitle : news.metaTitle,
                metaDescription: metaDescription !== undefined ? metaDescription : news.metaDescription,
                keywords: keywords !== undefined ? keywords : news.keywords,
                canonicalUrl: canonicalUrl !== undefined ? canonicalUrl : news.canonicalUrl,
                ogImage: ogImage !== undefined ? ogImage : news.ogImage,
                noIndex: noIndex !== undefined ? noIndex : news.noIndex,
            },
            include: {
                author: {
                    select: { id: true, name: true, email: true, image: true },
                },
                category: true,
            },
        });
        res.json(updatedNews);
    }
    catch (error) {
        console.error('Error updating news:', error);
        res.status(500).json({ error: 'Failed to update news' });
    }
};
exports.updateNews = updateNews;
const deleteNews = async (req, res) => {
    try {
        const { id } = req.params;
        const news = await prisma_1.default.news.findUnique({ where: { id } });
        if (!news) {
            return res.status(404).json({ error: 'News not found' });
        }
        if (news.authorId !== req.userId && req.userRole !== 'admin') {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        const settings = await prisma_1.default.siteSettings.findUnique({
            where: { id: 'default' },
        });
        if (settings?.breakingNewsId === id) {
            await prisma_1.default.siteSettings.update({
                where: { id: 'default' },
                data: {
                    breakingNewsId: null,
                    breakingNewsTitle: null,
                },
            });
        }
        await prisma_1.default.news.delete({ where: { id } });
        res.json({ message: 'News deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting news:', error);
        res.status(500).json({ error: 'Failed to delete news' });
    }
};
exports.deleteNews = deleteNews;
const trackNewsView = async (req, res) => {
    try {
        const { id } = req.params;
        const { duration, scrolled, sessionId } = req.body;
        const news = await prisma_1.default.news.findUnique({ where: { id } });
        if (!news) {
            return res.status(404).json({ error: 'News not found' });
        }
        const existingView = await prisma_1.default.newsView.findFirst({
            where: {
                newsId: id,
                OR: [
                    req.userId ? { userId: req.userId } : {},
                    sessionId ? { sessionId } : {},
                ],
            },
        });
        if (existingView) {
            await prisma_1.default.newsView.update({
                where: { id: existingView.id },
                data: {
                    duration: Math.max(existingView.duration, duration || 0),
                    scrolled: scrolled || existingView.scrolled,
                },
            });
        }
        else {
            await prisma_1.default.newsView.create({
                data: {
                    newsId: id,
                    userId: req.userId || null,
                    sessionId: sessionId || null,
                    duration: duration || 0,
                    scrolled: scrolled || false,
                },
            });
        }
        res.json({ message: 'View tracked successfully' });
    }
    catch (error) {
        console.error('Error tracking view:', error);
        res.status(500).json({ error: 'Failed to track view' });
    }
};
exports.trackNewsView = trackNewsView;
const rateNews = async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, sessionId } = req.body;
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Rating must be between 1 and 5' });
        }
        const news = await prisma_1.default.news.findUnique({ where: { id } });
        if (!news) {
            return res.status(404).json({ error: 'News not found' });
        }
        const existingRating = await prisma_1.default.newsRating.findFirst({
            where: {
                newsId: id,
                OR: [
                    req.userId ? { userId: req.userId } : {},
                    sessionId ? { sessionId } : {},
                ],
            },
        });
        if (existingRating) {
            await prisma_1.default.newsRating.update({
                where: { id: existingRating.id },
                data: { rating },
            });
        }
        else {
            await prisma_1.default.newsRating.create({
                data: {
                    newsId: id,
                    userId: req.userId || null,
                    sessionId: sessionId || null,
                    rating,
                },
            });
        }
        res.json({ message: 'Rating submitted successfully' });
    }
    catch (error) {
        console.error('Error rating news:', error);
        res.status(500).json({ error: 'Failed to submit rating' });
    }
};
exports.rateNews = rateNews;
const toggleFeatured = async (req, res) => {
    try {
        const { id } = req.params;
        if (req.userRole !== 'admin') {
            return res.status(403).json({ error: 'Only admins can toggle featured status' });
        }
        const news = await prisma_1.default.news.findUnique({ where: { id } });
        if (!news) {
            return res.status(404).json({ error: 'News not found' });
        }
        const updatedNews = await prisma_1.default.news.update({
            where: { id },
            data: { featured: !news.featured },
        });
        res.json(updatedNews);
    }
    catch (error) {
        console.error('Error toggling featured:', error);
        res.status(500).json({ error: 'Failed to toggle featured status' });
    }
};
exports.toggleFeatured = toggleFeatured;
