import mongoose from 'mongoose';

export async function connectDatabase(): Promise<void> {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/buddha';

        await mongoose.connect(mongoUri, {
            // Connection pool settings for better performance
            maxPoolSize: 10,
            minPoolSize: 5,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });

        console.log('✅ MongoDB connected successfully');

        // Handle connection events
        mongoose.connection.on('error', (error) => {
            console.error('❌ MongoDB connection error:', error);
        });

        mongoose.connection.on('disconnected', () => {
            console.warn('⚠️  MongoDB disconnected');
        });

    } catch (error) {
        console.error('❌ Failed to connect to MongoDB:', error);
        process.exit(1);
    }
}

export async function disconnectDatabase(): Promise<void> {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
}
