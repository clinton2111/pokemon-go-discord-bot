import 'dotenv/config';
import { Redis } from 'ioredis';

const getRedisURL = () => {
  if (process.env.UPSTASH_URI) {
    return process.env.UPSTASH_URI;
  }
  throw new Error('REDIS_URI is not defined');
};

export const redis = new Redis(getRedisURL());
