/* eslint-disable @typescript-eslint/no-explicit-any */
import { TokenPayload } from '@/types/app';
import 'express';

declare module 'express-serve-static-core' {
    interface Request {
        meta?: Record<string, any>;
    }
}

declare global {
    namespace Express {
        interface Request {
            user: TokenPayload;
        }
    }
}
