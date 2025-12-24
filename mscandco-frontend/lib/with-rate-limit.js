/**
 * Higher-order function to wrap API routes with rate limiting
 *
 * Usage:
 * export const POST = withRateLimit(async (request) => {
 *   // Your API logic here
 *   return NextResponse.json({ success: true })
 * }, { limiter: 'strict' })
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { rateLimit, getRateLimitIdentifier, addRateLimitHeaders, rateLimiters } from './rate-limit'

export function withRateLimit(handler, options = {}) {
  const limiterKey = options.limiter || 'api'
  const limiter = rateLimiters[limiterKey] || rateLimiters.api

  return async function rateLimitedHandler(request, context) {
    try {
      // Get user ID if authenticated
      let userId = null
      try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        userId = user?.id
      } catch (error) {
        // Continue without user ID
      }

      // Get rate limit identifier
      const identifier = getRateLimitIdentifier(request, userId)

      // Check rate limit
      const rateLimitResponse = await rateLimit(request, identifier, limiter)

      if (rateLimitResponse) {
        // Rate limit exceeded
        return rateLimitResponse
      }

      // Call the actual handler
      const response = await handler(request, context)

      // Add rate limit headers to successful response
      if (response instanceof Response && request.rateLimitResult) {
        return addRateLimitHeaders(response, request.rateLimitResult, limiter)
      }

      return response
    } catch (error) {
      console.error('Error in rate limit middleware:', error)
      // Don't block requests if rate limiting fails
      return await handler(request, context)
    }
  }
}

// Convenience exports for common patterns
export const withStrictRateLimit = (handler) => withRateLimit(handler, { limiter: 'strict' })
export const withPublicRateLimit = (handler) => withRateLimit(handler, { limiter: 'public' })
export const withApiRateLimit = (handler) => withRateLimit(handler, { limiter: 'api' })
export const withGeneralRateLimit = (handler) => withRateLimit(handler, { limiter: 'general' })

export default withRateLimit
