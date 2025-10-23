'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  DollarSign, Save, User, Building2, Users, AlertCircle,
  Search, X, Check, Loader2, Percent
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function SplitConfigurationClient({ user }) {
  const supabase = createClient()

  // Default splits state
  const [defaultSplits, setDefaultSplits] = useState({
    company_percentage: 20,
    artist_percentage: 80,
    label_percentage: 0
  })

  // Super label admin state
  const [superLabelAdmin, setSuperLabelAdmin] = useState(null)
  const [superLabelPercentage, setSuperLabelPercentage] = useState(20)

  // Overrides state
  const [artistOverrides, setArtistOverrides] = useState([])
  const [labelOverrides, setLabelOverrides] = useState([])

  // New override modal state
  const [showArtistModal, setShowArtistModal] = useState(false)
  const [showLabelModal, setShowLabelModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [overridePercentage, setOverridePercentage] = useState('')

  // Search state
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)

  // Loading and error state
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    loadConfiguration()
  }, [])

  // Search for users
  useEffect(() => {
    if (searchTerm.length < 2) {
      setSearchResults([])
      return
    }

    const timeoutId = setTimeout(async () => {
      setSearching(true)
      try {
        const response = await fetch(`/api/admin/users/search?q=${encodeURIComponent(searchTerm)}`, {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        })

        if (response.ok) {
          const data = await response.json()
          setSearchResults(data.users || [])
        }
      } catch (err) {
        console.error('Search error:', err)
      } finally {
        setSearching(false)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchTerm])

  const loadConfiguration = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/admin/splitconfiguration', {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      })

      if (!response.ok) {
        throw new Error('Failed to load configuration')
      }

      const data = await response.json()

      // Set default splits
      if (data.defaults) {
        setDefaultSplits({
          company_percentage: data.defaults.company_percentage || 20,
          artist_percentage: data.defaults.artist_percentage || 80,
          label_percentage: data.defaults.label_percentage || 0
        })

        if (data.defaults.super_label_admin) {
          setSuperLabelAdmin(data.defaults.super_label_admin)
          setSuperLabelPercentage(data.defaults.super_label_percentage || 20)
        }
      }

      // Set overrides
      setArtistOverrides(data.artist_overrides || [])
      setLabelOverrides(data.label_overrides || [])

    } catch (err) {
      console.error('Error loading configuration:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveDefaults = async () => {
    // Validate totals - only artist + label should equal 100% (company is separate)
    const total = parseFloat(defaultSplits.artist_percentage) +
                  parseFloat(defaultSplits.label_percentage)

    if (Math.abs(total - 100) > 0.01) {
      setError('Artist and Label percentages must total 100%')
      return
    }

    setSaving(true)
    setError(null)
    setSuccessMessage('')

    try {
      const response = await fetch('/api/admin/splitconfiguration', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_percentage: defaultSplits.company_percentage,
          artist_percentage: defaultSplits.artist_percentage,
          label_percentage: defaultSplits.label_percentage,
          super_label_percentage: superLabelPercentage
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save configuration')
      }

      setSuccessMessage('Default splits saved successfully')
      setTimeout(() => setSuccessMessage(''), 3000)

    } catch (err) {
      console.error('Error saving defaults:', err)
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleAddOverride = async (type) => {
    if (!selectedUser || !overridePercentage) {
      setError('Please select a user and enter a percentage')
      return
    }

    const percentage = parseFloat(overridePercentage)
    if (percentage < 0 || percentage > 100) {
      setError('Percentage must be between 0 and 100')
      return
    }

    setSaving(true)
    setError(null)

    try {
      const response = await fetch('/api/admin/splitconfiguration/override', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: selectedUser.id,
          percentage: percentage,
          type: type
        })
      })

      if (!response.ok) {
        throw new Error('Failed to add override')
      }

      // Reset modal state
      setShowArtistModal(false)
      setShowLabelModal(false)
      setSelectedUser(null)
      setOverridePercentage('')
      setSearchTerm('')
      setSearchResults([])

      // Reload configuration
      await loadConfiguration()

      setSuccessMessage('Override added successfully')
      setTimeout(() => setSuccessMessage(''), 3000)

    } catch (err) {
      console.error('Error adding override:', err)
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleRemoveOverride = async (userId, type) => {
    if (!confirm('Remove this override?')) return

    setSaving(true)
    setError(null)

    try {
      const response = await fetch('/api/admin/splitconfiguration/override', {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          type: type
        })
      })

      if (!response.ok) {
        throw new Error('Failed to remove override')
      }

      await loadConfiguration()

      setSuccessMessage('Override removed successfully')
      setTimeout(() => setSuccessMessage(''), 3000)

    } catch (err) {
      console.error('Error removing override:', err)
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading split configuration...</p>
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
              Split Configuration
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Manage revenue split percentages and overrides
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <div className="flex items-center">
              <Check className="h-5 w-5 text-green-400 mr-2" />
              <span className="text-green-800">{successMessage}</span>
            </div>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Default Splits */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
            <div className="flex items-center mb-6">
              <DollarSign className="w-6 h-6 text-blue-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Default Split Percentages</h2>
            </div>

            <div className="space-y-4">
              {/* Company Percentage */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Building2 className="w-4 h-4 inline mr-2" />
                  Company Percentage
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={defaultSplits.company_percentage}
                    onChange={(e) => setDefaultSplits({
                      ...defaultSplits,
                      company_percentage: e.target.value
                    })}
                    className="pr-10"
                  />
                  <Percent className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>

              {/* Artist Percentage */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Artist Percentage
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={defaultSplits.artist_percentage}
                    onChange={(e) => setDefaultSplits({
                      ...defaultSplits,
                      artist_percentage: e.target.value
                    })}
                    className="pr-10"
                  />
                  <Percent className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>

              {/* Label Percentage */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Users className="w-4 h-4 inline mr-2" />
                  Label Percentage
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={defaultSplits.label_percentage}
                    onChange={(e) => setDefaultSplits({
                      ...defaultSplits,
                      label_percentage: e.target.value
                    })}
                    className="pr-10"
                  />
                  <Percent className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>

              {/* Total Display - Only Artist + Label (Company is separate) */}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Artist + Label Total:</span>
                  <span className={`text-lg font-bold ${
                    Math.abs(
                      parseFloat(defaultSplits.artist_percentage || 0) +
                      parseFloat(defaultSplits.label_percentage || 0) - 100
                    ) < 0.01 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {(
                      parseFloat(defaultSplits.artist_percentage || 0) +
                      parseFloat(defaultSplits.label_percentage || 0)
                    ).toFixed(2)}%
                  </span>
                </div>
              </div>

              <Button
                onClick={handleSaveDefaults}
                disabled={saving}
                className="w-full"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Default Splits
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Super Label Admin Info */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
            <div className="flex items-center mb-6">
              <Users className="w-6 h-6 text-purple-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Super Label Admin</h2>
            </div>

            {superLabelAdmin ? (
              <div className="space-y-4">
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="text-sm text-gray-600 mb-1">Current Super Label Admin:</p>
                  <p className="font-semibold text-gray-900">{superLabelAdmin.name}</p>
                  <p className="text-sm text-gray-600">{superLabelAdmin.email}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Super Label Percentage
                  </label>
                  <div className="relative">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={superLabelPercentage}
                      onChange={(e) => setSuperLabelPercentage(e.target.value)}
                      className="pr-10"
                    />
                    <Percent className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>No Super Label Admin configured</p>
              </div>
            )}
          </div>

          {/* Artist Overrides */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <User className="w-6 h-6 text-green-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">Artist Overrides</h2>
              </div>
              <Button
                onClick={() => setShowArtistModal(true)}
                size="sm"
              >
                Add Override
              </Button>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {artistOverrides.length > 0 ? (
                artistOverrides.map((override) => (
                  <div
                    key={override.user_id}
                    className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{override.user_name}</p>
                      <p className="text-sm text-gray-600">{override.user_email}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="font-bold text-green-600">{override.percentage}%</span>
                      <button
                        onClick={() => handleRemoveOverride(override.user_id, 'artist')}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <User className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p>No artist overrides</p>
                </div>
              )}
            </div>
          </div>

          {/* Label Overrides */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <Users className="w-6 h-6 text-orange-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">Label Overrides</h2>
              </div>
              <Button
                onClick={() => setShowLabelModal(true)}
                size="sm"
              >
                Add Override
              </Button>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {labelOverrides.length > 0 ? (
                labelOverrides.map((override) => (
                  <div
                    key={override.user_id}
                    className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{override.user_name}</p>
                      <p className="text-sm text-gray-600">{override.user_email}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="font-bold text-orange-600">{override.percentage}%</span>
                      <button
                        onClick={() => handleRemoveOverride(override.user_id, 'label')}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p>No label overrides</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Artist Override Modal */}
      {showArtistModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Add Artist Override</h3>
              <button
                onClick={() => {
                  setShowArtistModal(false)
                  setSelectedUser(null)
                  setOverridePercentage('')
                  setSearchTerm('')
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Artist
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                  {searching && (
                    <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin text-blue-600" />
                  )}
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="mt-2 border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
                    {searchResults.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => {
                          setSelectedUser(user)
                          setSearchTerm('')
                          setSearchResults([])
                        }}
                        className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                      >
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected User */}
              {selectedUser && (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="font-medium text-gray-900">{selectedUser.name}</p>
                  <p className="text-sm text-gray-600">{selectedUser.email}</p>
                </div>
              )}

              {/* Percentage */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Override Percentage
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={overridePercentage}
                    onChange={(e) => setOverridePercentage(e.target.value)}
                    placeholder="Enter percentage"
                    className="pr-10"
                  />
                  <Percent className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>

              <Button
                onClick={() => handleAddOverride('artist')}
                disabled={!selectedUser || !overridePercentage || saving}
                className="w-full"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add Override'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Label Override Modal */}
      {showLabelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Add Label Override</h3>
              <button
                onClick={() => {
                  setShowLabelModal(false)
                  setSelectedUser(null)
                  setOverridePercentage('')
                  setSearchTerm('')
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Label
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                  {searching && (
                    <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin text-blue-600" />
                  )}
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="mt-2 border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
                    {searchResults.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => {
                          setSelectedUser(user)
                          setSearchTerm('')
                          setSearchResults([])
                        }}
                        className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                      >
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected User */}
              {selectedUser && (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="font-medium text-gray-900">{selectedUser.name}</p>
                  <p className="text-sm text-gray-600">{selectedUser.email}</p>
                </div>
              )}

              {/* Percentage */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Override Percentage
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={overridePercentage}
                    onChange={(e) => setOverridePercentage(e.target.value)}
                    placeholder="Enter percentage"
                    className="pr-10"
                  />
                  <Percent className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>

              <Button
                onClick={() => handleAddOverride('label')}
                disabled={!selectedUser || !overridePercentage || saving}
                className="w-full"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add Override'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}







