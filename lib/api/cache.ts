import { NextResponse } from 'next/server';

/**
 * Simple in-memory cache for Next.js API routes
 * For production, use Redis or Vercel KV
 */

interface CacheEntry {
    data: any;
    timestamp: number;
    ttl: number;
}

class ApiCache {
    private cache: Map<string, CacheEntry> = new Map();
    private maxSize: number = 100; // Prevent memory bloat

    set(key: string, data: any, ttl: number = 300): void {
        // Clear old cache if too large
        if (this.cache.size >= this.maxSize) {
            const oldestKey = this.cache.keys().next().value;
            if (oldestKey) {
                this.cache.delete(oldestKey);
            }
        }

        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            ttl: ttl * 1000, // Convert to milliseconds
        });
    }

    get(key: string): any | null {
        const entry = this.cache.get(key);

        if (!entry) return null;

        // Check if expired
        const age = Date.now() - entry.timestamp;
        if (age > entry.ttl) {
            this.cache.delete(key);
            return null;
        }

        return entry.data;
    }

    delete(key: string): void {
        this.cache.delete(key);
    }

    deletePattern(pattern: string): void {
        const regex = new RegExp(pattern.replace(/\*/g, '.*'));
        for (const key of this.cache.keys()) {
            if (regex.test(key)) {
                this.cache.delete(key);
            }
        }
    }

    clear(): void {
        this.cache.clear();
    }
}

// Singleton instance
export const apiCache = new ApiCache();

/**
 * Cache helper for API routes
 * @param key Cache key
 * @param ttl Time to live in seconds (default: 5 minutes)
 */
export function getCached<T>(key: string): T | null {
    return apiCache.get(key);
}

export function setCached(key: string, data: any, ttl: number = 300): void {
    apiCache.set(key, data, ttl);
}

export function invalidateCache(pattern: string): void {
    apiCache.deletePattern(pattern);
}

/**
 * Cached response helper
 * Wraps a function and caches its result
 */
export async function withCache<T>(
    key: string,
    fn: () => Promise<T>,
    ttl: number = 300
): Promise<T> {
    const cached = getCached<T>(key);
    if (cached !== null) {
        console.log(`✅ Cache HIT: ${key}`);
        return cached;
    }

    console.log(`❌ Cache MISS: ${key}`);
    const data = await fn();
    setCached(key, data, ttl);
    return data;
}

/**
 * Create cache headers for Next.js responses
 */
export function getCacheHeaders(maxAge: number = 300): {
    'Cache-Control': string;
} {
    return {
        'Cache-Control': `public, s-maxage=${maxAge}, stale-while-revalidate=${maxAge * 2}`,
    };
}
