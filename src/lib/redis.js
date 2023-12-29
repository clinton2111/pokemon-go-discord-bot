import 'dotenv/config';
import { Redis } from 'ioredis';

const redis = new Redis(process.env.UPSTASH_URI);

export default redis;
