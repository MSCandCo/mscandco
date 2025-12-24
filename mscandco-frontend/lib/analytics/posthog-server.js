import { PostHog } from 'posthog-node'

let posthogServer = null

/**
 * Get PostHog server client (singleton)
 * @returns {PostHog} PostHog server client
 */
export function getPostHogServer() {
  if (!posthogServer) {
    const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com'

    if (!apiKey) {
      return null
    }

    posthogServer = new PostHog(apiKey, {
      host,
      flushAt: 20, // Flush after 20 events
      flushInterval: 10000, // Flush every 10 seconds
    })

  }

  return posthogServer
}

/**
 * Track server-side event
 * @param {string} distinctId - User ID or session ID
 * @param {string} eventName - Event name
 * @param {Object} properties - Event properties
 */
export async function trackServerEvent(distinctId, eventName, properties = {}) {
  const posthog = getPostHogServer()
  
  if (!posthog) return

  try {
    posthog.capture({
      distinctId,
      event: eventName,
      properties: {
        ...properties,
        timestamp: new Date().toISOString(),
        $lib: 'posthog-node',
      },
    })
  } catch (error) {
    console.error('❌ PostHog server tracking error:', error)
  }
}

/**
 * Identify user on server
 * @param {string} userId - User ID
 * @param {Object} properties - User properties
 */
export async function identifyServerUser(userId, properties = {}) {
  const posthog = getPostHogServer()
  
  if (!posthog) return

  try {
    posthog.identify({
      distinctId: userId,
      properties: {
        email: properties.email,
        name: properties.name || properties.artist_name,
        role: properties.role,
        created_at: properties.created_at,
        ...properties,
      },
    })
  } catch (error) {
    console.error('❌ PostHog server identify error:', error)
  }
}

/**
 * Flush events (call before serverless function ends)
 */
export async function flushEvents() {
  const posthog = getPostHogServer()
  
  if (!posthog) return

  try {
    await posthog.shutdown()
  } catch (error) {
    console.error('❌ PostHog flush error:', error)
  }
}

/**
 * Track API request
 * @param {string} userId - User ID
 * @param {string} endpoint - API endpoint
 * @param {string} method - HTTP method
 * @param {number} statusCode - Response status code
 * @param {number} duration - Request duration in ms
 */
export async function trackAPIRequest(userId, endpoint, method, statusCode, duration) {
  await trackServerEvent(userId || 'anonymous', 'api_request', {
    endpoint,
    method,
    status_code: statusCode,
    duration_ms: duration,
    success: statusCode >= 200 && statusCode < 300,
  })
}

/**
 * Track database query
 * @param {string} userId - User ID
 * @param {string} queryType - Query type (e.g., 'SELECT', 'INSERT')
 * @param {string} table - Table name
 * @param {number} duration - Query duration in ms
 */
export async function trackDatabaseQuery(userId, queryType, table, duration) {
  await trackServerEvent(userId || 'system', 'database_query', {
    query_type: queryType,
    table,
    duration_ms: duration,
  })
}

/**
 * Track AI request
 * @param {string} userId - User ID
 * @param {string} model - AI model name
 * @param {number} tokens - Tokens used
 * @param {number} duration - Request duration in ms
 * @param {boolean} success - Request success
 */
export async function trackAIRequest(userId, model, tokens, duration, success) {
  await trackServerEvent(userId, 'ai_request', {
    model,
    tokens,
    duration_ms: duration,
    success,
    cost_estimate: (tokens / 1000) * 0.002, // Rough estimate
  })
}

export default {
  getPostHogServer,
  trackServerEvent,
  identifyServerUser,
  flushEvents,
  trackAPIRequest,
  trackDatabaseQuery,
  trackAIRequest,
}

