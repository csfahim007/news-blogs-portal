import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createContactMessage = async (req: Request, res: Response) => {
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
  } catch (error) {
    console.error('Error creating contact message:', error);
    res.status(500).json({ message: 'Failed to send message' });
  }
};

export const getAllContactMessages = async (req: Request, res: Response) => {
  try {
    const { status } = req.query;

    const where: any = {};
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
  } catch (error) {
    console.error('Error fetching contact messages:', error);
    res.status(500).json({ message: 'Failed to fetch messages' });
  }
};

export const updateContactMessageStatus = async (req: Request, res: Response) => {
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
  } catch (error) {
    console.error('Error updating message status:', error);
    res.status(500).json({ message: 'Failed to update status' });
  }
};

export const deleteContactMessage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.contactMessage.delete({
      where: { id },
    });

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ message: 'Failed to delete message' });
  }
};
