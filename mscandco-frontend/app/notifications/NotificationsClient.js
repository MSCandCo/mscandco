'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Bell,
  Music,
  DollarSign,
  MessageSquare,
  Users,
  CheckCircle2,
  Trash2,
  Filter,
  Search,
  X,
  Mail,
  MailOpen
} from 'lucide-react'

const NOTIFICATION_TYPES = {
  release: { icon: Music, color: 'purple', label: 'Release' },
  earnings: { icon: DollarSign, color: 'green', label: 'Earnings' },
  message: { icon: MessageSquare, color: 'blue', label: 'Message' },
  invitation: { icon: Users, color: 'orange', label: 'Invitation' },
  invitation_response: { icon: Users, color: 'teal', label: 'Invitation Response' },
  payment: { icon: DollarSign, color: 'emerald', label: 'Payment' },
  system: { icon: Bell, color: 'indigo', label: 'System' },
  default: { icon: Bell, color: 'gray', label: 'Notification' }
}

export default function NotificationsClient({ initialNotifications, user }) {
  const supabase = createClient()
  const [notifications, setNotifications] = useState(initialNotifications)
  const [filteredNotifications, setFilteredNotifications] = useState(initialNotifications)
  const [loading, setLoading] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [unreadCount, setUnreadCount] = useState(0)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [clearAllModalOpen, setClearAllModalOpen] = useState(false)
  const [notificationToDelete, setNotificationToDelete] = useState(null)

  // Calculate unread count
  useEffect(() => {
    const count = notifications.filter(n => !n.read).length
    setUnreadCount(count)
  }, [notifications])

  // Filter and search notifications
  useEffect(() => {
    let filtered = notifications

    // Apply type filter
    if (selectedFilter !== 'all') {
      if (selectedFilter === 'unread') {
        filtered = filtered.filter(n => !n.read)
      } else {
        filtered = filtered.filter(n => n.type === selectedFilter)
      }
    }

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(n =>
        n.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.message?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredNotifications(filtered)
  }, [notifications, selectedFilter, searchTerm])

  // Real-time subscription
  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel('notifications_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setNotifications(prev => [payload.new, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setNotifications(prev =>
              prev.map(n => n.id === payload.new.id ? payload.new : n)
            )
          } else if (payload.eventType === 'DELETE') {
            setNotifications(prev => prev.filter(n => n.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [user])

  const markAsRead = async (notificationId) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)
        .eq('user_id', user.id)

      if (error) throw error

      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      )
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      setLoading(true)
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false)

      if (error) throw error

      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    } catch (error) {
      console.error('Error marking all as read:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteNotification = async (notificationId) => {
    setDeleteModalOpen(true)
    setNotificationToDelete(notificationId)
  }

  const confirmDelete = async () => {
    if (!notificationToDelete) return

    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationToDelete)
        .eq('user_id', user.id)

      if (error) throw error

      setNotifications(prev => prev.filter(n => n.id !== notificationToDelete))
      setDeleteModalOpen(false)
      setNotificationToDelete(null)
    } catch (error) {
      console.error('Error deleting notification:', error)
      setDeleteModalOpen(false)
      setNotificationToDelete(null)
    }
  }

  const clearAllRead = async () => {
    setClearAllModalOpen(true)
  }

  const confirmClearAll = async () => {
    setClearAllModalOpen(false)

    try {
      setLoading(true)
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', user.id)
        .eq('read', true)

      if (error) throw error

      setNotifications(prev => prev.filter(n => !n.read))
    } catch (error) {
      console.error('Error clearing read notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatTimeAgo = (timestamp) => {
    const now = new Date()
    const date = new Date(timestamp)
    const seconds = Math.floor((now - date) / 1000)

    if (seconds < 60) return 'Just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
    return date.toLocaleDateString()
  }

  const getNotificationIcon = (type) => {
    const config = NOTIFICATION_TYPES[type] || NOTIFICATION_TYPES.default
    const Icon = config.icon
    return { Icon, color: config.color }
  }

  const filterOptions = [
    { value: 'all', label: 'All', count: notifications.length },
    { value: 'unread', label: 'Unread', count: unreadCount },
    { value: 'release', label: 'Releases', count: notifications.filter(n => n.type === 'release').length },
    { value: 'earnings', label: 'Earnings', count: notifications.filter(n => n.type === 'earnings').length },
    { value: 'message', label: 'Messages', count: notifications.filter(n => n.type === 'message').length },
    { value: 'invitation', label: 'Invitations', count: notifications.filter(n => n.type === 'invitation').length },
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Bell className="w-8 h-8 text-orange-600 mr-3" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
                <p className="text-gray-600 mt-1">
                  {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}
                </p>
              </div>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                disabled={loading}
                className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Mark All Read
              </button>
            )}
          </div>

          {/* Filter Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedFilter(option.value)}
                className={`flex items-center px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  selectedFilter === option.value
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {option.label}
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                  selectedFilter === option.value
                    ? 'bg-orange-500'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {option.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search notifications..."
              className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Actions */}
          {notifications.some(n => n.read) && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={clearAllRead}
                disabled={loading}
                className="text-sm text-red-600 hover:text-red-700 font-medium disabled:opacity-50"
              >
                Clear All Read Notifications
              </button>
            </div>
          )}
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="bg-white rounded-lg shadow border border-gray-200 p-12 text-center">
              <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No notifications</h3>
              <p className="text-gray-600">
                {searchTerm ? 'No notifications match your search' :
                 selectedFilter !== 'all' ? `No ${selectedFilter} notifications` :
                 'You\'re all caught up!'}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => {
              const { Icon, color } = getNotificationIcon(notification.type)
              const colorClasses = {
                purple: 'bg-purple-50 text-purple-600',
                blue: 'bg-blue-50 text-blue-600',
                green: 'bg-green-50 text-green-600',
                orange: 'bg-orange-50 text-orange-600',
                emerald: 'bg-emerald-50 text-emerald-600',
                gray: 'bg-gray-50 text-gray-600'
              }

              return (
                <div
                  key={notification.id}
                  className={`bg-white rounded-lg shadow border transition-all hover:shadow-md ${
                    notification.read
                      ? 'border-gray-200 opacity-75'
                      : 'border-orange-300 border-l-4'
                  }`}
                >
                  <div className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClasses[color]}`}>
                        <Icon className="w-6 h-6" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">
                              {notification.title}
                            </h3>
                            <p className="text-sm text-gray-600 mb-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatTimeAgo(notification.created_at)}
                            </p>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2">
                            {!notification.read && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                title="Mark as read"
                              >
                                <MailOpen className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => deleteNotification(notification.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Load More (if needed in future) */}
        {filteredNotifications.length >= 50 && (
          <div className="mt-6 text-center">
            <button className="px-6 py-3 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors">
              Load More Notifications
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Delete Notification
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this notification?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setDeleteModalOpen(false)
                  setNotificationToDelete(null)
                }}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear All Confirmation Modal */}
      {clearAllModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Clear All Read Notifications
            </h3>
            <p className="text-gray-600 mb-6">
              Delete all read notifications? This cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setClearAllModalOpen(false)}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmClearAll}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
