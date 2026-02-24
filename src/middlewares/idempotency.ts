/* eslint-disable @typescript-eslint/no-explicit-any */
import redis from '@/cache';
import { IDEMPOTENT_PROCESS_COMPLETED, IDEMPOTENT_PROCESSING } from '@/constants/idempotencyStatus';
import { BadRequestError, ConflictError } from '@/errors/app';
import { NextFunction, Request, RequestHandler, Response } from 'express';
import { version as uuidVersion } from 'uuid';
import { cacheService } from './../services/cache.service';

export const idempotencyMiddleware = (
    ns: string,
    requestHandler: RequestHandler<any, any, any, any>[],
) => {
    const requests: RequestHandler<any, any, any, any>[] = [
        // Checking idempotency key in headers
        async (req: Request, res: Response, next: NextFunction) => {
            const idempotencyKey = req.headers['idempotency-key'];

            if (!idempotencyKey) {
                throw new BadRequestError({ message: 'Missing idempotency key' });
            }
            if (uuidVersion(idempotencyKey) !== 4) {
                throw new BadRequestError({ message: 'Invalid idempotency key version' });
            }

            const idempotentCacheKey = cacheService.getIdempotentProcessFromNs(ns, idempotencyKey);
            const idempotentProcess = await redis.get(idempotentCacheKey);

            if (idempotentProcess) {
                throw new ConflictError({
                    message: 'Idempotency key is currently being processed by another request',
                });
            }
            // Keep track of idempotent process
            await redis.set(
                idempotentCacheKey,
                JSON.stringify({ status: IDEMPOTENT_PROCESSING }),
                'EX',
                24 * 60 * 60,
            );

            // Store json data in local response body for further logic
            const originalJson = res.json.bind(res);

            res.json = (data) => {
                res.locals.responseBody = data;

                // Call the original function to send the actual response
                return originalJson.call(this, data);
            };

            // Remove cached idempotency process when error happen
            res.on('finish', async () => {
                if (res.statusCode >= 400) {
                    await redis.del(cacheService.getIdempotentProcessFromNs(ns, idempotencyKey));
                }
            });
            next();
        },
        // current request handlers
        ...requestHandler,
        async (req: Request, res: Response, next: NextFunction) => {
            const idempotencyKey = req.headers['idempotency-key'] as string;

            await redis.set(
                cacheService.getIdempotentProcessFromNs(ns, idempotencyKey),
                JSON.stringify({
                    status: IDEMPOTENT_PROCESS_COMPLETED,
                    data: res.locals.responseBody,
                }),
                'KEEPTTL',
            );
            next();
        },
    ];

    return requests;
};
