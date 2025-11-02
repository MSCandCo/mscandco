# Rate Limiting Implementation Guide

## Overview

Our platform implements API rate limiting to prevent abuse, ensure fair resource allocation, and protect against DDoS attacks. The rate limiting system uses a token bucket algorithm with in-memory caching (LRU Cache).

## Features

- **Multiple Rate Limit Tiers**: Strict, API, General, and Public limiters
- **User and IP-based Identification**: Prioritizes user ID, falls back to IP address
- **Automatic Headers**: Adds standard rate limit headers to responses
- **Easy Integration**: Simple higher-order function wrapper for API routes
- **Graceful Degradation**: Doesn't block requests if rate limiting fails

## Rate Limit Tiers

| Tier | Requests/Minute | Use Case |
|------|----------------|----------|
| **Strict** | 5 | Authentication endpoints, password resets, sensitive operations |
| **API** | 60 | Standard API endpoints, authenticated routes |
| **General** | 100 | General use, low-risk operations |
| **Public** | 10 | Public endpoints without authentication |

## Usage

### Basic Usage

Wrap your API route handler with `withRateLimit`:

```javascript
// app/api/example/route.js
import { NextResponse } from 'next/server'
import { withRateLimit } from '@/lib/with-rate-limit'

export const POST = withRateLimit(async (request) => {
  // Your API logic here
  const body = await request.json()

  return NextResponse.json({
    success: true,
    data: body
  })
}, { limiter: 'api' })

export const GET = withRateLimit(async (request) => {
  // Your API logic here
  return NextResponse.json({
    success: true,
    message: 'Hello World'
  })
})
```

### Using Specific Limiters

```javascript
import {
  withStrictRateLimit,
  withApiRateLimit,
  withPublicRateLimit,
  withGeneralRateLimit
} from '@/lib/with-rate-limit'

// Strict rate limiting (5 req/min) for password reset
export const POST = withStrictRateLimit(async (request) => {
  // Handle password reset
  return NextResponse.json({ success: true })
})

// Public rate limiting (10 req/min) for unauthenticated endpoints
export const GET = withPublicRateLimit(async (request) => {
  // Return public data
  return NextResponse.json({ data: [] })
})
```

### Manual Rate Limiting

For more control, use the rate limiter directly:

```javascript
import { NextResponse } from 'next/server'
import { rateLimit, getRateLimitIdentifier, rateLimiters } from '@/lib/rate-limit'

export async function POST(request) {
  // Get identifier
  const identifier = getRateLimitIdentifier(request, userId)

  // Check rate limit
  const rateLimitResponse = await rateLimit(
    request,
    identifier,
    rateLimiters.strict
  )

  if (rateLimitResponse) {
    return rateLimitResponse // Returns 429 Too Many Requests
  }

  // Continue with your logic
  return NextResponse.json({ success: true })
}
```

## Response Headers

Rate limit headers are automatically added to responses:

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 58
X-RateLimit-Reset: 1735831200000
Retry-After: 45
```

- **X-RateLimit-Limit**: Total requests allowed in the time window
- **X-RateLimit-Remaining**: Requests remaining in current window
- **X-RateLimit-Reset**: Unix timestamp when the limit resets
- **Retry-After**: Seconds until the rate limit resets (only on 429 responses)

## Error Response

When rate limit is exceeded, clients receive:

```json
{
  "error": "Too Many Requests",
  "message": "You have exceeded the rate limit. Please try again later.",
  "retryAfter": 45
}
```

HTTP Status: `429 Too Many Requests`

## Examples by Endpoint Type

### Authentication Endpoints
Use **strict** rate limiting (5 req/min):
- `/api/auth/login`
- `/api/auth/register`
- `/api/auth/reset-password`
- `/api/auth/2fa/verify`

```javascript
export const POST = withStrictRateLimit(async (request) => {
  // Authentication logic
})
```

### Public API Endpoints
Use **public** rate limiting (10 req/min):
- `/api/public/releases`
- `/api/public/artists`
- `/api/health`

```javascript
export const GET = withPublicRateLimit(async (request) => {
  // Public data logic
})
```

### Authenticated API Endpoints
Use **api** rate limiting (60 req/min):
- `/api/artist/releases`
- `/api/artist/earnings`
- `/api/admin/users`

```javascript
export const GET = withApiRateLimit(async (request) => {
  // Authenticated logic
})
```

### High-Volume Endpoints
Use **general** rate limiting (100 req/min):
- `/api/search`
- `/api/analytics/pageview`

```javascript
export const POST = withGeneralRateLimit(async (request) => {
  // High-volume logic
})
```

## Client-Side Handling

### JavaScript/TypeScript

```typescript
async function makeRequest() {
  try {
    const response = await fetch('/api/example', {
      method: 'POST',
      body: JSON.stringify(data)
    })

    // Check rate limit headers
    const remaining = response.headers.get('X-RateLimit-Remaining')
    const limit = response.headers.get('X-RateLimit-Limit')

    console.log(`Rate limit: ${remaining}/${limit} remaining`)

    if (response.status === 429) {
      const error = await response.json()
      const retryAfter = error.retryAfter

      console.error(`Rate limited. Retry after ${retryAfter} seconds`)

      // Implement exponential backoff
      setTimeout(() => makeRequest(), retryAfter * 1000)
      return
    }

    const data = await response.json()
    return data

  } catch (error) {
    console.error('Request failed:', error)
  }
}
```

### React Hook

```typescript
import { useState } from 'react'

