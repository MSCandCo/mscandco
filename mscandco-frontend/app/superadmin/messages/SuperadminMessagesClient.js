'use client'

import { useState, useEffect } from 'react'
import {
  Bell, Mail, AlertTriangle, CheckCircle, Clock,
  User, Shield, Building2, Music, MessageSquare, Trash2,
  MarkRead, ArrowRight
} from 'lucide-react'

export default function SuperadminMessagesClient({ user }) {
  const [loading, setLoading] = useState(true)
  const [messages, setMessages] = useState([])
  const [filter, setFilter] = useState('all') // all, unread, notifications, alerts
  const [selectedMessage, setSelectedMessage] = useState(null)
  const [showArchived, setShowArchived] = useState(false)

  useEffect(() => {
    if (user) {
      loadMessages()
      setLoading(false)
    }
  }, [user])

  const loadMessages = () => {
    // Mock data showing messages between users across the platform
    // This is an audit trail - superadmin can see ALL platform messages
    const mockMessages = [
      {
        id: 1,
        from: 'john@mscandco.com',
        fromName: 'John Doe (Admin)',
        to: 'artist1@example.com',
        toName: 'Sarah Smith (Artist)',
        subject: 'Release Approval Required',
        body: 'Hi Sarah, I\'ve reviewed your latest release "Summer Dreams" and it looks great! Just need you to update the cover art resolution to 3000x3000px and we can approve it for distribution.',
        type: 'message',
        read: false,
        archived: false,
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        priority: 'medium'
      },
      {
        id: 2,
        from: 'labeladmin@records.com',
        fromName: 'Mike Johnson (Label Admin)',
        to: 'artist2@example.com',
        toName: 'The Soundwaves (Artist)',
        subject: 'Royalty Payment Update',
        body: 'Your Q3 royalty payment of £5,240 has been processed and will arrive in your account within 3-5 business days. Breakdown attached.',
        type: 'notification',
        read: false,
        archived: false,
        created_at: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        priority: 'medium'
      },
      {
        id: 3,
        from: 'artist3@example.com',
        fromName: 'Emma Wilson (Artist)',
        to: 'admin@mscandco.com',
        toName: 'Platform Admin',
        subject: 'Distribution Issue - Urgent',
        body: 'My release was supposed to go live yesterday but it\'s still showing as pending. The release date is critical for my marketing campaign. Can you please help?',
        type: 'alert',
        read: false,
        archived: false,
        created_at: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        priority: 'high'
      },
      {
        id: 4,
        from: 'admin@mscandco.com',
        fromName: 'Platform Admin',
        to: 'labeladmin@records.com',
        toName: 'Mike Johnson (Label Admin)',
        subject: 'New Artist Onboarding',
        body: 'We have 3 new artists waiting for approval under your label. Please review their profiles and approve/reject within 48 hours.',
        type: 'notification',
        read: true,
        archived: false,
        created_at: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
        priority: 'medium'
      },
      {
        id: 5,
        from: 'artist1@example.com',
        fromName: 'Sarah Smith (Artist)',
        to: 'john@mscandco.com',
        toName: 'John Doe (Admin)',
        subject: 'Re: Release Approval Required',
        body: 'Thanks John! I\'ve updated the cover art. Here\'s the new 3000x3000px version. Please let me know if anything else needs to be changed.',
        type: 'message',
        read: true,
        archived: false,
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        priority: 'low'
      },
      {
        id: 6,
        from: 'labeladmin2@indiemusic.com',
        fromName: 'Rachel Green (Label Admin)',
        to: 'artist4@example.com',
        toName: 'DJ Phoenix (Artist)',
        subject: 'Contract Renewal Discussion',
        body: 'Hi! Your current contract is expiring next month. I\'d love to discuss renewal terms. Can we schedule a call this week?',
        type: 'message',
        read: true,
        archived: false,
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        priority: 'medium'
      }
    ]
    setMessages(mockMessages)
  }

  const filteredMessages = messages.filter(message => {
    // Filter by archived status
    if (message.archived !== showArchived) return false

    // Then apply type/status filters
    if (filter === 'all') return true
    if (filter === 'unread') return !message.read
    return message.type === filter
  })

  const markAsRead = (messageId) => {
    setMessages(messages.map(msg =>
      msg.id === messageId ? { ...msg, read: true } : msg
    ))
  }

  const deleteMessage = (messageId) => {
    setMessages(messages.filter(msg => msg.id !== messageId))
    setSelectedMessage(null)
  }

  const archiveMessage = (messageId) => {
    setMessages(messages.map(msg =>
      msg.id === messageId ? { ...msg, archived: true } : msg
    ))
    setSelectedMessage(null)
  }

  const unarchiveMessage = (messageId) => {
    setMessages(messages.map(msg =>
      msg.id === messageId ? { ...msg, archived: false } : msg
    ))
    setSelectedMessage(null)
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200'
      case 'medium': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'low': return 'text-green-600 bg-green-50 border-green-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'alert': return <AlertTriangle className="w-4 h-4" />
      case 'notification': return <Bell className="w-4 h-4" />
      default: return <Mail className="w-4 h-4" />
    }
  }

  const formatTime = (date) => {
    const now = new Date()
    const diff = now - date
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`
    return 'Just now'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading platform messages...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-pink-600 rounded-xl p-6 text-white mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center mb-2">
              <Shield className="w-8 h-8 mr-3" />
              <h1 className="text-3xl font-bold">{showArchived ? 'Archived Platform Messages' : 'Platform Message Audit Trail'}</h1>
            </div>
            <p className="text-red-100">
              {showArchived ? 'View archived platform communications' : 'Monitor all platform communications between users (Admin ↔ Artist ↔ Label Admin)'}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowArchived(!showArchived)}
              className="bg-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors font-medium flex items-center border border-white/30"
            >
              <Mail className="w-4 h-4 mr-2" />
              {showArchived ? 'View Inbox' : 'View Archived'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Message List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Platform Messages</h3>
                <span className="text-sm text-gray-500">
                  {filteredMessages.filter(m => !m.read).length} unread
                </span>
              </div>

              {/* Filter buttons */}
              <div className="flex flex-wrap gap-2">
                {['all', 'unread', 'notifications', 'alert'].map((filterType) => (
                  <button
                    key={filterType}
                    onClick={() => setFilter(filterType)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      filter === filterType
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {filterType === 'alert' ? 'alerts' : filterType}
                  </button>
                ))}
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {filteredMessages.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Mail className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No messages found</p>
                </div>
              ) : (
                filteredMessages.map((message) => (
                  <div
                    key={message.id}
                    onClick={() => {
                      setSelectedMessage(message)
                      if (!message.read) markAsRead(message.id)
                    }}
                    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedMessage?.id === message.id ? 'bg-red-50' : ''
                    } ${!message.read ? 'bg-red-25' : ''}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center mb-1 flex-wrap">
                          {getTypeIcon(message.type)}
                          <span className="ml-2 text-xs font-medium text-gray-700">
                            {message.fromName}
                          </span>
                          <ArrowRight size={12} className="mx-1 text-gray-400" />
                          <span className="text-xs font-medium text-gray-700">
                            {message.toName}
                          </span>
                          {!message.read && (
                            <div className="ml-2 w-2 h-2 bg-red-600 rounded-full"></div>
                          )}
                        </div>
                        <p className="text-sm font-medium text-gray-800 mb-1 truncate">
                          {message.subject}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatTime(message.created_at)}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full border ${getPriorityColor(message.priority)}`}>
                        {message.priority}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Message Detail */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            {selectedMessage ? (
              <div>
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      {getTypeIcon(selectedMessage.type)}
                      <h3 className="ml-2 text-xl font-semibold text-gray-900">
                        {selectedMessage.subject}
                      </h3>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 text-sm rounded-full border ${getPriorityColor(selectedMessage.priority)}`}>
                        {selectedMessage.priority} priority
                      </span>
                      <button
                        onClick={() => deleteMessage(selectedMessage.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Prominent FROM → TO display */}
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <span className="text-gray-500 mr-2">From:</span>
                        <span className="font-medium text-gray-900">{selectedMessage.fromName}</span>
                        <span className="text-gray-400 mx-2">({selectedMessage.from})</span>
                      </div>
                      <ArrowRight size={16} className="text-gray-400" />
                      <div className="flex items-center">
                        <span className="text-gray-500 mr-2">To:</span>
                        <span className="font-medium text-gray-900">{selectedMessage.toName}</span>
                        <span className="text-gray-400 mx-2">({selectedMessage.to})</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span className="flex items-center">
                      <Clock size={14} className="mr-1" />
                      {formatTime(selectedMessage.created_at)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(selectedMessage.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="prose max-w-none">
                    <p className="text-gray-700 whitespace-pre-line">
                      {selectedMessage.body}
                    </p>
                  </div>

                  {/* Action buttons based on message type */}
                  <div className="mt-6 flex flex-wrap gap-3">
                    {selectedMessage.type === 'notification' && (
                      <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
                        View Details
                      </button>
                    )}
                    {selectedMessage.type === 'alert' && (
                      <>
                        <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
                          Investigate
                        </button>
                        <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors">
                          Mark as Resolved
                        </button>
                      </>
                    )}
                    {showArchived ? (
                      <button
                        onClick={() => unarchiveMessage(selectedMessage.id)}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Unarchive
                      </button>
                    ) : (
                      <button
                        onClick={() => archiveMessage(selectedMessage.id)}
                        className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        Archive
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-gray-500">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">Select a message</h3>
                <p>Choose a message from the list to read its contents</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
