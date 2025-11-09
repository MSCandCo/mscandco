'use client'

import { useEffect, useRef } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { useUser } from '@/components/providers/SupabaseProvider'

/**
 * Universal AI Learning Hook
 * Automatically tracks all user interactions for comprehensive learning
 * 
 * Usage: Add <AILearningTracker /> to your layout or use useAILearning() hook
 */
export function useAILearning() {
  const { user } = useUser()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const lastTrackedPath = useRef(null)

  // Track page views
  useEffect(() => {
    if (!user?.id || pathname === lastTrackedPath.current) return

    const trackPageView = async () => {
      try {
        await fetch('/api/ai/learn', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            interactionType: 'page_view',
            interactionCategory: getCategoryFromPath(pathname),
            interactionData: {
              page: pathname,
              query: Object.fromEntries(searchParams.entries()),
              timestamp: new Date().toISOString(),
            },
            sessionId: getSessionId(),
            locationData: await getLocationData(),
          }),
        })
        lastTrackedPath.current = pathname
      } catch (error) {
        console.error('Error tracking page view:', error)
      }
    }

    trackPageView()
  }, [user?.id, pathname, searchParams])

  // Function to track custom interactions
  const trackInteraction = async (interactionType, interactionCategory, interactionData = {}) => {
    if (!user?.id) return

    try {
      await fetch('/api/ai/learn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          interactionType,
          interactionCategory,
          interactionData: {
            ...interactionData,
            timestamp: new Date().toISOString(),
          },
          sessionId: getSessionId(),
          locationData: await getLocationData(),
        }),
      })
    } catch (error) {
      console.error('Error tracking interaction:', error)
    }
  }

  return { trackInteraction }
}

/**
 * Get category from pathname for intelligent categorization
 */
function getCategoryFromPath(pathname) {
  if (pathname.includes('/releases')) return 'releases'
  if (pathname.includes('/analytics')) return 'analytics'
  if (pathname.includes('/earnings')) return 'earnings'
  if (pathname.includes('/wallet')) return 'earnings'
  if (pathname.includes('/settings')) return 'settings'
  if (pathname.includes('/profile')) return 'settings'
  if (pathname.includes('/roster')) return 'collaboration'
  if (pathname.includes('/messages')) return 'communication'
  if (pathname.includes('/dashboard')) return 'navigation'
  if (pathname.includes('/admin')) return 'administration'
  return 'navigation'
}

/**
 * Get or create session ID
 */
function getSessionId() {
  if (typeof window === 'undefined') return null
  let sessionId = sessionStorage.getItem('ai_session_id')
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    sessionStorage.setItem('ai_session_id', sessionId)
  }
  return sessionId
}

/**
 * Get location data (simplified - can be enhanced with IP geolocation)
 */
async function getLocationData() {
  try {
    // Try to get from browser if available
    if (typeof window !== 'undefined' && navigator.geolocation) {
      // For now, return timezone and language
      return {
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language,
      }
    }
  } catch (error) {
    console.error('Error getting location:', error)
  }
  return null
}

/**
 * AILearningTracker Component
 * Add this to your layout to automatically track all interactions
 */
export default function AILearningTracker() {
  useAILearning()
  return null
}

export { useAILearning }

