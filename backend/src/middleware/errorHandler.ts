import { Request, Response, NextFunction } from 'express';

export interface ApiError extends Error {
    statusCode?: number;
    isOperational?: boolean;
}

export class AppError extends Error implements ApiError {
    statusCode: number;
    isOperational: boolean;

    constructor(message: string, statusCode: number = 500) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

export function errorHandler(
    err: ApiError,
    req: Request,
    res: Response,
    next: NextFunction
): void {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal server error';

    // Log error (in production, use proper logging service)
    if (process.env.NODE_ENV !== 'production') {
        console.error('Error:', err);
    }

    res.status(statusCode).json({
        success: false,
        error: {
            message,
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
        },
    });
}

// Async error wrapper
export const asyncHandler = (fn: Function) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
