'use client'

/**
 * Touring Admin Client - Comprehensive Admin Backend for Touring Platform
 * Best-in-class features for managing tours, analytics, and operations
 */

import { useState, useEffect } from 'react'
import {
  Music, Search, TrendingUp, Calendar, DollarSign, Users, 
  MapPin, Clock, CheckCircle, XCircle, Edit2, Trash2, Eye,
  RefreshCw, AlertTriangle, Filter, Download, Plus, BarChart3,
  Globe, Building2, Activity, Target, Award, Zap
} from 'lucide-react'

export default function TouringAdminClient({ user }) {
  // State Management
  const [stats, setStats] = useState(null)
  const [tours, setTours] = useState([])
  const [loading, setLoading] = useState(true)
  const [statsLoading, setStatsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedTour, setSelectedTour] = useState(null)
  
  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [tourTypeFilter, setTourTypeFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState('desc')
  const [viewMode, setViewMode] = useState('dashboard') // dashboard, tours, users, analytics

  const limit = 50

  // Load stats on mount
  useEffect(() => {
    loadStats()
  }, [])

  // Load tours when filters change
  useEffect(() => {
    if (viewMode === 'tours' || viewMode === 'dashboard') {
      loadTours()
    }
  }, [viewMode, currentPage, statusFilter, tourTypeFilter, searchTerm, sortBy, sortOrder])

  const loadStats = async () => {
    setStatsLoading(true)
    try {
      const response = await fetch('/api/admin/touring/stats', {
        credentials: 'include'
      })
      
      if (!response.ok) throw new Error('Failed to load statistics')
      
      const data = await response.json()
      if (data.success) {
        setStats(data.stats)
      }
    } catch (err) {
      console.error('Error loading stats:', err)
      setError(err.message)
    } finally {
      setStatsLoading(false)
    }
  }

  const loadTours = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
        sortBy,
        sortOrder
      })
      
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (tourTypeFilter !== 'all') params.append('tourType', tourTypeFilter)
      if (searchTerm) params.append('search', searchTerm)

      const response = await fetch(`/api/admin/touring/tours?${params}`, {
        credentials: 'include'
      })
      
      if (!response.ok) throw new Error('Failed to load tours')
      
      const data = await response.json()
      if (data.success) {
        setTours(data.tours || [])
      }
    } catch (err) {
      console.error('Error loading tours:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteTour = async (tourId) => {
    if (!confirm('Are you sure you want to delete this tour? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/touring/tours/${tourId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (!response.ok) throw new Error('Failed to delete tour')
      
      loadTours()
      loadStats()
      setSelectedTour(null)
    } catch (err) {
      console.error('Error deleting tour:', err)
      alert('Error deleting tour: ' + err.message)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200'
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'planning': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatCurrency = (amount, currency = 'GBP') => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency
    }).format(amount || 0)
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  if (statsLoading && !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="w-12 h-12 border-b-2 border-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading touring statistics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 flex items-center gap-3">
                <Music className="w-10 h-10" />
                Touring Administration
              </h1>
              <p className="text-xl text-blue-100 max-w-3xl">
                Comprehensive management platform for tours, analytics, and operations
              </p>
            </div>
            <button
              onClick={() => { loadStats(); loadTours(); }}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* View Mode Tabs */}
        <div className="mb-6 flex gap-2 border-b border-gray-200">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
            { id: 'tours', label: 'All Tours', icon: Music },
            { id: 'users', label: 'User Activity', icon: Users },
            { id: 'analytics', label: 'Analytics', icon: TrendingUp }
          ].map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setViewMode(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors border-b-2 ${
                  viewMode === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Dashboard View */}
        {viewMode === 'dashboard' && stats && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                icon={Music}
                title="Total Tours"
                value={stats.overview.totalTours}
                change={`${stats.overview.recentTours} this month`}
                color="blue"
              />
              <MetricCard
                icon={Activity}
                title="Active Tours"
                value={stats.overview.activeTours}
                subtitle={`${stats.overview.planningTours} in planning`}
                color="green"
              />
              <MetricCard
                icon={CheckCircle}
                title="Completed"
                value={stats.overview.completedTours}
                subtitle={`${stats.overview.cancelledTours} cancelled`}
                color="purple"
              />
              <MetricCard
                icon={DollarSign}
                title="Total Budget"
                value={formatCurrency(stats.overview.totalBudget)}
                subtitle={`${stats.overview.uniqueUsers} active users`}
                color="amber"
              />
            </div>

            {/* Breakdown Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  Tours by Type
                </h3>
                <div className="space-y-3">
                  {Object.entries(stats.breakdown.byType || {}).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <span className="text-gray-700 capitalize">{type.replace(/_/g, ' ')}</span>
                      <span className="font-semibold text-gray-900">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-green-600" />
                  Tours by Status
                </h3>
                <div className="space-y-3">
                  {Object.entries(stats.breakdown.byStatus || {}).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status)}`}>
                        {status}
                      </span>
                      <span className="font-semibold text-gray-900">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Tours */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Clock className="w-5 h-5 text-gray-600" />
                  Recent Tours
                </h3>
                <button
                  onClick={() => setViewMode('tours')}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View All →
                </button>
              </div>
              <ToursTable tours={tours.slice(0, 10)} onSelect={setSelectedTour} onDelete={handleDeleteTour} getStatusColor={getStatusColor} formatCurrency={formatCurrency} formatDate={formatDate} />
            </div>
          </div>
        )}

        {/* Tours View */}
        {viewMode === 'tours' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search tours..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="planning">Planning</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="created_at">Sort by Date</option>
                  <option value="name">Sort by Name</option>
                  <option value="budget">Sort by Budget</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  <Filter className="w-4 h-4" />
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>
            </div>

            {/* Tours Table */}
            {loading ? (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-b-2 border-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading tours...</p>
              </div>
            ) : (
              <ToursTable 
                tours={tours} 
                onSelect={setSelectedTour} 
                onDelete={handleDeleteTour} 
                getStatusColor={getStatusColor}
                formatCurrency={formatCurrency}
                formatDate={formatDate}
              />
            )}
          </div>
        )}

        {/* Users View */}
        {viewMode === 'users' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">User Activity</h3>
            <p className="text-gray-600">User activity view coming soon...</p>
          </div>
        )}

        {/* Analytics View */}
        {viewMode === 'analytics' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Analytics & Reports</h3>
            <p className="text-gray-600">Advanced analytics coming soon...</p>
          </div>
        )}
      </div>

      {/* Tour Detail Modal */}
      {selectedTour && (
        <TourDetailModal 
          tour={selectedTour} 
          onClose={() => setSelectedTour(null)}
          onDelete={handleDeleteTour}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
          getStatusColor={getStatusColor}
        />
      )}
    </div>
  )
}

