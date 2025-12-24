'use client'

import { createClient } from '@/lib/supabase/client'
import { addBreadcrumb } from '@/lib/monitoring/sentry'

/**
 * Subscribe to real-time notifications
 * @param {string} userId - User ID
 * @param {Function} onNotification - Callback for new notifications
 * @returns {Function} Unsubscribe function
 */
export function subscribeToNotifications(userId, onNotification) {
  const supabase = createClient()


  const channel = supabase
    .channel(`notifications:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        
        addBreadcrumb('New notification received', 'realtime', {
          notification_id: payload.new.id,
          type: payload.new.type,
        })

        onNotification(payload.new)
      }
    )
    .subscribe((status) => {
    })

  // Return unsubscribe function
  return () => {
    supabase.removeChannel(channel)
  }
}

/**
 * Subscribe to real-time releases
 * @param {string} userId - User ID (artist or label admin)
 * @param {Function} onRelease - Callback for release changes
 * @returns {Function} Unsubscribe function
 */
export function subscribeToReleases(userId, onRelease) {
  const supabase = createClient()


  const channel = supabase
    .channel(`releases:${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*', // All events (INSERT, UPDATE, DELETE)
        schema: 'public',
        table: 'releases',
        filter: `artist_id=eq.${userId}`,
      },
      (payload) => {
        
        addBreadcrumb('Release change', 'realtime', {
          event_type: payload.eventType,
          release_id: payload.new?.id || payload.old?.id,
        })

        onRelease({
          type: payload.eventType,
          data: payload.new || payload.old,
        })
      }
    )
    .subscribe((status) => {
    })

  return () => {
    supabase.removeChannel(channel)
  }
}

/**
 * Subscribe to real-time earnings
 * @param {string} userId - User ID
 * @param {Function} onEarning - Callback for new earnings
 * @returns {Function} Unsubscribe function
 */
export function subscribeToEarnings(userId, onEarning) {
  const supabase = createClient()


  const channel = supabase
    .channel(`earnings:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'earnings_log',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        
        addBreadcrumb('New earning', 'realtime', {
          amount: payload.new.amount,
          type: payload.new.type,
        })

        onEarning(payload.new)
      }
    )
    .subscribe((status) => {
    })

  return () => {
    supabase.removeChannel(channel)
  }
}

/**
 * Subscribe to real-time messages
 * @param {string} userId - User ID
 * @param {Function} onMessage - Callback for new messages
 * @returns {Function} Unsubscribe function
 */
export function subscribeToMessages(userId, onMessage) {
  const supabase = createClient()


  const channel = supabase
    .channel(`messages:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `recipient_id=eq.${userId}`,
      },
      (payload) => {
        
        addBreadcrumb('New message', 'realtime', {
          message_id: payload.new.id,
          sender_id: payload.new.sender_id,
        })

        onMessage(payload.new)
      }
    )
    .subscribe((status) => {
    })

  return () => {
    supabase.removeChannel(channel)
  }
}

/**
 * Subscribe to presence (online users)
 * @param {string} channelName - Channel name
 * @param {string} userId - User ID
 * @param {Object} userInfo - User info to broadcast
 * @param {Function} onPresenceChange - Callback for presence changes
 * @returns {Function} Unsubscribe function
 */
export function subscribeToPresence(channelName, userId, userInfo, onPresenceChange) {
  const supabase = createClient()


  const channel = supabase
    .channel(channelName)
    .on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState()
      onPresenceChange(state)
    })
    .on('presence', { event: 'join' }, ({ key, newPresences }) => {
      onPresenceChange(channel.presenceState())
    })
    .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
      onPresenceChange(channel.presenceState())
    })
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({
          user_id: userId,
          ...userInfo,
          online_at: new Date().toISOString(),
        })
      }
    })

  return () => {
    supabase.removeChannel(channel)
  }
}

/**
 * Broadcast message to channel
 * @param {string} channelName - Channel name
 * @param {string} eventName - Event name
 * @param {Object} payload - Message payload
 */
export async function broadcastMessage(channelName, eventName, payload) {
  const supabase = createClient()

  const channel = supabase.channel(channelName)
  
  await channel.subscribe()
  
  await channel.send({
    type: 'broadcast',
    event: eventName,
    payload,
  })

}

export default {
  subscribeToNotifications,
  subscribeToReleases,
  subscribeToEarnings,
  subscribeToMessages,
  subscribeToPresence,
  broadcastMessage,
}

