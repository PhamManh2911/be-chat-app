/* eslint-disable */
import { validator } from '@/utils/validator';
import { ClassConstructor } from 'class-transformer';
import { NextFunction, Request, RequestHandler, Response } from 'express';

type ParamsValidator<ReqBody, ReqParams, ReqQueries> = {
    body?: ReqBody;
    params?: ReqParams;
    query?: ReqQueries;
};

type Options = {
    customResponse?: boolean;
    middlewares?: RequestHandler<any, any, any, any>[];
};

const createValidationRequests = (
    dtos: ParamsValidator<any, any, any>,
): RequestHandler<any, any, any, any>[] => {
    const requests: RequestHandler<any, any, any, any>[] = [];

    if (dtos.params) {
        requests.push(validator('params', dtos.params));
    }
    if (dtos.body) {
        requests.push(validator('body', dtos.body));
    }
    if (dtos.query) {
        requests.push(validator('query', dtos.query));
    }
    return requests;
};

export const controller = <
    ResBody,
    ReqBody extends ClassConstructor<any> & { prototype: {} },
    ReqParams extends ClassConstructor<any> & { prototype: {} },
    ReqQueries extends ClassConstructor<any> & { prototype: {} },
>(
    dtos: ParamsValidator<ReqBody, ReqParams, ReqQueries>,
    handler: (
        req: Request<
            ReqParams['prototype'],
            ResBody,
            ReqBody['prototype'],
            ReqQueries['prototype']
        >,

        res: Response,

        next: NextFunction,
    ) => Promise<any>,
    options?: Options,
): RequestHandler<any, any, any, any>[] => {
    const requests = createValidationRequests(dtos);

    if (options?.middlewares && options.middlewares.length) {
        options.middlewares.forEach((o) => requests.push(o));
    }

    requests.push(async (req, res, next) => {
        try {
            const result = await handler(req, res, next);

            if (options?.customResponse === true) {
                return;
            }
            const data = result?.data ?? result;
            const statusCode = result?.statusCode ?? 200;

            res.status(statusCode).json(data);
            next();
        } catch (error) {
            next(error);
        }
    });

    return requests;
};
