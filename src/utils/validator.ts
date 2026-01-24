import { BadRequestError } from '@/errors/app';
import { ClassConstructor, plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { NextFunction, Request, Response } from 'express';

export const validator =
    (
        source: 'body' | 'params' | 'query',
        // eslint-disable-next-line
        ClassDto: ClassConstructor<any>,
    ) =>
    async (req: Request, res: Response, next: NextFunction) => {
        const errors = await validate(plainToInstance(ClassDto, req[source]), {
            skipMissingProperties: false,
            whitelist: true,
            forbidNonWhitelisted: true,
        });
        const isArrayErrors = typeof errors === 'object' && Array.isArray(errors) && errors.length;
        const isObjectErrors =
            typeof errors === 'object' && !Array.isArray(errors) && Boolean(errors);
        const isHaveError = isArrayErrors || isObjectErrors;

        if (isHaveError) {
            next(new BadRequestError({ data: errors }));
        } else {
            next();
        }
    };
