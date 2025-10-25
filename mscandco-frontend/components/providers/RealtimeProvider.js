'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { subscribeToNotifications } from '@/lib/realtime/supabase-realtime'
import { trackEvent } from '@/lib/analytics/posthog-client'

export default function RealtimeProvider({ children, user }) {
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!user?.id) return

    console.log('🔌 Setting up realtime subscriptions for user:', user.id)

    // Subscribe to notifications
    const unsubscribeNotifications = subscribeToNotifications(
      user.id,
      (notification) => {
        console.log('🔔 New notification:', notification)

        // Update unread count
        setUnreadCount(prev => prev + 1)

        // Show browser notification if permitted
        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
          new Notification(notification.title, {
            body: notification.message,
            icon: '/favicon.png',
            tag: notification.id,
          })
        }

        // Track event
        trackEvent('notification_received', {
          notification_type: notification.type,
          notification_id: notification.id,
        })

        // Play notification sound (optional)
        playNotificationSound()
      }
    )

    // Cleanup on unmount
    return () => {
      console.log('🔌 Cleaning up realtime subscriptions')
      unsubscribeNotifications()
    }
  }, [user?.id])

  // Request notification permission on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        console.log('🔔 Notification permission:', permission)
      })
    }
  }, [])

  return <>{children}</>
}

// Play notification sound
function playNotificationSound() {
  if (typeof window !== 'undefined' && typeof Audio !== 'undefined') {
    try {
      const audio = new Audio('/sounds/notification.mp3')
      audio.volume = 0.3
      audio.play().catch(err => {
        console.log('Could not play notification sound:', err)
      })
    } catch (err) {
      console.log('Audio not supported:', err)
    }
  }
}

