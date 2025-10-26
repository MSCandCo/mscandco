'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { FaSearch } from 'react-icons/fa'
import { Eye, CheckCircle, XCircle, Send, Edit, X, Inbox, RefreshCw } from 'lucide-react'
import { PageLoading } from '@/components/ui/LoadingSpinner';

const RELEASE_STATUSES = {
  draft: 'Draft',
  submitted: 'Submitted',
  in_review: 'In Review',
  revision: 'Revision Requested',
  completed: 'Completed',
  live: 'Live'
}

const getStatusLabel = (status) => {
  return RELEASE_STATUSES[status] || status
}

const getStatusColor = (status) => {
  const colors = {
    draft: 'bg-gray-100 text-gray-800',
    submitted: 'bg-blue-100 text-blue-800',
    in_review: 'bg-orange-100 text-orange-800',
    revision: 'bg-red-100 text-red-800',
    completed: 'bg-indigo-100 text-indigo-800',
    live: 'bg-green-100 text-green-800'
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

export default function DistributionHubClient({ user }) {
  const supabase = createClient()
  const [activeTab, setActiveTab] = useState('queue')
  const [releases, setReleases] = useState([])
  const [revisions, setRevisions] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [editingRelease, setEditingRelease] = useState(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const statusParam = urlParams.get('status')
    if (statusParam && ['submitted', 'in_review', 'completed', 'live'].includes(statusParam)) {
      setStatusFilter(statusParam)
    }
    loadAllData()
  }, [])

  const loadReleases = async () => {
    try {
      console.log('🔄 Fetching queue releases from API...')
      const response = await fetch('/api/distribution/releases?type=queue')

      console.log(`📡 Response status: ${response.status} ${response.statusText}`)

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`❌ API response not OK: ${response.status}`, errorText)
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const result = await response.json()
      console.log('📦 Queue API response:', result)

      if (result.success) {
        console.log(`✅ Loaded ${result.releases?.length || 0} queue releases`)
        setReleases(result.releases || [])
      } else {
        console.error('❌ API returned error:', result.error)
        throw new Error(result.error || 'Failed to load releases')
      }
    } catch (error) {
      console.error('❌ Error loading releases:', error)
      console.error('❌ Error stack:', error.stack)
      setReleases([])
    }
  }

  const loadRevisions = async () => {
    try {
      console.log('🔄 Fetching revisions from API...')
      const response = await fetch('/api/distribution/releases?type=revisions')

      console.log(`📡 Response status: ${response.status} ${response.statusText}`)

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`❌ API response not OK: ${response.status}`, errorText)
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const result = await response.json()
      console.log('📦 Revisions API response:', result)

      if (result.success) {
        console.log(`✅ Loaded ${result.releases?.length || 0} revisions`)
        setRevisions(result.releases || [])
      } else {
        console.error('❌ API returned error:', result.error)
        throw new Error(result.error || 'Failed to load revisions')
      }
    } catch (error) {
      console.error('❌ Error loading revisions:', error)
      console.error('❌ Error stack:', error.stack)
      setRevisions([])
    }
  }

  const loadAllData = async () => {
    setLoading(true)
    await Promise.all([loadReleases(), loadRevisions()])
    setLoading(false)
  }

  const filteredReleases = useMemo(() => {
    let filtered = releases

    if (statusFilter !== 'all') {
      filtered = filtered.filter(r => r.status === statusFilter)
    }

    if (searchTerm) {
      filtered = filtered.filter(r =>
        r.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.artist_name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    return filtered
  }, [releases, statusFilter, searchTerm])

  const handleStatusChange = async (releaseId, newStatus) => {
    try {
      const { error } = await supabase
        .from('releases')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', releaseId)

      if (error) throw error

      loadAllData()

      showNotification(`Release status updated to ${getStatusLabel(newStatus)}`, 'success')
    } catch (error) {
      console.error('Error updating status:', error)
      showNotification('Failed to update status', 'error')
    }
  }

  const handleSendToReview = async (releaseId) => {
    try {
      const { error } = await supabase
        .from('releases')
        .update({
          status: 'in_review',
          updated_at: new Date().toISOString()
        })
        .eq('id', releaseId)

      if (error) throw error

      loadAllData()
      showNotification('Release sent back to review', 'success')
    } catch (error) {
      console.error('Error sending to review:', error)
      showNotification('Failed to send release to review', 'error')
    }
  }

  const handleEditMetadata = async (releaseId, updates) => {
    try {
      const { error } = await supabase
        .from('releases')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', releaseId)

      if (error) throw error

      loadAllData()
      setIsEditModalOpen(false)
      setEditingRelease(null)
      showNotification('Release metadata updated successfully', 'success')
    } catch (error) {
      console.error('Error updating metadata:', error)
      showNotification('Failed to update metadata', 'error')
    }
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
        max-width: 400px;
      ">
        ${message}
      </div>
    `
    document.body.appendChild(notificationDiv)
    setTimeout(() => document.body.removeChild(notificationDiv), 4000)
  }

  const stats = useMemo(() => ({
    total: releases.length,
    submitted: releases.filter(r => r.status === 'submitted').length,
    inReview: releases.filter(r => r.status === 'in_review').length,
    completed: releases.filter(r => r.status === 'completed').length,
    live: releases.filter(r => r.status === 'live').length,
    revisions: revisions.length
  }), [releases, revisions])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading distribution queue...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900">Distribution Hub</h1>
          <p className="mt-2 text-gray-600">Review and manage submitted releases and revisions</p>

          {/* Tab Navigation */}
          <div className="flex gap-2 mt-6">
            <button
              onClick={() => setActiveTab('queue')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'queue'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Inbox className="w-5 h-5" />
              <span>Distribution Queue</span>
              {stats.total > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                  activeTab === 'queue' ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-800'
                }`}>
                  {stats.total}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('revisions')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'revisions'
                  ? 'bg-orange-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <RefreshCw className="w-5 h-5" />
              <span>Revisions</span>
              {stats.revisions > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                  activeTab === 'revisions' ? 'bg-orange-500 text-white' : 'bg-orange-100 text-orange-800'
                }`}>
                  {stats.revisions}
                </span>
              )}
            </button>
          </div>

          {/* Stats - Only show for Queue tab */}
          {activeTab === 'queue' && (
            <div className="grid grid-cols-5 gap-4 mt-6">
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-800">{stats.submitted}</div>
                <div className="text-sm text-blue-700">Submitted</div>
              </div>
              <div className="bg-orange-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-orange-800">{stats.inReview}</div>
                <div className="text-sm text-orange-700">In Review</div>
              </div>
              <div className="bg-indigo-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-indigo-800">{stats.completed}</div>
                <div className="text-sm text-indigo-700">Completed</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-800">{stats.live}</div>
                <div className="text-sm text-green-700">Live</div>
              </div>
            </div>
          )}

          {/* Revisions Stats */}
          {activeTab === 'revisions' && (
            <div className="grid grid-cols-1 gap-4 mt-6 max-w-xs">
              <div className="bg-orange-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-orange-800">{stats.revisions}</div>
                <div className="text-sm text-orange-700">Total Revisions</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filters - Only for Queue tab */}
      {activeTab === 'queue' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-white rounded-lg shadow-sm border p-4 flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search releases..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg"
                />
              </div>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">All Status</option>
              <option value="submitted">Submitted</option>
              <option value="in_review">In Review</option>
              <option value="completed">Completed</option>
              <option value="live">Live</option>
            </select>
          </div>
        </div>
      )}

      {/* Queue Table */}
      {activeTab === 'queue' && (
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
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Release Date
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
                      {release.artist_name || 'Unknown Artist'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(release.status)}`}>
                        {getStatusLabel(release.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {release.release_date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingRelease(release)
                            setIsEditModalOpen(true)
                          }}
                          className="text-indigo-600 hover:text-indigo-900 flex items-center gap-1"
                          title="Edit Metadata"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {release.status === 'submitted' && (
                          <button
                            onClick={() => handleStatusChange(release.id, 'in_review')}
                            className="text-orange-600 hover:text-orange-900 flex items-center gap-1"
                            title="Move to Review"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        )}
                        {release.status === 'in_review' && (
                          <>
                            <button
                              onClick={() => handleStatusChange(release.id, 'completed')}
                              className="text-green-600 hover:text-green-900 flex items-center gap-1"
                              title="Approve & Complete"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleStatusChange(release.id, 'revision')}
                              className="text-red-600 hover:text-red-900 flex items-center gap-1"
                              title="Request Revision"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {release.status === 'completed' && (
                          <button
                            onClick={() => handleStatusChange(release.id, 'live')}
                            className="text-green-600 hover:text-green-900 flex items-center gap-1"
                            title="Mark as Live"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Revisions Table */}
      {activeTab === 'revisions' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            {revisions.length === 0 ? (
              <div className="p-12 text-center">
                <RefreshCw className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No revisions</h3>
                <p className="text-gray-600">There are currently no releases requiring revisions.</p>
              </div>
            ) : (
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
                      Last Updated
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {revisions.map((release) => (
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
                        {release.artist_name || 'Unknown Artist'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(release.updated_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleSendToReview(release.id)}
                            className="px-3 py-1 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-1"
                            title="Send back to Review"
                          >
                            <Send className="w-4 h-4" />
                            <span>Send to Review</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Edit Metadata Modal */}
      {isEditModalOpen && editingRelease && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Edit Release Metadata</h3>
              <button
                onClick={() => {
                  setIsEditModalOpen(false)
                  setEditingRelease(null)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={editingRelease.title}
                    onChange={(e) => setEditingRelease({...editingRelease, title: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Genre</label>
                  <input
                    type="text"
                    value={editingRelease.genre || ''}
                    onChange={(e) => setEditingRelease({...editingRelease, genre: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Release Date</label>
                  <input
                    type="date"
                    value={editingRelease.release_date}
                    onChange={(e) => setEditingRelease({...editingRelease, release_date: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> You cannot edit artwork or audio files. If these need changes, push the release back to draft.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => {
                  setIsEditModalOpen(false)
                  setEditingRelease(null)
                }}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={() => handleEditMetadata(editingRelease.id, {
                  title: editingRelease.title,
                  genre: editingRelease.genre,
                  release_date: editingRelease.release_date
                })}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
