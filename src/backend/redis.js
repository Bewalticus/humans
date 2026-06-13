// Redis Connection
const redis = require('redis');
const logger = require('./logger');

let client;

const connectRedis = () => {
  client = redis.createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  });

  client.on('connect', () => {
    logger.info('Redis connected successfully');
  });

  client.on('error', (err) => {
    logger.error('Redis connection error', { error: err });
  });

  client.connect().catch(err => {
    logger.error('Failed to connect to Redis', { error: err });
  });

  return client;
};

const getRedis = () => {
  if (!client) {
    throw new Error('Redis client not initialized');
  }
  return client;
};

module.exports = {
  connectRedis,
  getRedis
};