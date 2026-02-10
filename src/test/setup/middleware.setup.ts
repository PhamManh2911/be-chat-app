import { UnauthorizedError } from '@/errors/app';
import { USER1_ID, USER2_ID, USER3_ID } from '@/test/setup/seed';
import { TokenPayload } from '@/types/app';
import { NextFunction, Request, Response } from 'express';
import { ExtendedError, Socket } from 'socket.io';

jest.mock('@/middlewares/auth', () => {
    const mockUserCredential: Record<string, TokenPayload> = {
        'test-token': {
            sub: USER1_ID,
            email: 'user1@example.com',
            name: 'User 1',
            avatar: 'user1@avatar',
        },
        'test-token2': {
            sub: USER2_ID,
            email: 'user2@example.com',
            name: 'User 2',
            avatar: 'user2@avatar',
        },
        'test-token3': {
            sub: USER3_ID,
            email: 'user3@example.com',
            name: 'User 3',
            avatar: 'user3@avatar',
        },
    };

    return {
        authMiddleware: (req: Request, res: Response, next: NextFunction) => {
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            const token = authHeader.split(' ')[1];

            if (!mockUserCredential[token]) {
                return res.status(401).json({ message: 'Invalid token' });
            }
            // Here you would typically verify the token and extract user info
            req.user = mockUserCredential[token]; // Attach user info to request
            next();
        },
        authSocketMiddleware: (socket: Socket, next: (err?: ExtendedError) => void) => {
            const token = socket.handshake.auth.token;

            if (!mockUserCredential[token]) {
                next(new UnauthorizedError({ message: 'unauthorized event' }));
            }
            socket.data.user = mockUserCredential[token]; // Attach user info to socket data
            next();
        },
    };
});

afterAll(() => {
    jest.clearAllMocks();
});
