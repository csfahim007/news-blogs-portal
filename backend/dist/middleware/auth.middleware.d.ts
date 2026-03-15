import { Request, Response, NextFunction } from 'express';
export interface AuthRequest extends Request {
    userId?: string;
    userRole?: string;
    user?: any;
}
export declare const authenticate: (req: AuthRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>>;
export declare const authorizeAdmin: (req: AuthRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>>;
export declare const requireAdmin: (req: AuthRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>>;
export declare const optionalAuth: (req: AuthRequest, res: Response, next: NextFunction) => void;
