'use client'

// Label Admin Artists Page - COMPLETE REBUILD
import { useState, useEffect } from 'react'
import { useUser } from '@/components/providers/SupabaseProvider'
import { createClient } from '@supabase/supabase-js'
import { 
  Users, Plus, Search, Send, CheckCircle, XCircle, Clock,
  AlertTriangle, User, Mail, Calendar, TrendingUp
} from 'lucide-react'
import { PageLoading } from '@/components/ui/LoadingSpinner'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function ArtistsClient() {
  const { user, session } = useUser()
  const [acceptedArtists, setAcceptedArtists] = useState([])
  const [artistRequests, setArtistRequests] = useState([])
  const [dataLoading, setDataLoading] = useState(true)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteForm, setInviteForm] = useState({
    firstName: '',
    lastName: '',
    artistName: '',
    message: '',
    labelSplit: 30,
    artistSplit: 70
  })
  const [inviting, setInviting] = useState(false)
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [notification, setNotification] = useState({
    show: false, type: '', title: '', message: ''
  })

  useEffect(() => {
    if (user && session) {
      loadLabelAdminData()
    }
  }, [user, session])

  const loadLabelAdminData = async () => {
    try {
      setDataLoading(true)
      await Promise.all([
        fetchAcceptedArtists(),
        fetchArtistRequests()
      ])
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setDataLoading(false)
    }
  }

  const fetchAcceptedArtists = async () => {
    try {
      const response = await fetch('/api/labeladmin/accepted-artists', {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      })
      
      if (!response.ok) throw new Error('Failed to fetch artists')
      
      const data = await response.json()
      console.log('✅ Accepted artists loaded:', data.artists?.length || 0)
      console.log('📊 Artists data:', data.artists)
      
      // API now returns release counts, just add joinDate
      const artistsWithJoinDate = (data.artists || []).map(artist => {
        console.log(`📊 Artist ${artist.artistName}: total=${artist.totalReleases}, live=${artist.liveReleases}, drafts=${artist.draftReleases}`)
        return {
          ...artist,
          joinDate: artist.affiliatedSince
        }
      })
      
      setAcceptedArtists(artistsWithJoinDate)
    } catch (error) {
      console.error('Error loading accepted artists:', error)
      setAcceptedArtists([])
    }
  }

  const fetchArtistRequests = async () => {
    try {
      const response = await fetch('/api/labeladmin/affiliation-requests', {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      })

      if (!response.ok) throw new Error('Failed to fetch requests')

      const data = await response.json()
      console.log('✅ Affiliation requests loaded:', data.requests?.length || 0)
      setArtistRequests(data.requests || [])
    } catch (error) {
      console.error('Error loading requests:', error)
      setArtistRequests([])
    }
  }

  const sendArtistInvitation = async (e) => {
    e?.preventDefault()
    setInviting(true)

    try {
      const response = await fetch('/api/labeladmin/invite-artist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(inviteForm)
      })

      const result = await response.json()

      if (response.ok) {
        showNotification('success', 'Invitation Sent!', `Invitation sent to ${inviteForm.artistName}`)
        setShowInviteModal(false)
        setInviteForm({ 
          firstName: '', 
          lastName: '', 
          artistName: '', 
          message: '', 
          labelSplit: 30, 
          artistSplit: 70 
        })
        fetchArtistRequests() // Refresh requests list
      } else {
        // Keep modal open so user can correct the error
        showNotification('error', 'Failed to Send Invitation', result.error || 'Please try again')
        // Don't close the modal - let user fix the issue
      }
    } catch (error) {
      console.error('Error inviting artist:', error)
      showNotification('error', 'Error', 'Failed to send invitation')
    } finally {
      setInviting(false)
    }
  }

  const removeArtist = async (affiliationId) => {
    if (!confirm('Remove this artist from your roster? This will end your affiliation.')) return
    
    try {
      const { error} = await supabase
        .from('label_artist_affiliations')
        .update({ status: 'terminated' })
        .eq('id', affiliationId)

      if (error) throw error

      showNotification('success', 'Artist Removed', 'Artist has been removed from your roster')
      fetchAcceptedArtists() // Refresh list
    } catch (error) {
      console.error('Error removing artist:', error)
      showNotification('error', 'Remove Failed', error.message)
    }
  }

  const showNotification = (type, title, message) => {
    setNotification({ show: true, type, title, message })
    setTimeout(() => setNotification({ show: false, type: '', title: '', message: '' }), 5000)
  }

  if (dataLoading) {
    return <PageLoading message="Loading your artists and requests..." />
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-8 text-white mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center mb-2">
              <Users className="w-8 h-8 mr-3" />
              <h1 className="text-3xl font-bold">My Artists</h1>
            </div>
            <p className="text-green-100 text-lg">
              Manage your roster - {acceptedArtists.length} artists, {artistRequests.filter(r => r.status === 'pending').length} pending requests
            </p>
          </div>
          <button
            onClick={() => setShowInviteModal(true)}
            className="flex items-center px-6 py-3 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Invite Artist
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">My Artists</p>
              <p className="text-3xl font-bold text-gray-900">{acceptedArtists.length}</p>
              <p className="text-xs text-green-600">
                {acceptedArtists.length} active partnerships
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Releases</p>
              <p className="text-3xl font-bold text-gray-900">
                {acceptedArtists.reduce((sum, artist) => sum + (artist.totalReleases || 0), 0)}
              </p>
              <p className="text-xs text-blue-600">
                {acceptedArtists.reduce((sum, artist) => sum + (artist.liveReleases || 0), 0)} live
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Pending Requests</p>
              <p className="text-3xl font-bold text-gray-900">
                {artistRequests.filter(r => r.status === 'pending').length}
              </p>
              <p className="text-xs text-orange-600">
                {artistRequests.filter(r => r.status === 'accepted').length} accepted total
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* My Artists List */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">My Artists ({acceptedArtists.length})</h3>
          <p className="text-sm text-gray-600">Artists who have accepted your label invitation</p>
        </div>

        {acceptedArtists.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No artists in your roster yet</p>
            <p className="text-gray-400 text-sm mb-6">Start by inviting artists to join your label</p>
            <button
              onClick={() => setShowInviteModal(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Invite Your First Artist
            </button>
          </div>
        ) : (
          <div className="space-y-3 p-6">
            {acceptedArtists.map(artist => (
              <div key={artist.affiliationId} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{artist.artistName}</p>
                  <p className="text-sm text-gray-600">{artist.artistEmail}</p>
                  <p className="text-xs text-gray-500">
                    Revenue split: You {artist.labelPercentage}% / Artist {100 - artist.labelPercentage}%
                  </p>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-900">{artist.totalReleases || 0}</p>
                    <p className="text-xs text-gray-500">Total Releases</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-green-600">{artist.liveReleases || 0}</p>
                    <p className="text-xs text-gray-500">Live</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-blue-600">{artist.draftReleases || 0}</p>
                    <p className="text-xs text-gray-500">Drafts</p>
                  </div>
                  <div className="text-right space-y-2">
                    <p className="text-xs text-gray-500">
                      Joined {new Date(artist.joinDate).toLocaleDateString()}
                    </p>
                    <div className="flex items-center space-x-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                        Active
                      </span>
                      <button 
                        onClick={() => removeArtist(artist.affiliationId)}
                        className="text-xs text-red-600 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Artist Requests Status */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Artist Invitation Requests ({artistRequests.length})</h3>
          <p className="text-sm text-gray-600">Track your sent invitations and responses</p>
        </div>

        {artistRequests.length === 0 ? (
          <div className="text-center py-12">
            <Send className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No invitations sent yet</p>
            <p className="text-gray-400 text-sm">Start building your roster by inviting artists</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {artistRequests.map((request) => (
              <div key={request.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      request.status === 'accepted' ? 'bg-green-100' :
                      request.status === 'declined' ? 'bg-red-100' : 'bg-yellow-100'
                    }`}>
                      {request.status === 'accepted' ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : request.status === 'declined' ? (
                        <XCircle className="w-5 h-5 text-red-600" />
                      ) : (
                        <Clock className="w-5 h-5 text-yellow-600" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">
                        {request.artist_name || `${request.artist_first_name} ${request.artist_last_name}` || 'Unknown Artist'}
                      </h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                          request.status === 'accepted' ? 'bg-green-100 text-green-800' :
                          request.status === 'declined' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {request.status.toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-500">
                          Sent {new Date(request.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    {request.status === 'pending' && (
                      <div>Awaiting response</div>
                    )}
                    {request.responded_at && (
                      <div>Responded {new Date(request.responded_at).toLocaleDateString()}</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Artist Invitation Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="bg-gradient-to-r from-green-600 to-blue-600 p-6 text-white">
              <h3 className="text-xl font-bold">Invite Artist to Label</h3>
              <p className="text-green-100">Fill in the artist details below</p>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                <input
                  type="text"
                  value={inviteForm.firstName}
                  onChange={(e) => setInviteForm(prev => ({ ...prev, firstName: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Artist's first name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                <input
                  type="text"
                  value={inviteForm.lastName}
                  onChange={(e) => setInviteForm(prev => ({ ...prev, lastName: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Artist's last name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Artist Name *</label>
                <input
                  type="text"
                  value={inviteForm.artistName}
                  onChange={(e) => setInviteForm(prev => ({ ...prev, artistName: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Artist's stage name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Personal Message (Optional)</label>
                <textarea
                  value={inviteForm.message}
                  onChange={(e) => setInviteForm(prev => ({ ...prev, message: e.target.value }))}
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add a personal message to your invitation..."
                />
              </div>

              {/* Revenue Split Configuration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Revenue Split</label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Your Split (Label)</label>
                    <div className="flex items-center">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={inviteForm.labelSplit}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0
                          setInviteForm(prev => ({
                            ...prev,
                            labelSplit: val,
                            artistSplit: 100 - val
                          }))
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <span className="ml-2 text-gray-600">%</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Artist Split</label>
                    <div className="flex items-center">
                      <input
                        type="number"
                        value={inviteForm.artistSplit}
                        readOnly
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                      />
                      <span className="ml-2 text-gray-600">%</span>
                    </div>
                  </div>
                </div>
                
                <div className={`text-xs mt-2 ${
                  inviteForm.labelSplit + inviteForm.artistSplit === 100 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  Total: {inviteForm.labelSplit + inviteForm.artistSplit}% 
                  {inviteForm.labelSplit + inviteForm.artistSplit !== 100 && ' (Must equal 100%)'}
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertTriangle className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">How it works:</p>
                    <p>The artist will receive your invitation and can accept or decline to join your label.</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  disabled={inviting}
                >
                  Cancel
                </button>
                <button
                  onClick={sendArtistInvitation}
                  disabled={inviting || !inviteForm.firstName.trim() || !inviteForm.lastName.trim() || !inviteForm.artistName.trim() || (inviteForm.labelSplit + inviteForm.artistSplit !== 100)}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {inviting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Invitation
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notification Modal */}
      {notification.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4">
            <div className={`flex items-center mb-4 ${
              notification.type === 'error' ? 'text-red-600' : 'text-green-600'
            }`}>
              {notification.type === 'error' ? (
                <AlertTriangle className="w-6 h-6 mr-3" />
              ) : (
                <CheckCircle className="w-6 h-6 mr-3" />
              )}
              <h3 className="text-lg font-semibold">{notification.title}</h3>
            </div>
            <p className="text-gray-600 mb-6">{notification.message}</p>
            <div className="flex justify-end">
              <button
                onClick={() => setNotification({ show: false, type: '', title: '', message: '' })}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
