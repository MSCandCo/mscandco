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
    const userEmail = userInfo?.email?.toLowerCase() || ''
    
    // Use the same role detection logic as frontend
    let userRole = userInfo?.user_metadata?.role || userInfo?.app_metadata?.role
    
    // Email-based role detection for known users (same as frontend)
    if (!userRole) {
      if (userEmail === 'codegroup@mscandco.com') {
        userRole = 'distribution_partner'
      } else if (userEmail.includes('codegroup') || userEmail.includes('code-group')) {
        userRole = 'distribution_partner'
      } else if (userEmail === 'labeladmin@mscandco.com') {
        userRole = 'label_admin'
      } else if (userEmail === 'companyadmin@mscandco.com') {
        userRole = 'company_admin'
      } else if (userEmail === 'superadmin@mscandco.com') {
        userRole = 'super_admin'
      } else {
        userRole = 'artist' // default
      }
    }
    
    console.log('🔍 Distribution Partner API - User role detection:', {
      userId,
      userEmail,
      detectedRole: userRole,
      user_metadata_role: userInfo?.user_metadata?.role,
      app_metadata_role: userInfo?.app_metadata?.role
    })
    
    if (userRole !== 'distribution_partner') {
      console.log('❌ Access denied - expected distribution_partner, got:', userRole)
      return res.status(403).json({ 
        error: 'Distribution Partner access required',
        details: `Your role is '${userRole}', but 'distribution_partner' is required`
      })
    }

    // Query all distribution-related data in parallel
    const [
      // All releases distributed by this partner
      releasesResult,
      
      // Revenue shares for this distribution partner
      revenueSharesResult,
      
      // Artists working with this distribution partner
      artistsResult,
      
      // Distribution partner's profile
      profileResult,
      
      // Platform statistics for context
      platformStatsResult,
      
      // Wallet transactions for this partner
      walletTransactionsResult
    ] = await Promise.all([
      // Get all releases distributed by this partner
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
        .eq('distribution_partner_id', userId)
        .order('created_at', { ascending: false }),
      
      // Get revenue shares for this distribution partner
      supabase
        .from('revenue_shares')
        .select('*')
        .eq('distribution_partner_id', userId)
        .order('created_at', { ascending: false }),
      
      // Get artists working with this distribution partner
      supabase
        .from('user_profiles')
        .select('*')
        .eq('distribution_partner_id', userId),
      
      // Get distribution partner's profile
      supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single(),
      
      // Get platform-wide statistics for context
      supabase
        .from('releases')
        .select('id, status, created_at, streams, earnings'),
      
      // Get wallet transactions for this partner
      supabase
        .from('wallet_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
    ])

    const releases = releasesResult.data || []
    const revenueShares = revenueSharesResult.data || []
    const artists = artistsResult.data || []
    const profile = profileResult.data || {}
    const platformReleases = platformStatsResult.data || []
    const walletTransactions = walletTransactionsResult.data || []

    // Calculate distribution metrics
    const totalDistributedContent = releases.length
    const liveReleases = releases.filter(r => r.status === 'live').length
    const pendingReleases = releases.filter(r => r.status === 'pending_review' || r.status === 'in_review').length
    const approvedReleases = releases.filter(r => r.status === 'approved' || r.status === 'completed').length

    // Calculate revenue metrics
    const totalPartnerRevenue = revenueShares.reduce((sum, r) => sum + (r.amount || 0), 0)
    const totalReleaseEarnings = releases.reduce((sum, r) => sum + (r.earnings || 0), 0)
    const totalStreams = releases.reduce((sum, r) => sum + (r.streams || 0), 0)

    // Calculate success rate (approved + live releases / total releases)
    const successfulReleases = liveReleases + approvedReleases
    const successRate = totalDistributedContent > 0 ? (successfulReleases / totalDistributedContent) * 100 : 100

    // Calculate growth metrics (month-over-month)
    const now = new Date()
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1)

    // Content growth
    const contentThisMonth = releases.filter(r => new Date(r.created_at) >= lastMonth).length
    const contentLastMonth = releases.filter(r => {
      const createdAt = new Date(r.created_at)
      return createdAt >= twoMonthsAgo && createdAt < lastMonth
    }).length
    const contentGrowth = contentLastMonth > 0 ? ((contentThisMonth - contentLastMonth) / contentLastMonth) * 100 : 0

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

    // Artist growth
    const artistsThisMonth = artists.filter(a => new Date(a.created_at) >= lastMonth).length
    const artistsLastMonth = artists.filter(a => {
      const createdAt = new Date(a.created_at)
      return createdAt >= twoMonthsAgo && createdAt < lastMonth
    }).length
    const artistGrowth = artistsLastMonth > 0 ? ((artistsThisMonth - artistsLastMonth) / artistsLastMonth) * 100 : 0

    // Top performing releases
    const topReleases = releases
      .sort((a, b) => (b.streams || 0) - (a.streams || 0))
      .slice(0, 5)
      .map(release => ({
        id: release.id,
        title: release.title,
        artistName: release.artist?.artist_name || `${release.artist?.first_name} ${release.artist?.last_name}`.trim() || 'Unknown Artist',
        streams: release.streams || 0,
        earnings: release.earnings || 0,
        status: release.status
      }))

    // Recent activity
    const recentReleases = releases
      .slice(0, 10)
      .map(release => ({
        id: release.id,
        title: release.title,
        artistName: release.artist?.artist_name || `${release.artist?.first_name} ${release.artist?.last_name}`.trim() || 'Unknown Artist',
        status: release.status,
        createdAt: release.created_at,
        streams: release.streams || 0
      }))

    // Platform market share (this partner's content vs total platform)
    const totalPlatformReleases = platformReleases.length
    const marketShare = totalPlatformReleases > 0 ? (totalDistributedContent / totalPlatformReleases) * 100 : 0

    // Monthly distribution trends (last 12 months)
    const monthlyDistribution = []
    for (let i = 11; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0)

      const monthReleases = releases.filter(r => {
        const createdAt = new Date(r.created_at)
        return createdAt >= monthStart && createdAt <= monthEnd
      }).length

      const monthRevenue = revenueShares.filter(r => {
        const createdAt = new Date(r.created_at)
        return createdAt >= monthStart && createdAt <= monthEnd
      }).reduce((sum, r) => sum + (r.amount || 0), 0)

      monthlyDistribution.push({
        month: date.toISOString().slice(0, 7), // YYYY-MM format
        releases: monthReleases,
        revenue: monthRevenue
      })
    }

    // Calculate available earnings
    const completedEarnings = walletTransactions
      .filter(t => t.type === 'earning' && t.status === 'completed')
      .reduce((sum, t) => sum + (t.amount || 0), 0)
    const completedWithdrawals = walletTransactions
      .filter(t => t.type === 'withdrawal' && t.status === 'completed')
      .reduce((sum, t) => sum + (t.amount || 0), 0)
    const availableEarnings = completedEarnings - completedWithdrawals

    // Prepare response data
    const dashboardStats = {
      // Main metrics
      totalDistributedContent,
      totalPartnerRevenue,
      totalArtists: artists.length,
      successRate: Math.round(successRate * 10) / 10,
      
      // Content breakdown
      liveReleases,
      pendingReleases,
      approvedReleases,
      totalStreams,
      
      // Growth metrics
      contentGrowth: Math.round(contentGrowth * 10) / 10,
      revenueGrowth: Math.round(revenueGrowth * 10) / 10,
      artistGrowth: Math.round(artistGrowth * 10) / 10,
      
      // Financial
      totalReleaseEarnings,
      availableEarnings,
      revenueThisMonth,
      
      // Performance
      topReleases,
      recentReleases,
      marketShare: Math.round(marketShare * 10) / 10,
      
      // Trends
      monthlyDistribution,
      
      // Partner info
      partnerName: profile.first_name && profile.last_name ? 
        `${profile.first_name} ${profile.last_name}` : 
        profile.artist_name || 'Distribution Partner',
      companyName: profile.company_name || 'Code Group',
      
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
    console.error('Distribution Partner dashboard stats error:', error)
    res.status(500).json({ 
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Failed to fetch distribution partner statistics'
    })
  }
}
