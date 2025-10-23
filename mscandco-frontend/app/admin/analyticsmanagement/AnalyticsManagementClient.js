'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Users, BarChart3, Music, Search, Loader2, TrendingUp, Eye, Download,
  Calendar, DollarSign, AlertTriangle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import AdminAnalyticsInterface from '@/components/analytics/AdminAnalyticsInterface'

export default function AnalyticsManagementClient({ user }) {
  const supabase = createClient()

  // State
  const [artists, setArtists] = useState([])
  const [searchResults, setSearchResults] = useState([])
  const [selectedArtist, setSelectedArtist] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [error, setError] = useState(null)

  // Load artists
  useEffect(() => {
    if (user) {
      loadArtists()
    }
  }, [user])

  // Search functionality
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
      const response = await fetch('/api/admin/get-artists', {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch artists')
      }

      const result = await response.json()

      if (result.success) {
        console.log('📊 Found artists/label admins:', result.breakdown)
        setArtists(result.users || [])
        setSearchResults((result.users || []).slice(0, 10))
      } else {
        throw new Error(result.error || 'Failed to load artists')
      }

    } catch (err) {
      console.error('Error loading artists:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectArtist = (artist) => {
    setSelectedArtist(artist)
    setSearchTerm('')
    setShowDropdown(false)
  }

  if (loading && artists.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Analytics Management
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              View and manage artist analytics, streaming data, and performance metrics
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
                <Users className="w-6 h-6 text-blue-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">Select Artist</h2>
              </div>

              {/* Search */}
              <div className="relative">
                <div className="relative">
                  <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2 z-10" />
                  <Input
                    type="text"
                    placeholder="Search by name or email..."
                    value={selectedArtist ? 
                      `${selectedArtist.artist_name || `${selectedArtist.first_name || ''} ${selectedArtist.last_name || ''}`.trim() || selectedArtist.email}` 
                      : searchTerm
                    }
                    onChange={(e) => {
                      setSearchTerm(e.target.value)
                      if (selectedArtist) setSelectedArtist(null)
                    }}
                    onFocus={() => {
                      if (!selectedArtist && searchTerm.trim()) setShowDropdown(true)
                    }}
                    className="pl-10"
                  />
                  {searching && (
                    <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin text-blue-600" />
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
                            className="w-full text-left p-3 hover:bg-slate-50 border-b border-slate-100 last:border-b-0"
                          >
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                <Music className="w-4 h-4 text-blue-600" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="font-medium text-slate-900 truncate">
                                  {artist.artist_name || `${artist.first_name || ''} ${artist.last_name || ''}`.trim() || artist.email}
                                </p>
                                <p className="text-xs text-slate-600 truncate">{artist.email}</p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </>
                    ) : (
                      <div className="p-4 text-center text-slate-500">
                        <Music className="w-6 h-6 mx-auto mb-2 text-slate-400" />
                        <p className="text-sm">No users found</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Selected Artist */}
              {selectedArtist && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <Music className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">
                          {selectedArtist.artist_name || `${selectedArtist.first_name} ${selectedArtist.last_name}`}
                        </p>
                        <p className="text-sm text-slate-600">{selectedArtist.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedArtist(null)
                        setSearchTerm('')
                      }}
                      className="text-slate-400 hover:text-slate-600 p-1 text-xl"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}

              {/* Recent Artists */}
              {!searchTerm && !selectedArtist && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-slate-700 mb-3">Recent Artists ({Math.min(artists.length, 10)})</h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {artists.slice(0, 10).map((artist) => (
                      <button
                        key={artist.id}
                        onClick={() => handleSelectArtist(artist)}
                        className="w-full text-left p-3 rounded-lg bg-slate-50 hover:bg-slate-100 border border-transparent hover:border-slate-200"
                      >
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <Music className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-slate-900 truncate">
                              {artist.artist_name || `${artist.first_name} ${artist.last_name}`}
                            </p>
                            <p className="text-xs text-slate-600 truncate">{artist.email}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Analytics Panel */}
          <div className="lg:col-span-2">
            {selectedArtist ? (
              <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <BarChart3 className="w-8 h-8 text-blue-600 mr-3" />
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900">
                        {selectedArtist.artist_name || `${selectedArtist.first_name} ${selectedArtist.last_name}`}
                      </h2>
                      <p className="text-slate-600">Analytics Dashboard</p>
                    </div>
                  </div>
                  <Button variant="outline" className="flex items-center">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>

                {/* Analytics Interface */}
                <AdminAnalyticsInterface 
                  artistId={selectedArtist.id}
                  artistName={selectedArtist.artist_name || `${selectedArtist.first_name} ${selectedArtist.last_name}`}
                />
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-12 text-center">
                <BarChart3 className="mx-auto h-16 w-16 text-slate-400 mb-4" />
                <h3 className="text-xl font-medium text-slate-900 mb-2">Select an Artist</h3>
                <p className="text-slate-600">
                  Choose an artist to view their analytics and performance metrics
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}







