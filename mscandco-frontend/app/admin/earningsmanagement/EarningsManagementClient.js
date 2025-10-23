'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Users, DollarSign, Music, Search, TrendingUp, Loader2, XCircle,
  RefreshCw, AlertTriangle, Calendar, Clock, CheckCircle, Edit2, Trash2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import AddEarningsForm from '@/components/admin/AddEarningsForm'

export default function EarningsManagementClient({ user }) {
  const supabase = createClient()

  // State
  const [artists, setArtists] = useState([])
  const [searchResults, setSearchResults] = useState([])
  const [selectedArtist, setSelectedArtist] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [earningsHistory, setEarningsHistory] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [searching, setSearching] = useState(false)
  const [editingEntry, setEditingEntry] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)

  // Load artists (both artists and label admins who can have earnings)
  useEffect(() => {
    if (user) {
      loadArtists()
    }
  }, [user])

  // Note: Real-time subscriptions removed to match staging implementation
  // We rely on manual refresh after updates instead

  // Search functionality with debounce
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults(artists.slice(0, 10))
      setShowDropdown(false)
      return
    }

    setSearching(true)
    setShowDropdown(true)

    const timeoutId = setTimeout(() => {
      const filtered = artists.filter(artist => {
        const searchLower = searchTerm.toLowerCase()
        const fullName = `${artist.first_name || ''} ${artist.last_name || ''}`.trim().toLowerCase()
        const artistName = (artist.artist_name || '').toLowerCase()
        const email = (artist.email || '').toLowerCase()

        return (
          fullName.includes(searchLower) ||
          artistName.includes(searchLower) ||
          email.includes(searchLower)
        )
      })

      setSearchResults(filtered.slice(0, 50))
      setSearching(false)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchTerm, artists])

  const loadArtists = async () => {
    setLoading(true)
    setError(null)

    try {
      // Use API route with credentials
      const response = await fetch('/api/admin/get-artists', {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to load artists')
      }

      const result = await response.json()

      if (result.success) {
        console.log('💰 Found artists/label admins for earnings management:', result.breakdown)
        setArtists(result.users || [])
        setSearchResults((result.users || []).slice(0, 10))
      } else {
        throw new Error(result.error || 'Failed to fetch artists')
      }

    } catch (err) {
      console.error('Error loading artists:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const loadEarningsHistory = async (artistId) => {
    try {
      const response = await fetch(`/api/admin/earnings/list?artist_id=${artistId}`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      })

      if (!response.ok) {
        throw new Error('Failed to load earnings history')
      }

      const data = await response.json()

      if (data.success) {
        setEarningsHistory(data.earnings || [])
        console.log(`📊 Loaded ${data.earnings?.length || 0} earnings entries`)
      } else {
        console.error('Failed to load earnings history:', data.error)
        setEarningsHistory([])
      }

    } catch (err) {
      console.error('Error loading earnings:', err)
      setError(err.message)
      setEarningsHistory([])
    }
  }

  const handleSelectArtist = (artist) => {
    setSelectedArtist(artist)
    setSearchTerm('')
    setShowDropdown(false)
    loadEarningsHistory(artist.id)
  }

  const handleDataUpdated = () => {
    if (selectedArtist) {
      loadEarningsHistory(selectedArtist.id)
    }
  }

  const handleStatusUpdate = async (entryId, newStatus, paymentDate, notes) => {
    try {
      setSaving(true)
      setError(null)

      const response = await fetch('/api/admin/earnings/update-status', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entry_id: entryId,
          status: newStatus,
          payment_date: paymentDate,
          notes: notes
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update status')
      }

      // Success notification
      if (typeof window !== 'undefined') {
        const successEvent = new CustomEvent('notification', {
          detail: { type: 'success', message: 'Status updated successfully!' }
        })
        window.dispatchEvent(successEvent)
      }

      setShowEditModal(false)
      setEditingEntry(null)
      loadEarningsHistory(selectedArtist.id)

    } catch (err) {
      console.error('Error updating status:', err)
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteEntry = async (entryId) => {
    if (!confirm('Are you sure you want to delete this earnings entry?')) return

    try {
      setSaving(true)
      setError(null)

      const { error: deleteError } = await supabase
        .from('earnings')
        .delete()
        .eq('id', entryId)

      if (deleteError) throw deleteError

      loadEarningsHistory(selectedArtist.id)

    } catch (err) {
      console.error('Error deleting entry:', err)
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const getTotalEarnings = () => {
    return earningsHistory.reduce((sum, entry) => sum + (parseFloat(entry.amount) || 0), 0)
  }

  const getPaidEarnings = () => {
    return earningsHistory
      .filter(entry => entry.status === 'paid')
      .reduce((sum, entry) => sum + (parseFloat(entry.amount) || 0), 0)
  }

  const getPendingEarnings = () => {
    return earningsHistory
      .filter(entry => entry.status === 'pending')
      .reduce((sum, entry) => sum + (parseFloat(entry.amount) || 0), 0)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading && artists.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading earnings data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Earnings Management
            </h1>
            <p className="text-xl text-green-100 max-w-3xl mx-auto">
              Manage artist earnings data, financial metrics, platform revenue, and territory breakdowns
            </p>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Artist Selection Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
              <div className="flex items-center mb-6">
                <Users className="w-6 h-6 text-green-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">Select Artist</h2>
              </div>

              {/* Search Dropdown */}
              <div className="relative">
                <div className="relative">
                  <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2 z-10" />
                  <Input
                    type="text"
                    placeholder="Search by name, artist name, or email..."
                    value={selectedArtist ? 
                      `${selectedArtist.artist_name || `${selectedArtist.first_name || ''} ${selectedArtist.last_name || ''}`.trim() || selectedArtist.email}` 
                      : searchTerm
                    }
                    onChange={(e) => {
                      const value = e.target.value
                      setSearchTerm(value)
                      if (selectedArtist) {
                        setSelectedArtist(null)
                      }
                    }}
                    onFocus={() => {
                      if (!selectedArtist && searchTerm.trim()) {
                        setShowDropdown(true)
                      }
                    }}
                    className="pl-10"
                  />
                  {searching && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <Loader2 className="w-4 h-4 animate-spin text-green-600" />
                    </div>
                  )}
                </div>
                
                {/* Dropdown Results */}
                {showDropdown && searchTerm && !selectedArtist && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-slate-300 rounded-lg shadow-lg mt-1 z-50 max-h-80 overflow-y-auto">
                    {searchResults.length > 0 ? (
                      <>
                        <div className="px-3 py-2 text-xs text-slate-500 bg-slate-50 border-b">
                          {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
                        </div>
                        {searchResults.map((artist) => (
                          <button
                            key={artist.id}
                            onClick={() => handleSelectArtist(artist)}
                            className="w-full text-left p-3 hover:bg-slate-50 border-b border-slate-100 last:border-b-0 transition-colors"
                          >
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                                <Music className="w-4 h-4 text-green-600" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="font-medium text-slate-900 truncate">
                                  {artist.artist_name || 
                                   (artist.first_name && artist.last_name ? `${artist.first_name} ${artist.last_name}` : artist.email)
                                  }
                                </p>
                                <div className="flex items-center text-xs text-slate-600 space-x-2">
                                  <span className="truncate">{artist.email}</span>
                                  <span className={`px-2 py-1 rounded-full whitespace-nowrap text-xs font-medium ${
                                    artist.role === 'artist'
                                      ? 'bg-green-100 text-green-700'
                                      : 'bg-blue-100 text-blue-700'
                                  }`}>
                                    {artist.role === 'artist' ? 'Artist' : 'Label Admin'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </button>
                        ))}
                      </>
                    ) : (
                      <div className="p-4 text-center text-slate-500">
                        <Music className="w-6 h-6 mx-auto mb-2 text-slate-400" />
                        <p className="text-sm">No users found</p>
                        <p className="text-xs mt-1">Try searching by name, artist name, or email</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Selected Artist Display */}
              {selectedArtist && (
                <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                        <Music className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">
                          {selectedArtist.artist_name || 
                           (selectedArtist.first_name && selectedArtist.last_name 
                             ? `${selectedArtist.first_name} ${selectedArtist.last_name}` 
                             : selectedArtist.email)
                          }
                        </p>
                        <p className="text-sm text-slate-600">{selectedArtist.email}</p>
                        <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-medium ${
                          selectedArtist.role === 'artist'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {selectedArtist.role === 'artist' ? 'Artist Profile' : 'Label Admin Profile'}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedArtist(null)
                        setSearchTerm('')
                        setShowDropdown(false)
                      }}
                      className="text-slate-400 hover:text-slate-600 p-1 text-xl"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}

              {/* Recent Users */}
              {!searchTerm && !selectedArtist && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-slate-700 mb-3">Recent Users ({Math.min(artists.length, 10)})</h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {artists.slice(0, 10).map((artist) => (
                      <button
                        key={artist.id}
                        onClick={() => handleSelectArtist(artist)}
                        className="w-full text-left p-3 rounded-lg transition-colors bg-slate-50 hover:bg-slate-100 border border-transparent hover:border-slate-200"
                      >
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                            <Music className="w-4 h-4 text-green-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-slate-900 truncate">
                              {artist.artist_name || 
                               (artist.first_name && artist.last_name 
                                 ? `${artist.first_name} ${artist.last_name}` 
                                 : artist.email)
                              }
                            </p>
                            <p className="text-xs text-slate-600 truncate">{artist.email}</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs ml-2 font-medium ${
                            artist.role === 'artist'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {artist.role === 'artist' ? 'Artist' : 'Label Admin'}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                  {artists.length > 10 && (
                    <p className="text-xs text-slate-500 mt-2 text-center">
                      Type to search {artists.length - 10} more users...
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Earnings Management Panel */}
          <div className="lg:col-span-2">
            {selectedArtist ? (
              <div className="space-y-6">
                {/* Selected Artist Header */}
                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                        <DollarSign className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-slate-900">
                          {selectedArtist.first_name} {selectedArtist.last_name}
                        </h2>
                        <p className="text-slate-600">{selectedArtist.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                        Earnings Management
                      </span>
                    </div>
                  </div>
                </div>

                {/* Earnings Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-lg shadow p-6 border border-slate-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600">Total Earnings</p>
                        <p className="text-2xl font-bold text-slate-900">
                          £{getTotalEarnings().toFixed(2)}
                        </p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-green-600" />
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6 border border-slate-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600">Paid Out</p>
                        <p className="text-2xl font-bold text-green-600">
                          £{getPaidEarnings().toFixed(2)}
                        </p>
                      </div>
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6 border border-slate-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600">Pending</p>
                        <p className="text-2xl font-bold text-yellow-600">
                          £{getPendingEarnings().toFixed(2)}
                        </p>
                      </div>
                      <Clock className="w-8 h-8 text-yellow-600" />
                    </div>
                  </div>
                </div>

                {/* Add Earnings Form */}
                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
                  <h3 className="text-lg font-bold mb-4 text-gray-900">Add New Earnings</h3>
                  <AddEarningsForm
                    artistId={selectedArtist.id}
                    onDataUpdated={handleDataUpdated}
                  />
                </div>

                {/* Earnings History */}
                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
                  <h3 className="text-lg font-bold mb-4 text-gray-900">
                    Earnings History ({earningsHistory.length} entries)
                  </h3>
                  {earningsHistory.length > 0 ? (
                    <div className="space-y-3">
                      {earningsHistory.map(entry => (
                        <div key={entry.id} className="flex items-center justify-between p-4 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <span className="font-semibold text-gray-900">{entry.platform || 'N/A'}</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(entry.status)}`}>
                                {entry.status || 'pending'}
                              </span>
                              {entry.earning_type && (
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                  {entry.earning_type}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-slate-600 flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {entry.territory || 'Global'} • {new Date(entry.created_at).toLocaleDateString()}
                            </p>
                            {entry.notes && (
                              <p className="text-xs mt-1 text-slate-500">{entry.notes}</p>
                            )}
                          </div>
                          <div className="text-right flex items-center space-x-3">
                            <div>
                              <p className="text-2xl font-bold text-green-600">
                                £{parseFloat(entry.amount || 0).toFixed(2)}
                              </p>
                              {entry.payment_date && (
                                <p className="text-xs text-slate-500">
                                  Paid: {new Date(entry.payment_date).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                            <div className="flex flex-col space-y-1">
                              <Button
                                onClick={() => {
                                  setEditingEntry(entry)
                                  setShowEditModal(true)
                                }}
                                variant="outline"
                                size="sm"
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button
                                onClick={() => handleDeleteEntry(entry.id)}
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No earnings yet</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Add earnings using the form above
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-12 text-center">
                <Users className="mx-auto h-16 w-16 text-slate-400 mb-4" />
                <h3 className="text-xl font-medium text-slate-900 mb-2">Select an Artist</h3>
                <p className="text-slate-600">
                  Choose an artist from the list to manage their earnings
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && editingEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Edit Earnings Status
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <Select 
                  defaultValue={editingEntry.status}
                  onValueChange={(value) => setEditingEntry({...editingEntry, status: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {editingEntry.status === 'paid' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Date
                  </label>
                  <Input
                    type="date"
                    defaultValue={editingEntry.payment_date ? new Date(editingEntry.payment_date).toISOString().split('T')[0] : ''}
                    onChange={(e) => setEditingEntry({...editingEntry, payment_date: e.target.value})}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  defaultValue={editingEntry.notes || ''}
                  onChange={(e) => setEditingEntry({...editingEntry, notes: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex space-x-2 justify-end mt-6">
              <Button
                onClick={() => {
                  setShowEditModal(false)
                  setEditingEntry(null)
                }}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleStatusUpdate(
                  editingEntry.id,
                  editingEntry.status,
                  editingEntry.payment_date,
                  editingEntry.notes
                )}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}







