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
    const userEmail = userInfo?.email?.toLowerCase() || ''
    
    // Use the same role detection logic as frontend
    let userRole = userInfo?.user_metadata?.role || userInfo?.app_metadata?.role
    
    // Email-based role detection for known users (same as frontend)
    if (!userRole) {
      if (userEmail === 'companyadmin@mscandco.com') {
        userRole = 'company_admin'
      } else if (userEmail.includes('companyadmin') || userEmail.includes('admin@')) {
        userRole = 'company_admin'
      } else if (userEmail === 'superadmin@mscandco.com') {
        userRole = 'super_admin'
      } else if (userEmail.includes('super') || userEmail.includes('superadmin')) {
        userRole = 'super_admin'
      } else if (userEmail === 'labeladmin@mscandco.com') {
        userRole = 'label_admin'
      } else if (userEmail === 'codegroup@mscandco.com') {
        userRole = 'distribution_partner'
      } else if (userEmail.includes('codegroup') || userEmail.includes('code-group')) {
        userRole = 'distribution_partner'
      } else {
        userRole = 'artist' // default
      }
    }
    
    console.log('🔍 Company Admin API - User role detection:', {
      userId,
      userEmail,
      detectedRole: userRole,
      user_metadata_role: userInfo?.user_metadata?.role,
      app_metadata_role: userInfo?.app_metadata?.role
    })
    
    if (userRole !== 'company_admin') {
      console.log('❌ Access denied - expected company_admin, got:', userRole)
      return res.status(403).json({ 
        error: 'Company Admin access required',
        details: `Your role is '${userRole}', but 'company_admin' is required`
      })
    }

    // Query all company-related data in parallel
    const [
      // All users in the platform (Company Admin has oversight)
      usersResult,
      
      // All releases in the platform
      releasesResult,
      
      // All subscriptions for revenue tracking
      subscriptionsResult,
      
      // Revenue shares across the platform
      revenueSharesResult,
      
      // Artist requests for approval
      artistRequestsResult,
      
      // Label artists relationships
      labelArtistsResult,
      
      // Platform revenue tracking
      platformRevenueResult,
      
      // Wallet transactions for financial oversight
      walletTransactionsResult
    ] = await Promise.all([
      // Get all users with their profiles
      supabase.auth.admin.listUsers(),
      
      // Get all releases with artist information
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
        .order('created_at', { ascending: false }),
      
      // Get all subscriptions for revenue analysis
      supabase
        .from('subscriptions')
        .select('*')
        .order('created_at', { ascending: false }),
      
      // Get all revenue shares
      supabase
        .from('revenue_shares')
        .select('*')
        .order('created_at', { ascending: false }),
      
      // Get artist requests
      supabase
        .from('artist_requests')
        .select(`
          *,
          label_admin:user_profiles!artist_requests_label_admin_id_fkey (
            first_name,
            last_name,
            artist_name
          )
        `)
        .order('created_at', { ascending: false }),
      
      // Get label-artist relationships
      supabase
        .from('label_artists')
        .select(`
          *,
          artist:user_profiles!label_artists_artist_id_fkey (
            first_name,
            last_name,
            artist_name
          ),
          label_admin:user_profiles!label_artists_label_admin_id_fkey (
            first_name,
            last_name,
            artist_name
          )
        `),
      
      // Get platform revenue data
      supabase
        .from('platform_revenue')
        .select('*')
        .order('created_at', { ascending: false }),
      
      // Get all wallet transactions for financial oversight
      supabase
        .from('wallet_transactions')
        .select('*')
        .order('created_at', { ascending: false })
    ])

    const users = usersResult.data?.users || []
    const releases = releasesResult.data || []
    const subscriptions = subscriptionsResult.data || []
    const revenueShares = revenueSharesResult.data || []
    const artistRequests = artistRequestsResult.data || []
    const labelArtists = labelArtistsResult.data || []
    const platformRevenue = platformRevenueResult.data || []
    const walletTransactions = walletTransactionsResult.data || []

    // Calculate user metrics by role
    const usersByRole = {
      artist: users.filter(u => u.user_metadata?.role === 'artist').length,
      label_admin: users.filter(u => u.user_metadata?.role === 'label_admin').length,
      distribution_partner: users.filter(u => u.user_metadata?.role === 'distribution_partner').length,
      company_admin: users.filter(u => u.user_metadata?.role === 'company_admin').length,
      super_admin: users.filter(u => u.user_metadata?.role === 'super_admin').length
    }

    const totalUsers = users.length
    const totalReleases = releases.length
    const activeSubscriptions = subscriptions.filter(s => s.status === 'active').length

    // Calculate revenue metrics
    const totalSubscriptionRevenue = subscriptions.reduce((sum, s) => sum + (s.amount || 0), 0)
    const totalRevenueShares = revenueShares.reduce((sum, r) => sum + (r.amount || 0), 0)
    const totalPlatformRevenue = platformRevenue.reduce((sum, p) => sum + (p.amount || 0), 0)
    const totalRevenue = totalSubscriptionRevenue + totalRevenueShares + totalPlatformRevenue

    // Calculate release metrics
    const releasesByStatus = {
      draft: releases.filter(r => r.status === 'draft').length,
      submitted: releases.filter(r => r.status === 'submitted').length,
      in_review: releases.filter(r => r.status === 'in_review' || r.status === 'pending_review').length,
      approved: releases.filter(r => r.status === 'approved' || r.status === 'completed').length,
      live: releases.filter(r => r.status === 'live').length,
      rejected: releases.filter(r => r.status === 'rejected').length
    }

    // Calculate artist request metrics
    const requestsByStatus = {
      pending: artistRequests.filter(r => r.status === 'pending').length,
      approved: artistRequests.filter(r => r.status === 'approved').length,
      rejected: artistRequests.filter(r => r.status === 'rejected').length
    }

    // Calculate growth metrics (month-over-month)
    const now = new Date()
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1)

    // User growth
    const usersThisMonth = users.filter(u => new Date(u.created_at) >= lastMonth).length
    const usersLastMonth = users.filter(u => {
      const createdAt = new Date(u.created_at)
      return createdAt >= twoMonthsAgo && createdAt < lastMonth
    }).length
    const userGrowth = usersLastMonth > 0 ? ((usersThisMonth - usersLastMonth) / usersLastMonth) * 100 : 0

    // Revenue growth
    const revenueThisMonth = subscriptions
      .filter(s => new Date(s.created_at) >= lastMonth)
      .reduce((sum, s) => sum + (s.amount || 0), 0)
    const revenueLastMonth = subscriptions
      .filter(s => {
        const createdAt = new Date(s.created_at)
        return createdAt >= twoMonthsAgo && createdAt < lastMonth
      })
      .reduce((sum, s) => sum + (s.amount || 0), 0)
    const revenueGrowth = revenueLastMonth > 0 ? ((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100 : 0

    // Release growth
    const releasesThisMonth = releases.filter(r => new Date(r.created_at) >= lastMonth).length
    const releasesLastMonth = releases.filter(r => {
      const createdAt = new Date(r.created_at)
      return createdAt >= twoMonthsAgo && createdAt < lastMonth
    }).length
    const releaseGrowth = releasesLastMonth > 0 ? ((releasesThisMonth - releasesLastMonth) / releasesLastMonth) * 100 : 0

    // Platform health metrics
    const platformHealth = {
      userRetention: totalUsers > 0 ? (activeSubscriptions / totalUsers) * 100 : 0,
      releaseApprovalRate: totalReleases > 0 ? ((releasesByStatus.approved + releasesByStatus.live) / totalReleases) * 100 : 100,
      artistRequestApprovalRate: artistRequests.length > 0 ? (requestsByStatus.approved / artistRequests.length) * 100 : 100,
      overallHealth: totalUsers > 0 ? 100 : 0
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

      const monthRevenue = subscriptions.filter(s => {
        const createdAt = new Date(s.created_at)
        return createdAt >= monthStart && createdAt <= monthEnd
      }).reduce((sum, s) => sum + (s.amount || 0), 0)

      monthlyTrends.push({
        month: date.toISOString().slice(0, 7),
        users: monthUsers,
        releases: monthReleases,
        revenue: monthRevenue
      })
    }

    // Top performing artists (by total streams/earnings)
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
      .slice(0, 10)

    // Recent activity summary
    const recentActivity = {
      newUsers: users.filter(u => new Date(u.created_at) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length,
      newReleases: releases.filter(r => new Date(r.created_at) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length,
      pendingRequests: requestsByStatus.pending,
      releasesNeedingReview: releasesByStatus.in_review
    }

    // Financial overview
    const financialOverview = {
      totalRevenue,
      subscriptionRevenue: totalSubscriptionRevenue,
      revenueShares: totalRevenueShares,
      platformRevenue: totalPlatformRevenue,
      
      // Wallet overview
      totalWalletBalance: walletTransactions
        .filter(t => t.type === 'deposit' && t.status === 'completed')
        .reduce((sum, t) => sum + (t.amount || 0), 0) -
        walletTransactions
        .filter(t => t.type === 'withdrawal' && t.status === 'completed')
        .reduce((sum, t) => sum + (t.amount || 0), 0),
      
      pendingPayouts: walletTransactions
        .filter(t => t.type === 'withdrawal' && t.status === 'pending')
        .reduce((sum, t) => sum + (t.amount || 0), 0)
    }

    // Prepare response data
    const dashboardStats = {
      // Core metrics
      totalUsers,
      totalReleases,
      totalRevenue,
      activeSubscriptions,
      
      // User breakdown
      usersByRole,
      
      // Release breakdown
      releasesByStatus,
      
      // Request management
      requestsByStatus,
      pendingApprovals: requestsByStatus.pending + releasesByStatus.in_review,
      
      // Growth metrics
      userGrowth: Math.round(userGrowth * 10) / 10,
      revenueGrowth: Math.round(revenueGrowth * 10) / 10,
      releaseGrowth: Math.round(releaseGrowth * 10) / 10,
      
      // Platform health
      platformHealth: Math.round(platformHealth.overallHealth),
      userRetention: Math.round(platformHealth.userRetention * 10) / 10,
      releaseApprovalRate: Math.round(platformHealth.releaseApprovalRate * 10) / 10,
      artistRequestApprovalRate: Math.round(platformHealth.artistRequestApprovalRate * 10) / 10,
      
      // Performance data
      topArtists,
      monthlyTrends,
      recentActivity,
      financialOverview,
      
      // Label management
      totalLabelArtists: labelArtists.length,
      activeLabelAdmins: usersByRole.label_admin,
      
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
    console.error('Company Admin dashboard stats error:', error)
    res.status(500).json({ 
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Failed to fetch company admin statistics'
    })
  }
}
