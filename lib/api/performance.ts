/**
 * Performance monitoring utilities for API routes
 */

interface PerformanceMetrics {
    route: string;
    method: string;
    duration: number;
    timestamp: number;
    cached: boolean;
}

class PerformanceMonitor {
    private metrics: PerformanceMetrics[] = [];
    private maxMetrics: number = 1000;

    log(metric: PerformanceMetrics): void {
        this.metrics.push(metric);

        // Keep only recent metrics
        if (this.metrics.length > this.maxMetrics) {
            this.metrics.shift();
        }

        // Log slow queries
        if (metric.duration > 1000) {
            console.warn(`⚠️  SLOW API: ${metric.method} ${metric.route} took ${metric.duration}ms`);
        } else if (metric.duration > 500) {
            console.log(`⏱️  ${metric.method} ${metric.route}: ${metric.duration}ms ${metric.cached ? '(cached)' : ''}`);
        }
    }

    getStats(route?: string): {
        avgDuration: number;
        count: number;
        slowestRequest: number;
        fastestRequest: number;
    } {
        const filtered = route
            ? this.metrics.filter(m => m.route === route)
            : this.metrics;

        if (filtered.length === 0) {
            return { avgDuration: 0, count: 0, slowestRequest: 0, fastestRequest: 0 };
        }

        const durations = filtered.map(m => m.duration);
        const sum = durations.reduce((a, b) => a + b, 0);

        return {
            avgDuration: sum / durations.length,
            count: filtered.length,
            slowestRequest: Math.max(...durations),
            fastestRequest: Math.min(...durations),
        };
    }

    clear(): void {
        this.metrics = [];
    }
}

export const perfMonitor = new PerformanceMonitor();

/**
 * Performance tracking wrapper for API handlers
 */
export function withPerformanceTracking(
    handler: (request: Request, context?: any) => Promise<Response>,
    routeName: string
) {
    return async (request: Request, context?: any): Promise<Response> => {
        const start = performance.now();
        const method = request.method;

        try {
            const response = await handler(request, context);
            const duration = performance.now() - start;

            // Check if response was cached (custom header)
            const cached = response.headers.get('X-Cache') === 'HIT';

            perfMonitor.log({
                route: routeName,
                method,
                duration: Math.round(duration),
                timestamp: Date.now(),
                cached,
            });

            return response;
        } catch (error) {
            const duration = performance.now() - start;

            perfMonitor.log({
                route: routeName,
                method,
                duration: Math.round(duration),
                timestamp: Date.now(),
                cached: false,
            });

            throw error;
        }
    };
}

/**
 * Get performance stats endpoint data
 */
export function getPerformanceStats() {
    return {
        overall: perfMonitor.getStats(),
        timestamp: new Date().toISOString(),
    };
}
