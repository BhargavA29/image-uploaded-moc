import { MongoClient } from 'mongodb';

if (!process.env.MONGODB_URI) {
    throw new Error('Please add MONGODB_URI to .env file');
}

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export async function connectToDb() {
    try {
        await client.connect();
        return client.db('image-uploader');
    } catch (error) {
        console.error('Failed to connect to MongoDB:', error);
        throw error;
    }
} 