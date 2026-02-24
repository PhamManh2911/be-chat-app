/* eslint-disable @typescript-eslint/no-explicit-any */
export abstract class AppError extends Error {
    constructor(
        public statusCode: number,
        message: string,
        public data: any = null,
    ) {
        super(message);
        this.data = data;
    }
}

export class BadRequestError extends AppError {
    constructor({ message, data }: { message?: string; data?: any } = {}) {
        super(400, message || 'Bad request', data);
    }
}

export class UnauthorizedError extends AppError {
    constructor({ message, data }: { message?: string; data?: any } = {}) {
        super(401, message || 'Unauthorized', data);
    }
}
export class ForbiddenError extends AppError {
    constructor({ message, data }: { message?: string; data?: any } = {}) {
        super(403, message || 'Forbidden', data);
    }
}

export class NotFoundError extends AppError {
    constructor({ message, data }: { message?: string; data?: any } = {}) {
        super(404, message || 'Not found', data);
    }
}

export class ConflictError extends AppError {
    constructor({ message, data }: { message?: string; data?: any } = {}) {
        super(409, message || 'Conflict', data);
    }
}

export class UnprocessableEntityError extends AppError {
    constructor({ message, data }: { message?: string; data?: any } = {}) {
        super(422, message || 'Unprocessable Entity', data);
    }
}
