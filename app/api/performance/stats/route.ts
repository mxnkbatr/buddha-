import { NextResponse } from 'next/server';
import { perfMonitor } from '@/lib/api/performance';
import { queryMonitor } from '@/lib/api/db';
import { apiCache } from '@/lib/api/cache';

/**
 * Performance stats API endpoint
 * GET /api/performance/stats
 */
export async function GET() {
    const apiStats = perfMonitor.getStats();
    const dbStats = queryMonitor.getStats();

    return NextResponse.json({
        success: true,
        data: {
            api: {
                totalRequests: apiStats.count,
                avgDuration: Math.round(apiStats.avgDuration),
                slowestRequest: apiStats.slowestRequest,
                fastestRequest: apiStats.fastestRequest,
            },
            database: {
                totalQueries: dbStats.count,
                avgDuration: dbStats.avgDuration,
                slowest: dbStats.slowest,
            },
            timestamp: new Date().toISOString(),
        },
    });
}

/**
 * Clear cache endpoint
 * POST /api/performance/stats?action=clearCache
 */
export async function POST(request: Request) {
    const url = new URL(request.url);
    const action = url.searchParams.get('action');

    if (action === 'clearCache') {
        apiCache.clear();
        return NextResponse.json({
            success: true,
            message: 'Cache cleared successfully',
        });
    }

    return NextResponse.json({
        success: false,
        message: 'Unknown action',
    }, { status: 400 });
}
