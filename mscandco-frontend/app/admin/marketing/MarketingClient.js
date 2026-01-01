'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Mail, Plus, Send, Edit2, Trash2, Eye, Filter, Users, TrendingUp,
  Clock, CheckCircle, XCircle, AlertCircle, BarChart3, FileText,
  Calendar, Target, Zap, Settings, Copy, RefreshCw, Search,
  ChevronDown, ChevronUp, ChevronRight, X, Save, Play, Pause, ExternalLink,
  Download, Upload, Image as ImageIcon, Link as LinkIcon, Type,
  Layout, Palette, Code, EyeOff, Globe, UserCheck, MapPin,
  Building2, Music, Tag, DollarSign, Calendar as CalendarIcon,
  MousePointer, Shield, Award, Activity, CreditCard
} from 'lucide-react'
import ConfirmationModal from '@/components/shared/ConfirmationModal'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'

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
  const [campaigns, setCampaigns] = useState([]) // Filtered campaigns for display
  const [allCampaigns, setAllCampaigns] = useState([]) // All campaigns for stats (single source of truth)
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [validationErrors, setValidationErrors] = useState([])
  const [showErrorModal, setShowErrorModal] = useState(false)

  // View state
  const [activeTab, setActiveTab] = useState('campaigns') // campaigns, archived, templates, analytics, segments
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showArchived, setShowArchived] = useState(false)

  // Saved segments
  const [segments, setSegments] = useState([])
  const [loadingSegments, setLoadingSegments] = useState(false)

  // Campaign modal state
  const [showCampaignModal, setShowCampaignModal] = useState(false)
  const [editingCampaign, setEditingCampaign] = useState(null)
  const [previewRecipients, setPreviewRecipients] = useState(null)
  const [recipientCount, setRecipientCount] = useState(0)
  
  // Confirmation modals state
  const [showSendConfirm, setShowSendConfirm] = useState(false)
  const [campaignToSend, setCampaignToSend] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [campaignToDelete, setCampaignToDelete] = useState(null)

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
      subscriptionStatus: [], // active, cancelled, expired, trial, past_due
      genres: [],
      labels: [],
      lastLoginDays: null,
      loginFrequency: null, // frequent, occasional, inactive
      createdAfter: null,
      createdBefore: null,
      accountAgeMin: null, // days
      accountAgeMax: null, // days
      totalEarningsMin: null,
      totalEarningsMax: null,
      releasesCountMin: null,
      releasesCountMax: null,
      accountStatus: [], // active, suspended, archived, pending_verification
      isVerified: null, // true, false, null (all)
      timezone: [],
      hasCompletedOnboarding: null, // true, false, null (all)
      emailEngagement: [], // opened_recently, clicked_recently, never_engaged
      supportTicketCount: null, // min count
      lastActivityDays: null, // days since last activity
      labelSize: [], // solo, small, medium, large, enterprise
      paymentMethod: null, // card, bank_transfer, etc
      hasActiveSubscription: null, // true, false, null (all)
      subscriptionRenewalDateFrom: null,
      subscriptionRenewalDateTo: null
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

  // Load segments function
  const loadSegments = async () => {
    try {
      setLoadingSegments(true)
      const response = await fetch('/api/admin/marketing/segments?activeOnly=true')
      if (response.ok) {
        const data = await response.json()
        setSegments(data.segments || [])
      }
    } catch (err) {
      console.error('Failed to load segments:', err)
    } finally {
      setLoadingSegments(false)
    }
  }

  // Load all campaigns for stats on mount and when campaigns change
  useEffect(() => {
    loadAllCampaignsForStats()
  }, []) // Only run once on mount

  // Load data
  useEffect(() => {
    loadCampaigns()
    loadTemplates()
    if (activeTab === 'segments') {
      loadSegments()
    }
  }, [statusFilter, activeTab, showArchived])

  // Update stats whenever allCampaigns changes
  useEffect(() => {
    if (allCampaigns.length > 0 || campaigns.length > 0) {
      loadStats()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allCampaigns, campaigns])

  const loadCampaigns = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.append('status', statusFilter)
      // Add archived parameter based on active tab
      params.append('archived', showArchived ? 'true' : 'false')

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
      } else {
        const errorData = await response.json()
        console.error('Templates API error:', response.status, errorData)
      }
    } catch (err) {
      console.error('Failed to load templates:', err)
    }
  }

  // Load all campaigns for stats (single source of truth)
  const loadAllCampaignsForStats = async () => {
    try {
      // Load all campaigns (both archived and non-archived) for stats
      const response = await fetch('/api/admin/marketing/campaigns?archived=all')
      if (response.ok) {
        const data = await response.json()
        setAllCampaigns(data.campaigns || [])
      }
    } catch (err) {
      console.error('Failed to load all campaigns for stats:', err)
    }
  }

  const loadStats = async () => {
    try {
      // Calculate stats from ALL campaigns (not filtered) - single source of truth
      // Use allCampaigns if available, otherwise fall back to campaigns
      const campaignsForStats = allCampaigns.length > 0 ? allCampaigns : campaigns
      
      // Only count non-archived campaigns for stats
      const activeCampaigns = campaignsForStats.filter(c => !c.is_archived)
      const totalCampaigns = activeCampaigns.length
      const sentCampaigns = activeCampaigns.filter(c => c.status === 'sent')
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
        subscriptionStatus: [],
        genres: [],
        labels: [],
        lastLoginDays: null,
        loginFrequency: null,
        createdAfter: null,
        createdBefore: null,
        accountAgeMin: null,
        accountAgeMax: null,
        totalEarningsMin: null,
        totalEarningsMax: null,
        releasesCountMin: null,
        releasesCountMax: null,
        accountStatus: [],
        isVerified: null,
        timezone: [],
        hasCompletedOnboarding: null,
        emailEngagement: [],
        supportTicketCount: null,
        lastActivityDays: null,
        labelSize: [],
        paymentMethod: null,
        hasActiveSubscription: null,
        subscriptionRenewalDateFrom: null,
        subscriptionRenewalDateTo: null
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

  // Validate campaign form
  const validateCampaignForm = () => {
    const errors = []
    const missingFields = []

    if (!campaignForm.name || campaignForm.name.trim() === '') {
      missingFields.push('Campaign Name')
      errors.push({ field: 'name', message: 'Campaign name is required' })
    }

    if (!campaignForm.subject || campaignForm.subject.trim() === '') {
      missingFields.push('Email Subject')
      errors.push({ field: 'subject', message: 'Email subject is required' })
    }

    if (!campaignForm.body_html || campaignForm.body_html.trim() === '') {
      missingFields.push('Email Content (HTML)')
      errors.push({ field: 'body_html', message: 'Email HTML content is required' })
    }

    return { isValid: errors.length === 0, errors, missingFields }
  }

  const handleSaveCampaign = async (saveAsDraft = true) => {
    try {
      setLoading(true)
      setError(null)
      setValidationErrors([])

      // For drafts, only validate that name exists (minimum requirement)
      // For non-drafts (sending/scheduling), validate all required fields
      let validation = { isValid: true, errors: [] }
      let actualSaveAsDraft = saveAsDraft
      
      if (saveAsDraft) {
        // Draft validation: only name is required
        if (!campaignForm.name || campaignForm.name.trim() === '') {
          validation = {
            isValid: false,
            errors: [{ field: 'name', message: 'Campaign name is required' }]
          }
        }
      } else {
        // Full validation for non-drafts (ready to send/schedule)
        validation = validateCampaignForm()
        
        // If validation fails and we're trying to save as non-draft,
        // automatically save as draft instead (graceful fallback)
        if (!validation.isValid) {
          actualSaveAsDraft = true
        }
      }

      // If validation fails and we're saving as draft, show error and return
      if (!validation.isValid && actualSaveAsDraft && saveAsDraft) {
        setValidationErrors(validation.errors)
        setShowErrorModal(true)
        setLoading(false)
        return
      }

      const url = editingCampaign
        ? `/api/admin/marketing/campaigns/${editingCampaign.id}`
        : '/api/admin/marketing/campaigns'

      const method = editingCampaign ? 'PUT' : 'POST'

      // Calculate recipient count before saving (even for drafts)
      let calculatedRecipientCount = recipientCount
      if (campaignForm.filters) {
        try {
          const countResponse = await fetch('/api/admin/marketing/campaigns/preview-filters', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              filters: campaignForm.filters,
              limit: 1 // We only need the count
            })
          })
          if (countResponse.ok) {
            const countData = await countResponse.json()
            calculatedRecipientCount = countData.totalCount || 0
          }
        } catch (err) {
          console.warn('Failed to calculate recipient count, using existing count:', err)
          // Use existing recipientCount if calculation fails
        }
      }

      // Prepare campaign data with status
      // Ensure filters is always an object (required by API)
      const campaignData = {
        ...campaignForm,
        filters: campaignForm.filters || {},
        status: actualSaveAsDraft ? 'draft' : (campaignForm.scheduled_for ? 'scheduled' : 'draft'),
        total_recipients: calculatedRecipientCount
      }

      // Debug log to see what we're sending
      console.log('Saving campaign:', {
        saveAsDraft,
        actualSaveAsDraft,
        status: campaignData.status,
        hasName: !!campaignData.name,
        hasSubject: !!campaignData.subject,
        hasBodyHtml: !!campaignData.body_html,
        hasFilters: !!campaignData.filters,
        total_recipients: calculatedRecipientCount,
        method,
        url
      })

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campaignData)
      })

      if (!response.ok) {
        const data = await response.json()
        // Log the full error for debugging
        console.error('Campaign save error:', {
          status: response.status,
          data,
          campaignData: { ...campaignData, filters: 'object' } // Don't log full filters
        })
        // Include details in error message for better debugging
        const errorMessage = data.details 
          ? `${data.error || 'Failed to save campaign'}: ${data.details}`
          : (data.error || 'Failed to save campaign')
        throw new Error(errorMessage)
      }

      await loadCampaigns()
      await loadAllCampaignsForStats() // Reload all campaigns for stats
      
      if (actualSaveAsDraft) {
        // If this was a fallback from "Save & Close", show message and close
        if (!saveAsDraft && !validation.isValid) {
          alert('Campaign saved as draft. Please complete all required fields before sending.')
          setShowCampaignModal(false)
        } else {
          // Regular draft save - don't close modal, allow user to continue editing
          alert('Draft saved successfully! You can continue editing or close this window.')
        }
      } else {
        setShowCampaignModal(false)
      }
    } catch (err) {
      setError(err.message)
      setValidationErrors([{ field: 'general', message: err.message }])
      setShowErrorModal(true)
    } finally {
      setLoading(false)
    }
  }

  const handleSendCampaign = (campaignId) => {
    setCampaignToSend(campaignId)
    setShowSendConfirm(true)
  }

  const confirmSendCampaign = async () => {
    if (!campaignToSend) return

    try {
      setLoading(true)
      setShowSendConfirm(false)
      
      const response = await fetch(`/api/admin/marketing/campaigns/${campaignToSend}/send`, {
        method: 'POST'
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to send campaign')
      }

      await loadCampaigns()
      await loadAllCampaignsForStats() // Reload all campaigns for stats
      setCampaignToSend(null)
    } catch (err) {
      setError(err.message)
      setValidationErrors([{ field: 'general', message: err.message }])
      setShowErrorModal(true)
    } finally {
      setLoading(false)
      setCampaignToSend(null)
    }
  }

  const handleArchiveCampaign = (campaignId) => {
    setCampaignToDelete(campaignId)
    setShowDeleteConfirm(true)
  }

  const confirmArchiveCampaign = async () => {
    if (!campaignToDelete) return

    try {
      setLoading(true)
      setShowDeleteConfirm(false)
      
      const response = await fetch(`/api/admin/marketing/campaigns/${campaignToDelete}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to archive campaign')
      }

      await loadCampaigns()
      await loadAllCampaignsForStats() // Reload all campaigns for stats
      setCampaignToDelete(null)
    } catch (err) {
      setError(err.message)
      setValidationErrors([{ field: 'general', message: err.message }])
      setShowErrorModal(true)
    } finally {
      setLoading(false)
      setCampaignToDelete(null)
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

  const handleCloneCampaign = async (campaignId) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/marketing/campaigns/${campaignId}/clone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: `${campaigns.find(c => c.id === campaignId)?.name} (Copy)` })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to clone campaign')
      }

      await loadCampaigns()
      await loadAllCampaignsForStats() // Reload all campaigns for stats
      alert('Campaign cloned successfully!')
      setShowCampaignModal(false)
    } catch (err) {
      alert(`Error cloning campaign: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

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
            onClick={() => {
              setActiveTab('campaigns')
              setShowArchived(false)
            }}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'campaigns' && !showArchived
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Campaigns
          </button>
          <button
            onClick={() => {
              setActiveTab('campaigns')
              setShowArchived(true)
            }}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'campaigns' && showArchived
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Archived
          </button>
          <button
            onClick={() => {
              setActiveTab('templates')
              setShowArchived(false)
            }}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'templates'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Templates
          </button>
          <button
            onClick={() => {
              setActiveTab('analytics')
              setShowArchived(false)
            }}
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
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {showArchived ? 'No archived campaigns' : 'No campaigns found'}
              </h3>
              <p className="text-gray-500 mb-6">
                {showArchived 
                  ? 'Archived campaigns will appear here when you archive them from the main campaigns list.'
                  : 'Get started by creating your first email campaign'}
              </p>
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
                                title="Edit"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleSendCampaign(campaign.id)}
                                className="text-green-600 hover:text-green-900"
                                title="Send Campaign"
                              >
                                <Send className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleEditCampaign(campaign)}
                            className="text-gray-600 hover:text-gray-900"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {!showArchived && (
                            <button
                              onClick={() => handleArchiveCampaign(campaign.id)}
                              className="text-orange-600 hover:text-orange-900"
                              title="Archive Campaign"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
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

      {/* Segments Tab */}
      {activeTab === 'segments' && (
        <SavedSegmentsTab
          segments={segments}
          loading={loadingSegments}
          onLoadSegments={loadSegments}
          onSelectSegment={(segment) => {
            setCampaignForm(prev => ({ ...prev, filters: segment.filters }))
            setActiveTab('campaigns')
            handleCreateCampaign()
          }}
        />
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <TemplatesTab 
          templates={templates} 
          loading={loading} 
          onLoadTemplates={loadTemplates}
          onUseTemplate={(template) => {
            // When user clicks "Use Template", populate form and open campaign modal
            setCampaignForm(prev => ({
              ...prev,
              template_id: template.id,
              subject: template.subject_template,
              body_html: template.body_html_template,
              body_text: template.body_text_template || ''
            }))
            setActiveTab('campaigns')
            setShowCampaignModal(true)
          }}
        />
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <CampaignAnalyticsTab campaigns={allCampaigns.filter(c => !c.is_archived)} />
      )}

      {/* Campaign Modal */}
      {showCampaignModal && (
        <CampaignModal
          campaign={editingCampaign}
          form={campaignForm}
          setForm={setCampaignForm}
          templates={templates}
          segments={segments}
          onSave={(saveAsDraft) => handleSaveCampaign(saveAsDraft)}
          onClose={() => {
            setShowCampaignModal(false)
            setValidationErrors([])
            setShowErrorModal(false)
          }}
          onPreviewRecipients={handlePreviewRecipients}
          recipientCount={recipientCount}
          previewRecipients={previewRecipients}
          loading={loading}
          validationErrors={validationErrors}
          onClone={() => {
            if (editingCampaign) {
              handleCloneCampaign(editingCampaign.id)
            }
          }}
        />
      )}

      {/* Send Campaign Confirmation Modal */}
      <ConfirmationModal
        isOpen={showSendConfirm}
        onClose={() => {
          setShowSendConfirm(false)
          setCampaignToSend(null)
        }}
        onConfirm={confirmSendCampaign}
        title="Send Campaign"
        message="Are you sure you want to send this campaign? This action cannot be undone."
        confirmText="Send Campaign"
        cancelText="Cancel"
        type="warning"
        isLoading={loading}
      />

      {/* Archive Campaign Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false)
          setCampaignToDelete(null)
        }}
        onConfirm={confirmArchiveCampaign}
        title="Archive Campaign"
        message="Are you sure you want to archive this campaign? It will be moved to the Archived tab and can be viewed later. Campaign data will be preserved."
        confirmText="Archive Campaign"
        cancelText="Cancel"
        type="danger"
        isLoading={loading}
      />
    </div>
  )
}

// Validation Error Modal Component
function ValidationErrorModal({ errors, onClose, onGoToField }) {
  const fieldLabels = {
    name: 'Campaign Name',
    subject: 'Email Subject',
    body_html: 'Email Content (HTML)'
  }

  const fieldSteps = {
    name: 'details',
    subject: 'details',
    body_html: 'content'
  }

  if (!errors || errors.length === 0) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-lg max-w-md w-full shadow-xl" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Branded Header */}
        <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 px-6 py-4 rounded-t-lg relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
              backgroundSize: '24px 24px'
            }}></div>
          </div>
          
          <div className="flex items-center gap-3 relative z-10">
            {/* MSC & Co Logo */}
            <div className="flex-shrink-0 relative">
              <img
                src="/logos/MSCandCoLogoV2.svg"
                alt="MSC & Co"
                className="h-8 w-8 object-contain"
                style={{ filter: 'brightness(0) invert(1)' }}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              {/* Fallback icon if logo fails */}
              <div className="absolute inset-0 flex items-center justify-center h-8 w-8 rounded-full bg-white/20" style={{ display: 'none' }}>
                <AlertCircle className="w-5 h-5 text-white" />
              </div>
            </div>
            
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white">Missing Required Fields</h3>
              <div className="flex items-center gap-2 mt-1">
                <div className="h-1 w-1 rounded-full bg-white/60"></div>
                <p className="text-xs font-medium text-gray-300">Please complete the following fields to continue</p>
              </div>
            </div>
          </div>
        </div>

        {/* Error List */}
        <div className="p-6">
          <div className="space-y-3">
            {errors.map((error, index) => (
              <div 
                key={index}
                className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors cursor-pointer"
                onClick={() => {
                  if (fieldSteps[error.field] && onGoToField) {
                    onGoToField(error.field)
                  }
                }}
              >
                <div className="flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {fieldLabels[error.field] || error.field}
                  </p>
                  <p className="text-xs text-gray-600 mt-0.5">{error.message}</p>
                </div>
                {fieldSteps[error.field] && (
                  <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

// Campaign Modal Component - Full Featured
function CampaignModal({ campaign, form, setForm, templates, segments, onSave, onClose, onPreviewRecipients, recipientCount, previewRecipients, loading, onClone, validationErrors = [] }) {
  const [activeStep, setActiveStep] = useState('details') // details, content, filters, preview
  const [showErrorModal, setShowErrorModal] = useState(false)

  // Show error modal when validation errors are present
  useEffect(() => {
    if (validationErrors && validationErrors.length > 0) {
      setShowErrorModal(true)
    }
  }, [validationErrors])
  const [availableRoles, setAvailableRoles] = useState([])
  const [availableCities, setAvailableCities] = useState([])
  const [availableCountries, setAvailableCountries] = useState([])

  useEffect(() => {
    loadFilterOptions()
  }, [])

  const loadFilterOptions = async () => {
    try {
      // Load roles from the correct endpoint
      const rolesResponse = await fetch('/api/admin/roles/list')
      if (rolesResponse.ok) {
        const rolesData = await rolesResponse.json()
        // Handle response format: { success: true, roles: [...] }
        const roles = rolesData.roles || rolesData.data || []
        if (Array.isArray(roles) && roles.length > 0) {
          // Map roles to include display_name (use name if display_name not available)
          const formattedRoles = roles.map(role => ({
            id: role.id,
            name: role.name,
            display_name: role.display_name || role.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
          }))
          setAvailableRoles(formattedRoles)
        } else {
          throw new Error('No roles returned')
        }
      } else {
        throw new Error('Failed to fetch roles')
      }
    } catch (err) {
      console.warn('Failed to load roles, using default roles:', err)
      // Set default roles as fallback
      setAvailableRoles([
        { id: '1', name: 'artist', display_name: 'Artist' },
        { id: '2', name: 'labeladmin', display_name: 'Label Admin' },
        { id: '3', name: 'distribution_partner', display_name: 'Distribution Partner' },
        { id: '4', name: 'super_admin', display_name: 'Super Admin' },
        { id: '5', name: 'company_admin', display_name: 'Company Admin' },
        { id: '6', name: 'marketing_admin', display_name: 'Marketing Admin' }
      ])
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
    if (templateId === 'none') {
      setForm(prev => ({
        ...prev,
        template_id: null
      }))
    } else {
      const template = templates.find(t => t.id.toString() === templateId)
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
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-7xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        {/* Branded Header */}
        <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 px-6 py-5 flex items-center justify-between relative overflow-hidden flex-shrink-0">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
              backgroundSize: '24px 24px'
            }}></div>
          </div>
          
          <div className="flex items-center gap-4 relative z-10 flex-1">
            {/* MSC & Co Logo */}
            <div className="flex-shrink-0 relative">
              <img
                src="/logos/MSCandCoLogoV2.svg"
                alt="MSC & Co"
                className="h-10 w-10 object-contain"
                style={{ filter: 'brightness(0) invert(1)' }}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
            
            <div className="flex-1">
              <h2 className="text-xl leading-6 font-bold text-white mb-1">
                {campaign ? 'Edit Campaign' : 'Create Campaign'}
              </h2>
              <div className="flex items-center gap-2">
                <div className="h-1 w-1 rounded-full bg-white/60"></div>
                <p className="text-xs font-medium text-gray-300">
                  {campaign ? `Last updated: ${new Date(campaign.updated_at).toLocaleString()}` : 'Create a new email campaign'}
                </p>
                <div className="h-1 w-1 rounded-full bg-white/60"></div>
                <p className="text-xs font-medium text-gray-300">MSC & Co Platform</p>
              </div>
            </div>
          </div>
          
          <button 
            onClick={onClose} 
            className="text-gray-300 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10 relative z-10"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
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
              validationErrors={validationErrors}
            />
          )}

          {activeStep === 'content' && (
            <CampaignContentStep
              form={form}
              setForm={setForm}
              validationErrors={validationErrors}
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
              segments={segments || []}
              onSaveSegment={async (segmentData) => {
                try {
                  const response = await fetch('/api/admin/marketing/segments', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(segmentData)
                  })
                  if (response.ok) {
                    // Segment saved successfully, could reload segments if needed
                    return true
                  }
                  return false
                } catch (err) {
                  console.error('Failed to save segment:', err)
                  return false
                }
              }}
            />
          )}

          {activeStep === 'preview' && (
            <CampaignPreviewStep
              form={form}
              recipientCount={recipientCount}
              templates={templates}
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
            {campaign && campaign.status === 'draft' && (
              <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-gray-200 text-gray-800">
                Draft
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            {/* Save Draft Button - Always visible */}
            <button
              onClick={() => {
                onSave(true) // Save as draft
              }}
              disabled={loading}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Draft
            </button>
            <button
              onClick={() => {
                if (activeStep === 'preview') {
                  onSave(false) // Save and close (ready to send)
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
              {loading ? 'Saving...' : activeStep === 'preview' ? 'Save & Close' : 'Next'}
            </button>
          </div>
        </div>
      </div>

      {/* Validation Error Modal inside Campaign Modal */}
      {showErrorModal && validationErrors.length > 0 && (
        <ValidationErrorModal
          errors={validationErrors}
          onClose={() => {
            setShowErrorModal(false)
          }}
          onGoToField={(fieldName) => {
            setShowErrorModal(false)
            // Navigate to appropriate step
            if (fieldName === 'name' || fieldName === 'subject') {
              setActiveStep('details')
            } else if (fieldName === 'body_html') {
              setActiveStep('content')
            }
          }}
        />
      )}
    </div>
  )
}

// Campaign Details Step
function CampaignDetailsStep({ form, setForm, templates, onTemplateSelect, validationErrors = [] }) {
  const hasNameError = validationErrors.some(e => e.field === 'name')
  const hasSubjectError = validationErrors.some(e => e.field === 'subject')

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaign Information</h3>
        
        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${hasNameError ? 'text-red-600' : 'text-gray-700'}`}>
              Campaign Name <span className="text-red-500">*</span>
              {hasNameError && <span className="ml-2 text-xs text-red-600">(Required)</span>}
            </label>
            <Input
              value={form.name}
              onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Welcome Email for New Artists"
              className={`w-full ${hasNameError ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
            />
            {hasNameError && (
              <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Campaign name is required
              </p>
            )}
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
            <label className={`block text-sm font-medium mb-2 ${hasSubjectError ? 'text-red-600' : 'text-gray-700'}`}>
              Email Subject <span className="text-red-500">*</span>
              {hasSubjectError && <span className="ml-2 text-xs text-red-600">(Required)</span>}
            </label>
            <Input
              value={form.subject}
              onChange={(e) => setForm(prev => ({ ...prev, subject: e.target.value }))}
              placeholder="e.g., Welcome to MSC & Co!"
              className={`w-full ${hasSubjectError ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
            />
            {hasSubjectError && (
              <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Email subject is required
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Use merge tags like {'{{user_name}}'} for personalization
            </p>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Email Template (Optional)</h3>
          <button
            onClick={() => {
              // Switch to templates tab (this will be handled by parent)
              window.dispatchEvent(new CustomEvent('switchToTemplatesTab'))
            }}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Browse Templates →
          </button>
        </div>
        <Select
          value={form.template_id ? form.template_id.toString() : 'none'}
          onValueChange={onTemplateSelect}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a template (optional)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No template (Start from scratch)</SelectItem>
            {templates.map((template) => (
              <SelectItem key={template.id} value={template.id.toString()}>
                {template.name} {template.category && `(${template.category})`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {form.template_id && (
          <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900">
              <strong>Template selected.</strong> The subject and content have been populated. You can edit them in the Content tab.
            </p>
          </div>
        )}
        <p className="text-xs text-gray-500 mt-2">
          Select a pre-built template to get started, or start from scratch. Templates can be customized after selection.
        </p>
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
function CampaignContentStep({ form, setForm, validationErrors = [] }) {
  const hasBodyHtmlError = validationErrors.some(e => e.field === 'body_html')
  
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
        <label className={`block text-sm font-medium mb-2 ${hasBodyHtmlError ? 'text-red-600' : 'text-gray-700'}`}>
          HTML Content <span className="text-red-500">*</span>
          {hasBodyHtmlError && <span className="ml-2 text-xs text-red-600">(Required)</span>}
        </label>
        <textarea
          id="body_html_textarea"
          value={form.body_html}
          onChange={(e) => setForm(prev => ({ ...prev, body_html: e.target.value }))}
          placeholder="<html>...</html> or plain HTML content"
          rows={20}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 font-mono text-sm ${
            hasBodyHtmlError 
              ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
              : 'border-gray-300 focus:ring-gray-900'
          }`}
        />
        {hasBodyHtmlError && (
          <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Email HTML content is required
          </p>
        )}
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
function CampaignFiltersStep({ form, updateFilters, availableRoles, recipientCount, onPreviewRecipients, previewRecipients, segments, onSaveSegment }) {
  const [showPreview, setShowPreview] = useState(false)
  const [showSaveSegmentModal, setShowSaveSegmentModal] = useState(false)

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
        <div className="flex items-center gap-2">
          {segments && segments.length > 0 && (
            <Select
              onValueChange={(segmentId) => {
                const segment = segments.find(s => s.id.toString() === segmentId)
                if (segment) {
                  updateFilters('roles', segment.filters.roles || [])
                  updateFilters('cities', segment.filters.cities || [])
                  updateFilters('countries', segment.filters.countries || [])
                  updateFilters('subscriptionTiers', segment.filters.subscriptionTiers || [])
                  updateFilters('lastLoginDays', segment.filters.lastLoginDays || null)
                  // Update all filters from segment
                  Object.keys(segment.filters).forEach(key => {
                    updateFilters(key, segment.filters[key])
                  })
                }
              }}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Load saved segment" />
              </SelectTrigger>
              <SelectContent>
                {segments.map((segment) => (
                  <SelectItem key={segment.id} value={segment.id.toString()}>
                    {segment.name} (~{segment.estimated_count || 0} users)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <button
            onClick={() => setShowSaveSegmentModal(true)}
            className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
          >
            <Save className="w-4 h-4" />
            Save Segment
          </button>
          <button
            onClick={() => onPreviewRecipients(form.filters)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Eye className="w-4 h-4" />
            Preview Recipients
          </button>
        </div>
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

      {/* Subscription Status Filter */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <label className="block text-sm font-semibold text-gray-900 mb-3">
          <CheckCircle className="w-4 h-4 inline mr-2" />
          Subscription Status
        </label>
        <p className="text-sm text-gray-500 mb-4">Filter by subscription status</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { value: 'active', label: 'Active' },
            { value: 'cancelled', label: 'Cancelled' },
            { value: 'expired', label: 'Expired' },
            { value: 'trial', label: 'Trial' },
            { value: 'past_due', label: 'Past Due' }
          ].map((status) => (
            <label key={status.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.filters.subscriptionStatus?.includes(status.value) || false}
                onChange={(e) => {
                  const current = form.filters.subscriptionStatus || []
                  const updated = e.target.checked
                    ? [...current, status.value]
                    : current.filter(s => s !== status.value)
                  updateFilters('subscriptionStatus', updated)
                }}
                className="rounded border-gray-300 text-gray-900 focus:ring-gray-900"
              />
              <span className="text-sm text-gray-700">{status.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Account Status Filter */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <label className="block text-sm font-semibold text-gray-900 mb-3">
          <UserCheck className="w-4 h-4 inline mr-2" />
          Account Status
        </label>
        <p className="text-sm text-gray-500 mb-4">Filter by account status</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { value: 'active', label: 'Active' },
            { value: 'suspended', label: 'Suspended' },
            { value: 'archived', label: 'Archived' },
            { value: 'pending_verification', label: 'Pending Verification' }
          ].map((status) => (
            <label key={status.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.filters.accountStatus?.includes(status.value) || false}
                onChange={(e) => {
                  const current = form.filters.accountStatus || []
                  const updated = e.target.checked
                    ? [...current, status.value]
                    : current.filter(s => s !== status.value)
                  updateFilters('accountStatus', updated)
                }}
                className="rounded border-gray-300 text-gray-900 focus:ring-gray-900"
              />
              <span className="text-sm text-gray-700">{status.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Financial Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <label className="block text-sm font-semibold text-gray-900 mb-3">
          <DollarSign className="w-4 h-4 inline mr-2" />
          Financial Filters
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Total Earnings (£)
            </label>
            <Input
              type="number"
              value={form.filters.totalEarningsMin || ''}
              onChange={(e) => updateFilters('totalEarningsMin', e.target.value ? parseFloat(e.target.value) : null)}
              placeholder="e.g., 100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Total Earnings (£)
            </label>
            <Input
              type="number"
              value={form.filters.totalEarningsMax || ''}
              onChange={(e) => updateFilters('totalEarningsMax', e.target.value ? parseFloat(e.target.value) : null)}
              placeholder="e.g., 10000"
            />
          </div>
        </div>
      </div>

      {/* Release Count Filter */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <label className="block text-sm font-semibold text-gray-900 mb-3">
          <Music className="w-4 h-4 inline mr-2" />
          Release Count
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Releases
            </label>
            <Input
              type="number"
              value={form.filters.releasesCountMin || ''}
              onChange={(e) => updateFilters('releasesCountMin', e.target.value ? parseInt(e.target.value) : null)}
              placeholder="e.g., 1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Releases
            </label>
            <Input
              type="number"
              value={form.filters.releasesCountMax || ''}
              onChange={(e) => updateFilters('releasesCountMax', e.target.value ? parseInt(e.target.value) : null)}
              placeholder="e.g., 50"
            />
          </div>
        </div>
      </div>

      {/* Account Age Filter */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <label className="block text-sm font-semibold text-gray-900 mb-3">
          <CalendarIcon className="w-4 h-4 inline mr-2" />
          Account Age (Days)
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Age (days)
            </label>
            <Input
              type="number"
              value={form.filters.accountAgeMin || ''}
              onChange={(e) => updateFilters('accountAgeMin', e.target.value ? parseInt(e.target.value) : null)}
              placeholder="e.g., 30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Age (days)
            </label>
            <Input
              type="number"
              value={form.filters.accountAgeMax || ''}
              onChange={(e) => updateFilters('accountAgeMax', e.target.value ? parseInt(e.target.value) : null)}
              placeholder="e.g., 365"
            />
          </div>
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

      {/* Verification Status */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <label className="block text-sm font-semibold text-gray-900 mb-3">
          <CheckCircle className="w-4 h-4 inline mr-2" />
          Account Verification
        </label>
        <div className="flex items-center gap-4">
          <Select
            value={form.filters.isVerified === null ? 'all' : form.filters.isVerified ? 'verified' : 'unverified'}
            onValueChange={(value) => {
              if (value === 'all') updateFilters('isVerified', null)
              else if (value === 'verified') updateFilters('isVerified', true)
              else updateFilters('isVerified', false)
            }}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Accounts</SelectItem>
              <SelectItem value="verified">Verified Only</SelectItem>
              <SelectItem value="unverified">Unverified Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Onboarding Status */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <label className="block text-sm font-semibold text-gray-900 mb-3">
          <CheckCircle className="w-4 h-4 inline mr-2" />
          Onboarding Status
        </label>
        <div className="flex items-center gap-4">
          <Select
            value={form.filters.hasCompletedOnboarding === null ? 'all' : form.filters.hasCompletedOnboarding ? 'completed' : 'incomplete'}
            onValueChange={(value) => {
              if (value === 'all') updateFilters('hasCompletedOnboarding', null)
              else if (value === 'completed') updateFilters('hasCompletedOnboarding', true)
              else updateFilters('hasCompletedOnboarding', false)
            }}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              <SelectItem value="completed">Completed Onboarding</SelectItem>
              <SelectItem value="incomplete">Incomplete Onboarding</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Email Engagement */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <label className="block text-sm font-semibold text-gray-900 mb-3">
          <Mail className="w-4 h-4 inline mr-2" />
          Email Engagement
        </label>
        <p className="text-sm text-gray-500 mb-4">Filter by previous email campaign engagement</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { value: 'opened_recently', label: 'Opened Recently' },
            { value: 'clicked_recently', label: 'Clicked Recently' },
            { value: 'never_engaged', label: 'Never Engaged' }
          ].map((engagement) => (
            <label key={engagement.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.filters.emailEngagement?.includes(engagement.value) || false}
                onChange={(e) => {
                  const current = form.filters.emailEngagement || []
                  const updated = e.target.checked
                    ? [...current, engagement.value]
                    : current.filter(e => e !== engagement.value)
                  updateFilters('emailEngagement', updated)
                }}
                className="rounded border-gray-300 text-gray-900 focus:ring-gray-900"
              />
              <span className="text-sm text-gray-700">{engagement.label}</span>
            </label>
          ))}
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
function CampaignPreviewStep({ form, recipientCount, templates }) {
  // Sample data for merge tag replacement in preview
  const sampleData = {
    user_name: 'John Doe',
    user_email: 'john.doe@example.com',
    platform_name: 'MSC & Co',
    base_url: typeof window !== 'undefined' ? window.location.origin : 'https://staging.mscandco.com',
    dashboard_url: 'https://staging.mscandco.com/dashboard',
    login_url: 'https://staging.mscandco.com/login',
    unsubscribe_url: 'https://staging.mscandco.com/unsubscribe',
    release_title: 'My New Album',
    analytics_url: 'https://staging.mscandco.com/analytics',
    promo_url: 'https://staging.mscandco.com/promotions',
    promo_code: 'SAVE20',
    discount_percent: '20',
    year_animal: 'Dragon',
    // Add more common template variables
  }

  // Replace merge tags with sample data for preview
  const replaceMergeTags = (text) => {
    if (!text) return ''
    let result = text
    Object.entries(sampleData).forEach(([key, value]) => {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g')
      result = result.replace(regex, value)
    })
    // Replace any remaining merge tags with placeholder
    result = result.replace(/{{[^}]+}}/g, '[Sample Data]')
    return result
  }

  const previewSubject = replaceMergeTags(form.subject)
  const previewHtml = replaceMergeTags(form.body_html)

  // Get template info if template is used
  const usedTemplate = form.template_id ? templates?.find(t => t.id.toString() === form.template_id.toString()) : null

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
            {usedTemplate && (
              <div className="col-span-2">
                <dt className="text-gray-500">Template</dt>
                <dd className="font-medium text-gray-900">{usedTemplate.name} ({usedTemplate.category})</dd>
              </div>
            )}
          </dl>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900">Email Preview</h4>
            <span className="text-xs text-gray-500 bg-yellow-50 px-2 py-1 rounded">
              Merge tags replaced with sample data
            </span>
          </div>
          
          {/* Email Client Preview */}
          <div className="border border-gray-300 rounded-lg overflow-hidden shadow-lg bg-white">
            {/* Email Header Simulation */}
            <div className="bg-gray-100 px-4 py-2 border-b border-gray-300 flex items-center gap-2 text-xs text-gray-600">
              <div className="w-3 h-3 rounded-full bg-gray-400"></div>
              <div className="w-3 h-3 rounded-full bg-gray-400"></div>
              <div className="w-3 h-3 rounded-full bg-gray-400"></div>
              <span className="ml-2">Email Client Preview</span>
            </div>
            
            {/* Email Content */}
            <div className="p-4">
              <div className="mb-4 pb-4 border-b border-gray-200">
                <div className="text-xs text-gray-500 mb-1">From: MSC & Co &lt;noreply@mscandco.com&gt;</div>
                <div className="text-xs text-gray-500 mb-1">To: {sampleData.user_email}</div>
                <div className="text-sm font-semibold text-gray-900">
                  Subject: {previewSubject}
                </div>
              </div>
              
              <div className="email-preview-content">
                <div 
                  dangerouslySetInnerHTML={{ __html: previewHtml }}
                  className="prose prose-sm max-w-none"
                  style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
                />
              </div>
            </div>
          </div>

          {/* Plain Text Preview */}
          {form.body_text && (
            <div className="mt-6 bg-white border border-gray-200 rounded-lg p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Plain Text Version</h4>
              <div className="bg-gray-50 border border-gray-200 rounded p-4 font-mono text-sm whitespace-pre-wrap">
                {replaceMergeTags(form.body_text)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Templates Tab Component
function TemplatesTab({ templates, loading, onLoadTemplates, onUseTemplate }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [selectedTemplate, setSelectedTemplate] = useState(null)

  const categories = ['all', 'onboarding', 'holidays', 'promotions', 'engagement', 'billing', 'support', 'educational', 'security', 'admin']
  
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = !searchQuery || 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (template.description && template.description.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesCategory = categoryFilter === 'all' || template.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const templatesByCategory = filteredTemplates.reduce((acc, template) => {
    const cat = template.category || 'other'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(template)
    return acc
  }, {})

  if (loading) {
    return (
      <div className="text-center py-12">
        <RefreshCw className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">Loading templates...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Email Templates</h2>
          <p className="text-gray-600 mt-1">Manage and use pre-built email templates for your campaigns ({filteredTemplates.length} templates)</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 flex items-center gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="onboarding">Onboarding</SelectItem>
            <SelectItem value="holidays">Holidays</SelectItem>
            <SelectItem value="promotions">Promotions</SelectItem>
            <SelectItem value="engagement">Engagement</SelectItem>
            <SelectItem value="billing">Billing</SelectItem>
            <SelectItem value="support">Support</SelectItem>
            <SelectItem value="educational">Educational</SelectItem>
            <SelectItem value="security">Security</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Templates List */}
      {filteredTemplates.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
          <p className="text-gray-500">{searchQuery || categoryFilter !== 'all' ? 'Try adjusting your filters' : 'Templates will appear here once they are created'}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(templatesByCategory).map(([category, categoryTemplates]) => (
            <div key={category} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 capitalize">
                  {category} ({categoryTemplates.length})
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                {categoryTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 
                        className="text-base font-medium text-gray-900 flex-1 cursor-pointer hover:text-gray-600"
                        onClick={() => setSelectedTemplate(template)}
                      >
                        {template.name}
                      </h4>
                      {template.is_active ? (
                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-800 ml-2">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-800 ml-2">
                          Inactive
                        </span>
                      )}
                    </div>
                    {template.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{template.description}</p>
                    )}
                    <div className="flex items-center justify-between mt-3">
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full capitalize text-xs">
                        {template.category}
                      </span>
                      {onUseTemplate && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onUseTemplate(template)
                          }}
                          className="px-3 py-1.5 text-xs font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          Use Template
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Template Preview Modal */}
      {selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedTemplate(null)}>
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">{selectedTemplate.name}</h3>
              <button
                onClick={() => setSelectedTemplate(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-sm font-medium text-gray-700">Description</label>
                  <p className="text-gray-900">{selectedTemplate.description || 'No description'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Subject Template</label>
                  <p className="text-gray-900 font-mono text-sm bg-gray-50 p-2 rounded">{selectedTemplate.subject_template}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Category</label>
                  <p className="text-gray-900 capitalize">{selectedTemplate.category}</p>
                </div>
                {selectedTemplate.variables && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Available Variables</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {(() => {
                        try {
                          const vars = Array.isArray(selectedTemplate.variables) 
                            ? selectedTemplate.variables 
                            : typeof selectedTemplate.variables === 'string'
                            ? JSON.parse(selectedTemplate.variables || '[]')
                            : []
                          return vars.map((variable) => (
                            <span key={variable} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-mono">
                              {`{{${variable}}}`}
                            </span>
                          ))
                        } catch (e) {
                          console.error('Error parsing template variables:', e)
                          return <span className="text-sm text-gray-500">Error loading variables</span>
                        }
                      })()}
                    </div>
                  </div>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">HTML Preview</label>
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 max-h-96 overflow-y-auto">
                  <div dangerouslySetInnerHTML={{ __html: selectedTemplate.body_html_template }} />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setSelectedTemplate(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Saved Segments Tab Component
function SavedSegmentsTab({ segments, loading, onLoadSegments, onSelectSegment }) {
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [segmentName, setSegmentName] = useState('')
  const [segmentDescription, setSegmentDescription] = useState('')

  const handleSaveSegment = async () => {
    // This would be called from the filter builder
    // For now, just show the modal structure
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Saved Audience Segments</h2>
          <p className="text-gray-600 mt-1">Reusable filter combinations for quick campaign targeting</p>
        </div>
        <button
          onClick={() => setShowSaveModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
        >
          <Plus className="w-5 h-5" />
          New Segment
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Loading segments...</p>
        </div>
      ) : segments.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No saved segments</h3>
          <p className="text-gray-500 mb-6">Create reusable audience segments for your campaigns</p>
          <button
            onClick={() => setShowSaveModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
          >
            <Plus className="w-5 h-5" />
            Create Segment
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {segments.map((segment) => (
            <div key={segment.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{segment.name}</h3>
                  {segment.description && (
                    <p className="text-sm text-gray-500 mt-1">{segment.description}</p>
                  )}
                </div>
              </div>
              <div className="mb-4">
                <div className="text-sm text-gray-600">
                  <Users className="w-4 h-4 inline mr-1" />
                  ~{segment.estimated_count?.toLocaleString() || 0} users
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onSelectSegment(segment)}
                  className="flex-1 px-3 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 text-sm font-medium"
                >
                  Use in Campaign
                </button>
                <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Campaign Analytics Tab Component
function CampaignAnalyticsTab({ campaigns }) {
  const [selectedCampaign, setSelectedCampaign] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(false)

  const sentCampaigns = campaigns.filter(c => c.status === 'sent')

  useEffect(() => {
    if (selectedCampaign) {
      loadCampaignAnalytics(selectedCampaign)
    }
  }, [selectedCampaign])

  const loadCampaignAnalytics = async (campaignId) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/marketing/campaigns/${campaignId}/analytics?timeSeries=true`)
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data.analytics)
      }
    } catch (err) {
      console.error('Failed to load analytics:', err)
    } finally {
      setLoading(false)
    }
  }

  // Aggregate stats for all campaigns
  const aggregateStats = {
    totalSent: sentCampaigns.length,
    totalRecipients: sentCampaigns.reduce((sum, c) => sum + (c.total_recipients || 0), 0),
    totalOpened: sentCampaigns.reduce((sum, c) => sum + (c.emails_opened || 0), 0),
    totalClicked: sentCampaigns.reduce((sum, c) => sum + (c.emails_clicked || 0), 0),
    totalBounced: sentCampaigns.reduce((sum, c) => sum + (c.emails_bounced || 0), 0)
  }

  const overallOpenRate = aggregateStats.totalRecipients > 0
    ? ((aggregateStats.totalOpened / aggregateStats.totalRecipients) * 100).toFixed(2)
    : 0
  const overallClickRate = aggregateStats.totalRecipients > 0
    ? ((aggregateStats.totalClicked / aggregateStats.totalRecipients) * 100).toFixed(2)
    : 0

  const chartData = sentCampaigns.map(c => ({
    name: c.name.substring(0, 20) + (c.name.length > 20 ? '...' : ''),
    recipients: c.total_recipients || 0,
    opened: c.emails_opened || 0,
    clicked: c.emails_clicked || 0,
    openRate: c.total_recipients > 0 ? ((c.emails_opened / c.total_recipients) * 100) : 0,
    clickRate: c.total_recipients > 0 ? ((c.emails_clicked / c.total_recipients) * 100) : 0
  }))

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Campaign Analytics</h2>
        <p className="text-gray-600">Comprehensive analytics and insights for your email campaigns</p>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard icon={Send} label="Campaigns Sent" value={aggregateStats.totalSent} />
        <MetricCard icon={Users} label="Total Recipients" value={aggregateStats.totalRecipients.toLocaleString()} />
        <MetricCard icon={TrendingUp} label="Avg Open Rate" value={`${overallOpenRate}%`} />
        <MetricCard icon={MousePointer} label="Avg Click Rate" value={`${overallClickRate}%`} />
      </div>

      {/* Campaign Performance Chart */}
      {chartData.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaign Performance</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#6b7280" angle={-45} textAnchor="end" height={100} />
              <YAxis stroke="#6b7280" />
              <Tooltip />
              <Legend />
              <Bar dataKey="recipients" fill="#9ca3af" name="Recipients" />
              <Bar dataKey="opened" fill="#3b82f6" name="Opened" />
              <Bar dataKey="clicked" fill="#10b981" name="Clicked" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Campaign Selector for Detailed Analytics */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Campaign Analytics</h3>
        <Select value={selectedCampaign || ''} onValueChange={setSelectedCampaign}>
          <SelectTrigger className="w-full max-w-md">
            <SelectValue placeholder="Select a campaign to view detailed analytics" />
          </SelectTrigger>
          <SelectContent>
            {sentCampaigns.map((campaign) => (
              <SelectItem key={campaign.id} value={campaign.id}>
                {campaign.name} ({new Date(campaign.sent_at).toLocaleDateString()})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedCampaign && analytics && (
          <DetailedCampaignAnalytics analytics={analytics} />
        )}
      </div>
    </div>
  )
}

// Detailed Campaign Analytics Component
function DetailedCampaignAnalytics({ analytics }) {
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

  const deviceData = Object.entries(analytics.deviceBreakdown || {}).map(([device, count]) => ({
    name: device.charAt(0).toUpperCase() + device.slice(1),
    value: count
  }))

  const clientData = Object.entries(analytics.clientBreakdown || {}).slice(0, 5).map(([client, count]) => ({
    name: client,
    value: count
  }))

  return (
    <div className="mt-6 space-y-6">
      {/* Overview Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-gray-900">{analytics.overview.deliveryRate}%</div>
          <div className="text-sm text-gray-600">Delivery Rate</div>
        </div>
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-900">{analytics.overview.openRate}%</div>
          <div className="text-sm text-blue-600">Open Rate</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-900">{analytics.overview.clickRate}%</div>
          <div className="text-sm text-green-600">Click Rate</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-purple-900">{analytics.overview.clickToOpenRate}%</div>
          <div className="text-sm text-purple-600">Click-to-Open Rate</div>
        </div>
      </div>

      {/* Engagement Timeline */}
      {analytics.engagementTimeline && analytics.engagementTimeline.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h4 className="text-md font-semibold text-gray-900 mb-4">Engagement Over Time</h4>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.engagementTimeline}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="hour" stroke="#6b7280" label={{ value: 'Hours After Send', position: 'insideBottom', offset: -5 }} />
              <YAxis stroke="#6b7280" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="cumulativeOpened" stroke="#3b82f6" strokeWidth={2} name="Cumulative Opens" />
              <Line type="monotone" dataKey="cumulativeClicked" stroke="#10b981" strokeWidth={2} name="Cumulative Clicks" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Device & Client Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {deviceData.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h4 className="text-md font-semibold text-gray-900 mb-4">Device Breakdown</h4>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={deviceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {deviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {clientData.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h4 className="text-md font-semibold text-gray-900 mb-4">Email Client Breakdown</h4>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={clientData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {clientData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  )
}

