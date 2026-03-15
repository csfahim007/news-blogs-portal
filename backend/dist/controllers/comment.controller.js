"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteComment = exports.updateComment = exports.createComment = exports.getCommentsByBlog = void 0;
const express_validator_1 = require("express-validator");
const prisma_1 = __importDefault(require("../lib/prisma"));
const getCommentsByBlog = async (req, res) => {
    try {
        const { blogId } = req.params;
        const comments = await prisma_1.default.comment.findMany({
            where: { blogId },
            include: {
                author: {
                    select: { id: true, name: true, image: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json(comments);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch comments' });
    }
};
exports.getCommentsByBlog = getCommentsByBlog;
const createComment = async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { content, blogId } = req.body;
        const comment = await prisma_1.default.comment.create({
            data: {
                content,
                authorId: req.userId,
                blogId,
            },
            include: {
                author: {
                    select: { id: true, name: true, image: true },
                },
            },
        });
        res.status(201).json(comment);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create comment' });
    }
};
exports.createComment = createComment;
const updateComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { content } = req.body;
        const comment = await prisma_1.default.comment.findUnique({ where: { id } });
        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }
        if (comment.authorId !== req.userId) {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        const updatedComment = await prisma_1.default.comment.update({
            where: { id },
            data: { content },
            include: {
                author: {
                    select: { id: true, name: true, image: true },
                },
            },
        });
        res.json(updatedComment);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update comment' });
    }
};
exports.updateComment = updateComment;
const deleteComment = async (req, res) => {
    try {
        const { id } = req.params;
        const comment = await prisma_1.default.comment.findUnique({ where: { id } });
        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }
        if (comment.authorId !== req.userId && req.userRole !== 'admin') {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        await prisma_1.default.comment.delete({ where: { id } });
        res.json({ message: 'Comment deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete comment' });
    }
};
exports.deleteComment = deleteComment;
