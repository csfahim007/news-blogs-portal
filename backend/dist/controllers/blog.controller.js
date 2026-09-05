"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBlogStats = exports.trackBlogView = exports.rateBlog = exports.publishBlog = exports.likeBlog = exports.deleteBlog = exports.updateBlog = exports.createBlog = exports.getBlogBySlug = exports.getBlogById = exports.getAllBlogs = void 0;
const express_validator_1 = require("express-validator");
const prisma_1 = __importDefault(require("../lib/prisma"));
const getAllBlogs = async (req, res) => {
    try {
        const { page = 1, limit = 10, search, categoryId, published, includeDrafts } = req.query;
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
        const [blogs, total] = await Promise.all([
            prisma_1.default.blog.findMany({
                where,
                skip,
                take: Number(limit),
                include: {
                    author: {
                        select: { id: true, name: true, email: true, image: true },
                    },
                    category: true,
                    _count: {
                        select: { comments: true, likes: true },
                    },
                    ratings: {
                        select: { rating: true },
                    },
                },
                orderBy: { createdAt: 'desc' },
            }),
            prisma_1.default.blog.count({ where }),
        ]);
        const blogsWithStats = await Promise.all(blogs.map(async (blog) => {
            const avgRating = blog.ratings.length > 0
                ? blog.ratings.reduce((acc, r) => acc + r.rating, 0) / blog.ratings.length
                : 0;
            const firstFeedback = await prisma_1.default.feedback.findFirst({
                where: { mentionedBlogId: blog.id },
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
                where: { mentionedBlogId: blog.id },
            });
            const { ratings, ...blogData } = blog;
            return {
                ...blogData,
                averageRating: parseFloat(avgRating.toFixed(1)),
                views: blog.views || 0,
                firstFeedback: firstFeedback || null,
                feedbackCount,
            };
        }));
        res.json({
            blogs: blogsWithStats,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                totalPages: Math.ceil(total / Number(limit)),
            },
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch blogs' });
    }
};
exports.getAllBlogs = getAllBlogs;
const getBlogById = async (req, res) => {
    try {
        const { id } = req.params;
        const blog = await prisma_1.default.blog.findUnique({
            where: { id },
            include: {
                author: {
                    select: { id: true, name: true, email: true, image: true },
                },
                category: true,
                comments: {
                    include: {
                        author: {
                            select: { id: true, name: true, image: true },
                        },
                    },
                    orderBy: { createdAt: 'desc' },
                },
                _count: {
                    select: { likes: true },
                },
            },
        });
        if (!blog) {
            return res.status(404).json({ error: 'Blog not found' });
        }
        res.json(blog);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch blog' });
    }
};
exports.getBlogById = getBlogById;
const getBlogBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const blog = await prisma_1.default.blog.findUnique({
            where: { slug },
            include: {
                author: {
                    select: { id: true, name: true, email: true, image: true },
                },
                category: true,
                comments: {
                    include: {
                        author: {
                            select: { id: true, name: true, image: true },
                        },
                    },
                    orderBy: { createdAt: 'desc' },
                },
                _count: {
                    select: { likes: true, comments: true },
                },
                ratings: {
                    select: { rating: true },
                },
            },
        });
        if (!blog) {
            return res.status(404).json({ error: 'Blog not found' });
        }
        const avgRating = blog.ratings.length > 0
            ? blog.ratings.reduce((acc, r) => acc + r.rating, 0) / blog.ratings.length
            : 0;
        const feedbackCount = await prisma_1.default.feedback.count({
            where: { mentionedBlogId: blog.id },
        });
        const { ratings, ...blogData } = blog;
        const blogWithStats = {
            ...blogData,
            averageRating: parseFloat(avgRating.toFixed(1)),
            views: blog.views || 0,
            feedbackCount,
        };
        res.json(blogWithStats);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch blog' });
    }
};
exports.getBlogBySlug = getBlogBySlug;
const createBlog = async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const user = await prisma_1.default.user.findUnique({
            where: { id: req.userId }
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found. Please login again.' });
        }
        const { title, content, excerpt, coverImage, categoryId, published, slug: providedSlug, titleAlignment, metaTitle, metaDescription, keywords, canonicalUrl, ogImage, noIndex } = req.body;
        let slug = providedSlug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        let finalSlug = slug;
        let slugExists = await prisma_1.default.blog.findFirst({ where: { slug } });
        if (slugExists) {
            finalSlug = `${slug}-${Date.now()}`;
        }
        const blog = await prisma_1.default.blog.create({
            data: {
                title,
                content,
                excerpt: excerpt || content.substring(0, 200),
                coverImage,
                slug: finalSlug,
                published: published || false,
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
        res.status(201).json(blog);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create blog' });
    }
};
exports.createBlog = createBlog;
const updateBlog = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, excerpt, coverImage, categoryId, published, titleAlignment, metaTitle, metaDescription, keywords, canonicalUrl, ogImage, noIndex } = req.body;
        const blog = await prisma_1.default.blog.findUnique({ where: { id } });
        if (!blog) {
            return res.status(404).json({ error: 'Blog not found' });
        }
        if (blog.authorId !== req.userId && req.userRole !== 'admin') {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        const updatedBlog = await prisma_1.default.blog.update({
            where: { id },
            data: {
                title,
                content,
                excerpt,
                coverImage,
                categoryId,
                published,
                titleAlignment: titleAlignment !== undefined ? titleAlignment : blog.titleAlignment,
                metaTitle: metaTitle !== undefined ? metaTitle : blog.metaTitle,
                metaDescription: metaDescription !== undefined ? metaDescription : blog.metaDescription,
                keywords: keywords !== undefined ? keywords : blog.keywords,
                canonicalUrl: canonicalUrl !== undefined ? canonicalUrl : blog.canonicalUrl,
                ogImage: ogImage !== undefined ? ogImage : blog.ogImage,
                noIndex: noIndex !== undefined ? noIndex : blog.noIndex,
            },
            include: {
                author: {
                    select: { id: true, name: true, email: true, image: true },
                },
                category: true,
            },
        });
        res.json(updatedBlog);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update blog' });
    }
};
exports.updateBlog = updateBlog;
const deleteBlog = async (req, res) => {
    try {
        const { id } = req.params;
        const blog = await prisma_1.default.blog.findUnique({ where: { id } });
        if (!blog) {
            return res.status(404).json({ error: 'Blog not found' });
        }
        if (blog.authorId !== req.userId && req.userRole !== 'admin') {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        await prisma_1.default.blog.delete({ where: { id } });
        res.json({ message: 'Blog deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete blog' });
    }
};
exports.deleteBlog = deleteBlog;
const likeBlog = async (req, res) => {
    try {
        const { id } = req.params;
        const existingLike = await prisma_1.default.like.findUnique({
            where: {
                userId_blogId: {
                    userId: req.userId,
                    blogId: id,
                },
            },
        });
        if (existingLike) {
            await prisma_1.default.like.delete({
                where: { id: existingLike.id },
            });
            return res.json({ message: 'Like removed', liked: false });
        }
        await prisma_1.default.like.create({
            data: {
                userId: req.userId,
                blogId: id,
            },
        });
        res.json({ message: 'Blog liked', liked: true });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to like blog' });
    }
};
exports.likeBlog = likeBlog;
const publishBlog = async (req, res) => {
    try {
        const { id } = req.params;
        const blog = await prisma_1.default.blog.update({
            where: { id },
            data: { published: true },
        });
        res.json(blog);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to publish blog' });
    }
};
exports.publishBlog = publishBlog;
const rateBlog = async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, sessionId, userId: bodyUserId } = req.body;
        const userId = req.user?.userId || bodyUserId || null;
        if (rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Rating must be between 1 and 5' });
        }
        if (!userId && !sessionId) {
            return res.status(400).json({ error: 'User ID or Session ID is required' });
        }
        const ratingRecord = await prisma_1.default.blogRating.upsert({
            where: userId
                ? { blogId_userId: { blogId: id, userId } }
                : { blogId_sessionId: { blogId: id, sessionId } },
            update: { rating },
            create: {
                rating,
                blogId: id,
                userId,
                sessionId: userId ? null : sessionId,
            },
        });
        const ratings = await prisma_1.default.blogRating.findMany({
            where: { blogId: id },
            select: { rating: true },
        });
        const avgRating = ratings.reduce((acc, r) => acc + r.rating, 0) / ratings.length;
        res.json({ rating: ratingRecord, avgRating, totalRatings: ratings.length });
    }
    catch (error) {
        console.error('Error rating blog:', error);
        res.status(500).json({ error: 'Failed to rate blog' });
    }
};
exports.rateBlog = rateBlog;
const trackBlogView = async (req, res) => {
    try {
        const { id } = req.params;
        const { duration, scrolled, sessionId } = req.body;
        const blog = await prisma_1.default.blog.findUnique({ where: { id } });
        if (!blog) {
            return res.status(404).json({ error: 'Blog not found' });
        }
        const existingView = await prisma_1.default.blogView.findFirst({
            where: {
                blogId: id,
                OR: [
                    req.userId ? { userId: req.userId } : {},
                    sessionId ? { sessionId } : {},
                ],
            },
        });
        if (existingView) {
            await prisma_1.default.blogView.update({
                where: { id: existingView.id },
                data: {
                    duration: Math.max(existingView.duration, duration || 0),
                    scrolled: scrolled || existingView.scrolled,
                },
            });
        }
        else {
            await prisma_1.default.blogView.create({
                data: {
                    blogId: id,
                    userId: req.userId || null,
                    sessionId: sessionId || null,
                    duration: duration || 0,
                    scrolled: scrolled || false,
                },
            });
            await prisma_1.default.blog.update({
                where: { id },
                data: { views: { increment: 1 } },
            });
        }
        res.json({ message: 'View tracked successfully', counted: !existingView });
    }
    catch (error) {
        console.error('Error tracking blog view:', error);
        res.status(500).json({ error: 'Failed to track view' });
    }
};
exports.trackBlogView = trackBlogView;
const getBlogStats = async (req, res) => {
    try {
        const { id } = req.params;
        const { sessionId, userId: queryUserId } = req.query;
        const userId = req.user?.userId || queryUserId || null;
        const blog = await prisma_1.default.blog.findUnique({
            where: { id },
            select: { views: true },
        });
        const ratings = await prisma_1.default.blogRating.findMany({
            where: { blogId: id },
            select: { rating: true },
        });
        const avgRating = ratings.length > 0
            ? ratings.reduce((acc, r) => acc + r.rating, 0) / ratings.length
            : 0;
        const totalViews = await prisma_1.default.blogView.count({
            where: { blogId: id },
        });
        let userRating = 0;
        if (userId || sessionId) {
            const userRatingRecord = await prisma_1.default.blogRating.findFirst({
                where: {
                    blogId: id,
                    ...(userId ? { userId } : { sessionId: sessionId }),
                },
                select: { rating: true },
            });
            userRating = userRatingRecord?.rating || 0;
        }
        res.json({
            views: blog?.views || 0,
            totalViews,
            averageRating: parseFloat(avgRating.toFixed(1)),
            totalRatings: ratings.length,
            userRating,
        });
    }
    catch (error) {
        console.error('Error fetching blog stats:', error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
};
exports.getBlogStats = getBlogStats;
