import rateLimit from 'express-rate-limit';
import { getRedisClient } from '../config/redis';

// General API rate limiter
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
    // Use Redis for distributed rate limiting
    store: {
        async increment(key: string): Promise<{ totalHits: number; resetTime?: Date }> {
            const client = getRedisClient();
            const ttl = 15 * 60; // 15 minutes

            const current = await client.incr(key);

            if (current === 1) {
                await client.expire(key, ttl);
            }

            return {
                totalHits: current,
                resetTime: new Date(Date.now() + ttl * 1000),
            };
        },
        async decrement(key: string): Promise<void> {
            const client = getRedisClient();
            await client.decr(key);
        },
        async resetKey(key: string): Promise<void> {
            const client = getRedisClient();
            await client.del(key);
        },
    } as any,
});

// Strict limiter for auth endpoints
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5, // 5 attempts per 15 minutes
    message: 'Too many authentication attempts, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
});

// Booking limiter
export const bookingLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // 10 bookings per hour
    message: 'Too many booking requests, please try again later',
});
