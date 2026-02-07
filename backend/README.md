# Buddha Backend API

Optimized TypeScript backend for the Buddha mobile application.

## Features

✅ **TypeScript** - Type-safe development
✅ **Express.js** - Fast, minimalist web framework
✅ **MongoDB** - Database with connection pooling
✅ **Redis** - Caching layer for performance
✅ **Rate Limiting** - Prevent abuse
✅ **Security** - Helmet, CORS, compression
✅ **Error Handling** - Centralized error management
✅ **API Caching** - Redis-backed response caching

## Setup

### Prerequisites

- Node.js 18+
- MongoDB running locally or remotely
- Redis running locally or remotely

### Installation

```bash
cd backend
npm install
```

### Environment Variables

Create a `.env` file in the backend directory:

```env
PORT=3001
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/buddha
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=24h
CORS_ORIGIN=http://localhost:3000
```

### Running

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm run build
npm start
```

##Architecture

```
backend/src/
├── config/
│   ├── database.ts       # MongoDB connection
│   └── redis.ts          # Redis cache config
├── middleware/
│   ├── cache.ts         # Cache middleware
│   ├── errorHandler.ts  # Error handling
│   └── rateLimit.ts     # Rate limiting
├── routes/
│   └── monks.ts         # Monks routes
├── controllers/
│   └── monksController.ts # Monks logic
├── models/
│   └── Monk.ts          # Monk schema
├── services/
│   └── (future services)
└── index.ts             # Server entry
```

## API Endpoints

### Monks

- `GET /api/v1/monks` - Get all monks (cached 15min)
  - Query params: `page`, `limit`, `availability`, `sort`, `search`
- `GET /api/v1/monks/:id` - Get monk by ID (cached 15min)
- `POST /api/v1/monks` - Create monk
- `PUT /api/v1/monks/:id` - Update monk
- `DELETE /api/v1/monks/:id` - Delete monk

### Health

- `GET /health` - Health check endpoint

## Performance Optimizations

1. **Database Indexes** - Created indexes on frequently queried fields
2. **Connection Pooling** - MongoDB connection pool (5-10 connections)
3. **Redis Caching** - 15-minute cache for GET requests
4. **Compression** - Gzip compression for responses
5. **Rate Limiting** - 100 req/15min for general API, 5 req/15min for auth
6. **Lean Queries** - Using `.lean()` for faster queries

## Cache Strategy

- **GET /monks** → 15 minutes TTL
- **GET /monks/:id** → 15 minutes TTL
- **Invalidation** → On POST, PUT, DELETE

## Next Steps

- [ ] Add authentication middleware
- [ ] Create booking routes and controllers
- [ ] Create tour routes and controllers
- [ ] Add request validation (Zod)
- [ ] Add unit tests
- [ ] Add API documentation (Swagger)
- [ ] Add logging service integration
- [ ] Add monitoring (Prometheus/Grafana)
