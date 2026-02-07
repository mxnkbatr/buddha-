import { NextResponse } from 'next/server';

export class ApiError extends Error {
    constructor(
        public message: string,
        public statusCode: number = 500,
        public code?: string
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

/**
 * Standardized error response
 */
export function errorResponse(
    error: unknown,
    defaultMessage: string = 'Internal server error'
): NextResponse {
    console.error('API Error:', error);

    if (error instanceof ApiError) {
        return NextResponse.json(
            {
                success: false,
                error: {
                    message: error.message,
                    code: error.code,
                },
            },
            { status: error.statusCode }
        );
    }

    if (error instanceof Error) {
        return NextResponse.json(
            {
                success: false,
                error: {
                    message: process.env.NODE_ENV === 'development' ? error.message : defaultMessage,
                },
            },
            { status: 500 }
        );
    }

    return NextResponse.json(
        {
            success: false,
            error: { message: defaultMessage },
        },
        { status: 500 }
    );
}

/**
 * Standardized success response
 */
export function successResponse<T>(data: T, status: number = 200): NextResponse {
    return NextResponse.json(
        {
            success: true,
            data,
        },
        { status }
    );
}

/**
 * Async error handler wrapper for API routes
 */
export function asyncHandler(
    handler: (request: Request, context?: any) => Promise<NextResponse>
) {
    return async (request: Request, context?: any): Promise<NextResponse> => {
        try {
            return await handler(request, context);
        } catch (error) {
            return errorResponse(error);
        }
    };
}

/**
 * Validation helper
 */
export function validateRequired(
    data: Record<string, any>,
    fields: string[]
): void {
    const missing = fields.filter(field => !data[field]);

    if (missing.length > 0) {
        throw new ApiError(
            `Missing required fields: ${missing.join(', ')}`,
            400,
            'VALIDATION_ERROR'
        );
    }
}
