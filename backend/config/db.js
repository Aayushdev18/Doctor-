import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let memoryServer;

export const connectDB = async () => {
    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/prescripto';
    const allowEmbedded = process.env.ALLOW_EMBEDDED_MONGO !== 'false';
    const isAtlas = uri.includes('mongodb+srv://') || uri.includes('mongodb.net');

    try {
        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: isAtlas ? 15000 : 2500
        });
        console.log(isAtlas ? 'MongoDB Atlas connected' : 'MongoDB connected');
        return;
    } catch (error) {
        console.error('Primary MongoDB connection failed:', error.message);
        if (!allowEmbedded) {
            throw new Error(
                'Could not connect to MONGO_URI. Set a valid Atlas URI in backend/.env or set ALLOW_EMBEDDED_MONGO=true for local fallback.'
            );
        }
        console.log('Falling back to in-memory MongoDB...');
    }

    memoryServer = await MongoMemoryServer.create({
        instance: { dbName: 'prescripto' }
    });

    await mongoose.connect(memoryServer.getUri('prescripto'));
    console.log('Embedded MongoDB connected (in-memory)');
};
