'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
import { PageLoading } from '@/components/ui/LoadingSpinner';
  TrendingUp,
  DollarSign,
  BarChart3,
  FileText,
  Edit,
  Save,
  X,
  Search,
  Download
} from 'lucide-react'

function showNotification(message, type = 'success') {
  const existingToast = document.getElementById('notification-toast')
  if (existingToast) {
    existingToast.remove()
  }

  const toast = document.createElement('div')
  toast.id = 'notification-toast'
  toast.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${
    type === 'success' ? 'bg-green-500' : 'bg-red-500'
  } text-white`
  toast.textContent = message
  document.body.appendChild(toast)

  setTimeout(() => toast.remove(), 3000)
}

export default function RevenueReportingClient({ user }) {
  const supabase = createClient()
  const [releases, setReleases] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [dateRange, setDateRange] = useState('all')
  const [editingEarnings, setEditingEarnings] = useState(null)
  const [editingStreams, setEditingStreams] = useState(null)

  useEffect(() => {
    loadReleases()
  }, [])

  const loadReleases = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('releases')
        .select('*')
        .eq('status', 'live')
        .order('release_date', { ascending: false })

      if (error) throw error

      setReleases(data || [])
    } catch (error) {
      console.error('Error loading releases:', error)
      showNotification('Failed to load releases', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateEarnings = async (releaseId, earnings, streams) => {
    try {
      const { error } = await supabase
        .from('releases')
        .update({
          partner_earnings: earnings,
          partner_streams: streams,
          updated_at: new Date().toISOString()
        })
        .eq('id', releaseId)

      if (error) throw error

      loadReleases()
      setEditingEarnings(null)
      setEditingStreams(null)
      showNotification('Earnings and analytics updated successfully', 'success')
    } catch (error) {
      console.error('Error updating earnings:', error)
      showNotification('Failed to update earnings', 'error')
    }
  }

  const exportToCSV = () => {
    const headers = ['Release', 'Artist', 'Release Date', 'Streams', 'Earnings (£)']
    const rows = filteredReleases.map(r => [
      r.title || '',
      r.artist_name || '',
      r.release_date || '',
      r.partner_streams || 0,
      (r.partner_earnings || 0).toFixed(2)
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `revenue-report-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const filteredReleases = useMemo(() => {
    let filtered = releases

    if (searchTerm) {
      filtered = filtered.filter(r =>
        r.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.artist_name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Date range filtering could be implemented here if needed

    return filtered
  }, [releases, searchTerm, dateRange])

  const stats = useMemo(() => {
    const totalEarnings = filteredReleases.reduce((sum, r) => sum + (r.partner_earnings || 0), 0)
    const totalStreams = filteredReleases.reduce((sum, r) => sum + (r.partner_streams || 0), 0)

    return {
      totalReleases: filteredReleases.length,
      totalEarnings,
      totalStreams,
      avgEarningsPerRelease: filteredReleases.length > 0 ? totalEarnings / filteredReleases.length : 0
    }
  }, [filteredReleases])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading revenue data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900">Revenue & Analytics Reporting</h1>
          <p className="mt-2 text-gray-600">Report earnings and analytics for distributed assets</p>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mt-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-blue-700 mb-2">
                <FileText className="w-5 h-5" />
                <span className="text-sm font-medium">Total Releases</span>
              </div>
              <div className="text-2xl font-bold text-blue-900">{stats.totalReleases}</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-700 mb-2">
                <DollarSign className="w-5 h-5" />
                <span className="text-sm font-medium">Total Earnings</span>
              </div>
              <div className="text-2xl font-bold text-green-900">£{stats.totalEarnings.toFixed(2)}</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-purple-700 mb-2">
                <TrendingUp className="w-5 h-5" />
                <span className="text-sm font-medium">Total Streams</span>
              </div>
              <div className="text-2xl font-bold text-purple-900">{stats.totalStreams.toLocaleString()}</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-orange-700 mb-2">
                <BarChart3 className="w-5 h-5" />
                <span className="text-sm font-medium">Avg per Release</span>
              </div>
              <div className="text-2xl font-bold text-orange-900">£{stats.avgEarningsPerRelease.toFixed(2)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm border p-4 flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search releases or artists..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Time</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Releases Table */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Release
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Artist
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Release Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Streams
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Earnings (£)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredReleases.map((release) => (
                <tr key={release.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {release.artwork_url && (
                        <img
                          src={release.artwork_url}
                          alt={release.title}
                          className="h-10 w-10 rounded object-cover mr-3"
                        />
                      )}
                      <div className="text-sm font-medium text-gray-900">{release.title}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {release.artist_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {release.release_date ? new Date(release.release_date).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {editingStreams === release.id ? (
                      <input
                        type="number"
                        defaultValue={release.partner_streams || 0}
                        className="w-24 px-2 py-1 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        id={`streams-${release.id}`}
                      />
                    ) : (
                      <span>{(release.partner_streams || 0).toLocaleString()}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {editingEarnings === release.id ? (
                      <input
                        type="number"
                        step="0.01"
                        defaultValue={release.partner_earnings || 0}
                        className="w-24 px-2 py-1 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        id={`earnings-${release.id}`}
                      />
                    ) : (
                      <span>£{(release.partner_earnings || 0).toFixed(2)}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      {editingEarnings === release.id ? (
                        <>
                          <button
                            onClick={() => {
                              const earnings = parseFloat(document.getElementById(`earnings-${release.id}`).value)
                              const streams = parseInt(document.getElementById(`streams-${release.id}`).value)
                              handleUpdateEarnings(release.id, earnings, streams)
                            }}
                            className="text-green-600 hover:text-green-900 flex items-center gap-1"
                            title="Save"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingEarnings(null)
                              setEditingStreams(null)
                            }}
                            className="text-red-600 hover:text-red-900 flex items-center gap-1"
                            title="Cancel"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingEarnings(release.id)
                            setEditingStreams(release.id)
                          }}
                          className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                          title="Edit Earnings & Analytics"
                        >
                          <Edit className="w-4 h-4" />
                          <span>Report</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredReleases.length === 0 && (
            <div className="p-12 text-center">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No live releases</h3>
              <p className="text-gray-600">There are currently no live releases to report on.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
