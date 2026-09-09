import mongoose from 'mongoose';

let memoryServer;

export const connectDB = async () => {
    const uri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/prescripto';
    const onVercel = Boolean(process.env.VERCEL);
    const allowEmbedded = !onVercel && process.env.ALLOW_EMBEDDED_MONGO !== 'false';
    const isAtlas = uri.includes('mongodb+srv://') || uri.includes('mongodb.net');

    if (onVercel && !(process.env.MONGO_URI || process.env.MONGODB_URI)) {
        throw new Error('MONGO_URI is missing on Vercel. Add it under doctor → Settings → Environment Variables → Project, then Redeploy.');
    }

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
                error.message?.includes('auth') || error.message?.includes('Authentication')
                    ? 'Atlas login failed. Reset the database user password in Database Access, put the new password in Vercel MONGO_URI, then Redeploy.'
                    : `Could not connect to MongoDB: ${error.message}`
            );
        }
        console.log('Falling back to in-memory MongoDB...');
    }

    const { MongoMemoryServer } = await import('mongodb-memory-server');
    memoryServer = await MongoMemoryServer.create({
        instance: { dbName: 'prescripto' }
    });

    await mongoose.connect(memoryServer.getUri('prescripto'));
    console.log('Embedded MongoDB connected (in-memory)');
};

export const closeDB = async () => {
    await mongoose.disconnect();
    if (memoryServer) {
        await memoryServer.stop();
        memoryServer = undefined;
    }
};
