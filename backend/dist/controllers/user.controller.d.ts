import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
export declare const getProfile: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateProfile: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getAllUsers: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateUserRole: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const deleteUser: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const setPassword: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
