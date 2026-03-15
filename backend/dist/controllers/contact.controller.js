"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteContactMessage = exports.updateContactMessageStatus = exports.getAllContactMessages = exports.createContactMessage = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const createContactMessage = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        if (!name || !email || !message) {
            return res.status(400).json({ message: 'Name, email, and message are required' });
        }
        const contactMessage = await prisma.contactMessage.create({
            data: {
                name,
                email,
                subject,
                message,
            },
        });
        res.status(201).json({
            message: 'Message sent successfully',
            contactMessage
        });
    }
    catch (error) {
        console.error('Error creating contact message:', error);
        res.status(500).json({ message: 'Failed to send message' });
    }
};
exports.createContactMessage = createContactMessage;
const getAllContactMessages = async (req, res) => {
    try {
        const { status } = req.query;
        const where = {};
        if (status) {
            where.status = status;
        }
        const messages = await prisma.contactMessage.findMany({
            where,
            orderBy: {
                createdAt: 'desc',
            },
        });
        res.json({ messages });
    }
    catch (error) {
        console.error('Error fetching contact messages:', error);
        res.status(500).json({ message: 'Failed to fetch messages' });
    }
};
exports.getAllContactMessages = getAllContactMessages;
const updateContactMessageStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        if (!['unread', 'read', 'replied'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }
        const message = await prisma.contactMessage.update({
            where: { id },
            data: { status },
        });
        res.json({ message: 'Status updated successfully', contactMessage: message });
    }
    catch (error) {
        console.error('Error updating message status:', error);
        res.status(500).json({ message: 'Failed to update status' });
    }
};
exports.updateContactMessageStatus = updateContactMessageStatus;
const deleteContactMessage = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.contactMessage.delete({
            where: { id },
        });
        res.json({ message: 'Message deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting message:', error);
        res.status(500).json({ message: 'Failed to delete message' });
    }
};
exports.deleteContactMessage = deleteContactMessage;
