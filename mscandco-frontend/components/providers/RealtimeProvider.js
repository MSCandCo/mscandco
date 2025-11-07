'use client'

import { useEffect, useState, createContext, useContext, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { subscribeToNotifications } from '@/lib/realtime/supabase-realtime'
import { trackEvent } from '@/lib/analytics/posthog-client'

// Create context for global notification events
const RealtimeContext = createContext({
  onNotification: null,
  unreadCount: 0,
})

export const useRealtime = () => useContext(RealtimeContext)

export default function RealtimeProvider({ children, user }) {
  const [unreadCount, setUnreadCount] = useState(0)
  const notificationListenersRef = useRef([])
  const supabase = createClient()

  // Fetch initial unread count on mount
  useEffect(() => {
    if (!user?.id) {
      setUnreadCount(0)
      return
    }

    const fetchInitialCount = async () => {
      try {
        const { count, error } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('read', false)

        if (!error && count !== null) {
          setUnreadCount(count)
        }
      } catch (err) {
        console.error('Error fetching initial unread count:', err)
      }
    }

    fetchInitialCount()
  }, [user?.id, supabase])

  useEffect(() => {
    if (!user?.id) return

    console.log('🔌 Setting up SINGLE global realtime subscription for user:', user.id)

    // SINGLE global subscription to notifications
    const unsubscribeNotifications = subscribeToNotifications(
      user.id,
      (notification) => {
        console.log('🔔 New notification received (global):', notification)

        // Update unread count (increment)
        setUnreadCount(prev => prev + 1)

        // Notify all listeners (using ref to avoid dependency issues)
        notificationListenersRef.current.forEach(listener => {
          try {
            listener(notification)
          } catch (err) {
            console.error('Error in notification listener:', err)
          }
        })

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
      console.log('🔌 Cleaning up global realtime subscriptions')
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

  // Register notification listener (using ref to avoid re-renders)
  const registerNotificationListener = (listener) => {
    notificationListenersRef.current.push(listener)
    return () => {
      notificationListenersRef.current = notificationListenersRef.current.filter(l => l !== listener)
    }
  }

  // Decrement unread count when notification is marked as read
  const markNotificationRead = () => {
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  // Refresh unread count (useful after marking all as read)
  const refreshUnreadCount = async () => {
    if (!user?.id) return
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('read', false)

      if (!error && count !== null) {
        setUnreadCount(count)
      }
    } catch (err) {
      console.error('Error refreshing unread count:', err)
    }
  }

  return (
    <RealtimeContext.Provider value={{
      onNotification: registerNotificationListener,
      unreadCount,
      markNotificationRead,
      refreshUnreadCount,
    }}>
      {children}
    </RealtimeContext.Provider>
  )
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

