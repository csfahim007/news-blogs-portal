import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
export declare const getSiteSettings: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateSiteSettings: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const clearBreakingNews: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
