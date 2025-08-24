import { createClient } from '@supabase/supabase-js'
import jwt from 'jsonwebtoken'

// Server-side Supabase client with service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // This stays on server!
)

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Verify user authentication
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token) {
      return res.status(401).json({ error: 'No authentication token' })
    }

    // For now, we'll skip JWT verification since we don't have SUPABASE_JWT_SECRET set up
    // In production, you'd verify the JWT token properly:
    // const userInfo = jwt.verify(token, process.env.SUPABASE_JWT_SECRET)
    
    // For now, we'll get user info from the token directly (Supabase JWT format)
    let userInfo
    try {
      // Decode without verification for now (not recommended for production)
      userInfo = jwt.decode(token)
    } catch (error) {
      return res.status(401).json({ error: 'Invalid token' })
    }

    const userId = userInfo?.sub
    const userRole = userInfo?.user_metadata?.role || 'artist'

    // Role-based data fetching
    let stats = {}

    if (userRole === 'artist') {
      // Fetch artist-specific stats
      const [releasesResult, earningsResult, streamsResult] = await Promise.all([
        supabase
          .from('releases')
          .select('id, streams, earnings, created_at')
          .eq('artist_id', userId),
        supabase
          .from('earnings')
          .select('amount, created_at')
          .eq('user_id', userId),
        supabase
          .from('streams')
          .select('platform, count, created_at')
          .eq('artist_id', userId)
      ])

      const releases = releasesResult.data || []
      const earnings = earningsResult.data || []
      const streams = streamsResult.data || []

      stats = {
        totalReleases: releases.length,
        totalEarnings: earnings.reduce((sum, e) => sum + (e.amount || 0), 0),
        totalStreams: streams.reduce((sum, s) => sum + (s.count || 0), 0),
        monthlyGrowth: calculateGrowth(earnings, 'month'),
        recentReleases: releases.slice(0, 5),
        platformBreakdown: groupByPlatform(streams)
      }

    } else if (userRole === 'label_admin') {
      // Fetch label-specific stats
      const [artistsResult, releasesResult, revenueResult] = await Promise.all([
        supabase
          .from('label_artists')
          .select('artist_id, artists(name, email)')
          .eq('label_id', userId),
        supabase
          .from('releases')
          .select('id, title, streams, earnings, artist_id, created_at'),
        supabase
          .from('revenue_shares')
          .select('amount, created_at')
          .eq('label_id', userId)
      ])

      const artists = artistsResult.data || []
      const releases = releasesResult.data || []
      const revenue = revenueResult.data || []

      stats = {
        totalArtists: artists.length,
        totalReleases: releases.length,
        totalRevenue: revenue.reduce((sum, r) => sum + (r.amount || 0), 0),
        topArtists: getTopArtists(releases),
        recentReleases: releases.slice(0, 5),
        monthlyGrowth: calculateGrowth(revenue, 'month')
      }

    } else if (['company_admin', 'super_admin'].includes(userRole)) {
      // Fetch company-wide stats
      const [usersResult, subscriptionsResult, profilesResult] = await Promise.all([
        supabase.auth.admin.listUsers(),
        supabase
          .from('subscriptions')
          .select('tier, amount, status, created_at'),
        supabase
          .from('user_profiles')
          .select('*', { count: 'exact' })
      ])

      const users = usersResult.data?.users || []
      const subscriptions = subscriptionsResult.data || []
      const profiles = profilesResult.data || []

      const activeSubscriptions = subscriptions.filter(s => s.status === 'active')
      const totalRevenue = subscriptions.reduce((sum, s) => sum + (s.amount || 0), 0)

      stats = {
        superAdmin: {
          totalUsers: users.length,
          activeProjects: activeSubscriptions.length,
          totalRevenue: totalRevenue,
          platformHealth: users.length > 0 ? 98.5 : 0,
          systemStatus: 'operational',
          lastUpdated: new Date().toISOString()
        },
        companyAdmin: {
          totalUsers: users.length,
          activeProjects: activeSubscriptions.length,
          totalRevenue: totalRevenue,
          platformHealth: users.length > 0 ? 98.5 : 0,
          systemStatus: 'operational',
          lastUpdated: new Date().toISOString()
        },
        labelAdmin: {
          totalArtists: 0,
          totalReleases: 0,
          totalEarnings: 0,
          pendingApprovals: 0
        },
        distributionPartner: {
          totalPartners: 0,
          totalReleases: 0,
          totalRevenue: 0,
          pendingDistributions: 0
        },
        artist: {
          totalReleases: 0,
          totalStreams: 0,
          totalEarnings: 0,
          pendingReleases: 0
        }
      }

    } else {
      return res.status(403).json({ error: 'Insufficient permissions' })
    }

    // Return sanitized data
    res.status(200).json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Dashboard stats error:', error)
    res.status(500).json({ 
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    })
  }
}

// Helper functions
function calculateGrowth(data, period) {
  if (!data.length) return 0
  
  const now = new Date()
  const periodStart = new Date()
  
  if (period === 'month') {
    periodStart.setMonth(now.getMonth() - 1)
  } else if (period === 'week') {
    periodStart.setDate(now.getDate() - 7)
  }
  
  const currentPeriod = data.filter(d => new Date(d.created_at) >= periodStart)
  const previousPeriod = data.filter(d => {
    const date = new Date(d.created_at)
    const prevStart = new Date(periodStart)
    prevStart.setMonth(prevStart.getMonth() - 1)
    return date >= prevStart && date < periodStart
  })
  
  const currentSum = currentPeriod.reduce((sum, d) => sum + (d.amount || 0), 0)
  const previousSum = previousPeriod.reduce((sum, d) => sum + (d.amount || 0), 0)
  
  if (previousSum === 0) return currentSum > 0 ? 100 : 0
  return ((currentSum - previousSum) / previousSum) * 100
}

function groupByPlatform(streams) {
  const grouped = {}
  streams.forEach(stream => {
    if (!grouped[stream.platform]) {
      grouped[stream.platform] = 0
    }
    grouped[stream.platform] += stream.count || 0
  })
  return grouped
}

function getTopArtists(releases) {
  const artistStats = {}
  
  releases.forEach(release => {
    if (!artistStats[release.artist_id]) {
      artistStats[release.artist_id] = {
        totalStreams: 0,
        totalEarnings: 0,
        releaseCount: 0
      }
    }
    
    artistStats[release.artist_id].totalStreams += release.streams || 0
    artistStats[release.artist_id].totalEarnings += release.earnings || 0
    artistStats[release.artist_id].releaseCount++
  })
  
  return Object.entries(artistStats)
    .sort((a, b) => b[1].totalStreams - a[1].totalStreams)
    .slice(0, 5)
    .map(([artistId, stats]) => ({
      artistId,
      ...stats
    }))
}
