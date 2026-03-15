import { Response } from 'express';
import { validationResult } from 'express-validator';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../lib/prisma';

export const getAllBlogs = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 10, search, categoryId, published, includeDrafts } = req.query;
    
    const where: any = {};
    const andConditions: any[] = [];
    
    if (search) {
      andConditions.push({
        OR: [
          { title: { contains: search as string } },
          { content: { contains: search as string } },
        ]
      });
    }
    
    if (categoryId) {
      where.categoryId = categoryId;
    }
    
    // If includeDrafts is true and user is authenticated, show their drafts too
    if (includeDrafts === 'true' && req.userId) {
      if (req.userRole === 'admin') {
        // Admin can see all drafts (published OR unpublished)
        andConditions.push({
          OR: [
            { published: true },
            { published: false }
          ]
        });
      } else {
        // Regular users can see published or their own drafts
        andConditions.push({
          OR: [
            { published: true },
            { authorId: req.userId, published: false }
          ]
        });
      }
    } else if (published !== undefined) {
      where.published = published === 'true';
    } else {
      where.published = true; // Only show published by default
    }
    
    if (andConditions.length > 0) {
      where.AND = andConditions;
    }

    const skip = (Number(page) - 1) * Number(limit);
    
    const [blogs, total] = await Promise.all([
      prisma.blog.findMany({
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
      prisma.blog.count({ where }),
    ]);

    // Calculate average rating and first feedback for each blog
    const blogsWithStats = await Promise.all(
      blogs.map(async (blog: any) => {
        const avgRating = blog.ratings.length > 0
          ? blog.ratings.reduce((acc: number, r: any) => acc + r.rating, 0) / blog.ratings.length
          : 0;

        // Get first (latest) feedback for this blog
        const firstFeedback = await prisma.feedback.findFirst({
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

        // Count total feedbacks for this blog
        const feedbackCount = await prisma.feedback.count({
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
      })
    );

    res.json({
      blogs: blogsWithStats,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch blogs' });
  }
};

export const getBlogById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const blog = await prisma.blog.findUnique({
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
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch blog' });
  }
};

export const getBlogBySlug = async (req: AuthRequest, res: Response) => {
  try {
    const { slug } = req.params;

    const blog = await prisma.blog.findUnique({
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

    // Calculate average rating
    const avgRating = blog.ratings.length > 0
      ? blog.ratings.reduce((acc, r) => acc + r.rating, 0) / blog.ratings.length
      : 0;

    // Count feedbacks for this blog
    const feedbackCount = await prisma.feedback.count({
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
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch blog' });
  }
};

export const createBlog = async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: req.userId! }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found. Please login again.' });
    }

    const { title, content, excerpt, coverImage, categoryId, published, slug: providedSlug, titleAlignment, metaTitle, metaDescription, keywords, canonicalUrl, ogImage, noIndex } = req.body;
    
    // Use provided slug or generate one from title
    let slug = providedSlug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    // Add timestamp only if slug is not unique (to handle duplicates)
    let finalSlug = slug;
    let slugExists = await prisma.blog.findFirst({ where: { slug } });
    if (slugExists) {
      finalSlug = `${slug}-${Date.now()}`;
    }

    const blog = await prisma.blog.create({
      data: {
        title,
        content,
        excerpt: excerpt || content.substring(0, 200),
        coverImage,
        slug: finalSlug,
        published: published || false,
        titleAlignment: titleAlignment || 'left',
        authorId: req.userId!,
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
  } catch (error) {
    res.status(500).json({ error: 'Failed to create blog' });
  }
};

export const updateBlog = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, content, excerpt, coverImage, categoryId, published, titleAlignment, metaTitle, metaDescription, keywords, canonicalUrl, ogImage, noIndex } = req.body;

    const blog = await prisma.blog.findUnique({ where: { id } });

    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    if (blog.authorId !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const updatedBlog = await prisma.blog.update({
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
  } catch (error) {
    res.status(500).json({ error: 'Failed to update blog' });
  }
};

export const deleteBlog = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const blog = await prisma.blog.findUnique({ where: { id } });

    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    if (blog.authorId !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await prisma.blog.delete({ where: { id } });

    res.json({ message: 'Blog deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete blog' });
  }
};

export const likeBlog = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const existingLike = await prisma.like.findUnique({
      where: {
        userId_blogId: {
          userId: req.userId!,
          blogId: id,
        },
      },
    });

    if (existingLike) {
      await prisma.like.delete({
        where: { id: existingLike.id },
      });
      return res.json({ message: 'Like removed', liked: false });
    }

    await prisma.like.create({
      data: {
        userId: req.userId!,
        blogId: id,
      },
    });

    res.json({ message: 'Blog liked', liked: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to like blog' });
  }
};

export const publishBlog = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const blog = await prisma.blog.update({
      where: { id },
      data: { published: true },
    });

    res.json(blog);
  } catch (error) {
    res.status(500).json({ error: 'Failed to publish blog' });
  }
};

// Rate a blog (1-5 scale)
export const rateBlog = async (req: AuthRequest, res: Response) => {
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

    // Upsert rating (update if exists, create if not)
    const ratingRecord = await prisma.blogRating.upsert({
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

    // Calculate average rating
    const ratings = await prisma.blogRating.findMany({
      where: { blogId: id },
      select: { rating: true },
    });

    const avgRating = ratings.reduce((acc: number, r: { rating: number }) => acc + r.rating, 0) / ratings.length;

    res.json({ rating: ratingRecord, avgRating, totalRatings: ratings.length });
  } catch (error) {
    console.error('Error rating blog:', error);
    res.status(500).json({ error: 'Failed to rate blog' });
  }
};

// Track blog view (2-minute read with scroll)
export const trackBlogView = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { duration, scrolled, sessionId } = req.body;

    const blog = await prisma.blog.findUnique({ where: { id } });
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    // Check if view already exists
    const existingView = await prisma.blogView.findFirst({
      where: {
        blogId: id,
        OR: [
          req.userId ? { userId: req.userId } : {},
          sessionId ? { sessionId } : {},
        ],
      },
    });

    if (existingView) {
      // Update existing view
      await prisma.blogView.update({
        where: { id: existingView.id },
        data: {
          duration: Math.max(existingView.duration, duration || 0),
          scrolled: scrolled || existingView.scrolled,
        },
      });
    } else {
      // Create new view
      await prisma.blogView.create({
        data: {
          blogId: id,
          userId: req.userId || null,
          sessionId: sessionId || null,
          duration: duration || 0,
          scrolled: scrolled || false,
        },
      });

      // Increment blog views counter
      await prisma.blog.update({
        where: { id },
        data: { views: { increment: 1 } },
      });
    }

    res.json({ message: 'View tracked successfully' });
  } catch (error) {
    console.error('Error tracking blog view:', error);
    res.status(500).json({ error: 'Failed to track view' });
  }
};

// Get blog statistics
export const getBlogStats = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { sessionId, userId: queryUserId } = req.query;
    const userId = req.user?.userId || (queryUserId as string) || null;

    const blog = await prisma.blog.findUnique({
      where: { id },
      select: { views: true },
    });

    const ratings = await prisma.blogRating.findMany({
      where: { blogId: id },
      select: { rating: true },
    });

    const avgRating = ratings.length > 0
      ? ratings.reduce((acc: number, r: { rating: number }) => acc + r.rating, 0) / ratings.length
      : 0;

    const totalViews = await prisma.blogView.count({
      where: { blogId: id },
    });

    // Get user's current rating
    let userRating = 0;
    if (userId || sessionId) {
      const userRatingRecord = await prisma.blogRating.findFirst({
        where: {
          blogId: id,
          ...(userId ? { userId } : { sessionId: sessionId as string }),
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
  } catch (error) {
    console.error('Error fetching blog stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};
