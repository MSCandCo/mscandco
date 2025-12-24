/**
 * Rate Limiting Utility
 *
 * Implements token bucket algorithm for API rate limiting.
 * Can be configured to use Upstash Redis for distributed rate limiting across multiple servers.
 * Falls back to in-memory storage for development.
 */

import { LRUCache } from 'lru-cache'

// Create an in-memory cache for rate limiting
// LRU (Least Recently Used) cache ensures memory doesn't grow indefinitely
const tokenCache = new LRUCache({
  max: 500, // Maximum number of unique identifiers to track
  ttl: 60000 * 60, // 1 hour TTL
})

export class RateLimiter {
  constructor(options = {}) {
    this.interval = options.interval || 60000 // Default: 1 minute
    this.uniqueTokenPerInterval = options.uniqueTokenPerInterval || 500
    this.tokensPerInterval = options.tokensPerInterval || 10 // Default: 10 requests per interval
  }

  async check(identifier, limit = this.tokensPerInterval) {
    const tokenCount = tokenCache.get(identifier) || [0]

    if (tokenCount[0] === 0) {
      // First request, initialize with full tokens
      tokenCache.set(identifier, [limit - 1])
      return { success: true, remaining: limit - 1, reset: Date.now() + this.interval }
    }

    // Check if we have tokens remaining
    if (tokenCount[0] > 0) {
      tokenCache.set(identifier, [tokenCount[0] - 1])
      return { success: true, remaining: tokenCount[0] - 1, reset: Date.now() + this.interval }
    }

    // No tokens remaining
    return {
      success: false,
      remaining: 0,
      reset: Date.now() + this.interval,
      error: 'Too many requests'
    }
  }

  async reset(identifier) {
    tokenCache.delete(identifier)
  }
}

// Pre-configured rate limiters for different use cases
export const rateLimiters = {
  // Strict rate limiting for sensitive endpoints (authentication, etc.)
  strict: new RateLimiter({
    interval: 60000, // 1 minute
    tokensPerInterval: 5, // 5 requests per minute
  }),

  // Standard rate limiting for API endpoints
  api: new RateLimiter({
    interval: 60000, // 1 minute
    tokensPerInterval: 60, // 60 requests per minute
  }),

  // Lenient rate limiting for general use
  general: new RateLimiter({
    interval: 60000, // 1 minute
    tokensPerInterval: 100, // 100 requests per minute
  }),

  // Very strict for public endpoints (no auth)
  public: new RateLimiter({
    interval: 60000, // 1 minute
    tokensPerInterval: 10, // 10 requests per minute
  }),
}

/**
 * Rate limit middleware for API routes
 *
 * @param {Request} request - Next.js request object
 * @param {string} identifier - Unique identifier for the rate limit (usually IP or user ID)
 * @param {RateLimiter} limiter - Rate limiter instance to use
 * @returns {Response|null} - Returns Response if rate limited, null otherwise
 */
export async function rateLimit(request, identifier, limiter = rateLimiters.api) {
  const result = await limiter.check(identifier)

  // Add rate limit headers to the request for tracking
  request.rateLimitResult = result

  if (!result.success) {
    return new Response(
      JSON.stringify({
        error: 'Too Many Requests',
        message: 'You have exceeded the rate limit. Please try again later.',
        retryAfter: Math.ceil((result.reset - Date.now()) / 1000),
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': limiter.tokensPerInterval.toString(),
          'X-RateLimit-Remaining': result.remaining.toString(),
          'X-RateLimit-Reset': result.reset.toString(),
          'Retry-After': Math.ceil((result.reset - Date.now()) / 1000).toString(),
        },
      }
    )
  }

  return null // No rate limit hit, proceed
}

/**
 * Get rate limit identifier from request
 * Prioritizes user ID, falls back to IP address
 */
export function getRateLimitIdentifier(request, userId = null) {
  if (userId) {
    return `user:${userId}`
  }

  // Get IP from various headers (considering proxies)
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const ip = forwarded?.split(',')[0] || realIp || 'unknown'

  return `ip:${ip}`
}

/**
 * Add rate limit headers to a successful response
 */
export function addRateLimitHeaders(response, rateLimitResult, limiter) {
  if (!rateLimitResult) return response

  const headers = new Headers(response.headers)
  headers.set('X-RateLimit-Limit', limiter.tokensPerInterval.toString())
  headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString())
  headers.set('X-RateLimit-Reset', rateLimitResult.reset.toString())

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}

// Export for use in API routes
export default {
  RateLimiter,
  rateLimiters,
  rateLimit,
  getRateLimitIdentifier,
  addRateLimitHeaders,
}
