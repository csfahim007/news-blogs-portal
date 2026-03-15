import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import prisma from '../lib/prisma';

export const register = async (req: Request, res: Response) => {
  console.log('[BACKEND-REGISTER] Request received');
  console.log('[BACKEND-REGISTER] Body:', { ...req.body, password: '***' });
  
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error('[BACKEND-REGISTER] Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, name } = req.body;

    console.log('[BACKEND-REGISTER] Checking for existing user:', email);
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      console.error('[BACKEND-REGISTER] User already exists:', email);
      return res.status(400).json({ error: 'User already exists' });
    }

    console.log('[BACKEND-REGISTER] Hashing password');
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log('[BACKEND-REGISTER] Creating user in database');
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'user',
      },
    });

    console.log('[BACKEND-REGISTER] User created successfully:', user.id);
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    console.log('[BACKEND-REGISTER] Sending success response');
    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error('[BACKEND-REGISTER] Error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

export const login = async (req: Request, res: Response) => {
  console.log('[BACKEND-LOGIN] Request received');
  console.log('[BACKEND-LOGIN] Email:', req.body.email);
  
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error('[BACKEND-LOGIN] Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    console.log('[BACKEND-LOGIN] Looking up user:', email);
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      console.error('[BACKEND-LOGIN] User not found or no password:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('[BACKEND-LOGIN] Verifying password');
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.error('[BACKEND-LOGIN] Invalid password for:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('[BACKEND-LOGIN] Login successful, generating token');
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
      role: string;
    };

    const newToken = jwt.sign(
      { userId: decoded.userId, role: decoded.role },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    res.json({ token: newToken });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

export const generateOAuthToken = async (req: Request, res: Response) => {
  console.log('[BACKEND-OAUTH-TOKEN] Request received');
  console.log('[BACKEND-OAUTH-TOKEN] Body:', req.body);
  
  try {
    const { email, id, role } = req.body;

    if (!email || !id || !role) {
      console.error('[BACKEND-OAUTH-TOKEN] Missing required fields');
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verify user exists in database
    console.log('[BACKEND-OAUTH-TOKEN] Verifying user exists:', email);
    const user = await prisma.user.findUnique({ 
      where: { email },
      select: { id: true, role: true, email: true }
    });

    if (!user) {
      console.error('[BACKEND-OAUTH-TOKEN] User not found:', email);
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('[BACKEND-OAUTH-TOKEN] Generating token for user:', user.id);
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    console.log('[BACKEND-OAUTH-TOKEN] Token generated successfully');
    res.json({ token });
  } catch (error) {
    console.error('[BACKEND-OAUTH-TOKEN] Error:', error);
    res.status(500).json({ error: 'Failed to generate token' });
  }
};