export function useRateLimitedFetch() {
  const [isRateLimited, setIsRateLimited] = useState(false)
  const [retryAfter, setRetryAfter] = useState(0)

  const fetch = async (url, options) => {
    try {
      const response = await window.fetch(url, options)

      if (response.status === 429) {
        const error = await response.json()
        setIsRateLimited(true)
        setRetryAfter(error.retryAfter)

        // Auto-reset after retry period
        setTimeout(() => {
          setIsRateLimited(false)
          setRetryAfter(0)
        }, error.retryAfter * 1000)

        throw new Error('Rate limit exceeded')
      }

      setIsRateLimited(false)
      return response

    } catch (error) {
      throw error
    }
  }

  return { fetch, isRateLimited, retryAfter }
}
```

## Custom Rate Limiters

Create custom rate limiters for specific needs:

```javascript
import { RateLimiter } from '@/lib/rate-limit'

const customLimiter = new RateLimiter({
  interval: 60000, // 1 minute
  tokensPerInterval: 30, // 30 requests per minute
})

export const POST = withRateLimit(async (request) => {
  // Your logic
}, { limiter: customLimiter })
```

## Testing

### Testing Rate Limits

```bash
# Test rate limit (should fail after 5 requests within 1 minute)
for i in {1..10}; do
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"password"}' \
    -v
done
```

### Disable Rate Limiting for Tests

```javascript
// jest.setup.js
jest.mock('@/lib/rate-limit', () => ({
  rateLimit: jest.fn(() => null),
  getRateLimitIdentifier: jest.fn(() => 'test-identifier'),
  rateLimiters: {
    strict: { check: jest.fn(() => ({ success: true, remaining: 999 })) },
    api: { check: jest.fn(() => ({ success: true, remaining: 999 })) },
    general: { check: jest.fn(() => ({ success: true, remaining: 999 })) },
    public: { check: jest.fn(() => ({ success: true, remaining: 999 })) },
  }
}))
```

## Monitoring

### Track Rate Limit Hits

```javascript
// lib/monitoring.js
export function logRateLimitHit(identifier, endpoint) {
  console.warn(`Rate limit hit: ${identifier} on ${endpoint}`)

  // Send to monitoring service (Sentry, DataDog, etc.)
  if (typeof window !== 'undefined' && window.Sentry) {
    window.Sentry.captureMessage('Rate limit hit', {
      level: 'warning',
      extra: { identifier, endpoint }
    })
  }
}
```

## Future Enhancements

### Upstash Redis Integration

For distributed rate limiting across multiple servers:

```javascript
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
})

export class RedisRateLimiter {
  async check(identifier, limit) {
    const key = `rate-limit:${identifier}`
    const current = await redis.incr(key)

    if (current === 1) {
      await redis.expire(key, 60) // 1 minute TTL
    }

    if (current > limit) {
      return { success: false, remaining: 0 }
    }

    return { success: true, remaining: limit - current }
  }
}
```

## Best Practices

1. **Use Appropriate Tiers**: Don't over-restrict legitimate users
2. **Add Monitoring**: Track rate limit hits to detect issues
3. **Communicate Clearly**: Return helpful error messages
4. **Implement Backoff**: Clients should respect Retry-After headers
5. **Document Limits**: Make rate limits clear in API documentation
6. **Test Thoroughly**: Ensure rate limits don't block legitimate traffic
7. **Consider Bursts**: Allow short bursts for better UX

## Compliance

Rate limiting helps with:

- **GDPR**: Prevent brute-force attacks on user accounts
- **PCI DSS**: Protect payment endpoints from abuse
- **General Security**: Mitigate DDoS and abuse attempts

## Support

For questions or issues with rate limiting:
- Email: support@mscandco.com
- Docs: https://docs.mscandco.com/rate-limiting
