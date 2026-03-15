"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setPassword = exports.deleteUser = exports.updateUserRole = exports.getAllUsers = exports.updateProfile = exports.getProfile = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const getProfile = async (req, res) => {
    try {
        const user = await prisma_1.default.user.findUnique({
            where: { id: req.userId },
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                bio: true,
                role: true,
                createdAt: true,
            },
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
};
exports.getProfile = getProfile;
const updateProfile = async (req, res) => {
    try {
        const { name, bio, image } = req.body;
        const user = await prisma_1.default.user.update({
            where: { id: req.userId },
            data: { name, bio, image },
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                bio: true,
                role: true,
            },
        });
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update profile' });
    }
};
exports.updateProfile = updateProfile;
const getAllUsers = async (req, res) => {
    try {
        const users = await prisma_1.default.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                role: true,
                createdAt: true,
                _count: {
                    select: { blogs: true, comments: true },
                },
            },
        });
        res.json(users);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};
exports.getAllUsers = getAllUsers;
const updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;
        if (!['user', 'admin'].includes(role)) {
            return res.status(400).json({ error: 'Invalid role' });
        }
        const user = await prisma_1.default.user.update({
            where: { id },
            data: { role },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
            },
        });
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update user role' });
    }
};
exports.updateUserRole = updateUserRole;
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        if (id === req.userId) {
            return res.status(400).json({ error: 'Cannot delete your own account' });
        }
        await prisma_1.default.user.delete({
            where: { id },
        });
        res.json({ message: 'User deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete user' });
    }
};
exports.deleteUser = deleteUser;
const setPassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters long' });
        }
        const user = await prisma_1.default.user.findUnique({
            where: { id: req.userId },
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        if (user.password && currentPassword) {
            const isPasswordValid = await bcryptjs_1.default.compare(currentPassword, user.password);
            if (!isPasswordValid) {
                return res.status(400).json({ error: 'Current password is incorrect' });
            }
        }
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, 10);
        const updatedUser = await prisma_1.default.user.update({
            where: { id: req.userId },
            data: { password: hashedPassword },
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                bio: true,
                role: true,
            },
        });
        res.json({ message: 'Password set successfully', user: updatedUser });
    }
    catch (error) {
        console.error('Error setting password:', error);
        res.status(500).json({ error: 'Failed to set password' });
    }
};
exports.setPassword = setPassword;
