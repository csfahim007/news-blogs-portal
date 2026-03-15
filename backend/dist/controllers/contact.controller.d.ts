import { Request, Response } from 'express';
export declare const createContactMessage: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getAllContactMessages: (req: Request, res: Response) => Promise<void>;
export declare const updateContactMessageStatus: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const deleteContactMessage: (req: Request, res: Response) => Promise<void>;
