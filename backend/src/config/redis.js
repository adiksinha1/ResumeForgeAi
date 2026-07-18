import { createClient } from 'redis';

let redisClient = null;
const memoryCache = new Map();

// Initialize Redis Client
if (process.env.REDIS_URL) {
  try {
    redisClient = createClient({
      url: process.env.REDIS_URL
    });

    redisClient.on('error', (err) => {
      console.warn('Redis Client Error, switching to in-memory fallback:', err.message);
      redisClient = null;
    });

    redisClient.on('connect', () => {
      console.log('Redis connected successfully');
    });

    await redisClient.connect();
  } catch (err) {
    console.warn('Could not initialize Redis, falling back to in-memory store:', err.message);
    redisClient = null;
  }
} else {
  console.log('No REDIS_URL provided. Using in-memory cache.');
}

// Cache helper object matching redis client schema but fallback-safe
export const cache = {
  get: async (key) => {
    if (redisClient) {
      try {
        const val = await redisClient.get(key);
        return val ? JSON.parse(val) : null;
      } catch (err) {
        console.error('Redis GET error:', err);
      }
    }
    const memoryVal = memoryCache.get(key);
    if (memoryVal && memoryVal.expiry > Date.now()) {
      return memoryVal.value;
    } else if (memoryVal) {
      memoryCache.delete(key);
    }
    return null;
  },

  set: async (key, value, ttlSeconds = 3600) => {
    const stringVal = JSON.stringify(value);
    if (redisClient) {
      try {
        await redisClient.set(key, stringVal, {
          EX: ttlSeconds
        });
        return true;
      } catch (err) {
        console.error('Redis SET error:', err);
      }
    }
    memoryCache.set(key, {
      value,
      expiry: Date.now() + (ttlSeconds * 1000)
    });
    return true;
  },

  del: async (key) => {
    if (redisClient) {
      try {
        await redisClient.del(key);
        return true;
      } catch (err) {
        console.error('Redis DEL error:', err);
      }
    }
    memoryCache.delete(key);
    return true;
  },

  flush: async () => {
    if (redisClient) {
      try {
        await redisClient.flushAll();
        return true;
      } catch (err) {
        console.error('Redis FLUSH error:', err);
      }
    }
    memoryCache.clear();
    return true;
  }
};

export default redisClient;
