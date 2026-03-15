import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
export declare const getCommentsByBlog: (req: AuthRequest, res: Response) => Promise<void>;
export declare const createComment: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateComment: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const deleteComment: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
