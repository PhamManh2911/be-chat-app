import { AppError } from '@/errors/app';
import logger from '@/logger';
import { NextFunction, Request, Response } from 'express';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorMiddleware(err: Error, _req: Request, res: Response, _next: NextFunction) {
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            message: err.message,
            data: err.data,
        });
    }

    logger.error(err);

    res.status(500).json({
        message: 'Internal Server Error',
    });
}
