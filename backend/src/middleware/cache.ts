import { Request, Response, NextFunction } from 'express';
import { getCached, setCached } from '../config/redis';

export interface CacheOptions {
    ttl?: number; // Time to live in seconds
    keyPrefix?: string;
}

/**
 * Cache middleware for GET requests
 * Caches the response for subsequent requests
 */
export function cacheMiddleware(ttl: number = 300, keyPrefix: string = 'cache:') {
    return async (req: Request, res: Response, next: NextFunction) => {
        // Only cache GET requests
        if (req.method !== 'GET') {
            return next();
        }

        const cacheKey = `${keyPrefix}${req.originalUrl}`;

        try {
            // Try to get from cache
            const cachedData = await getCached(cacheKey);

            if (cachedData) {
                console.log(`✅ Cache HIT: ${cacheKey}`);
                return res.json(cachedData);
            }

            console.log(`❌ Cache MISS: ${cacheKey}`);

            // Store the original json function
            const originalJson = res.json.bind(res);

            // Override res.json to cache the response
            res.json = function (data: any) {
                // Cache the response
                setCached(cacheKey, data, ttl).catch(err => {
                    console.error('Failed to cache response:', err);
                });

                // Call the original json function
                return originalJson(data);
            } as any;

            next();
        } catch (error) {
            console.error('Cache middleware error:', error);
            next(); // Continue without cache on error
        }
    };
}

/**
 * Helper to create cache key from request
 */
export function createCacheKey(req: Request, prefix: string = ''): string {
    const { originalUrl, query } = req;
    const queryString = new URLSearchParams(query as any).toString();
    return `${prefix}${originalUrl}${queryString ? '?' + queryString : ''}`;
}
