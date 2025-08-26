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
    // Verify authentication and Label Admin role
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
    const userEmail = userInfo?.email?.toLowerCase() || ''
    
    // Use the same role detection logic as frontend
    let userRole = userInfo?.user_metadata?.role || userInfo?.app_metadata?.role
    
    // Email-based role detection for known users (same as frontend)
    if (!userRole) {
      if (userEmail === 'labeladmin@mscandco.com') {
        userRole = 'label_admin'
      } else if (userEmail === 'codegroup@mscandco.com') {
        userRole = 'distribution_partner'
      } else if (userEmail.includes('codegroup') || userEmail.includes('code-group')) {
        userRole = 'distribution_partner'
      } else if (userEmail === 'companyadmin@mscandco.com') {
        userRole = 'company_admin'
      } else if (userEmail === 'superadmin@mscandco.com') {
        userRole = 'super_admin'
      } else {
        userRole = 'artist' // default
      }
    }
    
    console.log('🔍 Label Admin API - User role detection:', {
      userId,
      userEmail,
      detectedRole: userRole,
      user_metadata_role: userInfo?.user_metadata?.role,
      app_metadata_role: userInfo?.app_metadata?.role
    })
    
    if (userRole !== 'label_admin') {
      console.log('❌ Access denied - expected label_admin, got:', userRole)
      return res.status(403).json({ 
        error: 'Label Admin access required',
        details: `Your role is '${userRole}', but 'label_admin' is required`
      })
    }

    // Query all label admin-related data in parallel
    const [
      // Label admin's profile
      profileResult,
      
      // Artists managed by this label admin
      labelArtistsResult,
      
      // Releases by artists under this label
      releasesResult,
      
      // Revenue shares for this label
      revenueSharesResult,
      
      // Subscription information
      subscriptionResult,
      
      // Wallet transactions
      walletTransactionsResult,
      
      // Artist requests for this label admin
      artistRequestsResult
    ] = await Promise.all([
      // Get label admin profile
      supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single(),
      
      // Get artists managed by this label admin
      supabase
        .from('label_artists')
        .select(`
          *,
          artist:user_profiles!label_artists_artist_id_fkey (
            id,
            first_name,
            last_name,
            artist_name,
            email,
            country,
            artist_type
          )
        `)
        .eq('label_admin_id', userId),
      
      // Get releases by artists under this label
      supabase
        .from('releases')
        .select(`
          *,
          artist:user_profiles!releases_artist_id_fkey (
            id,
            first_name,
            last_name,
            artist_name,
            email
          )
        `)
        .eq('label_admin_id', userId)
        .order('created_at', { ascending: false }),
      
      // Get revenue shares for this label
      supabase
        .from('revenue_shares')
        .select('*')
        .eq('label_admin_id', userId)
        .order('created_at', { ascending: false }),
      
      // Get label admin's subscription
      supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1),
      
      // Get wallet transactions
      supabase
        .from('wallet_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),
      
      // Get artist requests for this label admin
      supabase
        .from('artist_requests')
        .select('*')
        .eq('label_admin_id', userId)
        .order('created_at', { ascending: false })
    ])

    const profile = profileResult.data || {}
    const labelArtists = labelArtistsResult.data || []
    const releases = releasesResult.data || []
    const revenueShares = revenueSharesResult.data || []
    const subscription = subscriptionResult.data?.[0] || null
    const walletTransactions = walletTransactionsResult.data || []
    const artistRequests = artistRequestsResult.data || []

    // Calculate artist metrics
    const totalArtists = labelArtists.length
    const activeArtists = labelArtists.filter(la => la.status === 'active').length
    const pendingArtists = labelArtists.filter(la => la.status === 'pending').length

    // Calculate release metrics
    const totalReleases = releases.length
    const releasesByStatus = {
      draft: releases.filter(r => r.status === 'draft').length,
      submitted: releases.filter(r => r.status === 'submitted').length,
      in_review: releases.filter(r => r.status === 'in_review' || r.status === 'pending_review').length,
      approved: releases.filter(r => r.status === 'approved' || r.status === 'completed').length,
      live: releases.filter(r => r.status === 'live').length,
      rejected: releases.filter(r => r.status === 'rejected').length
    }

    // Calculate streaming and earnings metrics
    const totalStreams = releases.reduce((sum, r) => sum + (r.streams || 0), 0)
    const totalEarnings = releases.reduce((sum, r) => sum + (r.earnings || 0), 0)
    const totalRevenueShares = revenueShares.reduce((sum, r) => sum + (r.amount || 0), 0)
    const totalRevenue = totalEarnings + totalRevenueShares

    // Calculate averages
    const avgStreamsPerRelease = totalReleases > 0 ? totalStreams / totalReleases : 0
    const avgEarningsPerRelease = totalReleases > 0 ? totalEarnings / totalReleases : 0
    const avgStreamsPerArtist = activeArtists > 0 ? totalStreams / activeArtists : 0
    const avgEarningsPerArtist = activeArtists > 0 ? totalRevenue / activeArtists : 0

    // Calculate wallet metrics
    const walletBalance = profile.wallet_balance || 0
    const totalDeposits = walletTransactions
      .filter(t => t.type === 'deposit' && t.status === 'completed')
      .reduce((sum, t) => sum + (t.amount || 0), 0)
    const totalWithdrawals = walletTransactions
      .filter(t => t.type === 'withdrawal' && t.status === 'completed')
      .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0)
    const pendingEarnings = walletTransactions
      .filter(t => t.type === 'earning' && t.status === 'pending')
      .reduce((sum, t) => sum + (t.amount || 0), 0)

    // Calculate growth metrics (month-over-month)
    const now = new Date()
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1)

    // Artist growth
    const artistsThisMonth = labelArtists.filter(la => new Date(la.created_at) >= lastMonth).length
    const artistsLastMonth = labelArtists.filter(la => {
      const createdAt = new Date(la.created_at)
      return createdAt >= twoMonthsAgo && createdAt < lastMonth
    }).length
    const artistGrowth = artistsLastMonth > 0 ? ((artistsThisMonth - artistsLastMonth) / artistsLastMonth) * 100 : 0

    // Release growth
    const releasesThisMonth = releases.filter(r => new Date(r.created_at) >= lastMonth).length
    const releasesLastMonth = releases.filter(r => {
      const createdAt = new Date(r.created_at)
      return createdAt >= twoMonthsAgo && createdAt < lastMonth
    }).length
    const releaseGrowth = releasesLastMonth > 0 ? ((releasesThisMonth - releasesLastMonth) / releasesLastMonth) * 100 : 0

    // Revenue growth
    const revenueThisMonth = revenueShares
      .filter(r => new Date(r.created_at) >= lastMonth)
      .reduce((sum, r) => sum + (r.amount || 0), 0)
    const revenueLastMonth = revenueShares
      .filter(r => {
        const createdAt = new Date(r.created_at)
        return createdAt >= twoMonthsAgo && createdAt < lastMonth
      })
      .reduce((sum, r) => sum + (r.amount || 0), 0)
    const revenueGrowth = revenueLastMonth > 0 ? ((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100 : 0

    // Monthly performance trends (last 12 months)
    const monthlyPerformance = []
    for (let i = 11; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0)

      const monthReleases = releases.filter(r => {
        const createdAt = new Date(r.created_at)
        return createdAt >= monthStart && createdAt <= monthEnd
      }).length

      const monthStreams = releases.filter(r => {
        const createdAt = new Date(r.created_at)
        return createdAt >= monthStart && createdAt <= monthEnd
      }).reduce((sum, r) => sum + (r.streams || 0), 0)

      const monthRevenue = revenueShares.filter(r => {
        const createdAt = new Date(r.created_at)
        return createdAt >= monthStart && createdAt <= monthEnd
      }).reduce((sum, r) => sum + (r.amount || 0), 0)

      monthlyPerformance.push({
        month: date.toISOString().slice(0, 7),
        releases: monthReleases,
        streams: monthStreams,
        revenue: monthRevenue
      })
    }

    // Top performing releases
    const topReleases = releases
      .sort((a, b) => (b.streams || 0) - (a.streams || 0))
      .slice(0, 5)
      .map(release => ({
        id: release.id,
        title: release.title,
        artistName: release.artist?.artist_name || `${release.artist?.first_name} ${release.artist?.last_name}`.trim(),
        streams: release.streams || 0,
        earnings: release.earnings || 0,
        status: release.status,
        releaseDate: release.release_date,
        genre: release.genre
      }))

    // Top performing artists
    const artistPerformance = {}
    releases.forEach(release => {
      const artistId = release.artist_id
      const artistName = release.artist?.artist_name || `${release.artist?.first_name} ${release.artist?.last_name}`.trim() || 'Unknown Artist'
      
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
      .slice(0, 5)

    // Recent activity
    const recentReleases = releases
      .slice(0, 5)
      .map(release => ({
        id: release.id,
        title: release.title,
        artistName: release.artist?.artist_name || `${release.artist?.first_name} ${release.artist?.last_name}`.trim(),
        status: release.status,
        createdAt: release.created_at,
        streams: release.streams || 0,
        earnings: release.earnings || 0
      }))

    // Subscription status
    const subscriptionStatus = {
      isActive: subscription?.status === 'active',
      tier: subscription?.tier || 'none',
      billingCycle: subscription?.billing_cycle || 'monthly',
      amount: subscription?.amount || 0,
      currency: subscription?.currency || 'GBP',
      nextBillingDate: subscription?.current_period_end,
      artistsUsed: totalArtists,
      artistsLimit: subscription?.tier === 'label_admin_starter' ? 4 : 
                   subscription?.tier === 'label_admin_pro' ? 999999 : 0,
      releasesUsed: totalReleases,
      releasesLimit: subscription?.tier === 'label_admin_starter' ? 8 : 
                    subscription?.tier === 'label_admin_pro' ? 999999 : 0
    }

    // Artist requests summary
    const requestsSummary = {
      total: artistRequests.length,
      pending: artistRequests.filter(r => r.status === 'pending').length,
      approved: artistRequests.filter(r => r.status === 'approved').length,
      rejected: artistRequests.filter(r => r.status === 'rejected').length
    }

    // Genre breakdown
    const genreBreakdown = {}
    releases.forEach(release => {
      const genre = release.genre || 'Unknown'
      if (!genreBreakdown[genre]) {
        genreBreakdown[genre] = {
          releases: 0,
          streams: 0,
          earnings: 0
        }
      }
      genreBreakdown[genre].releases++
      genreBreakdown[genre].streams += release.streams || 0
      genreBreakdown[genre].earnings += release.earnings || 0
    })

    // Prepare response data
    const dashboardStats = {
      // Label information
      labelName: profile.artist_name || `${profile.first_name} ${profile.last_name}`.trim() || 'Label Admin',
      
      // Core metrics
      totalArtists,
      activeArtists,
      pendingArtists,
      totalReleases,
      totalStreams,
      totalEarnings,
      totalRevenue,
      
      // Averages
      avgStreamsPerRelease: Math.round(avgStreamsPerRelease),
      avgEarningsPerRelease: Math.round(avgEarningsPerRelease * 100) / 100,
      avgStreamsPerArtist: Math.round(avgStreamsPerArtist),
      avgEarningsPerArtist: Math.round(avgEarningsPerArtist * 100) / 100,
      
      // Release breakdown
      releasesByStatus,
      
      // Growth metrics
      artistGrowth: Math.round(artistGrowth * 10) / 10,
      releaseGrowth: Math.round(releaseGrowth * 10) / 10,
      revenueGrowth: Math.round(revenueGrowth * 10) / 10,
      
      // Financial metrics
      walletBalance,
      totalDeposits,
      totalWithdrawals,
      pendingEarnings,
      totalRevenueShares,
      
      // Performance data
      topReleases,
      topArtists,
      recentReleases,
      monthlyPerformance,
      
      // Subscription information
      subscriptionStatus,
      
      // Artist requests
      requestsSummary,
      
      // Genre insights
      genreBreakdown,
      
      // System info
      lastUpdated: new Date().toISOString(),
      systemStatus: 'operational'
    }

    res.status(200).json({
      success: true,
      data: dashboardStats,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Label Admin dashboard stats error:', error)
    res.status(500).json({ 
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Failed to fetch label admin statistics'
    })
  }
}
