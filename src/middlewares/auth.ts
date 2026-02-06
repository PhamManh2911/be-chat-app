import { config } from '@/config';
import { UnauthorizedError } from '@/errors/app';
import logger from '@/logger';
import { TokenPayload } from '@/types/app';
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { ExtendedError, Socket } from 'socket.io';

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];
    // Here you would typically verify the token and extract user info
    try {
        const payload = jwt.verify(token, config.authConfig.jwtSecret);
        req.user = payload as TokenPayload; // Attach user info to request
        next();
    } catch (err) {
        logger.error('Token verification failed', err);
        return res.status(401).json({ message: 'Invalid token' });
    }
}

export function authSocketMiddleware(socket: Socket, next: (err?: ExtendedError) => void) {
    const token = socket.handshake.auth.token;

    try {
        const payload = jwt.verify(token, config.authConfig.jwtSecret);
        socket.data.user = payload as TokenPayload; // Attach user info to socket data
        next();
    } catch (err) {
        logger.error('Socket token verification failed', err);
        next(new UnauthorizedError({ message: 'unauthorized event' }));
    }
}
