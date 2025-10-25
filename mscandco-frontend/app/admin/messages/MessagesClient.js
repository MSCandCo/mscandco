'use client'

import { useState, useEffect } from 'react'
import {
  Bell, Mail, AlertTriangle, CheckCircle, Clock,
  User, Shield, Building2, Music, MessageSquare, Trash2,
  MarkRead, Send, Plus, X
} from 'lucide-react'
import { PageLoading } from '@/components/ui/LoadingSpinner'

export default function MessagesClient({ user }) {
  const [loading, setLoading] = useState(true)
  const [messages, setMessages] = useState([])
  const [filter, setFilter] = useState('all') // all, unread, notifications, alerts
  const [selectedMessage, setSelectedMessage] = useState(null)
  const [newMessage, setNewMessage] = useState({
    recipient: '',
    subject: '',
    body: '',
    type: 'notification',
    priority: 'medium'
  })
  const [showCompose, setShowCompose] = useState(false)
  const [showArchived, setShowArchived] = useState(false)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (user) {
      loadMessages()
      setLoading(false)
    }
  }, [user])

  const loadMessages = () => {
    // Mock data for now - will be replaced with real API
    const mockMessages = [
      {
        id: 1,
        from: 'system@mscandco.com',
        fromName: 'MSC & Co System',
        subject: 'New Artist Registration Requires Approval',
        body: 'A new artist "John Doe" has registered and is awaiting approval.',
        type: 'notification',
        read: false,
        archived: false,
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        priority: 'medium'
      },
      {
        id: 2,
        from: 'security@mscandco.com',
        fromName: 'Security Alert',
        subject: 'Failed Login Attempts Detected',
        body: 'Multiple failed login attempts detected for user info@htay.co.uk. Please review security logs.',
        type: 'alert',
        read: false,
        archived: false,
        created_at: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        priority: 'high'
      },
      {
        id: 3,
        from: 'releases@mscandco.com',
        fromName: 'Release System',
        subject: 'Release "My New Song" Submitted for Review',
        body: 'Artist Sarah Smith has submitted "My New Song" for distribution approval.',
        type: 'notification',
        read: true,
        archived: false,
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        priority: 'medium'
      },
      {
        id: 4,
        from: 'payments@mscandco.com',
        fromName: 'Payment System',
        subject: 'Monthly Revenue Report Available',
        body: 'The monthly revenue report for October 2024 is now available for review.',
        type: 'notification',
        read: true,
        archived: false,
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        priority: 'low'
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

  const handleSendMessage = () => {
    if (!newMessage.recipient || !newMessage.subject || !newMessage.body) {
      alert('Please fill in all required fields')
      return
    }

    setSending(true)

    // Simulate sending delay
    setTimeout(() => {
      const message = {
        id: messages.length + 1,
        from: user?.email || 'admin@mscandco.com',
        fromName: 'Admin',
        subject: newMessage.subject,
        body: newMessage.body,
        type: newMessage.type,
        read: false,
        archived: false,
        created_at: new Date(),
        priority: newMessage.priority
      }

      setMessages([message, ...messages])
      setNewMessage({
        recipient: '',
        subject: '',
        body: '',
        type: 'notification',
        priority: 'medium'
      })
      setShowCompose(false)
      setSending(false)

      // Show success notification
      showNotification('Message sent successfully!', 'success')
    }, 500)
  }

  const showNotification = (message, type = 'success') => {
    const bgColor = type === 'success' ? '#f0fdf4' : '#fef2f2'
    const borderColor = type === 'success' ? '#065f46' : '#991b1b'
    const textColor = type === 'success' ? '#065f46' : '#991b1b'

    const notificationDiv = document.createElement('div')
    notificationDiv.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${bgColor};
        border-left: 4px solid ${borderColor};
        padding: 16px 24px;
        color: ${textColor};
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        z-index: 1000;
      ">
        ${message}
      </div>
    `
    document.body.appendChild(notificationDiv)
    setTimeout(() => document.body.removeChild(notificationDiv), 3000)
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
          <PageLoading message="Loading..." />
          <p className="mt-4 text-gray-600">Loading messages...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center mb-2">
              <MessageSquare className="w-8 h-8 mr-3" />
              <h1 className="text-3xl font-bold">{showArchived ? 'Archived Messages' : 'Admin Messages'}</h1>
            </div>
            <p className="text-blue-100">
              {showArchived ? 'View and manage archived messages' : 'System notifications, alerts, and communications'}
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
            <button
              onClick={() => setShowCompose(true)}
              className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors font-medium flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Compose
            </button>
          </div>
        </div>
      </div>

      {/* Compose Modal */}
      {showCompose && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-xl">
              <div className="flex items-center">
                <Send className="w-6 h-6 text-blue-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">Compose Message</h2>
              </div>
              <button
                onClick={() => {
                  setShowCompose(false)
                  setNewMessage({
                    recipient: '',
                    subject: '',
                    body: '',
                    type: 'notification',
                    priority: 'medium'
                  })
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Recipient */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recipient Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={newMessage.recipient}
                  onChange={(e) => setNewMessage({ ...newMessage, recipient: e.target.value })}
                  placeholder="user@example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Type and Priority Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newMessage.type}
                    onChange={(e) => setNewMessage({ ...newMessage, type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="notification">Notification</option>
                    <option value="alert">Alert</option>
                    <option value="message">Message</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newMessage.priority}
                    onChange={(e) => setNewMessage({ ...newMessage, priority: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newMessage.subject}
                  onChange={(e) => setNewMessage({ ...newMessage, subject: e.target.value })}
                  placeholder="Enter message subject"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Message Body */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={newMessage.body}
                  onChange={(e) => setNewMessage({ ...newMessage, body: e.target.value })}
                  placeholder="Type your message here..."
                  rows={8}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-4">
                <button
                  onClick={() => {
                    setShowCompose(false)
                    setNewMessage({
                      recipient: '',
                      subject: '',
                      body: '',
                      type: 'notification',
                      priority: 'medium'
                    })
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendMessage}
                  disabled={sending}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sending ? (
                    <>
                      <PageLoading message="Loading..." />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Message
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Message List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Messages</h3>
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
                        ? 'bg-blue-600 text-white'
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
                      selectedMessage?.id === message.id ? 'bg-blue-50' : ''
                    } ${!message.read ? 'bg-blue-25' : ''}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center mb-1">
                          {getTypeIcon(message.type)}
                          <span className="ml-2 text-sm font-medium text-gray-900 truncate">
                            {message.fromName}
                          </span>
                          {!message.read && (
                            <div className="ml-2 w-2 h-2 bg-blue-600 rounded-full"></div>
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

                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>From: {selectedMessage.fromName}</span>
                    <span>{formatTime(selectedMessage.created_at)}</span>
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
                      <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
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
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
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


