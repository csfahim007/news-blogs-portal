"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOAuthToken = exports.refreshToken = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const express_validator_1 = require("express-validator");
const prisma_1 = __importDefault(require("../lib/prisma"));
const register = async (req, res) => {
    console.log('[BACKEND-REGISTER] Request received');
    console.log('[BACKEND-REGISTER] Body:', { ...req.body, password: '***' });
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            console.error('[BACKEND-REGISTER] Validation errors:', errors.array());
            return res.status(400).json({ errors: errors.array() });
        }
        const { email, password, name } = req.body;
        console.log('[BACKEND-REGISTER] Checking for existing user:', email);
        const existingUser = await prisma_1.default.user.findUnique({ where: { email } });
        if (existingUser) {
            console.error('[BACKEND-REGISTER] User already exists:', email);
            return res.status(400).json({ error: 'User already exists' });
        }
        console.log('[BACKEND-REGISTER] Hashing password');
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        console.log('[BACKEND-REGISTER] Creating user in database');
        const user = await prisma_1.default.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                role: 'user',
            },
        });
        console.log('[BACKEND-REGISTER] User created successfully:', user.id);
        const token = jsonwebtoken_1.default.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
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
    }
    catch (error) {
        console.error('[BACKEND-REGISTER] Error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
};
exports.register = register;
const login = async (req, res) => {
    console.log('[BACKEND-LOGIN] Request received');
    console.log('[BACKEND-LOGIN] Email:', req.body.email);
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            console.error('[BACKEND-LOGIN] Validation errors:', errors.array());
            return res.status(400).json({ errors: errors.array() });
        }
        const { email, password } = req.body;
        console.log('[BACKEND-LOGIN] Looking up user:', email);
        const user = await prisma_1.default.user.findUnique({ where: { email } });
        if (!user || !user.password) {
            console.error('[BACKEND-LOGIN] User not found or no password:', email);
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        console.log('[BACKEND-LOGIN] Verifying password');
        const isPasswordValid = await bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            console.error('[BACKEND-LOGIN] Invalid password for:', email);
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        console.log('[BACKEND-LOGIN] Login successful, generating token');
        const token = jsonwebtoken_1.default.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
            token,
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
};
exports.login = login;
const refreshToken = async (req, res) => {
    try {
        const { token } = req.body;
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const newToken = jsonwebtoken_1.default.sign({ userId: decoded.userId, role: decoded.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ token: newToken });
    }
    catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
};
exports.refreshToken = refreshToken;
const generateOAuthToken = async (req, res) => {
    console.log('[BACKEND-OAUTH-TOKEN] Request received');
    console.log('[BACKEND-OAUTH-TOKEN] Body:', req.body);
    try {
        const { email, id, role } = req.body;
        if (!email || !id || !role) {
            console.error('[BACKEND-OAUTH-TOKEN] Missing required fields');
            return res.status(400).json({ error: 'Missing required fields' });
        }
        console.log('[BACKEND-OAUTH-TOKEN] Verifying user exists:', email);
        const user = await prisma_1.default.user.findUnique({
            where: { email },
            select: { id: true, role: true, email: true }
        });
        if (!user) {
            console.error('[BACKEND-OAUTH-TOKEN] User not found:', email);
            return res.status(404).json({ error: 'User not found' });
        }
        console.log('[BACKEND-OAUTH-TOKEN] Generating token for user:', user.id);
        const token = jsonwebtoken_1.default.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
        console.log('[BACKEND-OAUTH-TOKEN] Token generated successfully');
        res.json({ token });
    }
    catch (error) {
        console.error('[BACKEND-OAUTH-TOKEN] Error:', error);
        res.status(500).json({ error: 'Failed to generate token' });
    }
};
exports.generateOAuthToken = generateOAuthToken;
