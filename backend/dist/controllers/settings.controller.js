"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearBreakingNews = exports.updateSiteSettings = exports.getSiteSettings = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const getSiteSettings = async (req, res) => {
    try {
        let settings = await prisma_1.default.siteSettings.findUnique({
            where: { id: 'default' },
        });
        if (!settings) {
            settings = await prisma_1.default.siteSettings.create({
                data: {
                    id: 'default',
                    breakingNewsTitle: '',
                    breakingNewsId: null,
                },
            });
        }
        res.json(settings);
    }
    catch (error) {
        console.error('Error fetching site settings:', error);
        res.status(500).json({ error: 'Failed to fetch site settings' });
    }
};
exports.getSiteSettings = getSiteSettings;
const updateSiteSettings = async (req, res) => {
    try {
        if (req.userRole !== 'admin') {
            return res.status(403).json({ error: 'Unauthorized - Admin access required' });
        }
        const { breakingNewsId, breakingNewsTitle } = req.body;
        if (breakingNewsId) {
            const news = await prisma_1.default.news.findUnique({
                where: { id: breakingNewsId },
            });
            if (!news) {
                return res.status(404).json({ error: 'News not found' });
            }
        }
        let settings = await prisma_1.default.siteSettings.findUnique({
            where: { id: 'default' },
        });
        if (!settings) {
            settings = await prisma_1.default.siteSettings.create({
                data: {
                    id: 'default',
                    breakingNewsId: breakingNewsId || null,
                    breakingNewsTitle: breakingNewsTitle || '',
                },
            });
        }
        else {
            settings = await prisma_1.default.siteSettings.update({
                where: { id: 'default' },
                data: {
                    breakingNewsId: breakingNewsId || null,
                    breakingNewsTitle: breakingNewsTitle || '',
                },
            });
        }
        res.json(settings);
    }
    catch (error) {
        console.error('Error updating site settings:', error);
        res.status(500).json({ error: 'Failed to update site settings' });
    }
};
exports.updateSiteSettings = updateSiteSettings;
const clearBreakingNews = async (req, res) => {
    try {
        if (req.userRole !== 'admin') {
            return res.status(403).json({ error: 'Unauthorized - Admin access required' });
        }
        const settings = await prisma_1.default.siteSettings.update({
            where: { id: 'default' },
            data: {
                breakingNewsId: null,
                breakingNewsTitle: null,
            },
        });
        res.json({ message: 'Breaking news cleared', settings });
    }
    catch (error) {
        console.error('Error clearing breaking news:', error);
        res.status(500).json({ error: 'Failed to clear breaking news' });
    }
};
exports.clearBreakingNews = clearBreakingNews;
