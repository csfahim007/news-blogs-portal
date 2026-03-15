"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.updateCategory = exports.createCategory = exports.getAllCategories = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const getAllCategories = async (req, res) => {
    try {
        const categories = await prisma_1.default.category.findMany({
            include: {
                _count: {
                    select: { blogs: true },
                },
            },
        });
        res.json(categories);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
};
exports.getAllCategories = getAllCategories;
const createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Category name is required' });
        }
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const category = await prisma_1.default.category.create({
            data: {
                name,
                slug,
                description: description || '',
            },
        });
        res.status(201).json({ category });
    }
    catch (error) {
        console.error('Category creation error:', error);
        if (error.code === 'P2002') {
            return res.status(409).json({
                error: 'A category with this name already exists',
                field: 'name'
            });
        }
        res.status(500).json({ error: 'Failed to create category', details: error.message });
    }
};
exports.createCategory = createCategory;
const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;
        const category = await prisma_1.default.category.update({
            where: { id },
            data: { name, description },
        });
        res.json(category);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update category' });
    }
};
exports.updateCategory = updateCategory;
const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma_1.default.category.delete({ where: { id } });
        res.json({ message: 'Category deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete category' });
    }
};
exports.deleteCategory = deleteCategory;
