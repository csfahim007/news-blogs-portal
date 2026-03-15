import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Create feedback (registered or anonymous)
export const createFeedback = async (req: Request, res: Response) => {
  try {
    const { content, authorName, authorEmail, mentionedBlogId, mentionedNewsId, userId: bodyUserId } = req.body;
    // Try to get userId from auth middleware first, then from body
    const userId = (req as any).user?.userId || bodyUserId || null;

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
  } catch (error) {
    console.error('Error creating feedback:', error);
    res.status(500).json({ error: 'Failed to create feedback' });
  }
};

// Get all feedback with optional filters
export const getAllFeedback = async (req: Request, res: Response) => {
  try {
    const { blogId, newsId, limit = '50', skip = '0' } = req.query;

    const where: any = {};
    if (blogId) where.mentionedBlogId = blogId as string;
    if (newsId) where.mentionedNewsId = newsId as string;

    const feedbacks = await prisma.feedback.findMany({
      where: Object.keys(where).length > 0 ? where : undefined,
      take: parseInt(limit as string),
      skip: parseInt(skip as string),
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
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ error: 'Failed to fetch feedback' });
  }
};

// Delete feedback (admin only)
export const deleteFeedback = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.feedback.delete({
      where: { id },
    });

    res.json({ message: 'Feedback deleted successfully' });
  } catch (error) {
    console.error('Error deleting feedback:', error);
    res.status(500).json({ error: 'Failed to delete feedback' });
  }
};

// Add comment to feedback
export const addFeedbackComment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { content, authorName, authorEmail, parentId } = req.body;
    const userId = (req as any).user?.userId || null;

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
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
};

// Update feedback comment (registered users only - own comments)
export const updateFeedbackComment = async (req: Request, res: Response) => {
  try {
    const { id, commentId } = req.params;
    const { content, userId: bodyUserId } = req.body;
    const userId = (req as any).user?.userId || bodyUserId || null;

    if (!userId) {
      return res.status(401).json({ error: 'Must be logged in to edit comments' });
    }

    const comment = await prisma.feedbackComment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Only allow registered users to edit their own comments
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
  } catch (error) {
    console.error('Error updating comment:', error);
    res.status(500).json({ error: 'Failed to update comment' });
  }
};

// Delete feedback comment (registered users only - own comments)
export const deleteFeedbackComment = async (req: Request, res: Response) => {
  try {
    const { id, commentId } = req.params;
    const { userId: bodyUserId } = req.body;
    const userId = (req as any).user?.userId || bodyUserId || null;

    if (!userId) {
      return res.status(401).json({ error: 'Must be logged in to delete comments' });
    }

    const comment = await prisma.feedbackComment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Only allow registered users to delete their own comments
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
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
};

// Toggle like/dislike on feedback
export const toggleFeedbackLike = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { isLike, sessionId, userId: bodyUserId } = req.body;
    const userId = (req as any).user?.userId || bodyUserId || null;

    // Check if user/session already liked/disliked
    const existingLike = await prisma.feedbackLike.findFirst({
      where: {
        feedbackId: id,
        ...(userId ? { userId } : { sessionId }),
      },
    });

    if (existingLike) {
      if (existingLike.isLike === isLike) {
        // Remove like/dislike
        await prisma.feedbackLike.delete({ where: { id: existingLike.id } });
        await prisma.feedback.update({
          where: { id },
          data: { [isLike ? 'likes' : 'dislikes']: { decrement: 1 } },
        });
      } else {
        // Switch from like to dislike or vice versa
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
    } else {
      // Create new like/dislike
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
  } catch (error) {
    console.error('Error toggling feedback like:', error);
    res.status(500).json({ error: 'Failed to toggle like' });
  }
};
