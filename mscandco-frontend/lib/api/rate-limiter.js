/**
 * Advanced API Rate Limiter with Redis
 * Protects API routes from abuse with flexible rate limiting strategies
 */

import { Redis } from '@upstash/redis';
import { APIError, ErrorTypes } from './error-handler.js';

// Initialize Redis client
const redis = process.env.UPSTASH_REDIS_REST_URL
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

// In-memory fallback for development
class InMemoryRateLimiter {
  constructor() {
    this.requests = new Map();
  }

  async check(key, limit, window) {
    const now = Date.now();
    const windowStart = now - window;

    if (!this.requests.has(key)) {
      this.requests.set(key, []);
    }

    const requests = this.requests.get(key).filter(time => time > windowStart);
    requests.push(now);
    this.requests.set(key, requests);

    return {
      count: requests.length,
      remaining: Math.max(0, limit - requests.length),
      resetTime: windowStart + window,
    };
  }

  async reset(key) {
    this.requests.delete(key);
  }
}

const memoryLimiter = new InMemoryRateLimiter();

/**
 * Rate limit configurations for different endpoint types
 */
export const RateLimitConfigs = {
  // General API endpoints - 100 requests per minute
  default: {
    limit: 100,
    window: 60 * 1000, // 1 minute
  },

  // Authentication endpoints - 5 requests per minute
  auth: {
    limit: 5,
    window: 60 * 1000,
  },

  // Payment endpoints - 10 requests per minute
  payment: {
    limit: 10,
    window: 60 * 1000,
  },

  // Apollo AI endpoints - 30 requests per minute
  apollo: {
    limit: 30,
    window: 60 * 1000,
  },

  // Data export endpoints - 5 requests per 5 minutes
  export: {
    limit: 5,
    window: 5 * 60 * 1000,
  },

  // Upload endpoints - 20 requests per minute
  upload: {
    limit: 20,
    window: 60 * 1000,
  },

  // Admin endpoints - 200 requests per minute
  admin: {
    limit: 200,
    window: 60 * 1000,
  },

  // Public endpoints - 300 requests per minute
  public: {
    limit: 300,
    window: 60 * 1000,
  },
};

/**
 * Check rate limit for a request
 */
export async function checkRateLimit(identifier, config = RateLimitConfigs.default) {
  const { limit, window } = config;
  const key = `ratelimit:${identifier}`;

  try {
    if (redis) {
      // Use Redis for production
      const now = Date.now();
      const windowStart = now - window;

      // Remove old entries
      await redis.zremrangebyscore(key, 0, windowStart);

      // Count current requests in window
      const count = await redis.zcard(key);

      if (count >= limit) {
        const oldest = await redis.zrange(key, 0, 0, { withScores: true });
        const resetTime = oldest[0]?.score + window;

        throw new APIError(
          ErrorTypes.RATE_LIMIT,
          'Rate limit exceeded. Please try again later.',
          {
            limit,
            window: window / 1000,
            resetTime: new Date(resetTime).toISOString(),
          },
          429
        );
      }

      // Add current request
      await redis.zadd(key, { score: now, member: `${now}:${Math.random()}` });
      await redis.expire(key, Math.ceil(window / 1000));

      return {
        success: true,
        remaining: limit - count - 1,
        limit,
        resetTime: now + window,
      };
    } else {
      // Use in-memory limiter for development
      const result = await memoryLimiter.check(key, limit, window);

      if (result.count > limit) {
        throw new APIError(
          ErrorTypes.RATE_LIMIT,
          'Rate limit exceeded. Please try again later.',
          {
            limit,
            window: window / 1000,
            resetTime: new Date(result.resetTime).toISOString(),
          },
          429
        );
      }

      return {
        success: true,
        remaining: result.remaining,
        limit,
        resetTime: result.resetTime,
      };
    }
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }

    // If rate limiting fails, allow the request but log the error
    console.error('[Rate Limiter] Error:', error);
    return {
      success: true,
      remaining: limit,
      limit,
      resetTime: Date.now() + window,
      error: 'Rate limiter unavailable',
    };
  }
}

/**
 * Rate limiter middleware
 */
export function rateLimitMiddleware(config = RateLimitConfigs.default) {
  return async (req, res, next) => {
    try {
      // Get identifier from IP or user ID
      const identifier = req.user?.id || req.ip || req.headers['x-forwarded-for'] || 'anonymous';

      // Check rate limit
      const result = await checkRateLimit(identifier, config);

      // Set rate limit headers
      res.setHeader('X-RateLimit-Limit', result.limit);
      res.setHeader('X-RateLimit-Remaining', result.remaining);
      res.setHeader('X-RateLimit-Reset', new Date(result.resetTime).toISOString());

      if (next) {
        return next();
      }
    } catch (error) {
      if (error instanceof APIError && error.type === ErrorTypes.RATE_LIMIT) {
        return res.status(429).json({
          success: false,
          error: {
            type: error.type,
            message: error.message,
            details: error.details,
          },
        });
      }

      throw error;
    }
  };
}

/**
 * IP-based rate limiting
 */
export async function checkIPRateLimit(req, config = RateLimitConfigs.default) {
  const ip = req.headers['x-forwarded-for'] || req.ip || 'unknown';
  return checkRateLimit(`ip:${ip}`, config);
}

/**
 * User-based rate limiting
 */
export async function checkUserRateLimit(userId, config = RateLimitConfigs.default) {
  return checkRateLimit(`user:${userId}`, config);
}

/**
 * Endpoint-based rate limiting
 */
export async function checkEndpointRateLimit(req, config = RateLimitConfigs.default) {
  const endpoint = req.url || 'unknown';
  const identifier = req.user?.id || req.ip || 'anonymous';
  return checkRateLimit(`endpoint:${endpoint}:${identifier}`, config);
}

/**
 * Reset rate limit for an identifier
 */
export async function resetRateLimit(identifier) {
  const key = `ratelimit:${identifier}`;

  try {
    if (redis) {
      await redis.del(key);
    } else {
      await memoryLimiter.reset(key);
    }
    return { success: true };
  } catch (error) {
    console.error('[Rate Limiter] Reset error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get rate limit status
 */
export async function getRateLimitStatus(identifier, config = RateLimitConfigs.default) {
  const { limit, window } = config;
  const key = `ratelimit:${identifier}`;

  try {
    if (redis) {
      const now = Date.now();
      const windowStart = now - window;

      await redis.zremrangebyscore(key, 0, windowStart);
      const count = await redis.zcard(key);

      return {
        current: count,
        limit,
        remaining: Math.max(0, limit - count),
        window: window / 1000,
      };
    } else {
      const result = await memoryLimiter.check(key, limit, window);
      return {
        current: result.count,
        limit,
        remaining: result.remaining,
        window: window / 1000,
      };
    }
  } catch (error) {
    console.error('[Rate Limiter] Status error:', error);
    return {
      current: 0,
      limit,
      remaining: limit,
      window: window / 1000,
      error: 'Unable to fetch status',
    };
  }
}
