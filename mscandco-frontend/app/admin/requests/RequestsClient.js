'use client'

import { useState, useEffect } from 'react'
import {
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Calendar,
  Lock,
  User,
  Mail,
  Edit3,
  UserPlus,
  Settings
} from 'lucide-react'

export default function RequestsClient() {
  const [activeTab, setActiveTab] = useState('artist')
  const [artistRequests, setArtistRequests] = useState([])
  const [profileRequests, setProfileRequests] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('pending')
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [adminNotes, setAdminNotes] = useState('')
  const [error, setError] = useState(null)

  // Load all requests
  useEffect(() => {
    loadAllRequests()
  }, [statusFilter])

  const loadAllRequests = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Load artist requests and profile change requests using API routes
      const [artistResponse, profileResponse] = await Promise.all([
        fetch('/api/admin/artist-requests', {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        }),
        fetch('/api/admin/profile-change-requests', {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        })
      ])

      if (!artistResponse.ok) {
        const errorData = await artistResponse.json()
        throw new Error(errorData.error || 'Failed to load artist requests')
      }

      if (!profileResponse.ok) {
        const errorData = await profileResponse.json()
        throw new Error(errorData.error || 'Failed to load profile requests')
      }

      const artistData = await artistResponse.json()
      const profileData = await profileResponse.json()

      const filteredArtistRequests = statusFilter === 'all'
        ? artistData.requests || []
        : (artistData.requests || []).filter(req => req.status === statusFilter)

      const filteredProfileRequests = statusFilter === 'all'
        ? profileData.requests || []
        : (profileData.requests || []).filter(req => req.status === statusFilter)

      setArtistRequests(filteredArtistRequests)
      setProfileRequests(filteredProfileRequests)

    } catch (err) {
      console.error('Error loading requests:', err)
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleProcessRequest = async (action, requestType) => {
    if (!selectedRequest) return

    try {
      setIsProcessing(true)
      setError(null)

      const apiEndpoint = requestType === 'artist'
        ? '/api/admin/artist-requests'
        : '/api/admin/profile-change-requests'

      const response = await fetch(apiEndpoint, {
        method: requestType === 'artist' ? 'POST' : 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: selectedRequest.id,
          action: action,
          adminNotes: adminNotes,
          rejectionReason: action === 'reject' ? adminNotes : null
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || `Failed to ${action} request`)
      }

      setShowModal(false)
      setSelectedRequest(null)
      setAdminNotes('')
      loadAllRequests()

    } catch (err) {
      console.error(`Error ${action}ing request:`, err)
      setError(err.message)
    } finally {
      setIsProcessing(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'approved': return 'bg-green-100 text-green-800 border-green-200'
      case 'accepted': return 'bg-green-100 text-green-800 border-green-200'
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200'
      case 'declined': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />
      case 'approved':
      case 'accepted': return <CheckCircle className="h-4 w-4" />
      case 'rejected':
      case 'declined': return <XCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const formatFieldName = (fieldName) => {
    return fieldName.split(/(?=[A-Z])/).join(' ').replace(/^\w/, c => c.toUpperCase())
  }

  const getTotalRequestsCount = () => {
    return artistRequests.length + profileRequests.length
  }

  const getPendingRequestsCount = () => {
    return artistRequests.filter(r => r.status === 'pending').length +
           profileRequests.filter(r => r.status === 'pending').length
  }

  const renderArtistRequests = () => (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Artist Invitation Requests</h3>
        <p className="text-sm text-gray-600">Manage artist invitations and collaborations</p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Artist</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Label Admin</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {artistRequests.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                  No artist requests found.
                </td>
              </tr>
            ) : (
              artistRequests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {request.artist_stage_name || `${request.artist_first_name} ${request.artist_last_name}`.trim()}
                        </div>
                        <div className="text-sm text-gray-500">{request.requested_by_email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{request.label_name}</div>
                    <div className="text-sm text-gray-500">{request.requested_by_email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>
                      {getStatusIcon(request.status)}
                      <span className="capitalize">{request.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(request.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => {
                        setSelectedRequest({...request, requestType: 'artist'})
                        setShowModal(true)
                      }}
                      className="text-blue-600 hover:text-blue-900 flex items-center space-x-1"
                    >
                      <Eye className="h-4 w-4" />
                      <span>Review</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )

  const renderProfileRequests = () => (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Profile Change Requests</h3>
        <p className="text-sm text-gray-600">Review profile modification requests from artists</p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Artist</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Field</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current → Requested</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {profileRequests.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                  No profile change requests found.
                </td>
              </tr>
            ) : (
              profileRequests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center">
                        <Lock className="h-5 w-5 text-white" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {request.user_profiles?.artist_name || `${request.user_profiles?.first_name} ${request.user_profiles?.last_name}`.trim() || 'No Name'}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {request.user_profiles?.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">
                      {formatFieldName(request.field_name)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm max-w-xs">
                      <div className="text-gray-500 line-through truncate">
                        {request.current_value || 'Not set'}
                      </div>
                      <div className="text-gray-900 font-medium truncate">
                        {request.requested_value}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>
                      {getStatusIcon(request.status)}
                      <span className="capitalize">{request.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(request.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => {
                        setSelectedRequest({...request, requestType: 'profile'})
                        setShowModal(true)
                      }}
                      className="text-blue-600 hover:text-blue-900 flex items-center space-x-1"
                    >
                      <Eye className="h-4 w-4" />
                      <span>Review</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )

  const renderReviewModal = () => {
    if (!selectedRequest) return null

    const isArtistRequest = selectedRequest.requestType === 'artist'

    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white">
          <div className="mt-3">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900">
                {isArtistRequest ? 'Review Artist Request' : 'Review Profile Change Request'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Request Details */}
              {isArtistRequest ? (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Artist Invitation Details</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Artist:</span>
                      <span className="ml-2 text-gray-900">
                        {selectedRequest.artist_stage_name || `${selectedRequest.artist_first_name} ${selectedRequest.artist_last_name}`.trim()}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Label:</span>
                      <span className="ml-2 text-gray-900">{selectedRequest.label_name}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Invited by:</span>
                      <span className="ml-2 text-gray-900">{selectedRequest.requested_by_email}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Royalty Split:</span>
                      <span className="ml-2 text-gray-900">{selectedRequest.label_royalty_percent}%</span>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Artist Info for Profile Requests */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Artist Information</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Name:</span>
                        <span className="ml-2 text-gray-900">
                          {selectedRequest.user_profiles?.artist_name || `${selectedRequest.user_profiles?.first_name} ${selectedRequest.user_profiles?.last_name}`.trim()}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Email:</span>
                        <span className="ml-2 text-gray-900">{selectedRequest.user_profiles?.email}</span>
                      </div>
                    </div>
                  </div>

                  {/* Profile Change Details */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Requested Change</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Field</label>
                        <div className="mt-1 text-sm text-gray-900">{formatFieldName(selectedRequest.field_name)}</div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Current Value</label>
                        <div className="mt-1 text-sm text-gray-500 line-through">
                          {selectedRequest.current_value || 'Not set'}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Requested Value</label>
                        <div className="mt-1 text-sm text-gray-900 font-medium">
                          {selectedRequest.requested_value}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Reason</label>
                        <div className="mt-1 text-sm text-gray-900">
                          {selectedRequest.reason || 'No reason provided'}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Admin Notes */}
              {selectedRequest.status === 'pending' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Admin Notes (Optional)
                  </label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Add notes about your decision..."
                  />
                </div>
              )}

              {/* Existing Admin Notes */}
              {selectedRequest.admin_notes && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="text-sm font-semibold text-blue-900 mb-2">Admin Notes</h4>
                  <p className="text-sm text-blue-800">{selectedRequest.admin_notes}</p>
                  {selectedRequest.reviewed_at && (
                    <p className="text-xs text-blue-600 mt-2">
                      Reviewed on {new Date(selectedRequest.reviewed_at).toLocaleString()}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 mt-8">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
              {selectedRequest.status === 'pending' && (
                <>
                  <button
                    onClick={() => handleProcessRequest('reject', selectedRequest.requestType)}
                    disabled={isProcessing}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    {isProcessing ? 'Processing...' : (isArtistRequest ? 'Decline' : 'Reject')}
                  </button>
                  <button
                    onClick={() => handleProcessRequest('approve', selectedRequest.requestType)}
                    disabled={isProcessing}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {isProcessing ? 'Processing...' : (isArtistRequest ? 'Accept' : 'Approve')}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading requests...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-blue-100 p-3 rounded-lg">
            <Settings className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Request Management</h1>
            <p className="mt-1 text-sm text-gray-600">
              Centralized hub for all artist and profile change requests
            </p>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Total Requests</div>
            <div className="text-2xl font-bold text-gray-900">{getTotalRequestsCount()}</div>
            <div className="text-sm text-gray-600">All request types</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-yellow-600">Pending</div>
            <div className="text-2xl font-bold text-yellow-900">{getPendingRequestsCount()}</div>
            <div className="text-sm text-yellow-700">Awaiting review</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-blue-600">Artist Requests</div>
            <div className="text-2xl font-bold text-blue-900">{artistRequests.length}</div>
            <div className="text-sm text-blue-700">Invitation requests</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-amber-600">Profile Requests</div>
            <div className="text-2xl font-bold text-amber-900">{profileRequests.length}</div>
            <div className="text-sm text-amber-700">Profile changes</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('artist')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'artist'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <UserPlus className="h-4 w-4" />
                <span>Artist Requests</span>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  artistRequests.filter(r => r.status === 'pending').length > 0
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {artistRequests.filter(r => r.status === 'pending').length}
                </span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'profile'
                  ? 'border-amber-500 text-amber-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Lock className="h-4 w-4" />
                <span>Profile Requests</span>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  profileRequests.filter(r => r.status === 'pending').length > 0
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {profileRequests.filter(r => r.status === 'pending').length}
                </span>
              </div>
            </button>
          </nav>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit mt-6">
          {[
            { key: 'pending', label: 'Pending' },
            { key: 'approved', label: 'Approved' },
            { key: 'rejected', label: 'Rejected' },
            { key: 'all', label: 'All' }
          ].map(tab => {
            const currentRequests = activeTab === 'artist' ? artistRequests : profileRequests
            const count = tab.key === 'all' ? currentRequests.length : currentRequests.filter(r => r.status === tab.key).length

            return (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  statusFilter === tab.key
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label} ({count})
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="mt-8">
        {activeTab === 'artist' && renderArtistRequests()}
        {activeTab === 'profile' && renderProfileRequests()}
      </div>

      {/* Review Modal */}
      {showModal && renderReviewModal()}
    </div>
  )
}
