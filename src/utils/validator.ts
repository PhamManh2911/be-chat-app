import { BadRequestError } from '@/errors/app';
import { ClassConstructor, plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

export async function validateDto<T extends object>(
    dto: ClassConstructor<T>,
    value: unknown,
): Promise<T> {
    const instance = plainToInstance(dto, value, {
        enableImplicitConversion: true,
    });

    const errors = await validate(instance, {
        whitelist: true,
        forbidNonWhitelisted: true,
    });

    if (errors.length) {
        throw new BadRequestError('Validation failed');
    }

    return instance;
}
