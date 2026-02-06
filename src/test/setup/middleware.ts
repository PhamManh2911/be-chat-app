import { UnauthorizedError } from '@/errors/app';
import { TokenPayload } from '@/types/app';
import { NextFunction, Request, Response } from 'express';
import { ExtendedError, Socket } from 'socket.io';

jest.mock('@/middlewares/auth', () => ({
    authMiddleware: (req: Request, res: Response, next: NextFunction) => {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const token = authHeader.split(' ')[1];

        if (token !== 'test-token') {
            return res.status(401).json({ message: 'Invalid token' });
        }
        // Here you would typically verify the token and extract user info
        req.user = { sub: globalThis.__USER_1_ID, email: 'user1@example.com' } as TokenPayload; // Attach user info to request
        next();
    },
    authSocketMiddleware: (socket: Socket, next: (err?: ExtendedError) => void) => {
        const token = socket.handshake.auth.token;

        if (token !== 'test-token') {
            next(new UnauthorizedError({ message: 'unauthorized event' }));
        }
        socket.data.user = {
            sub: globalThis.__USER_1_ID,
            email: 'user1@example.com',
        } as TokenPayload; // Attach user info to socket data
        next();
    },
}));
