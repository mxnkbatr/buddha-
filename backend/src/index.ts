import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectDatabase } from './config/database';
import { getRedisClient } from './config/redis';
import { errorHandler } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimit';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3001;

// ====================
// MIDDLEWARE
// ====================

// Security headers
app.use(helmet({
    contentSecurityPolicy: false, // Disable for API
    crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// CORS
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
}));

// Compression
app.use(compression());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

// Rate limiting
app.use('/api/', apiLimiter);

// ====================
// ROUTES
// ====================

// Import route modules
import monksRouter from './routes/monks';

// Health check
app.get('/health', (req: Request, res: Response) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});

// API v1 routes
app.get('/api/v1', (req: Request, res: Response) => {
    res.json({
        message: 'Buddha Backend API v1',
        version: '1.0.0',
        endpoints: {
            monks: '/api/v1/monks',
            bookings: '/api/v1/bookings',
            tours: '/api/v1/tours',
            auth: '/api/v1/auth',
        },
    });
});

// Register route modules
app.use('/api/v1/monks', monksRouter);
// app.use('/api/v1/bookings', bookingsRouter);
// app.use('/api/v1/tours', toursRouter);
// app.use('/api/v1/auth', authRouter);

// 404 handler
app.use((req: Request, res: Response) => {
    res.status(404).json({
        success: false,
        error: {
            message: 'Route not found',
            path: req.originalUrl,
        },
    });
});

// Error handler (must be last)
app.use(errorHandler);

// ====================
// SERVER INITIALIZATION
// ====================

async function startServer() {
    try {
        // Connect to MongoDB
        await connectDatabase();

        // Initialize Redis
        const redis = getRedisClient();
        await redis.ping();

        // Start server
        app.listen(PORT, () => {
            console.log(`
╔════════════════════════════════════════╗
║   🚀 Buddha Backend API Running       ║
║   📡 Port: ${PORT}                       ║
║   🌍 Environment: ${process.env.NODE_ENV || 'development'}            ║
║   💾 MongoDB: Connected                ║
║   ⚡ Redis: Connected                  ║
╚════════════════════════════════════════╝
      `);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received. Shutting down gracefully...');
    process.exit(0);
});

// Start the server
startServer();

export default app;
