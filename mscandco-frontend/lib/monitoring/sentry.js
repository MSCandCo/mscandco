import * as Sentry from '@sentry/nextjs'

/**
 * Capture an exception with context
 * @param {Error} error - The error to capture
 * @param {Object} context - Additional context
 */
export function captureException(error, context = {}) {
  Sentry.captureException(error, {
    tags: context.tags || {},
    extra: context.extra || {},
    level: context.level || 'error',
  })
}

/**
 * Capture a message
 * @param {string} message - The message to capture
 * @param {string} level - The severity level
 * @param {Object} context - Additional context
 */
export function captureMessage(message, level = 'info', context = {}) {
  Sentry.captureMessage(message, {
    level,
    tags: context.tags || {},
    extra: context.extra || {},
  })
}

/**
 * Set user context for error tracking
 * @param {Object} user - User data
 */
export function setUser(user) {
  if (user) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.artist_name || `${user.first_name} ${user.last_name}`,
      role: user.role,
    })
  } else {
    Sentry.setUser(null)
  }
}

/**
 * Add breadcrumb for debugging
 * @param {string} message - Breadcrumb message
 * @param {string} category - Category (e.g., 'auth', 'api', 'ui')
 * @param {Object} data - Additional data
 */
export function addBreadcrumb(message, category = 'app', data = {}) {
  Sentry.addBreadcrumb({
    message,
    category,
    data,
    level: 'info',
    timestamp: Date.now() / 1000,
  })
}

/**
 * Wrap an async function with error tracking
 * @param {Function} fn - The function to wrap
 * @param {string} name - Function name for tracking
 * @returns {Function} Wrapped function
 */
export function withErrorTracking(fn, name) {
  return async (...args) => {
    try {
      const result = await fn(...args)
      return result
    } catch (error) {
      captureException(error, {
        tags: { function: name },
        extra: { args },
      })
      throw error
    }
  }
}

/**
 * Track API route performance
 * @param {string} route - API route path
 * @param {string} method - HTTP method
 * @param {Function} handler - Route handler
 * @returns {Function} Wrapped handler
 */
export function withAPIMonitoring(route, method, handler) {
  return async (req, res) => {
    const startTime = Date.now()
    
    try {
      const result = await handler(req, res)
      
      const duration = Date.now() - startTime
      
      return result
    } catch (error) {
      const duration = Date.now() - startTime
      
      captureException(error, {
        tags: {
          route,
          method,
          duration_ms: duration,
        },
        extra: {
          body: req.body,
          query: req.query,
        },
      })
      
      throw error
    }
  }
}

export default Sentry

