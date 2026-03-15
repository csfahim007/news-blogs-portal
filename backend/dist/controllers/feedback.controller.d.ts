import { Request, Response } from 'express';
export declare const createFeedback: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getAllFeedback: (req: Request, res: Response) => Promise<void>;
export declare const deleteFeedback: (req: Request, res: Response) => Promise<void>;
export declare const addFeedbackComment: (req: Request, res: Response) => Promise<void>;
export declare const updateFeedbackComment: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const deleteFeedbackComment: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const toggleFeedbackLike: (req: Request, res: Response) => Promise<void>;
