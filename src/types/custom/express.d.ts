/* eslint-disable @typescript-eslint/no-explicit-any */
import 'express';

declare module 'express-serve-static-core' {
    interface Request {
        meta?: Record<string, any>;
    }
}

declare global {
    namespace Express {
        interface Request {
            validated: {
                body?: any;
                query?: any;
                params?: any;
            };
            user: {
                id: string;
            };
        }
    }
}
