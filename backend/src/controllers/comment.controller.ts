import { Response } from 'express';
import { validationResult } from 'express-validator';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../lib/prisma';

export const getCommentsByBlog = async (req: AuthRequest, res: Response) => {
  try {
    const { blogId } = req.params;

    const comments = await prisma.comment.findMany({
      where: { blogId },
      include: {
        author: {
          select: { id: true, name: true, image: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
};

export const createComment = async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { content, blogId } = req.body;

    const comment = await prisma.comment.create({
      data: {
        content,
        authorId: req.userId!,
        blogId,
      },
      include: {
        author: {
          select: { id: true, name: true, image: true },
        },
      },
    });

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create comment' });
  }
};

export const updateComment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    const comment = await prisma.comment.findUnique({ where: { id } });

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (comment.authorId !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const updatedComment = await prisma.comment.update({
      where: { id },
      data: { content },
      include: {
        author: {
          select: { id: true, name: true, image: true },
        },
      },
    });

    res.json(updatedComment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update comment' });
  }
};

export const deleteComment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const comment = await prisma.comment.findUnique({ where: { id } });

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (comment.authorId !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await prisma.comment.delete({ where: { id } });

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete comment' });
  }
};