// Metric Card Component
function MetricCard({ icon: Icon, title, value, subtitle, change, color }) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    amber: 'bg-amber-100 text-amber-600'
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
      <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
      {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
      {change && <p className="text-sm text-green-600 mt-2">{change}</p>}
    </div>
  )
}

// Tours Table Component
function ToursTable({ tours, onSelect, onDelete, getStatusColor, formatCurrency, formatDate }) {
  if (tours.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-12 text-center">
        <Music className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No tours found</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tour</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Artist</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tours.map((tour) => (
              <tr key={tour.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{tour.name}</div>
                  <div className="text-sm text-gray-500 capitalize">{tour.tour_type?.replace(/_/g, ' ')}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{tour.artist_name}</div>
                  <div className="text-sm text-gray-500">{tour.artist_email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(tour.start_date)} - {formatDate(tour.end_date)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatCurrency(tour.budget, tour.currency)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(tour.status)}`}>
                    {tour.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onSelect(tour)}
                      className="text-blue-600 hover:text-blue-900"
                      title="View Details"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => onDelete(tour.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete Tour"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Tour Detail Modal Component
function TourDetailModal({ tour, onClose, onDelete, formatCurrency, formatDate, getStatusColor }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">{tour.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-500">Artist</label>
              <p className="text-lg text-gray-900">{tour.artist_name}</p>
              <p className="text-sm text-gray-500">{tour.artist_email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Status</label>
              <div className="mt-1">
                <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(tour.status)}`}>
                  {tour.status}
                </span>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Start Date</label>
              <p className="text-lg text-gray-900">{formatDate(tour.start_date)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">End Date</label>
              <p className="text-lg text-gray-900">{formatDate(tour.end_date)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Budget</label>
              <p className="text-lg text-gray-900">{formatCurrency(tour.budget, tour.currency)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Tour Type</label>
              <p className="text-lg text-gray-900 capitalize">{tour.tour_type?.replace(/_/g, ' ')}</p>
            </div>
          </div>
          {tour.description && (
            <div>
              <label className="text-sm font-medium text-gray-500">Description</label>
              <p className="text-gray-900 mt-1">{tour.description}</p>
            </div>
          )}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={() => { onDelete(tour.id); onClose(); }}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Delete Tour
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
