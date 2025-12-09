/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-object-type */
import { Request } from 'express';

import { validateDto } from '@/utils/validator';
import { ClassConstructor } from 'class-transformer';
import { NextFunction, RequestHandler, Response } from 'express';

export type TypedRequest<
    P extends object = {},
    B extends object = {},
    Q extends object = {},
> = Request<P, any, B, Q>;

type Dtos<P, B, Q> = {
    params?: ClassConstructor<P>;
    body?: ClassConstructor<B>;
    query?: ClassConstructor<Q>;
};

export function controller<
    Res,
    P extends object = {},
    B extends object = {},
    Q extends object = {},
>(
    dtos: Dtos<P, B, Q>,
    handler: (
        req: TypedRequest<P, B, Q>,
        res: Response,
        next: NextFunction,
    ) => Promise<{ data: Res; statusCode: number }>,
): RequestHandler {
    return async (req, res, next) => {
        try {
            if (dtos.params) {
                req.params = (await validateDto(dtos.params, req.params)) as any;
            }

            if (dtos.body) {
                req.body = (await validateDto(dtos.body, req.body)) as B;
            }

            if (dtos.query) {
                req.query = (await validateDto(dtos.query, req.query)) as any;
            }

            const result = await handler(req as TypedRequest<P, B, Q>, res, next);

            res.status(result.statusCode).json(result.data);
        } catch (err) {
            next(err);
        }
    };
}
