import mongoose from 'mongoose';
import config from '../config';
import logger from './logger';

export let isConnected = false;

mongoose.connection.on('connected', () => {
  isConnected = true;
  logger.info('MongoDB connected');
});

mongoose.connection.on('disconnected', () => {
  isConnected = false;
  logger.warn('MongoDB disconnected, falling back to memory store');
});

mongoose.connection.on('reconnected', () => {
  isConnected = true;
  logger.info('MongoDB reconnected');
});

mongoose.connection.on('error', (err) => {
  isConnected = false;
  logger.error('MongoDB connection error:', err);
});

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
