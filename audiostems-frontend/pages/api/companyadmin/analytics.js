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
    // Verify authentication and Company Admin role
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
    if (userRole !== 'company_admin') {
      return res.status(403).json({ error: 'Company Admin access required' })
    }

    // Get query parameters for date filtering
    const { startDate, endDate, userRole: filterRole, genre } = req.query

    // Query comprehensive analytics data
    const [
      usersResult,
      releasesResult,
      subscriptionsResult,
      revenueSharesResult,
      streamsResult,
      walletTransactionsResult
    ] = await Promise.all([
      // Get all users with profiles
      supabase.auth.admin.listUsers(),
      
      // Get all releases with detailed information
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
        `),
      
      // Get all subscriptions
      supabase
        .from('subscriptions')
        .select('*'),
      
      // Get all revenue shares
      supabase
        .from('revenue_shares')
        .select('*'),
      
      // Get streaming data if available
      supabase
        .from('streams')
        .select('*'),
      
      // Get wallet transactions
      supabase
        .from('wallet_transactions')
        .select('*')
    ])

    const users = usersResult.data?.users || []
    const releases = releasesResult.data || []
    const subscriptions = subscriptionsResult.data || []
    const revenueShares = revenueSharesResult.data || []
    const streams = streamsResult.data || []
    const walletTransactions = walletTransactionsResult.data || []

    // Apply date filtering if provided
    let filteredUsers = users
    let filteredReleases = releases
    let filteredSubscriptions = subscriptions

    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      
      filteredUsers = users.filter(u => {
        const date = new Date(u.created_at)
        return date >= start && date <= end
      })
      
      filteredReleases = releases.filter(r => {
        const date = new Date(r.created_at)
        return date >= start && date <= end
      })
      
      filteredSubscriptions = subscriptions.filter(s => {
        const date = new Date(s.created_at)
        return date >= start && date <= end
      })
    }

    // Apply role filtering if provided
    if (filterRole) {
      filteredUsers = filteredUsers.filter(u => u.user_metadata?.role === filterRole)
    }

    // Apply genre filtering if provided
    if (genre) {
      filteredReleases = filteredReleases.filter(r => r.genre === genre)
    }

    // Calculate user analytics
    const userAnalytics = {
      totalUsers: filteredUsers.length,
      usersByRole: {
        artist: filteredUsers.filter(u => u.user_metadata?.role === 'artist').length,
        label_admin: filteredUsers.filter(u => u.user_metadata?.role === 'label_admin').length,
        distribution_partner: filteredUsers.filter(u => u.user_metadata?.role === 'distribution_partner').length,
        company_admin: filteredUsers.filter(u => u.user_metadata?.role === 'company_admin').length,
        super_admin: filteredUsers.filter(u => u.user_metadata?.role === 'super_admin').length
      },
      usersByCountry: {},
      userRegistrationTrends: []
    }

    // Calculate users by country (from profiles)
    const userProfiles = await supabase
      .from('user_profiles')
      .select('country')
      .in('id', filteredUsers.map(u => u.id))

    if (userProfiles.data) {
      userProfiles.data.forEach(profile => {
        const country = profile.country || 'Unknown'
        userAnalytics.usersByCountry[country] = (userAnalytics.usersByCountry[country] || 0) + 1
      })
    }

    // Calculate release analytics
    const releaseAnalytics = {
      totalReleases: filteredReleases.length,
      releasesByStatus: {
        draft: filteredReleases.filter(r => r.status === 'draft').length,
        submitted: filteredReleases.filter(r => r.status === 'submitted').length,
        in_review: filteredReleases.filter(r => r.status === 'in_review' || r.status === 'pending_review').length,
        approved: filteredReleases.filter(r => r.status === 'approved' || r.status === 'completed').length,
        live: filteredReleases.filter(r => r.status === 'live').length,
        rejected: filteredReleases.filter(r => r.status === 'rejected').length
      },
      releasesByGenre: {},
      releasesByCountry: {},
      totalStreams: filteredReleases.reduce((sum, r) => sum + (r.streams || 0), 0),
      totalEarnings: filteredReleases.reduce((sum, r) => sum + (r.earnings || 0), 0)
    }

    // Calculate releases by genre
    filteredReleases.forEach(release => {
      const genre = release.genre || 'Unknown'
      releaseAnalytics.releasesByGenre[genre] = (releaseAnalytics.releasesByGenre[genre] || 0) + 1
    })

    // Calculate releases by country (artist's country)
    filteredReleases.forEach(release => {
      const country = release.artist?.country || 'Unknown'
      releaseAnalytics.releasesByCountry[country] = (releaseAnalytics.releasesByCountry[country] || 0) + 1
    })

    // Calculate subscription analytics
    const subscriptionAnalytics = {
      totalSubscriptions: filteredSubscriptions.length,
      activeSubscriptions: filteredSubscriptions.filter(s => s.status === 'active').length,
      subscriptionsByTier: {},
      subscriptionRevenue: filteredSubscriptions.reduce((sum, s) => sum + (s.amount || 0), 0),
      averageSubscriptionValue: filteredSubscriptions.length > 0 ? 
        filteredSubscriptions.reduce((sum, s) => sum + (s.amount || 0), 0) / filteredSubscriptions.length : 0
    }

    // Calculate subscriptions by tier
    filteredSubscriptions.forEach(subscription => {
      const tier = subscription.tier || 'unknown'
      subscriptionAnalytics.subscriptionsByTier[tier] = (subscriptionAnalytics.subscriptionsByTier[tier] || 0) + 1
    })

    // Calculate revenue analytics
    const revenueAnalytics = {
      totalRevenue: subscriptionAnalytics.subscriptionRevenue + revenueShares.reduce((sum, r) => sum + (r.amount || 0), 0),
      subscriptionRevenue: subscriptionAnalytics.subscriptionRevenue,
      revenueShares: revenueShares.reduce((sum, r) => sum + (r.amount || 0), 0),
      walletTransactions: walletTransactions.reduce((sum, t) => sum + Math.abs(t.amount || 0), 0)
    }

    // Monthly trends (last 12 months)
    const monthlyTrends = []
    for (let i = 11; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0)

      const monthUsers = users.filter(u => {
        const createdAt = new Date(u.created_at)
        return createdAt >= monthStart && createdAt <= monthEnd
      }).length

      const monthReleases = releases.filter(r => {
        const createdAt = new Date(r.created_at)
        return createdAt >= monthStart && createdAt <= monthEnd
      }).length

      const monthSubscriptions = subscriptions.filter(s => {
        const createdAt = new Date(s.created_at)
        return createdAt >= monthStart && createdAt <= monthEnd
      }).length

      const monthRevenue = subscriptions.filter(s => {
        const createdAt = new Date(s.created_at)
        return createdAt >= monthStart && createdAt <= monthEnd
      }).reduce((sum, s) => sum + (s.amount || 0), 0)

      const monthStreams = releases.filter(r => {
        const createdAt = new Date(r.created_at)
        return createdAt >= monthStart && createdAt <= monthEnd
      }).reduce((sum, r) => sum + (r.streams || 0), 0)

      monthlyTrends.push({
        month: date.toISOString().slice(0, 7),
        users: monthUsers,
        releases: monthReleases,
        subscriptions: monthSubscriptions,
        revenue: monthRevenue,
        streams: monthStreams
      })
    }

    // Top performing content
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
        status: release.status,
        releaseDate: release.release_date
      }))

    // Top performing artists
    const artistPerformance = {}
    filteredReleases.forEach(release => {
      const artistId = release.artist_id
      const artistName = release.artist?.artist_name || `${release.artist?.first_name} ${release.artist?.last_name}`.trim() || 'Unknown Artist'
      
      if (!artistPerformance[artistId]) {
        artistPerformance[artistId] = {
          artistId,
          artistName,
          totalStreams: 0,
          totalEarnings: 0,
          releaseCount: 0,
          country: release.artist?.country || 'Unknown'
        }
      }
      
      artistPerformance[artistId].totalStreams += release.streams || 0
      artistPerformance[artistId].totalEarnings += release.earnings || 0
      artistPerformance[artistId].releaseCount++
    })

    const topArtists = Object.values(artistPerformance)
      .sort((a, b) => b.totalStreams - a.totalStreams)
      .slice(0, 10)

    // Growth calculations
    const currentMonth = new Date()
    const lastMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    const twoMonthsAgo = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 2, 1)

    const thisMonthUsers = users.filter(u => new Date(u.created_at) >= lastMonth).length
    const lastMonthUsers = users.filter(u => {
      const createdAt = new Date(u.created_at)
      return createdAt >= twoMonthsAgo && createdAt < lastMonth
    }).length

    const userGrowth = lastMonthUsers > 0 ? ((thisMonthUsers - lastMonthUsers) / lastMonthUsers) * 100 : 0

    const thisMonthRevenue = subscriptions
      .filter(s => new Date(s.created_at) >= lastMonth)
      .reduce((sum, s) => sum + (s.amount || 0), 0)
    
    const lastMonthRevenue = subscriptions
      .filter(s => {
        const createdAt = new Date(s.created_at)
        return createdAt >= twoMonthsAgo && createdAt < lastMonth
      })
      .reduce((sum, s) => sum + (s.amount || 0), 0)

    const revenueGrowth = lastMonthRevenue > 0 ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0

    const analyticsData = {
      // Core analytics
      userAnalytics,
      releaseAnalytics,
      subscriptionAnalytics,
      revenueAnalytics,
      
      // Time series data
      monthlyTrends,
      
      // Top performers
      topReleases,
      topArtists,
      
      // Growth metrics
      userGrowth: Math.round(userGrowth * 10) / 10,
      revenueGrowth: Math.round(revenueGrowth * 10) / 10,
      
      // Platform insights
      platformInsights: {
        averageReleasesPerArtist: userAnalytics.usersByRole.artist > 0 ? 
          releaseAnalytics.totalReleases / userAnalytics.usersByRole.artist : 0,
        averageStreamsPerRelease: releaseAnalytics.totalReleases > 0 ? 
          releaseAnalytics.totalStreams / releaseAnalytics.totalReleases : 0,
        subscriptionConversionRate: userAnalytics.totalUsers > 0 ? 
          (subscriptionAnalytics.activeSubscriptions / userAnalytics.totalUsers) * 100 : 0
      },
      
      // Filters applied
      filters: {
        startDate,
        endDate,
        userRole: filterRole,
        genre
      },
      
      // System info
      lastUpdated: new Date().toISOString(),
      dataRange: {
        earliestUser: users.length > 0 ? 
          Math.min(...users.map(u => new Date(u.created_at).getTime())) : null,
        latestUser: users.length > 0 ? 
          Math.max(...users.map(u => new Date(u.created_at).getTime())) : null,
        earliestRelease: releases.length > 0 ? 
          Math.min(...releases.map(r => new Date(r.created_at).getTime())) : null,
        latestRelease: releases.length > 0 ? 
          Math.max(...releases.map(r => new Date(r.created_at).getTime())) : null
      }
    }

    res.status(200).json({
      success: true,
      data: analyticsData,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Company Admin analytics error:', error)
    res.status(500).json({ 
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Failed to fetch analytics data'
    })
  }
}
