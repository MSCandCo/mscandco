'use client'

import { useState, useEffect } from 'react'
import { Mail, Send, CheckCircle, XCircle, Clock, TrendingUp, RefreshCw, Eye, Edit, Plus } from 'lucide-react'

export default function EmailClient() {
  const [emails, setEmails] = useState([])
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalSent: 0,
    delivered: 0,
    bounced: 0,
    opened: 0,
    clicked: 0,
    deliveryRate: 0,
    openRate: 0
  })
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedEmail, setSelectedEmail] = useState(null)

  useEffect(() => {
    fetchEmails()
    fetchTemplates()
    fetchStats()
  }, [statusFilter])

  const fetchEmails = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.append('status', statusFilter)
      
      const response = await fetch(`/api/admin/systems/email?${params}`)
      if (response.ok) {
        const data = await response.json()
        setEmails(data.emails || [])
      }
    } catch (error) {
      console.error('Failed to fetch emails:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/admin/systems/email/templates')
      if (response.ok) {
        const data = await response.json()
        setTemplates(data.templates || [])
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/systems/email/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'bounced':
        return <XCircle className="w-5 h-5 text-red-600" />
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />
      default:
        return <Mail className="w-5 h-5 text-gray-600" />
    }
  }

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'bounced':
        return 'bg-red-100 text-red-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Email System Management</h1>
            <p className="text-gray-600 mt-1">Manage email templates and delivery monitoring</p>
          </div>
          <button
            onClick={() => {
              fetchEmails()
              fetchTemplates()
              fetchStats()
            }}
            className="flex items-center gap-2 px-4 py-2 bg-[#2D2D2D] text-white rounded-lg hover:bg-[#1a1a1a] transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <Send className="w-8 h-8 text-blue-500" />
            </div>
            <p className="text-sm text-gray-600">Total Sent</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalSent.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <p className="text-sm text-gray-600">Delivered</p>
            <p className="text-2xl font-bold text-green-600">{stats.delivered.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
            <p className="text-sm text-gray-600">Bounced</p>
            <p className="text-2xl font-bold text-red-600">{stats.bounced.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <Eye className="w-8 h-8 text-purple-500" />
            </div>
            <p className="text-sm text-gray-600">Opened</p>
            <p className="text-2xl font-bold text-purple-600">{stats.opened.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-cyan-500" />
            </div>
            <p className="text-sm text-gray-600">Clicked</p>
            <p className="text-2xl font-bold text-cyan-600">{stats.clicked.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <p className="text-sm text-gray-600">Delivery Rate</p>
            <p className="text-2xl font-bold text-gray-900">{stats.deliveryRate}%</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <Eye className="w-8 h-8 text-purple-500" />
            </div>
            <p className="text-sm text-gray-600">Open Rate</p>
            <p className="text-2xl font-bold text-gray-900">{stats.openRate}%</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Email Log */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Email Delivery Log</h2>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#2D2D2D] focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="delivered">Delivered</option>
                <option value="bounced">Bounced</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-6 h-6 text-gray-400 animate-spin" />
              </div>
            ) : emails.length === 0 ? (
              <div className="text-center py-12">
                <Mail className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No emails found</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
                {emails.map((email) => (
                  <div key={email.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        {getStatusIcon(email.status)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-medium text-gray-900 truncate">{email.subject}</p>
                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusBadgeClass(email.status)}`}>
                              {email.status}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 mb-1">To: {email.recipient}</p>
                          <p className="text-xs text-gray-500">{new Date(email.sent_at).toLocaleString()}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedEmail(email)}
                        className="text-[#2D2D2D] hover:text-[#1a1a1a] text-sm font-medium ml-4"
                      >
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Email Templates */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Email Templates</h2>
              <button className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors">
                <Plus className="w-5 h-5" />
              </button>
            </div>
            {templates.length === 0 ? (
              <div className="text-center py-12">
                <Mail className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No templates found</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {templates.map((template) => (
                  <div key={template.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 mb-1">{template.name}</p>
                        <p className="text-xs text-gray-600 mb-2">{template.description}</p>
                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                          {template.category}
                        </span>
                      </div>
                      <button className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors ml-2">
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Email Detail Modal */}
      {selectedEmail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Email Details</h3>
                <button
                  onClick={() => setSelectedEmail(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Status</label>
                <div className="mt-1 flex items-center gap-2">
                  {getStatusIcon(selectedEmail.status)}
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(selectedEmail.status)}`}>
                    {selectedEmail.status}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Subject</label>
                <p className="mt-1 text-gray-900">{selectedEmail.subject}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Recipient</label>
                <p className="mt-1 text-gray-900">{selectedEmail.recipient}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Sent At</label>
                <p className="mt-1 text-gray-900">{new Date(selectedEmail.sent_at).toLocaleString()}</p>
              </div>
              {selectedEmail.body && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Body</label>
                  <div className="mt-1 p-4 bg-gray-50 rounded-lg text-sm text-gray-900">
                    {selectedEmail.body}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

