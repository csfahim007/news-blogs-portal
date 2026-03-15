"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleFeedbackLike = exports.deleteFeedbackComment = exports.updateFeedbackComment = exports.addFeedbackComment = exports.deleteFeedback = exports.getAllFeedback = exports.createFeedback = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const createFeedback = async (req, res) => {
    try {
        const { content, authorName, authorEmail, mentionedBlogId, mentionedNewsId, userId: bodyUserId } = req.body;
        const userId = req.user?.userId || bodyUserId || null;
        if (content.length > 250) {
            return res.status(400).json({ error: 'Feedback must be 250 characters or less' });
        }
        const feedback = await prisma.feedback.create({
            data: {
                content,
                authorName: userId ? null : authorName,
                authorEmail: userId ? null : authorEmail,
                userId,
                mentionedBlogId: mentionedBlogId || null,
                mentionedNewsId: mentionedNewsId || null,
            },
            include: {
                user: { select: { id: true, name: true, image: true } },
                mentionedBlog: { select: { id: true, title: true, slug: true } },
                mentionedNews: { select: { id: true, title: true, slug: true } },
                comments: {
                    include: {
                        user: { select: { id: true, name: true, image: true } },
                        replies: {
                            include: {
                                user: { select: { id: true, name: true, image: true } },
                            },
                        },
                    },
                },
            },
        });
        res.json(feedback);
    }
    catch (error) {
        console.error('Error creating feedback:', error);
        res.status(500).json({ error: 'Failed to create feedback' });
    }
};
exports.createFeedback = createFeedback;
const getAllFeedback = async (req, res) => {
    try {
        const { blogId, newsId, limit = '50', skip = '0' } = req.query;
        const where = {};
        if (blogId)
            where.mentionedBlogId = blogId;
        if (newsId)
            where.mentionedNewsId = newsId;
        const feedbacks = await prisma.feedback.findMany({
            where: Object.keys(where).length > 0 ? where : undefined,
            take: parseInt(limit),
            skip: parseInt(skip),
            orderBy: { createdAt: 'desc' },
            include: {
                user: { select: { id: true, name: true, image: true } },
                mentionedBlog: { select: { id: true, title: true, slug: true } },
                mentionedNews: { select: { id: true, title: true, slug: true } },
                comments: {
                    orderBy: { createdAt: 'asc' },
                    include: {
                        user: { select: { id: true, name: true, image: true } },
                        replies: {
                            orderBy: { createdAt: 'asc' },
                            include: {
                                user: { select: { id: true, name: true, image: true } },
                            },
                        },
                    },
                },
                _count: { select: { comments: true } },
            },
        });
        const total = await prisma.feedback.count({
            where: Object.keys(where).length > 0 ? where : undefined,
        });
        res.json({ feedbacks, total });
    }
    catch (error) {
        console.error('Error fetching feedback:', error);
        res.status(500).json({ error: 'Failed to fetch feedback' });
    }
};
exports.getAllFeedback = getAllFeedback;
const deleteFeedback = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.feedback.delete({
            where: { id },
        });
        res.json({ message: 'Feedback deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting feedback:', error);
        res.status(500).json({ error: 'Failed to delete feedback' });
    }
};
exports.deleteFeedback = deleteFeedback;
const addFeedbackComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { content, authorName, authorEmail, parentId } = req.body;
        const userId = req.user?.userId || null;
        const comment = await prisma.feedbackComment.create({
            data: {
                content,
                authorName: userId ? null : authorName,
                authorEmail: userId ? null : authorEmail,
                userId,
                feedbackId: id,
                parentId: parentId || null,
            },
            include: {
                user: { select: { id: true, name: true, image: true } },
            },
        });
        res.json(comment);
    }
    catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ error: 'Failed to add comment' });
    }
};
exports.addFeedbackComment = addFeedbackComment;
const updateFeedbackComment = async (req, res) => {
    try {
        const { id, commentId } = req.params;
        const { content, userId: bodyUserId } = req.body;
        const userId = req.user?.userId || bodyUserId || null;
        if (!userId) {
            return res.status(401).json({ error: 'Must be logged in to edit comments' });
        }
        const comment = await prisma.feedbackComment.findUnique({
            where: { id: commentId },
        });
        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }
        if (!comment.userId) {
            return res.status(403).json({ error: 'Anonymous comments can only be managed by admin' });
        }
        if (comment.userId !== userId) {
            return res.status(403).json({ error: 'Not authorized to edit this comment' });
        }
        const updatedComment = await prisma.feedbackComment.update({
            where: { id: commentId },
            data: { content },
            include: {
                user: { select: { id: true, name: true, image: true } },
            },
        });
        res.json(updatedComment);
    }
    catch (error) {
        console.error('Error updating comment:', error);
        res.status(500).json({ error: 'Failed to update comment' });
    }
};
exports.updateFeedbackComment = updateFeedbackComment;
const deleteFeedbackComment = async (req, res) => {
    try {
        const { id, commentId } = req.params;
        const { userId: bodyUserId } = req.body;
        const userId = req.user?.userId || bodyUserId || null;
        if (!userId) {
            return res.status(401).json({ error: 'Must be logged in to delete comments' });
        }
        const comment = await prisma.feedbackComment.findUnique({
            where: { id: commentId },
        });
        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }
        if (!comment.userId) {
            return res.status(403).json({ error: 'Anonymous comments can only be managed by admin' });
        }
        if (comment.userId !== userId) {
            return res.status(403).json({ error: 'Not authorized to delete this comment' });
        }
        await prisma.feedbackComment.delete({
            where: { id: commentId },
        });
        res.json({ message: 'Comment deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ error: 'Failed to delete comment' });
    }
};
exports.deleteFeedbackComment = deleteFeedbackComment;
const toggleFeedbackLike = async (req, res) => {
    try {
        const { id } = req.params;
        const { isLike, sessionId, userId: bodyUserId } = req.body;
        const userId = req.user?.userId || bodyUserId || null;
        const existingLike = await prisma.feedbackLike.findFirst({
            where: {
                feedbackId: id,
                ...(userId ? { userId } : { sessionId }),
            },
        });
        if (existingLike) {
            if (existingLike.isLike === isLike) {
                await prisma.feedbackLike.delete({ where: { id: existingLike.id } });
                await prisma.feedback.update({
                    where: { id },
                    data: { [isLike ? 'likes' : 'dislikes']: { decrement: 1 } },
                });
            }
            else {
                await prisma.feedbackLike.update({
                    where: { id: existingLike.id },
                    data: { isLike },
                });
                await prisma.feedback.update({
                    where: { id },
                    data: {
                        likes: { increment: isLike ? 1 : -1 },
                        dislikes: { increment: isLike ? -1 : 1 },
                    },
                });
            }
        }
        else {
            await prisma.feedbackLike.create({
                data: {
                    feedbackId: id,
                    userId,
                    sessionId: userId ? null : sessionId,
                    isLike,
                },
            });
            await prisma.feedback.update({
                where: { id },
                data: { [isLike ? 'likes' : 'dislikes']: { increment: 1 } },
            });
        }
        const updatedFeedback = await prisma.feedback.findUnique({
            where: { id },
            select: { likes: true, dislikes: true },
        });
        res.json(updatedFeedback);
    }
    catch (error) {
        console.error('Error toggling feedback like:', error);
        res.status(500).json({ error: 'Failed to toggle like' });
    }
};
exports.toggleFeedbackLike = toggleFeedbackLike;
