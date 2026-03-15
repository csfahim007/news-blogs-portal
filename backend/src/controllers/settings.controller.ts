import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../lib/prisma';

// Re-generated TypeScript types for SiteSettings

export const getSiteSettings = async (req: AuthRequest, res: Response) => {
  try {
    let settings = await prisma.siteSettings.findUnique({
      where: { id: 'default' },
    });

    if (!settings) {
      settings = await prisma.siteSettings.create({
        data: {
          id: 'default',
          breakingNewsTitle: '',
          breakingNewsId: null,
        },
      });
    }

    res.json(settings);
  } catch (error) {
    console.error('Error fetching site settings:', error);
    res.status(500).json({ error: 'Failed to fetch site settings' });
  }
};

export const updateSiteSettings = async (req: AuthRequest, res: Response) => {
  try {
    // Check if user is admin
    if (req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized - Admin access required' });
    }

    const { breakingNewsId, breakingNewsTitle } = req.body;

    // If breakingNewsId is provided, verify the news exists
    if (breakingNewsId) {
      const news = await prisma.news.findUnique({
        where: { id: breakingNewsId },
      });
      if (!news) {
        return res.status(404).json({ error: 'News not found' });
      }
    }

    let settings = await prisma.siteSettings.findUnique({
      where: { id: 'default' },
    });

    if (!settings) {
      settings = await prisma.siteSettings.create({
        data: {
          id: 'default',
          breakingNewsId: breakingNewsId || null,
          breakingNewsTitle: breakingNewsTitle || '',
        },
      });
    } else {
      settings = await prisma.siteSettings.update({
        where: { id: 'default' },
        data: {
          breakingNewsId: breakingNewsId || null,
          breakingNewsTitle: breakingNewsTitle || '',
        },
      });
    }

    res.json(settings);
  } catch (error) {
    console.error('Error updating site settings:', error);
    res.status(500).json({ error: 'Failed to update site settings' });
  }
};

export const clearBreakingNews = async (req: AuthRequest, res: Response) => {
  try {
    // Check if user is admin
    if (req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized - Admin access required' });
    }

    const settings = await prisma.siteSettings.update({
      where: { id: 'default' },
      data: {
        breakingNewsId: null,
        breakingNewsTitle: null,
      },
    });

    res.json({ message: 'Breaking news cleared', settings });
  } catch (error) {
    console.error('Error clearing breaking news:', error);
    res.status(500).json({ error: 'Failed to clear breaking news' });
  }
};

