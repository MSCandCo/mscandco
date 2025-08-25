import { createClient } from '@supabase/supabase-js'
import jwt from 'jsonwebtoken'

// Server-side Supabase client with service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Verify authentication and Distribution Partner role
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token) {
      return res.status(401).json({ error: 'No authentication token' })
    }

    let userInfo
    try {
      userInfo = jwt.decode(token)
    } catch (error) {
      return res.status(401).json({ error: 'Invalid token' })
    }

    const userId = userInfo?.sub
    const userRole = userInfo?.user_metadata?.role
    if (userRole !== 'distribution_partner') {
      return res.status(403).json({ error: 'Distribution Partner access required' })
    }

    // Get query parameters for date filtering
    const { startDate, endDate, platform, genre } = req.query

    // Query analytics data
    const [
      releasesResult,
      streamsResult,
      revenueSharesResult,
      platformStatsResult
    ] = await Promise.all([
      // Get all releases with detailed analytics
      supabase
        .from('releases')
        .select(`
          *,
          artist:user_profiles!releases_artist_id_fkey (
            id,
            first_name,
            last_name,
            artist_name,
            email,
            country
          )
        `)
        .eq('distribution_partner_id', userId),
      
      // Get detailed streaming data (if streams table exists)
      supabase
        .from('streams')
        .select('*')
        .in('release_id', []), // Will be populated with release IDs
      
      // Get revenue shares for this partner
      supabase
        .from('revenue_shares')
        .select('*')
        .eq('distribution_partner_id', userId),
      
      // Get platform-wide statistics for benchmarking
      supabase
        .from('releases')
        .select('streams, earnings, genre, created_at')
        .not('streams', 'is', null)
    ])

    const releases = releasesResult.data || []
    const streams = streamsResult.data || []
    const revenueShares = revenueSharesResult.data || []
    const platformStats = platformStatsResult.data || []

    // Apply date filtering if provided
    let filteredReleases = releases
    if (startDate && endDate) {
      filteredReleases = releases.filter(r => {
        const releaseDate = new Date(r.created_at)
        return releaseDate >= new Date(startDate) && releaseDate <= new Date(endDate)
      })
    }

    // Apply platform filtering if provided
    if (platform) {
      filteredReleases = filteredReleases.filter(r => 
        r.platforms && r.platforms.includes(platform)
      )
    }

    // Apply genre filtering if provided
    if (genre) {
      filteredReleases = filteredReleases.filter(r => r.genre === genre)
    }

    // Calculate performance metrics
    const totalStreams = filteredReleases.reduce((sum, r) => sum + (r.streams || 0), 0)
    const totalEarnings = filteredReleases.reduce((sum, r) => sum + (r.earnings || 0), 0)
    const totalRevenue = revenueShares.reduce((sum, r) => sum + (r.amount || 0), 0)

    // Streams by platform
    const streamsByPlatform = {}
    filteredReleases.forEach(release => {
      if (release.platforms) {
        release.platforms.forEach(platform => {
          const platformStreams = Math.floor((release.streams || 0) / release.platforms.length)
          streamsByPlatform[platform] = (streamsByPlatform[platform] || 0) + platformStreams
        })
      }
    })

    // Streams by genre
    const streamsByGenre = {}
    filteredReleases.forEach(release => {
      const genre = release.genre || 'Unknown'
      streamsByGenre[genre] = (streamsByGenre[genre] || 0) + (release.streams || 0)
    })

    // Streams by country (based on artist location)
    const streamsByCountry = {}
    filteredReleases.forEach(release => {
      const country = release.artist?.country || 'Unknown'
      streamsByCountry[country] = (streamsByCountry[country] || 0) + (release.streams || 0)
    })

    // Monthly performance (last 12 months)
    const monthlyPerformance = []
    for (let i = 11; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0)

      const monthReleases = filteredReleases.filter(r => {
        const createdAt = new Date(r.created_at)
        return createdAt >= monthStart && createdAt <= monthEnd
      })

      const monthStreams = monthReleases.reduce((sum, r) => sum + (r.streams || 0), 0)
      const monthEarnings = monthReleases.reduce((sum, r) => sum + (r.earnings || 0), 0)
      const monthRevenue = revenueShares.filter(r => {
        const createdAt = new Date(r.created_at)
        return createdAt >= monthStart && createdAt <= monthEnd
      }).reduce((sum, r) => sum + (r.amount || 0), 0)

      monthlyPerformance.push({
        month: date.toISOString().slice(0, 7),
        releases: monthReleases.length,
        streams: monthStreams,
        earnings: monthEarnings,
        revenue: monthRevenue
      })
    }

    // Top performing releases
    const topReleases = filteredReleases
      .sort((a, b) => (b.streams || 0) - (a.streams || 0))
      .slice(0, 10)
      .map(release => ({
        id: release.id,
        title: release.title,
        artistName: release.artist?.artist_name || `${release.artist?.first_name} ${release.artist?.last_name}`.trim(),
        streams: release.streams || 0,
        earnings: release.earnings || 0,
        genre: release.genre,
        releaseDate: release.release_date,
        platforms: release.platforms || []
      }))

    // Top performing artists
    const artistPerformance = {}
    filteredReleases.forEach(release => {
      const artistId = release.artist_id
      const artistName = release.artist?.artist_name || `${release.artist?.first_name} ${release.artist?.last_name}`.trim()
      
      if (!artistPerformance[artistId]) {
        artistPerformance[artistId] = {
          artistId,
          artistName,
          totalStreams: 0,
          totalEarnings: 0,
          releaseCount: 0
        }
      }
      
      artistPerformance[artistId].totalStreams += release.streams || 0
      artistPerformance[artistId].totalEarnings += release.earnings || 0
      artistPerformance[artistId].releaseCount++
    })

    const topArtists = Object.values(artistPerformance)
      .sort((a, b) => b.totalStreams - a.totalStreams)
      .slice(0, 10)

    // Platform benchmarking
    const platformAvgStreams = platformStats.length > 0 ? 
      platformStats.reduce((sum, r) => sum + (r.streams || 0), 0) / platformStats.length : 0
    const platformAvgEarnings = platformStats.length > 0 ? 
      platformStats.reduce((sum, r) => sum + (r.earnings || 0), 0) / platformStats.length : 0

    const partnerAvgStreams = filteredReleases.length > 0 ? 
      totalStreams / filteredReleases.length : 0
    const partnerAvgEarnings = filteredReleases.length > 0 ? 
      totalEarnings / filteredReleases.length : 0

    // Growth calculations
    const currentMonth = new Date()
    const lastMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    const twoMonthsAgo = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 2, 1)

    const thisMonthStreams = filteredReleases
      .filter(r => new Date(r.created_at) >= lastMonth)
      .reduce((sum, r) => sum + (r.streams || 0), 0)
    const lastMonthStreams = filteredReleases
      .filter(r => {
        const createdAt = new Date(r.created_at)
        return createdAt >= twoMonthsAgo && createdAt < lastMonth
      })
      .reduce((sum, r) => sum + (r.streams || 0), 0)

    const streamGrowth = lastMonthStreams > 0 ? ((thisMonthStreams - lastMonthStreams) / lastMonthStreams) * 100 : 0

    const analyticsData = {
      // Summary metrics
      totalStreams,
      totalEarnings,
      totalRevenue,
      totalReleases: filteredReleases.length,
      
      // Performance breakdowns
      streamsByPlatform,
      streamsByGenre,
      streamsByCountry,
      
      // Time series data
      monthlyPerformance,
      
      // Top performers
      topReleases,
      topArtists,
      
      // Benchmarking
      benchmarks: {
        platformAvgStreams: Math.round(platformAvgStreams),
        platformAvgEarnings: Math.round(platformAvgEarnings * 100) / 100,
        partnerAvgStreams: Math.round(partnerAvgStreams),
        partnerAvgEarnings: Math.round(partnerAvgEarnings * 100) / 100,
        performanceRatio: platformAvgStreams > 0 ? (partnerAvgStreams / platformAvgStreams) : 1
      },
      
      // Growth metrics
      streamGrowth: Math.round(streamGrowth * 10) / 10,
      
      // Filters applied
      filters: {
        startDate,
        endDate,
        platform,
        genre
      },
      
      // System info
      lastUpdated: new Date().toISOString(),
      dataRange: {
        earliestRelease: filteredReleases.length > 0 ? 
          Math.min(...filteredReleases.map(r => new Date(r.created_at).getTime())) : null,
        latestRelease: filteredReleases.length > 0 ? 
          Math.max(...filteredReleases.map(r => new Date(r.created_at).getTime())) : null
      }
    }

    res.status(200).json({
      success: true,
      data: analyticsData,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Distribution Partner analytics error:', error)
    res.status(500).json({ 
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Failed to fetch analytics data'
    })
  }
}
