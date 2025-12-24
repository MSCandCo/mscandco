/**
 * API Response Caching Utilities
 *
 * Provides consistent caching headers for API responses
 * Dramatically improves performance by reducing database queries
 */

/**
 * Cache durations in seconds
 */
export const CACHE_DURATIONS = {
  // Very short cache for frequently changing data
  REALTIME: 10,           // 10 seconds
  SHORT: 60,              // 1 minute
  MEDIUM: 300,            // 5 minutes
  LONG: 3600,             // 1 hour
  VERY_LONG: 86400,       // 24 hours
  WEEK: 604800,           // 7 days
}

/**
 * Get cache control header for different data types
 */
export function getCacheHeaders(duration = CACHE_DURATIONS.MEDIUM, options = {}) {
  const {
    staleWhileRevalidate = duration * 24, // Default: stale for 24x the cache duration
    isPublic = true,
    mustRevalidate = false,
  } = options

  const directives = []

  // Public vs Private
  directives.push(isPublic ? 'public' : 'private')

  // Max age
  directives.push(`max-age=${duration}`)

  // S-maxage (CDN cache)
  if (isPublic) {
    directives.push(`s-maxage=${duration}`)
  }

  // Stale while revalidate
  directives.push(`stale-while-revalidate=${staleWhileRevalidate}`)

  // Must revalidate
  if (mustRevalidate) {
    directives.push('must-revalidate')
  }

  return {
    'Cache-Control': directives.join(', '),
  }
}

/**
 * Pre-configured cache headers for common scenarios
 */
export const CACHE_HEADERS = {
  // User-specific data (private, short cache)
  USER_DATA: getCacheHeaders(CACHE_DURATIONS.SHORT, {
    isPublic: false,
    staleWhileRevalidate: CACHE_DURATIONS.MEDIUM,
  }),

  // Public list data (longer cache)
  LIST_DATA: getCacheHeaders(CACHE_DURATIONS.MEDIUM, {
    isPublic: true,
    staleWhileRevalidate: CACHE_DURATIONS.LONG,
  }),

  // Static content (very long cache)
  STATIC: getCacheHeaders(CACHE_DURATIONS.VERY_LONG, {
    isPublic: true,
    staleWhileRevalidate: CACHE_DURATIONS.WEEK,
  }),

  // Analytics/Stats (medium cache)
  STATS: getCacheHeaders(CACHE_DURATIONS.LONG, {
    isPublic: false,
    staleWhileRevalidate: CACHE_DURATIONS.VERY_LONG,
  }),

  // Releases/Music (long cache)
  RELEASES: getCacheHeaders(CACHE_DURATIONS.LONG, {
    isPublic: true,
    staleWhileRevalidate: CACHE_DURATIONS.VERY_LONG,
  }),

  // User profiles (medium cache)
  PROFILES: getCacheHeaders(CACHE_DURATIONS.MEDIUM, {
    isPublic: false,
    staleWhileRevalidate: CACHE_DURATIONS.LONG,
  }),

  // Real-time data (very short cache)
  REALTIME: getCacheHeaders(CACHE_DURATIONS.REALTIME, {
    isPublic: false,
    staleWhileRevalidate: CACHE_DURATIONS.SHORT,
  }),

  // No cache (for mutations/sensitive data)
  NO_CACHE: {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  },
}

/**
 * Helper to create a cached JSON response
 *
 * @example
 * return cachedJsonResponse(data, CACHE_HEADERS.LIST_DATA)
 */
export function cachedJsonResponse(data, headers = CACHE_HEADERS.LIST_DATA, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
  })
}

/**
 * Helper to add ETag support for cache validation
 */
export function generateETag(data) {
  const hash = require('crypto')
    .createHash('md5')
    .update(JSON.stringify(data))
    .digest('hex')
  return `"${hash}"`
}

/**
 * Check if request has matching ETag (304 Not Modified)
 */
export function checkETag(request, etag) {
  const ifNoneMatch = request.headers.get('if-none-match')
  return ifNoneMatch === etag
}

/**
 * Example usage in API route:
 *
 * // app/api/artists/route.js
 * import { cachedJsonResponse, CACHE_HEADERS } from '@/lib/apiCache'
 *
 * export async function GET() {
 *   const artists = await getArtists()
 *   return cachedJsonResponse(artists, CACHE_HEADERS.LIST_DATA)
 * }
 */
