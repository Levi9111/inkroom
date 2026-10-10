import mongoose from 'mongoose';
import config from '../config';
import logger from './logger';

export let isConnected = false;

export async function connectDB(): Promise<void> {
  try {
    await mongoose.connect(config.databaseUrl, {
      serverSelectionTimeoutMS: 3000,
      maxPoolSize: 50,
      minPoolSize: 10,
      socketTimeoutMS: 45000,
    });
    isConnected = true;
    logger.info('MongoDB connected successfully');
  } catch (err) {
    isConnected = false;
    logger.warn(
      `Notice: MongoDB connection attempt failed (${(err as Error).message}). Local in-memory store will be used for testing/dev.`
    );
  }
}
