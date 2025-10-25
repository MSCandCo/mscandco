'use client'

// LABEL ADMIN ANALYTICS - Combined analytics from all accepted artists
import { useState, useEffect } from 'react'
import { useUser } from '@/components/providers/SupabaseProvider'
import { createClient } from '@supabase/supabase-js'
import { BarChart3, TrendingUp, Users, Crown, Lock, Music, DollarSign, Globe } from 'lucide-react'
import CleanManualDisplay from '@/components/analytics/CleanManualDisplay'
import { PageLoading } from '@/components/ui/LoadingSpinner'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function AnalyticsClient() {
  const { user, session } = useUser()
  const [connectedArtists, setConnectedArtists] = useState([])
  const [activeTab, setActiveTab] = useState('summary')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [summaryData, setSummaryData] = useState(null)

  // Load connected artists
  useEffect(() => {
    if (user && session) {
      loadConnectedArtists()
    }
  }, [user, session])

  const loadConnectedArtists = async () => {
    try {
      setLoading(true)
      
      const token = session?.access_token
      if (!token) {
        throw new Error('Authentication required')
      }

      // Fetch accepted artists from API
      const response = await fetch('/api/labeladmin/accepted-artists', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (!response.ok) {
        throw new Error('Failed to load accepted artists')
      }

      const data = await response.json()
      setConnectedArtists(data.artists || [])
      
      // Load summary data
      await loadSummaryData(data.artists || [])
      
    } catch (error) {
      console.error('Error loading accepted artists:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const loadSummaryData = async (artists) => {
    try {
      // Fetch analytics for all artists and combine
      const analyticsPromises = artists.map(async (artist) => {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('analytics_data')
          .eq('id', artist.artistId)
          .maybeSingle()

        if (error || !data || !data.analytics_data) return null
        return { ...data.analytics_data, artistName: artist.artistName }
      })

      const allAnalytics = await Promise.all(analyticsPromises)
      const validAnalytics = allAnalytics.filter(a => a !== null)

      // Combine stats
      const combined = {
        totalStreams: validAnalytics.reduce((sum, a) => sum + (a.advancedData?.totalStreams || 0), 0),
        totalReleases: validAnalytics.length,
        totalArtists: artists.length,
        topGenres: {},
        topPlatforms: {},
        recentMilestones: []
      }

      // Aggregate genres
      validAnalytics.forEach(a => {
        const genre = a.latestRelease?.genre
        if (genre) {
          combined.topGenres[genre] = (combined.topGenres[genre] || 0) + 1
        }
      })

      // Aggregate platforms
      validAnalytics.forEach(a => {
        const platforms = a.advancedData?.platformPerformance || []
        platforms.forEach(p => {
          if (!combined.topPlatforms[p.platform]) {
            combined.topPlatforms[p.platform] = 0
          }
          combined.topPlatforms[p.platform] += p.streams || 0
        })
      })

      // Collect recent milestones
      validAnalytics.forEach(a => {
        if (a.milestones && Array.isArray(a.milestones)) {
          combined.recentMilestones.push(...a.milestones.map(m => ({
            ...m,
            artistName: a.artistName
          })))
        }
      })

      // Sort milestones by date
      combined.recentMilestones.sort((a, b) => new Date(b.date) - new Date(a.date))
      combined.recentMilestones = combined.recentMilestones.slice(0, 10)

      setSummaryData(combined)
    } catch (error) {
      console.error('Error loading summary data:', error)
    }
  }

  if (loading) {
    return <PageLoading message="Loading analytics..." />
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <h3 className="text-red-900 font-semibold mb-2">Error Loading Analytics</h3>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (connectedArtists.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Artists Connected</h3>
            <p className="text-gray-600 mb-6">
              You need to have accepted artists before viewing analytics.
            </p>
            <button
              onClick={() => window.location.href = '/labeladmin/artists'}
              className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
            >
              Manage Artists
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <BarChart3 className="h-8 w-8" />
            Label Analytics
          </h1>
          <p className="text-gray-600 mt-2">
            Performance insights across {connectedArtists.length} artists
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px overflow-x-auto">
              <button
                onClick={() => setActiveTab('summary')}
                className={`px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 ${
                  activeTab === 'summary'
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <TrendingUp className="inline h-4 w-4 mr-2" />
                Summary
              </button>
              {connectedArtists.map((artist) => (
                <button
                  key={artist.artistId}
                  onClick={() => setActiveTab(artist.artistId)}
                  className={`px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 ${
                    activeTab === artist.artistId
                      ? 'border-gray-900 text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {artist.artistName}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'summary' ? (
          <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Artists</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {summaryData?.totalArtists || 0}
                    </p>
                  </div>
                  <Users className="h-12 w-12 text-gray-300" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Releases</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {summaryData?.totalReleases || 0}
                    </p>
                  </div>
                  <Music className="h-12 w-12 text-gray-300" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Streams</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {(summaryData?.totalStreams || 0).toLocaleString()}
                    </p>
                  </div>
                  <TrendingUp className="h-12 w-12 text-gray-300" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Top Genre</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                      {summaryData?.topGenres && Object.keys(summaryData.topGenres).length > 0
                        ? Object.entries(summaryData.topGenres).sort((a, b) => b[1] - a[1])[0][0]
                        : 'N/A'}
                    </p>
                  </div>
                  <Crown className="h-12 w-12 text-gray-300" />
                </div>
              </div>
            </div>

            {/* Top Platforms */}
            {summaryData?.topPlatforms && Object.keys(summaryData.topPlatforms).length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Top Platforms
                </h3>
                <div className="space-y-3">
                  {Object.entries(summaryData.topPlatforms)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5)
                    .map(([platform, streams]) => (
                      <div key={platform} className="flex items-center justify-between">
                        <span className="text-gray-700">{platform}</span>
                        <span className="text-gray-900 font-semibold">{streams.toLocaleString()} streams</span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Recent Milestones */}
            {summaryData?.recentMilestones && summaryData.recentMilestones.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Crown className="h-5 w-5" />
                  Recent Milestones
                </h3>
                <div className="space-y-4">
                  {summaryData.recentMilestones.map((milestone, index) => (
                    <div key={index} className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Crown className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{milestone.title}</p>
                        <p className="text-sm text-gray-600">{milestone.artistName}</p>
                        <p className="text-xs text-gray-500 mt-1">{milestone.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <CleanManualDisplay 
            artistId={activeTab} 
            showAdvanced={true}
          />
        )}
      </div>
    </div>
  )
}

