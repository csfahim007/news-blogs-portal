import { Response } from 'express';
import { validationResult } from 'express-validator';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../lib/prisma';

export const getAllNews = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 10, search, categoryId, published, featured, includeDrafts } = req.query;
    
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
    
    if (featured === 'true') {
      where.featured = true;
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
    
    const [news, total] = await Promise.all([
      prisma.news.findMany({
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
      prisma.news.count({ where }),
    ]);

    // Calculate average rating and first feedback for each news
    const newsWithStats = await Promise.all(
      news.map(async (newsItem: any) => {
        const avgRating = newsItem.ratings.length > 0
          ? newsItem.ratings.reduce((acc: number, r: any) => acc + r.rating, 0) / newsItem.ratings.length
          : 0;

        // Get first (latest) feedback for this news
        const firstFeedback = await prisma.feedback.findFirst({
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

        // Count total feedbacks for this news
        const feedbackCount = await prisma.feedback.count({
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
      })
    );

    res.json({
      news: newsWithStats,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
};

export const getNewsById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const news = await prisma.news.findUnique({
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

    // Check if user has access (published or own draft)
    if (!news.published && news.authorId !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Calculate stats
    const avgRating = news.ratings.length > 0
      ? news.ratings.reduce((acc, r) => acc + r.rating, 0) / news.ratings.length
      : 0;

    const feedbackCount = await prisma.feedback.count({
      where: { mentionedNewsId: news.id },
    });

    const { ratings, ...newsData } = news;

    res.json({
      ...newsData,
      averageRating: parseFloat(avgRating.toFixed(1)),
      views: news.views || 0,
      feedbackCount,
    });
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
};

export const getNewsBySlug = async (req: AuthRequest, res: Response) => {
  try {
    const { slug } = req.params;

    const news = await prisma.news.findUnique({
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

    // Check if user has access
    if (!news.published && news.authorId !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Calculate stats
    const avgRating = news.ratings.length > 0
      ? news.ratings.reduce((acc, r) => acc + r.rating, 0) / news.ratings.length
      : 0;

    const feedbackCount = await prisma.feedback.count({
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
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
};

export const createNews = async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { 
      title, content, excerpt, coverImage, categoryId, published, featured, slug: providedSlug, titleAlignment,
      metaTitle, metaDescription, keywords, canonicalUrl, ogImage, noIndex 
    } = req.body;
    
    // Use provided slug or generate one from title
    let slug = providedSlug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    // Add timestamp only if slug is not unique (to handle duplicates)
    let finalSlug = slug;
    let slugExists = await prisma.news.findFirst({ where: { slug } });
    if (slugExists) {
      finalSlug = `${slug}-${Date.now()}`;
    }

    // Only admins can set featured
    const canSetFeatured = req.userRole === 'admin';

    const news = await prisma.news.create({
      data: {
        title,
        content,
        excerpt: excerpt || content.substring(0, 200),
        coverImage,
        slug: finalSlug,
        published: published || false,
        featured: canSetFeatured ? (featured || false) : false,
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

    res.status(201).json(news);
  } catch (error) {
    console.error('Error creating news:', error);
    res.status(500).json({ error: 'Failed to create news' });
  }
};

export const updateNews = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { 
      title, content, excerpt, coverImage, categoryId, published, featured, titleAlignment,
      metaTitle, metaDescription, keywords, canonicalUrl, ogImage, noIndex 
    } = req.body;

    const news = await prisma.news.findUnique({ where: { id } });

    if (!news) {
      return res.status(404).json({ error: 'News not found' });
    }

    if (news.authorId !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Only admins can change featured status
    const canSetFeatured = req.userRole === 'admin';

    const updatedNews = await prisma.news.update({
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
  } catch (error) {
    console.error('Error updating news:', error);
    res.status(500).json({ error: 'Failed to update news' });
  }
};

export const deleteNews = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const news = await prisma.news.findUnique({ where: { id } });

    if (!news) {
      return res.status(404).json({ error: 'News not found' });
    }

    if (news.authorId !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // If this news is set as breaking news, clear it
    const settings = await prisma.siteSettings.findUnique({
      where: { id: 'default' },
    });
    
    if (settings?.breakingNewsId === id) {
      await prisma.siteSettings.update({
        where: { id: 'default' },
        data: {
          breakingNewsId: null,
          breakingNewsTitle: null,
        },
      });
    }

    await prisma.news.delete({ where: { id } });

    res.json({ message: 'News deleted successfully' });
  } catch (error) {
    console.error('Error deleting news:', error);
    res.status(500).json({ error: 'Failed to delete news' });
  }
};

export const trackNewsView = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { duration, scrolled, sessionId } = req.body;

    const news = await prisma.news.findUnique({ where: { id } });
    if (!news) {
      return res.status(404).json({ error: 'News not found' });
    }

    // Check if view already exists
    const existingView = await prisma.newsView.findFirst({
      where: {
        newsId: id,
        OR: [
          req.userId ? { userId: req.userId } : {},
          sessionId ? { sessionId } : {},
        ],
      },
    });

    if (existingView) {
      // Update existing view
      await prisma.newsView.update({
        where: { id: existingView.id },
        data: {
          duration: Math.max(existingView.duration, duration || 0),
          scrolled: scrolled || existingView.scrolled,
        },
      });
    } else {
      // Create new view
      await prisma.newsView.create({
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
  } catch (error) {
    console.error('Error tracking view:', error);
    res.status(500).json({ error: 'Failed to track view' });
  }
};

export const rateNews = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { rating, sessionId } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const news = await prisma.news.findUnique({ where: { id } });
    if (!news) {
      return res.status(404).json({ error: 'News not found' });
    }

    const existingRating = await prisma.newsRating.findFirst({
      where: {
        newsId: id,
        OR: [
          req.userId ? { userId: req.userId } : {},
          sessionId ? { sessionId } : {},
        ],
      },
    });

    if (existingRating) {
      // Update existing rating
      await prisma.newsRating.update({
        where: { id: existingRating.id },
        data: { rating },
      });
    } else {
      // Create new rating
      await prisma.newsRating.create({
        data: {
          newsId: id,
          userId: req.userId || null,
          sessionId: sessionId || null,
          rating,
        },
      });
    }

    res.json({ message: 'Rating submitted successfully' });
  } catch (error) {
    console.error('Error rating news:', error);
    res.status(500).json({ error: 'Failed to submit rating' });
  }
};

export const toggleFeatured = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Only admins can toggle featured status' });
    }

    const news = await prisma.news.findUnique({ where: { id } });
    if (!news) {
      return res.status(404).json({ error: 'News not found' });
    }

    const updatedNews = await prisma.news.update({
      where: { id },
      data: { featured: !news.featured },
    });

    res.json(updatedNews);
  } catch (error) {
    console.error('Error toggling featured:', error);
    res.status(500).json({ error: 'Failed to toggle featured status' });
  }
};
