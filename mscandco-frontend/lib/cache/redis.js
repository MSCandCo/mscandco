import { Redis } from '@upstash/redis'

let redis = null

/**
 * Get Redis client (singleton)
 * @returns {Redis} Upstash Redis client
 */
export function getRedis() {
  if (!redis) {
    const url = process.env.UPSTASH_REDIS_REST_URL
    const token = process.env.UPSTASH_REDIS_REST_TOKEN

    if (!url || !token) {
      return null
    }

    redis = new Redis({
      url,
      token,
      automaticDeserialization: true,
    })

  }

  return redis
}

/**
 * Cache wrapper with automatic expiration
 * @param {string} key - Cache key
 * @param {Function} fn - Function to execute if cache miss
 * @param {number} ttl - Time to live in seconds (default: 5 minutes)
 * @returns {Promise<any>} Cached or fresh data
 */
export async function cache(key, fn, ttl = 300) {
  const redis = getRedis()
  
  // If Redis not configured, just execute function
  if (!redis) {
    return await fn()
  }

  try {
    // Try to get from cache
    const cached = await redis.get(key)
    
    if (cached !== null) {
      return cached
    }

    
    // Execute function and cache result
    const result = await fn()
    
    // Store in cache with TTL
    await redis.setex(key, ttl, result)
    
    return result
  } catch (error) {
    console.error('❌ Redis error:', error)
    // Fallback to executing function
    return await fn()
  }
}

/**
 * Invalidate cache by key or pattern
 * @param {string} keyOrPattern - Cache key or pattern (e.g., 'user:*')
 */
export async function invalidate(keyOrPattern) {
  const redis = getRedis()
  
  if (!redis) return

  try {
    if (keyOrPattern.includes('*')) {
      // Pattern-based deletion
      const keys = await redis.keys(keyOrPattern)
      if (keys.length > 0) {
        await redis.del(...keys)
      }
    } else {
      // Single key deletion
      await redis.del(keyOrPattern)
    }
  } catch (error) {
    console.error('❌ Redis invalidation error:', error)
  }
}

/**
 * Set cache value manually
 * @param {string} key - Cache key
 * @param {any} value - Value to cache
 * @param {number} ttl - Time to live in seconds
 */
export async function set(key, value, ttl = 300) {
  const redis = getRedis()
  
  if (!redis) return

  try {
    await redis.setex(key, ttl, value)
  } catch (error) {
    console.error('❌ Redis set error:', error)
  }
}

/**
 * Get cache value manually
 * @param {string} key - Cache key
 * @returns {Promise<any>} Cached value or null
 */
export async function get(key) {
  const redis = getRedis()
  
  if (!redis) return null

  try {
    const value = await redis.get(key)
    return value
  } catch (error) {
    console.error('❌ Redis get error:', error)
    return null
  }
}

/**
 * Increment a counter (useful for rate limiting)
 * @param {string} key - Counter key
 * @param {number} ttl - Time to live in seconds
 * @returns {Promise<number>} New counter value
 */
export async function increment(key, ttl = 60) {
  const redis = getRedis()
  
  if (!redis) return 0

  try {
    const value = await redis.incr(key)
    
    // Set expiry on first increment
    if (value === 1) {
      await redis.expire(key, ttl)
    }
    
    return value
  } catch (error) {
    console.error('❌ Redis increment error:', error)
    return 0
  }
}

/**
 * Rate limiter
 * @param {string} identifier - User ID or IP address
 * @param {number} limit - Max requests per window
 * @param {number} window - Time window in seconds
 * @returns {Promise<{allowed: boolean, remaining: number, resetAt: number}>}
 */
export async function rateLimit(identifier, limit = 100, window = 60) {
  const redis = getRedis()
  
  if (!redis) {
    return { allowed: true, remaining: limit, resetAt: Date.now() + window * 1000 }
  }

  try {
    const key = `ratelimit:${identifier}`
    const count = await increment(key, window)
    
    const allowed = count <= limit
    const remaining = Math.max(0, limit - count)
    const resetAt = Date.now() + window * 1000

    if (!allowed) {
    }

    return { allowed, remaining, resetAt }
  } catch (error) {
    console.error('❌ Rate limit error:', error)
    return { allowed: true, remaining: limit, resetAt: Date.now() + window * 1000 }
  }
}

/**
 * Cache user session
 * @param {string} userId - User ID
 * @param {Object} sessionData - Session data
 * @param {number} ttl - Time to live in seconds (default: 1 hour)
 */
export async function cacheSession(userId, sessionData, ttl = 3600) {
  await set(`session:${userId}`, sessionData, ttl)
}

/**
 * Get cached session
 * @param {string} userId - User ID
 * @returns {Promise<Object|null>} Session data or null
 */
export async function getSession(userId) {
  return await get(`session:${userId}`)
}

/**
 * Invalidate user session
 * @param {string} userId - User ID
 */
export async function invalidateSession(userId) {
  await invalidate(`session:${userId}`)
}

/**
 * Cache query result
 * @param {string} queryName - Query identifier
 * @param {Object} params - Query parameters
 * @param {Function} fn - Function to execute if cache miss
 * @param {number} ttl - Time to live in seconds
 * @returns {Promise<any>} Cached or fresh data
 */
export async function cacheQuery(queryName, params, fn, ttl = 300) {
  const key = `query:${queryName}:${JSON.stringify(params)}`
  return await cache(key, fn, ttl)
}

/**
 * Invalidate all queries for a specific query name
 * @param {string} queryName - Query identifier
 */
export async function invalidateQuery(queryName) {
  await invalidate(`query:${queryName}:*`)
}

export default {
  getRedis,
  cache,
  invalidate,
  set,
  get,
  increment,
  rateLimit,
  cacheSession,
  getSession,
  invalidateSession,
  cacheQuery,
  invalidateQuery,
}

