require('dotenv').config();
const { Redis } = require('ioredis');

const redis = new Redis(process.env.UPSTASH_URI);

module.exports = redis;
