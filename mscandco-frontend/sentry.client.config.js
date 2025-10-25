import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // EU Data Residency (for GDPR compliance)
  tunnel: process.env.NEXT_PUBLIC_SENTRY_ORG ? `/api/sentry-tunnel` : undefined,
  
  // Performance Monitoring
  tracesSampleRate: 1.0, // Capture 100% of transactions for performance monitoring
  
  // Session Replay
  replaysSessionSampleRate: 0.1, // 10% of sessions
  replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors
  
  // Environment
  environment: process.env.NEXT_PUBLIC_VERCEL_ENV || 'development',
  
  // Release tracking
  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
  
  // Integrations - simplified for compatibility
  integrations: [
    // Browser tracing and replay will be handled automatically by SDK
  ],
  
  // Filter out noise
  ignoreErrors: [
    // Browser extensions
    'top.GLOBALS',
    'chrome-extension://',
    'moz-extension://',
    // Network errors
    'NetworkError',
    'Failed to fetch',
    // Supabase realtime reconnection (expected)
    'WebSocket connection',
  ],
  
  // Add custom tags
  beforeSend(event, hint) {
    // Add user context if available
    if (typeof window !== 'undefined' && window.localStorage) {
      const user = window.localStorage.getItem('user')
      if (user) {
        try {
          const userData = JSON.parse(user)
          event.user = {
            id: userData.id,
            email: userData.email,
            role: userData.role,
          }
        } catch (e) {
          // Ignore parsing errors
        }
      }
    }
    
    return event
  },
})

