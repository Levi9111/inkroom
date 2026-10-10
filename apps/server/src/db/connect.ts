import mongoose from 'mongoose';
import { config } from '../config';

let isConnected = false;

export async function connectDatabase(): Promise<boolean> {
  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(config.mongodbUri, {
      serverSelectionTimeoutMS: 3000,
    });
    isConnected = true;
    console.log(`[Database] Successfully connected to MongoDB at ${config.mongodbUri}`);
    return true;
  } catch (error) {
    console.warn(
      `[Database] Notice: MongoDB not reachable (${(error as Error).message}). Falling back to robust in-memory storage adapter for local dev.`
    );
    isConnected = false;
    return false;
  }
}

export function isDbConnected(): boolean {
  return isConnected && mongoose.connection.readyState === 1;
}
