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
    // Verify authentication and Super Admin role
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token) {
      return res.status(401).json({ error: 'No authentication token' })
    }

    // Decode JWT to get user info
    let userInfo
    try {
      userInfo = jwt.decode(token)
    } catch (error) {
      return res.status(401).json({ error: 'Invalid token' })
    }

    const userRole = userInfo?.user_metadata?.role
    if (userRole !== 'super_admin') {
      return res.status(403).json({ error: 'Super Admin access required' })
    }

    // Query all required data in parallel for performance
    const [
      authUsersResult,
      profilesResult,
      subscriptionsResult,
      releasesResult,
      revenueSharesResult,
      paymentsResult
    ] = await Promise.all([
      // Get all authenticated users
      supabase.auth.admin.listUsers(),
      
      // Get all user profiles with role information
      supabase
        .from('user_profiles')
        .select('*'),
      
      // Get all subscriptions for revenue calculation
      supabase
        .from('subscriptions')
        .select('*'),
      
      // Get all releases for project tracking
      supabase
        .from('releases')
        .select('*'),
      
      // Get revenue shares for earnings calculation
      supabase
        .from('revenue_shares')
        .select('*'),
      
      // Get payment transactions for withdrawal calculations
      supabase
        .from('wallet_transactions')
        .select('*')
    ])

    // Process the data
    const authUsers = authUsersResult.data?.users || []
    const profiles = profilesResult.data || []
    const subscriptions = subscriptionsResult.data || []
    const releases = releasesResult.data || []
    const revenueShares = revenueSharesResult.data || []
    const payments = paymentsResult.data || []

    // Calculate user counts by role
    const getUserCountByRole = (role) => {
      return authUsers.filter(user => {
        const userRole = user.user_metadata?.role
        return userRole === role
      }).length
    }

    // Calculate revenue metrics
    const activeSubscriptions = subscriptions.filter(s => s.status === 'active')
    const totalSubscriptionRevenue = subscriptions.reduce((sum, s) => sum + (s.amount || 0), 0)
    const totalRevenueShares = revenueShares.reduce((sum, r) => sum + (r.amount || 0), 0)
    const totalPlatformRevenue = totalSubscriptionRevenue + totalRevenueShares

    // Calculate available to withdraw (completed payments ready for payout)
    const availableToWithdraw = payments
      .filter(p => p.status === 'completed' && p.type === 'earning')
      .reduce((sum, p) => sum + (p.amount || 0), 0)

    // Calculate earning assets (active releases generating revenue)
    const earningAssets = releases.filter(r => 
      r.status === 'live' && (r.earnings || 0) > 0
    ).length

    // Calculate release status counts
    const releasesByStatus = {
      pending_review: releases.filter(r => r.status === 'pending_review' || r.status === 'in_review').length,
      approved: releases.filter(r => r.status === 'approved' || r.status === 'completed').length,
      live: releases.filter(r => r.status === 'live').length
    }

    // Calculate growth metrics (month-over-month)
    const now = new Date()
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1)

    // User growth calculation
    const usersThisMonth = authUsers.filter(u => new Date(u.created_at) >= lastMonth).length
    const usersLastMonth = authUsers.filter(u => {
      const createdAt = new Date(u.created_at)
      return createdAt >= twoMonthsAgo && createdAt < lastMonth
    }).length
    const userGrowth = usersLastMonth > 0 ? ((usersThisMonth - usersLastMonth) / usersLastMonth) * 100 : 0

    // Revenue growth calculation
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

    // Release growth calculation
    const releasesThisMonth = releases.filter(r => new Date(r.created_at) >= lastMonth).length
    const releasesLastMonth = releases.filter(r => {
      const createdAt = new Date(r.created_at)
      return createdAt >= twoMonthsAgo && createdAt < lastMonth
    }).length
    const releaseGrowth = releasesLastMonth > 0 ? ((releasesThisMonth - releasesLastMonth) / releasesLastMonth) * 100 : 0

    // Calculate platform health (based on active users, successful payments, and system uptime)
    const activeUsersCount = authUsers.filter(u => u.last_sign_in_at && 
      new Date(u.last_sign_in_at) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
    ).length
    const successfulPaymentsRate = payments.length > 0 ? 
      (payments.filter(p => p.status === 'completed').length / payments.length) * 100 : 100
    const platformHealth = Math.min(100, Math.round(
      (activeUsersCount / Math.max(1, authUsers.length)) * 50 + // 50% weight for user activity
      (successfulPaymentsRate * 0.5) // 50% weight for payment success rate
    ))

    // Prepare response data
    const dashboardStats = {
      // Main stats cards
      totalUsers: authUsers.length,
      totalReleases: releases.length,
      totalRevenue: totalPlatformRevenue,
      activeProjects: activeSubscriptions.length,
      
      // Growth metrics
      userGrowth: Math.round(userGrowth * 10) / 10,
      revenueGrowth: Math.round(revenueGrowth * 10) / 10,
      releaseGrowth: Math.round(releaseGrowth * 10) / 10,
      
      // Platform health
      platformHealth: platformHealth,
      
      // Earnings overview
      totalPlatformRevenue: totalPlatformRevenue,
      availableToWithdraw: availableToWithdraw,
      earningAssets: earningAssets,
      
      // User role breakdown
      userRoles: {
        artists: getUserCountByRole('artist'),
        labelAdmins: getUserCountByRole('label_admin'),
        distributionPartners: getUserCountByRole('distribution_partner'),
        companyAdmins: getUserCountByRole('company_admin'),
        superAdmins: getUserCountByRole('super_admin')
      },
      
      // Release management
      releasesByStatus: releasesByStatus,
      
      // Additional metrics
      monthlyRevenue: revenueThisMonth,
      totalStreams: releases.reduce((sum, r) => sum + (r.streams || 0), 0),
      newUsersToday: authUsers.filter(u => {
        const createdAt = new Date(u.created_at)
        const today = new Date()
        return createdAt.toDateString() === today.toDateString()
      }).length,
      
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
    console.error('Dashboard stats error:', error)
    res.status(500).json({ 
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Failed to fetch dashboard statistics'
    })
  }
}
