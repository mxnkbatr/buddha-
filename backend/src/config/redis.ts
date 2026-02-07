import Redis from 'ioredis';

let redisClient: Redis | null = null;

export function getRedisClient(): Redis {
    if (!redisClient) {
        const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

        redisClient = new Redis(redisUrl, {
            maxRetriesPerRequest: 3,
            enableReadyCheck: true,
            retryStrategy: (times) => {
                const delay = Math.min(times * 50, 2000);
                return delay;
            },
        });

        redisClient.on('connect', () => {
            console.log('✅ Redis connected');
        });

        redisClient.on('error', (error) => {
            console.error('❌ Redis error:', error);
        });

        redisClient.on('close', () => {
            console.warn('⚠️  Redis connection closed');
        });
    }

    return redisClient;
}

export async function disconnectRedis(): Promise<void> {
    if (redisClient) {
        await redisClient.quit();
        redisClient = null;
        console.log('Redis disconnected');
    }
}

// Cache helper functions
export async function getCached<T>(key: string): Promise<T | null> {
    try {
        const client = getRedisClient();
        const data = await client.get(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Cache get error:', error);
        return null;
    }
}

export async function setCached(key: string, value: any, ttl: number = 300): Promise<void> {
    try {
        const client = getRedisClient();
        await client.setex(key, ttl, JSON.stringify(value));
    } catch (error) {
        console.error('Cache set error:', error);
    }
}

export async function deleteCached(key: string): Promise<void> {
    try {
        const client = getRedisClient();
        await client.del(key);
    } catch (error) {
        console.error('Cache delete error:', error);
    }
}

export async function invalidatePattern(pattern: string): Promise<void> {
    try {
        const client = getRedisClient();
        const keys = await client.keys(pattern);
        if (keys.length > 0) {
            await client.del(...keys);
        }
    } catch (error) {
        console.error('Cache invalidate error:', error);
    }
}
