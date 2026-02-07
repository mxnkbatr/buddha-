import { Db, Collection, Document, Filter, FindOptions } from 'mongodb';
import { connectToDatabase } from '@/database/db';

/**
 * Query performance tracker
 */
interface QueryMetric {
    collection: string;
    operation: string;
    duration: number;
    timestamp: number;
}

class QueryPerformanceMonitor {
    private metrics: QueryMetric[] = [];
    private maxMetrics: number = 500;

    log(metric: QueryMetric): void {
        this.metrics.push(metric);

        if (this.metrics.length > this.maxMetrics) {
            this.metrics.shift();
        }

        // Log slow queries (>100ms)
        if (metric.duration > 100) {
            console.warn(
                `🐌 SLOW QUERY: ${metric.collection}.${metric.operation} took ${metric.duration}ms`
            );
        }
    }

    getStats(collection?: string) {
        const filtered = collection
            ? this.metrics.filter(m => m.collection === collection)
            : this.metrics;

        if (filtered.length === 0) {
            return { avgDuration: 0, count: 0 };
        }

        const durations = filtered.map(m => m.duration);
        const sum = durations.reduce((a, b) => a + b, 0);

        return {
            avgDuration: Math.round(sum / durations.length),
            count: filtered.length,
            slowest: Math.max(...durations),
        };
    }
}

export const queryMonitor = new QueryPerformanceMonitor();

/**
 * Optimized database helper with performance tracking
 */
export class OptimizedDB {
    private db: Db;

    constructor(db: Db) {
        this.db = db;
    }

    /**
     * Find documents with performance tracking
     */
    async find<T extends Document = Document>(
        collectionName: string,
        filter: Filter<T> = {},
        options?: any
    ): Promise<any[]> {
        const start = performance.now();

        try {
            const result = await this.db
                .collection<T>(collectionName)
                .find(filter, options)
                .toArray();

            const duration = Math.round(performance.now() - start);
            queryMonitor.log({
                collection: collectionName,
                operation: 'find',
                duration,
                timestamp: Date.now(),
            });

            return result;
        } catch (error) {
            console.error(`Query error on ${collectionName}:`, error);
            throw error;
        }
    }

    /**
     * Find one document with performance tracking
     */
    async findOne<T extends Document = Document>(
        collectionName: string,
        filter: Filter<T>,
        options?: any
    ): Promise<any | null> {
        const start = performance.now();

        try {
            const result = await this.db
                .collection<T>(collectionName)
                .findOne(filter, options);

            const duration = Math.round(performance.now() - start);
            queryMonitor.log({
                collection: collectionName,
                operation: 'findOne',
                duration,
                timestamp: Date.now(),
            });

            return result;
        } catch (error) {
            console.error(`Query error on ${collectionName}:`, error);
            throw error;
        }
    }

    /**
     * Insert document with performance tracking
     */
    async insertOne<T extends Document = Document>(
        collectionName: string,
        document: any
    ) {
        const start = performance.now();

        try {
            const result = await this.db
                .collection<T>(collectionName)
                .insertOne(document);

            const duration = Math.round(performance.now() - start);
            queryMonitor.log({
                collection: collectionName,
                operation: 'insertOne',
                duration,
                timestamp: Date.now(),
            });

            return result;
        } catch (error) {
            console.error(`Insert error on ${collectionName}:`, error);
            throw error;
        }
    }

    /**
     * Update document with performance tracking
     */
    async updateOne<T extends Document>(
        collectionName: string,
        filter: Filter<T>,
        update: any,
        options?: any
    ) {
        const start = performance.now();

        try {
            const result = await this.db
                .collection<T>(collectionName)
                .updateOne(filter, update, options);

            const duration = Math.round(performance.now() - start);
            queryMonitor.log({
                collection: collectionName,
                operation: 'updateOne',
                duration,
                timestamp: Date.now(),
            });

            return result;
        } catch (error) {
            console.error(`Update error on ${collectionName}:`, error);
            throw error;
        }
    }

    /**
     * Delete document with performance tracking
     */
    async deleteOne<T extends Document>(
        collectionName: string,
        filter: Filter<T>
    ) {
        const start = performance.now();

        try {
            const result = await this.db
                .collection<T>(collectionName)
                .deleteOne(filter);

            const duration = Math.round(performance.now() - start);
            queryMonitor.log({
                collection: collectionName,
                operation: 'deleteOne',
                duration,
                timestamp: Date.now(),
            });

            return result;
        } catch (error) {
            console.error(`Delete error on ${collectionName}:`, error);
            throw error;
        }
    }

    /**
     * Get raw collection (for complex operations)
     */
    collection<T extends Document>(name: string): Collection<T> {
        return this.db.collection<T>(name);
    }
}

/**
 * Get optimized database instance
 */
export async function getOptimizedDB(): Promise<OptimizedDB> {
    const { db } = await connectToDatabase();
    return new OptimizedDB(db);
}
