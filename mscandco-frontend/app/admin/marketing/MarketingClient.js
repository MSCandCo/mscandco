'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Mail, Plus, Send, Edit2, Trash2, Eye, Filter, Users, TrendingUp,
  Clock, CheckCircle, XCircle, AlertCircle, BarChart3, FileText,
  Calendar, Target, Zap, Settings, Copy, RefreshCw, Search,
  ChevronDown, ChevronUp, X, Save, Play, Pause, ExternalLink,
  Download, Upload, Image as ImageIcon, Link as LinkIcon, Type,
  Layout, Palette, Code, EyeOff, Globe, UserCheck, MapPin,
  Building2, Music, Tag, DollarSign, Calendar as CalendarIcon
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

// Status badge component
function StatusBadge({ status }) {
  const configs = {
    draft: { bg: 'bg-gray-100', text: 'text-gray-800', icon: FileText, label: 'Draft' },
    scheduled: { bg: 'bg-blue-100', text: 'text-blue-800', icon: Calendar, label: 'Scheduled' },
    sending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Send, label: 'Sending' },
    sent: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle, label: 'Sent' },
    cancelled: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle, label: 'Cancelled' }
  }

  const config = configs[status] || configs.draft
  const Icon = config.icon

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </span>
  )
}

// Metric card component
function MetricCard({ icon: Icon, label, value, change, trend }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-gray-50 rounded-lg">
          <Icon className="w-5 h-5 text-gray-600" />
        </div>
        {trend && (
          <span className={`text-sm font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {trend === 'up' ? '↑' : '↓'} {change}
          </span>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500 mt-1">{label}</p>
      </div>
    </div>
  )
}

export default function MarketingClient() {
  // Core state
  const [campaigns, setCampaigns] = useState([])
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // View state
  const [activeTab, setActiveTab] = useState('campaigns') // campaigns, templates, analytics
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Campaign modal state
  const [showCampaignModal, setShowCampaignModal] = useState(false)
  const [editingCampaign, setEditingCampaign] = useState(null)
  const [previewRecipients, setPreviewRecipients] = useState(null)
  const [recipientCount, setRecipientCount] = useState(0)

  // Campaign form state
  const [campaignForm, setCampaignForm] = useState({
    name: '',
    description: '',
    subject: '',
    body_html: '',
    body_text: '',
    template_id: null,
    filters: {
      roles: [],
      cities: [],
      countries: [],
      subscriptionTiers: [],
      genres: [],
      labels: [],
      lastLoginDays: null,
      createdAfter: null,
      createdBefore: null
    },
    scheduled_for: null
  })

  // Stats
  const [stats, setStats] = useState({
    totalCampaigns: 0,
    totalSent: 0,
    totalRecipients: 0,
    avgOpenRate: 0,
    avgClickRate: 0
  })

  // Load data
  useEffect(() => {
    loadCampaigns()
    loadTemplates()
    loadStats()
  }, [statusFilter])

  const loadCampaigns = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.append('status', statusFilter)

      const response = await fetch(`/api/admin/marketing/campaigns?${params}`)
      if (response.ok) {
        const data = await response.json()
        setCampaigns(data.campaigns || [])
      }
    } catch (err) {
      console.error('Failed to load campaigns:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const loadTemplates = async () => {
    try {
      const response = await fetch('/api/admin/marketing/templates?activeOnly=true')
      if (response.ok) {
        const data = await response.json()
        setTemplates(data.templates || [])
      }
    } catch (err) {
      console.error('Failed to load templates:', err)
    }
  }

  const loadStats = async () => {
    try {
      // Calculate stats from campaigns
      const totalCampaigns = campaigns.length
      const sentCampaigns = campaigns.filter(c => c.status === 'sent')
      const totalSent = sentCampaigns.length
      const totalRecipients = sentCampaigns.reduce((sum, c) => sum + (c.total_recipients || 0), 0)
      const totalOpened = sentCampaigns.reduce((sum, c) => sum + (c.emails_opened || 0), 0)
      const totalClicked = sentCampaigns.reduce((sum, c) => sum + (c.emails_clicked || 0), 0)

      setStats({
        totalCampaigns,
        totalSent,
        totalRecipients,
        avgOpenRate: totalRecipients > 0 ? ((totalOpened / totalRecipients) * 100).toFixed(1) : 0,
        avgClickRate: totalRecipients > 0 ? ((totalClicked / totalRecipients) * 100).toFixed(1) : 0
      })
    } catch (err) {
      console.error('Failed to load stats:', err)
    }
  }

  const handleCreateCampaign = () => {
    setEditingCampaign(null)
    setCampaignForm({
      name: '',
      description: '',
      subject: '',
      body_html: '',
      body_text: '',
      template_id: null,
      filters: {
        roles: [],
        cities: [],
        countries: [],
        subscriptionTiers: [],
        genres: [],
        labels: [],
        lastLoginDays: null,
        createdAfter: null,
        createdBefore: null
      },
      scheduled_for: null
    })
    setPreviewRecipients(null)
    setRecipientCount(0)
    setShowCampaignModal(true)
  }

  const handleEditCampaign = (campaign) => {
    setEditingCampaign(campaign)
    setCampaignForm({
      name: campaign.name,
      description: campaign.description || '',
      subject: campaign.subject,
      body_html: campaign.body_html,
      body_text: campaign.body_text || '',
      template_id: campaign.template_id,
      filters: campaign.filters || {},
      scheduled_for: campaign.scheduled_for
    })
    setPreviewRecipients(null)
    setRecipientCount(campaign.total_recipients || 0)
    setShowCampaignModal(true)
  }

  const handleSaveCampaign = async () => {
    try {
      setLoading(true)
      setError(null)

      const url = editingCampaign
        ? `/api/admin/marketing/campaigns/${editingCampaign.id}`
        : '/api/admin/marketing/campaigns'

      const method = editingCampaign ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campaignForm)
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save campaign')
      }

      await loadCampaigns()
      setShowCampaignModal(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSendCampaign = async (campaignId) => {
    if (!confirm('Are you sure you want to send this campaign? This action cannot be undone.')) {
      return
    }

    try {
      setLoading(true)
      const response = await fetch(`/api/admin/marketing/campaigns/${campaignId}/send`, {
        method: 'POST'
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to send campaign')
      }

      await loadCampaigns()
      alert('Campaign sent successfully!')
    } catch (err) {
      alert(`Error sending campaign: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handlePreviewRecipients = async (filters) => {
    try {
      const filtersToUse = filters || campaignForm.filters
      
      if (editingCampaign) {
        const response = await fetch(`/api/admin/marketing/campaigns/${editingCampaign.id}/preview-recipients?limit=100`)
        if (response.ok) {
          const data = await response.json()
          setPreviewRecipients(data.recipients || [])
          setRecipientCount(data.totalCount || 0)
        }
      } else {
        // For new campaigns, use the filters directly
        const response = await fetch('/api/admin/marketing/campaigns/preview-filters', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filters: filtersToUse,
            limit: 100
          })
        })
        if (response.ok) {
          const data = await response.json()
          setPreviewRecipients(data.recipients || [])
          setRecipientCount(data.totalCount || 0)
        }
      }
    } catch (err) {
      console.error('Failed to preview recipients:', err)
      alert('Failed to preview recipients')
    }
  }

  // Filter campaigns by search
  const filteredCampaigns = campaigns.filter(campaign => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      campaign.name?.toLowerCase().includes(query) ||
      campaign.subject?.toLowerCase().includes(query) ||
      campaign.description?.toLowerCase().includes(query)
    )
  })

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Marketing Campaigns</h1>
            <p className="text-gray-600 mt-1">Create and manage email campaigns with intelligent targeting</p>
          </div>
          <button
            onClick={handleCreateCampaign}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Plus className="w-5 h-5" />
            New Campaign
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <MetricCard
            icon={Mail}
            label="Total Campaigns"
            value={stats.totalCampaigns}
          />
          <MetricCard
            icon={Send}
            label="Campaigns Sent"
            value={stats.totalSent}
          />
          <MetricCard
            icon={Users}
            label="Total Recipients"
            value={stats.totalRecipients.toLocaleString()}
          />
          <MetricCard
            icon={TrendingUp}
            label="Avg Open Rate"
            value={`${stats.avgOpenRate}%`}
          />
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-4 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('campaigns')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'campaigns'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Campaigns
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'templates'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Templates
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'analytics'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Analytics
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'campaigns' && (
        <div>
          {/* Filters and Search */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6 flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search campaigns..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="sending">Sending</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Campaigns List */}
          {loading ? (
            <div className="text-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Loading campaigns...</p>
            </div>
          ) : filteredCampaigns.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns found</h3>
              <p className="text-gray-500 mb-6">Get started by creating your first email campaign</p>
              <button
                onClick={handleCreateCampaign}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
              >
                <Plus className="w-5 h-5" />
                Create Campaign
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Campaign
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Recipients
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Performance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCampaigns.map((campaign) => (
                    <tr key={campaign.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                          <div className="text-sm text-gray-500">{campaign.subject}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={campaign.status} />
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {campaign.total_recipients?.toLocaleString() || 0}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="text-gray-900">
                            {campaign.total_recipients > 0
                              ? `${((campaign.emails_opened / campaign.total_recipients) * 100).toFixed(1)}% opens`
                              : 'N/A'}
                          </div>
                          <div className="text-gray-500">
                            {campaign.total_recipients > 0
                              ? `${((campaign.emails_clicked / campaign.total_recipients) * 100).toFixed(1)}% clicks`
                              : ''}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(campaign.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          {campaign.status === 'draft' && (
                            <>
                              <button
                                onClick={() => handleEditCampaign(campaign)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleSendCampaign(campaign.id)}
                                className="text-green-600 hover:text-green-900"
                              >
                                <Send className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleEditCampaign(campaign)}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Campaign Modal - This will be expanded in next part */}
      {showCampaignModal && (
        <CampaignModal
          campaign={editingCampaign}
          form={campaignForm}
          setForm={setCampaignForm}
          templates={templates}
          onSave={handleSaveCampaign}
          onClose={() => setShowCampaignModal(false)}
          onPreviewRecipients={handlePreviewRecipients}
          recipientCount={recipientCount}
          previewRecipients={previewRecipients}
          loading={loading}
        />
      )}
    </div>
  )
}

// Campaign Modal Component - Full Featured
function CampaignModal({ campaign, form, setForm, templates, onSave, onClose, onPreviewRecipients, recipientCount, previewRecipients, loading }) {
  const [activeStep, setActiveStep] = useState('details') // details, content, filters, preview
  const [availableRoles, setAvailableRoles] = useState([])
  const [availableCities, setAvailableCities] = useState([])
  const [availableCountries, setAvailableCountries] = useState([])

  useEffect(() => {
    loadFilterOptions()
  }, [])

  const loadFilterOptions = async () => {
    try {
      // Load roles
      const rolesResponse = await fetch('/api/admin/roles/list')
      if (rolesResponse.ok) {
        const rolesData = await rolesResponse.json()
        setAvailableRoles(rolesData.roles || [])
      }

      // Load cities and countries from users (would need an API endpoint)
      // For now, we'll use placeholder arrays
    } catch (err) {
      console.error('Failed to load filter options:', err)
    }
  }

  const updateFilters = (key, value) => {
    setForm(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        [key]: value
      }
    }))
  }

  const handleTemplateSelect = (templateId) => {
    const template = templates.find(t => t.id === templateId)
    if (template) {
      setForm(prev => ({
        ...prev,
        template_id: templateId,
        subject: template.subject_template,
        body_html: template.body_html_template,
        body_text: template.body_text_template || ''
      }))
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-7xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {campaign ? 'Edit Campaign' : 'Create Campaign'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {campaign ? `Last updated: ${new Date(campaign.updated_at).toLocaleString()}` : 'Create a new email campaign'}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Steps Navigation */}
        <div className="border-b border-gray-200 flex items-center gap-1 px-6 flex-shrink-0">
          {[
            { id: 'details', label: 'Details', icon: FileText },
            { id: 'content', label: 'Content', icon: Mail },
            { id: 'filters', label: 'Audience', icon: Target },
            { id: 'preview', label: 'Preview', icon: Eye }
          ].map((step) => {
            const Icon = step.icon
            const isActive = activeStep === step.id
            return (
              <button
                key={step.id}
                onClick={() => setActiveStep(step.id)}
                className={`flex items-center gap-2 px-4 py-3 font-medium border-b-2 transition-colors ${
                  isActive
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {step.label}
              </button>
            )
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeStep === 'details' && (
            <CampaignDetailsStep
              form={form}
              setForm={setForm}
              templates={templates}
              onTemplateSelect={handleTemplateSelect}
            />
          )}

          {activeStep === 'content' && (
            <CampaignContentStep
              form={form}
              setForm={setForm}
            />
          )}

          {activeStep === 'filters' && (
            <CampaignFiltersStep
              form={form}
              updateFilters={updateFilters}
              availableRoles={availableRoles}
              recipientCount={recipientCount}
              onPreviewRecipients={onPreviewRecipients}
              previewRecipients={previewRecipients}
            />
          )}

          {activeStep === 'preview' && (
            <CampaignPreviewStep
              form={form}
              recipientCount={recipientCount}
            />
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex items-center justify-between flex-shrink-0 bg-gray-50">
          <div className="text-sm text-gray-600">
            {recipientCount > 0 && (
              <span className="font-medium text-gray-900">{recipientCount.toLocaleString()}</span>
            )}{' '}
            {recipientCount === 1 ? 'recipient' : 'recipients'} will receive this campaign
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (activeStep === 'preview') {
                  onSave()
                } else {
                  const steps = ['details', 'content', 'filters', 'preview']
                  const currentIndex = steps.indexOf(activeStep)
                  if (currentIndex < steps.length - 1) {
                    setActiveStep(steps[currentIndex + 1])
                  }
                }
              }}
              disabled={loading}
              className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : activeStep === 'preview' ? 'Save Campaign' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Campaign Details Step
function CampaignDetailsStep({ form, setForm, templates, onTemplateSelect }) {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaign Information</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Campaign Name <span className="text-red-500">*</span>
            </label>
            <Input
              value={form.name}
              onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Welcome Email for New Artists"
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of this campaign..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Subject <span className="text-red-500">*</span>
            </label>
            <Input
              value={form.subject}
              onChange={(e) => setForm(prev => ({ ...prev, subject: e.target.value }))}
              placeholder="e.g., Welcome to MSC & Co!"
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              Use merge tags like {'{{user_name}}'} for personalization
            </p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Email Template (Optional)</h3>
        <Select
          value={form.template_id || ''}
          onValueChange={onTemplateSelect}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a template (optional)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">No template (Start from scratch)</SelectItem>
            {templates.map((template) => (
              <SelectItem key={template.id} value={template.id}>
                {template.name} {template.category && `(${template.category})`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {form.template_id && (
          <p className="text-sm text-gray-500 mt-2">
            Template selected. Edit the content in the Content tab.
          </p>
        )}
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Scheduling</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Schedule Send (Optional)
          </label>
          <Input
            type="datetime-local"
            value={form.scheduled_for ? new Date(form.scheduled_for).toISOString().slice(0, 16) : ''}
            onChange={(e) => setForm(prev => ({ 
              ...prev, 
              scheduled_for: e.target.value ? new Date(e.target.value).toISOString() : null 
            }))}
            className="w-full max-w-md"
          />
          <p className="text-xs text-gray-500 mt-1">
            Leave empty to send immediately. Campaign will be saved as draft if scheduled.
          </p>
        </div>
      </div>
    </div>
  )
}

// Campaign Content Step
function CampaignContentStep({ form, setForm }) {
  const mergeTags = [
    { tag: '{{user_name}}', label: 'User Name' },
    { tag: '{{user_email}}', label: 'User Email' },
    { tag: '{{platform_name}}', label: 'Platform Name' },
    { tag: '{{dashboard_url}}', label: 'Dashboard URL' },
    { tag: '{{login_url}}', label: 'Login URL' },
    { tag: '{{unsubscribe_url}}', label: 'Unsubscribe URL' }
  ]

  const insertMergeTag = (tag) => {
    const textarea = document.getElementById('body_html_textarea')
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const text = form.body_html
      const newText = text.substring(0, start) + tag + text.substring(end)
      setForm(prev => ({ ...prev, body_html: newText }))
      
      // Set cursor position after inserted tag
      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(start + tag.length, start + tag.length)
      }, 0)
    }
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Email Content</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Insert:</span>
          <div className="flex flex-wrap gap-2">
            {mergeTags.map(({ tag, label }) => (
              <button
                key={tag}
                onClick={() => insertMergeTag(tag)}
                className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                title={label}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          HTML Content <span className="text-red-500">*</span>
        </label>
        <textarea
          id="body_html_textarea"
          value={form.body_html}
          onChange={(e) => setForm(prev => ({ ...prev, body_html: e.target.value }))}
          placeholder="<html>...</html> or plain HTML content"
          rows={20}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 font-mono text-sm"
        />
        <p className="text-xs text-gray-500 mt-1">
          Enter HTML content for your email. Use merge tags for personalization.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Plain Text Version (Optional)
        </label>
        <textarea
          value={form.body_text}
          onChange={(e) => setForm(prev => ({ ...prev, body_text: e.target.value }))}
          placeholder="Plain text version for email clients that don't support HTML"
          rows={10}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
        />
        <p className="text-xs text-gray-500 mt-1">
          Plain text fallback. If empty, HTML will be used.
        </p>
      </div>

      {/* Preview Section */}
      <div className="border-t border-gray-200 pt-6">
        <h4 className="text-md font-semibold text-gray-900 mb-4">Quick Preview</h4>
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 max-h-96 overflow-y-auto">
          <div 
            dangerouslySetInnerHTML={{ __html: form.body_html }}
            className="prose prose-sm max-w-none"
          />
        </div>
      </div>
    </div>
  )
}

// Campaign Filters Step - Advanced Filter Builder
function CampaignFiltersStep({ form, updateFilters, availableRoles, recipientCount, onPreviewRecipients, previewRecipients }) {
  const [showPreview, setShowPreview] = useState(false)

  const roles = availableRoles.map(r => ({ value: r.name, label: r.display_name || r.name }))
  const subscriptionTiers = [
    { value: 'free', label: 'Free' },
    { value: 'pro', label: 'Pro' },
    { value: 'mpp_partner', label: 'MPP Partner' },
    { value: 'investment', label: 'Investment' },
    { value: 'label_starter', label: 'Label Starter' },
    { value: 'label_pro', label: 'Label Pro' },
    { value: 'label_partner', label: 'Label Partner' },
    { value: 'label_enterprise', label: 'Label Enterprise' }
  ]

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Target Audience</h3>
          <p className="text-sm text-gray-500 mt-1">
            Define who will receive this campaign using the filters below
          </p>
        </div>
        <button
          onClick={() => onPreviewRecipients(form.filters)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Eye className="w-4 h-4" />
          Preview Recipients
        </button>
      </div>

      {recipientCount > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-blue-900">
              {recipientCount.toLocaleString()} recipients match your filters
            </span>
          </div>
        </div>
      )}

      {/* Role Filter */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <label className="block text-sm font-semibold text-gray-900 mb-3">
          <UserCheck className="w-4 h-4 inline mr-2" />
          Roles
        </label>
        <p className="text-sm text-gray-500 mb-4">Select user roles to target</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {roles.map((role) => (
            <label key={role.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.filters.roles?.includes(role.value) || false}
                onChange={(e) => {
                  const current = form.filters.roles || []
                  const updated = e.target.checked
                    ? [...current, role.value]
                    : current.filter(r => r !== role.value)
                  updateFilters('roles', updated)
                }}
                className="rounded border-gray-300 text-gray-900 focus:ring-gray-900"
              />
              <span className="text-sm text-gray-700">{role.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Location Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <label className="block text-sm font-semibold text-gray-900 mb-3">
          <MapPin className="w-4 h-4 inline mr-2" />
          Location
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cities (comma-separated)
            </label>
            <Input
              value={Array.isArray(form.filters.cities) ? form.filters.cities.join(', ') : ''}
              onChange={(e) => {
                const cities = e.target.value.split(',').map(c => c.trim()).filter(c => c)
                updateFilters('cities', cities)
              }}
              placeholder="e.g., London, New York, Los Angeles"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Countries (comma-separated)
            </label>
            <Input
              value={Array.isArray(form.filters.countries) ? form.filters.countries.join(', ') : ''}
              onChange={(e) => {
                const countries = e.target.value.split(',').map(c => c.trim()).filter(c => c)
                updateFilters('countries', countries)
              }}
              placeholder="e.g., UK, US, Canada"
            />
          </div>
        </div>
      </div>

      {/* Subscription Tier Filter */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <label className="block text-sm font-semibold text-gray-900 mb-3">
          <DollarSign className="w-4 h-4 inline mr-2" />
          Subscription Tiers
        </label>
        <p className="text-sm text-gray-500 mb-4">Target users by subscription tier</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {subscriptionTiers.map((tier) => (
            <label key={tier.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.filters.subscriptionTiers?.includes(tier.value) || false}
                onChange={(e) => {
                  const current = form.filters.subscriptionTiers || []
                  const updated = e.target.checked
                    ? [...current, tier.value]
                    : current.filter(t => t !== tier.value)
                  updateFilters('subscriptionTiers', updated)
                }}
                className="rounded border-gray-300 text-gray-900 focus:ring-gray-900"
              />
              <span className="text-sm text-gray-700">{tier.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Last Login Filter */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <label className="block text-sm font-semibold text-gray-900 mb-3">
          <Clock className="w-4 h-4 inline mr-2" />
          Activity Filter
        </label>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Users who haven't logged in for (days)
          </label>
          <Input
            type="number"
            value={form.filters.lastLoginDays || ''}
            onChange={(e) => updateFilters('lastLoginDays', e.target.value ? parseInt(e.target.value) : null)}
            placeholder="e.g., 30 for users inactive 30+ days"
            className="max-w-xs"
          />
          <p className="text-xs text-gray-500 mt-1">
            Leave empty to include all users regardless of last login
          </p>
        </div>
      </div>

      {/* Date Range Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <label className="block text-sm font-semibold text-gray-900 mb-3">
          <CalendarIcon className="w-4 h-4 inline mr-2" />
          Account Creation Date
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Created After
            </label>
            <Input
              type="date"
              value={form.filters.createdAfter || ''}
              onChange={(e) => updateFilters('createdAfter', e.target.value || null)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Created Before
            </label>
            <Input
              type="date"
              value={form.filters.createdBefore || ''}
              onChange={(e) => updateFilters('createdBefore', e.target.value || null)}
            />
          </div>
        </div>
      </div>

      {/* Preview Recipients */}
      {previewRecipients && previewRecipients.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-semibold text-gray-900">Preview Recipients (First 100)</h4>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              {showPreview ? 'Hide' : 'Show'}
            </button>
          </div>
          {showPreview && (
            <div className="max-h-96 overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {previewRecipients.map((user) => (
                    <tr key={user.id}>
                      <td className="px-4 py-2 text-sm text-gray-900">{user.email}</td>
                      <td className="px-4 py-2 text-sm text-gray-700">
                        {user.display_name || user.first_name || 'N/A'}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-700">{user.role}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Campaign Preview Step
function CampaignPreviewStep({ form, recipientCount }) {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaign Preview</h3>
        
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h4 className="font-semibold text-gray-900 mb-2">Campaign Summary</h4>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-gray-500">Name</dt>
              <dd className="font-medium text-gray-900">{form.name}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Recipients</dt>
              <dd className="font-medium text-gray-900">{recipientCount.toLocaleString()}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Subject</dt>
              <dd className="font-medium text-gray-900">{form.subject}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Status</dt>
              <dd className="font-medium text-gray-900">Draft</dd>
            </div>
          </dl>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="font-semibold text-gray-900 mb-4">Email Preview</h4>
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="mb-2 text-sm text-gray-600">
              <strong>Subject:</strong> {form.subject}
            </div>
            <div className="border-t border-gray-200 pt-4">
              <div 
                dangerouslySetInnerHTML={{ __html: form.body_html }}
                className="prose prose-sm max-w-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

