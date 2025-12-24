'use client'

import posthog from 'posthog-js'

let isInitialized = false

/**
 * Initialize PostHog client-side
 */
export function initPostHog() {
  if (typeof window === 'undefined' || isInitialized) return

  const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY
  const apiHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com'

  if (!apiKey) {
    return
  }

  posthog.init(apiKey, {
    api_host: apiHost,

    // Capture pageviews automatically
    capture_pageview: true,
    capture_pageleave: true,

    // Session recording
    session_recording: {
      maskAllInputs: true,
      maskTextSelector: '[data-private]',
    },

    // Performance monitoring
    autocapture: true,
    capture_performance: true,

    // Privacy
    respect_dnt: true,
    opt_out_capturing_by_default: false,

    // Persistence
    persistence: 'localStorage+cookie',

    // Advanced features
    enable_recording_console_log: true,

    // UI/UX - Disable toolbar and person profile icons
    disable_toolbar: true,
    disable_session_recording: false,

    loaded: (posthog) => {
      if (process.env.NODE_ENV === 'development') {
        posthog.debug()
      }
    },
  })

  isInitialized = true
}

/**
 * Identify user
 * @param {string} userId - User ID
 * @param {Object} properties - User properties
 */
export function identifyUser(userId, properties = {}) {
  if (!isInitialized) return

  posthog.identify(userId, {
    email: properties.email,
    name: properties.name || properties.artist_name,
    role: properties.role,
    created_at: properties.created_at,
    ...properties,
  })
}

/**
 * Track event
 * @param {string} eventName - Event name
 * @param {Object} properties - Event properties
 */
export function trackEvent(eventName, properties = {}) {
  if (!isInitialized) return

  posthog.capture(eventName, {
    ...properties,
    timestamp: new Date().toISOString(),
  })
}

/**
 * Track page view
 * @param {string} pageName - Page name
 * @param {Object} properties - Page properties
 */
export function trackPageView(pageName, properties = {}) {
  if (!isInitialized) return

  posthog.capture('$pageview', {
    $current_url: window.location.href,
    page_name: pageName,
    ...properties,
  })
}

/**
 * Set user properties
 * @param {Object} properties - Properties to set
 */
export function setUserProperties(properties) {
  if (!isInitialized) return

  posthog.people.set(properties)
}

/**
 * Reset user (logout)
 */
export function resetUser() {
  if (!isInitialized) return

  posthog.reset()
}

/**
 * Feature flag check
 * @param {string} flagKey - Feature flag key
 * @returns {boolean} Flag value
 */
export function isFeatureEnabled(flagKey) {
  if (!isInitialized) return false

  return posthog.isFeatureEnabled(flagKey)
}

/**
 * Get feature flag variant
 * @param {string} flagKey - Feature flag key
 * @returns {string|boolean} Flag variant
 */
export function getFeatureFlag(flagKey) {
  if (!isInitialized) return false

  return posthog.getFeatureFlag(flagKey)
}

/**
 * Start session recording
 */
export function startRecording() {
  if (!isInitialized) return

  posthog.startSessionRecording()
}

/**
 * Stop session recording
 */
export function stopRecording() {
  if (!isInitialized) return

  posthog.stopSessionRecording()
}

export default posthog

