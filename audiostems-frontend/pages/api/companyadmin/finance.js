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

    // Get query parameters for filtering
    const { startDate, endDate, currency = 'GBP' } = req.query

    // Query comprehensive financial data
    const [
      subscriptionsResult,
      revenueSharesResult,
      walletTransactionsResult,
      releasesResult,
      platformRevenueResult,
      usersResult
    ] = await Promise.all([
      // Get all subscriptions across the platform
      supabase
        .from('subscriptions')
        .select(`
          *,
          user:user_profiles!subscriptions_user_id_fkey (
            first_name,
            last_name,
            artist_name,
            email
          )
        `)
        .order('created_at', { ascending: false }),
      
      // Get all revenue shares
      supabase
        .from('revenue_shares')
        .select(`
          *,
          release:releases (
            id,
            title,
            artist_id,
            artist:user_profiles!releases_artist_id_fkey (
              first_name,
              last_name,
              artist_name
            )
          )
        `)
        .order('created_at', { ascending: false }),
      
      // Get all wallet transactions
      supabase
        .from('wallet_transactions')
        .select(`
          *,
          user:user_profiles!wallet_transactions_user_id_fkey (
            first_name,
            last_name,
            artist_name,
            email
          )
        `)
        .order('created_at', { ascending: false }),
      
      // Get releases with earnings data
      supabase
        .from('releases')
        .select(`
          *,
          artist:user_profiles!releases_artist_id_fkey (
            first_name,
            last_name,
            artist_name,
            email
          )
        `)
        .not('earnings', 'is', null),
      
      // Get platform revenue records
      supabase
        .from('platform_revenue')
        .select('*')
        .order('created_at', { ascending: false }),
      
      // Get user data for financial analysis
      supabase.auth.admin.listUsers()
    ])

    const subscriptions = subscriptionsResult.data || []
    const revenueShares = revenueSharesResult.data || []
    const walletTransactions = walletTransactionsResult.data || []
    const releases = releasesResult.data || []
    const platformRevenue = platformRevenueResult.data || []
    const users = usersResult.data?.users || []

    // Apply date filtering if provided
    let filteredSubscriptions = subscriptions
    let filteredRevenueShares = revenueShares
    let filteredTransactions = walletTransactions
    let filteredReleases = releases
    let filteredPlatformRevenue = platformRevenue

    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      
      filteredSubscriptions = subscriptions.filter(s => {
        const date = new Date(s.created_at)
        return date >= start && date <= end
      })
      
      filteredRevenueShares = revenueShares.filter(r => {
        const date = new Date(r.created_at)
        return date >= start && date <= end
      })
      
      filteredTransactions = walletTransactions.filter(t => {
        const date = new Date(t.created_at)
        return date >= start && date <= end
      })
      
      filteredReleases = releases.filter(r => {
        const date = new Date(r.created_at)
        return date >= start && date <= end
      })
      
      filteredPlatformRevenue = platformRevenue.filter(p => {
        const date = new Date(p.created_at)
        return date >= start && date <= end
      })
    }

    // Calculate subscription revenue metrics
    const subscriptionMetrics = {
      totalRevenue: filteredSubscriptions.reduce((sum, s) => sum + (s.amount || 0), 0),
      activeSubscriptions: filteredSubscriptions.filter(s => s.status === 'active').length,
      totalSubscriptions: filteredSubscriptions.length,
      averageSubscriptionValue: filteredSubscriptions.length > 0 ? 
        filteredSubscriptions.reduce((sum, s) => sum + (s.amount || 0), 0) / filteredSubscriptions.length : 0,
      
      // Subscription breakdown by tier
      byTier: {},
      
      // Monthly recurring revenue (MRR)
      monthlyRecurringRevenue: filteredSubscriptions
        .filter(s => s.status === 'active' && s.billing_cycle === 'monthly')
        .reduce((sum, s) => sum + (s.amount || 0), 0),
      
      // Annual recurring revenue (ARR)
      annualRecurringRevenue: filteredSubscriptions
        .filter(s => s.status === 'active')
        .reduce((sum, s) => {
          const amount = s.amount || 0
          return sum + (s.billing_cycle === 'yearly' ? amount : amount * 12)
        }, 0)
    }

    // Calculate subscription breakdown by tier
    filteredSubscriptions.forEach(subscription => {
      const tier = subscription.tier || 'unknown'
      if (!subscriptionMetrics.byTier[tier]) {
        subscriptionMetrics.byTier[tier] = {
          count: 0,
          revenue: 0,
          active: 0
        }
      }
      subscriptionMetrics.byTier[tier].count++
      subscriptionMetrics.byTier[tier].revenue += subscription.amount || 0
      if (subscription.status === 'active') {
        subscriptionMetrics.byTier[tier].active++
      }
    })

    // Calculate revenue share metrics
    const revenueShareMetrics = {
      totalRevenueShares: filteredRevenueShares.reduce((sum, r) => sum + (r.amount || 0), 0),
      totalShares: filteredRevenueShares.length,
      averageShareAmount: filteredRevenueShares.length > 0 ? 
        filteredRevenueShares.reduce((sum, r) => sum + (r.amount || 0), 0) / filteredRevenueShares.length : 0,
      
      // Revenue shares by type
      byType: {},
      
      // Top earning releases
      topEarningReleases: []
    }

    // Calculate revenue shares by type
    filteredRevenueShares.forEach(share => {
      const type = share.share_type || 'unknown'
      revenueShareMetrics.byType[type] = (revenueShareMetrics.byType[type] || 0) + (share.amount || 0)
    })

    // Calculate release earnings
    const releaseEarnings = {
      totalEarnings: filteredReleases.reduce((sum, r) => sum + (r.earnings || 0), 0),
      totalStreams: filteredReleases.reduce((sum, r) => sum + (r.streams || 0), 0),
      averageEarningsPerRelease: filteredReleases.length > 0 ? 
        filteredReleases.reduce((sum, r) => sum + (r.earnings || 0), 0) / filteredReleases.length : 0,
      averageStreamsPerRelease: filteredReleases.length > 0 ? 
        filteredReleases.reduce((sum, r) => sum + (r.streams || 0), 0) / filteredReleases.length : 0
    }

    // Calculate wallet metrics
    const walletMetrics = {
      totalTransactionVolume: filteredTransactions.reduce((sum, t) => sum + Math.abs(t.amount || 0), 0),
      totalDeposits: filteredTransactions
        .filter(t => t.type === 'deposit' && t.status === 'completed')
        .reduce((sum, t) => sum + (t.amount || 0), 0),
      totalWithdrawals: filteredTransactions
        .filter(t => t.type === 'withdrawal' && t.status === 'completed')
        .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0),
      pendingTransactions: filteredTransactions.filter(t => t.status === 'pending').length,
      failedTransactions: filteredTransactions.filter(t => t.status === 'failed').length,
      successRate: filteredTransactions.length > 0 ? 
        (filteredTransactions.filter(t => t.status === 'completed').length / filteredTransactions.length) * 100 : 100
    }

    // Calculate platform revenue
    const platformMetrics = {
      totalPlatformRevenue: filteredPlatformRevenue.reduce((sum, p) => sum + (p.amount || 0), 0),
      platformFees: filteredPlatformRevenue
        .filter(p => p.revenue_type === 'platform_fee')
        .reduce((sum, p) => sum + (p.amount || 0), 0),
      distributionFees: filteredPlatformRevenue
        .filter(p => p.revenue_type === 'distribution_fee')
        .reduce((sum, p) => sum + (p.amount || 0), 0)
    }

    // Calculate total company revenue
    const totalRevenue = subscriptionMetrics.totalRevenue + 
                        revenueShareMetrics.totalRevenueShares + 
                        releaseEarnings.totalEarnings + 
                        platformMetrics.totalPlatformRevenue

    // Monthly financial trends (last 12 months)
    const monthlyFinancials = []
    for (let i = 11; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0)

      const monthSubscriptions = subscriptions.filter(s => {
        const createdAt = new Date(s.created_at)
        return createdAt >= monthStart && createdAt <= monthEnd
      }).reduce((sum, s) => sum + (s.amount || 0), 0)

      const monthRevenueShares = revenueShares.filter(r => {
        const createdAt = new Date(r.created_at)
        return createdAt >= monthStart && createdAt <= monthEnd
      }).reduce((sum, r) => sum + (r.amount || 0), 0)

      const monthReleaseEarnings = releases.filter(r => {
        const createdAt = new Date(r.created_at)
        return createdAt >= monthStart && createdAt <= monthEnd
      }).reduce((sum, r) => sum + (r.earnings || 0), 0)

      const monthPlatformRevenue = platformRevenue.filter(p => {
        const createdAt = new Date(p.created_at)
        return createdAt >= monthStart && createdAt <= monthEnd
      }).reduce((sum, p) => sum + (p.amount || 0), 0)

      const monthTransactionVolume = walletTransactions.filter(t => {
        const createdAt = new Date(t.created_at)
        return createdAt >= monthStart && createdAt <= monthEnd
      }).reduce((sum, t) => sum + Math.abs(t.amount || 0), 0)

      monthlyFinancials.push({
        month: date.toISOString().slice(0, 7),
        subscriptionRevenue: monthSubscriptions,
        revenueShares: monthRevenueShares,
        releaseEarnings: monthReleaseEarnings,
        platformRevenue: monthPlatformRevenue,
        totalRevenue: monthSubscriptions + monthRevenueShares + monthReleaseEarnings + monthPlatformRevenue,
        transactionVolume: monthTransactionVolume
      })
    }

    // Top revenue generating users
    const userRevenue = {}
    
    // Add subscription revenue
    filteredSubscriptions.forEach(sub => {
      const userId = sub.user_id
      if (!userRevenue[userId]) {
        userRevenue[userId] = {
          userId,
          userName: sub.user?.artist_name || `${sub.user?.first_name} ${sub.user?.last_name}`.trim() || sub.user?.email || 'Unknown',
          email: sub.user?.email || '',
          subscriptionRevenue: 0,
          releaseEarnings: 0,
          totalRevenue: 0
        }
      }
      userRevenue[userId].subscriptionRevenue += sub.amount || 0
    })

    // Add release earnings
    filteredReleases.forEach(release => {
      const userId = release.artist_id
      if (!userRevenue[userId]) {
        userRevenue[userId] = {
          userId,
          userName: release.artist?.artist_name || `${release.artist?.first_name} ${release.artist?.last_name}`.trim() || release.artist?.email || 'Unknown',
          email: release.artist?.email || '',
          subscriptionRevenue: 0,
          releaseEarnings: 0,
          totalRevenue: 0
        }
      }
      userRevenue[userId].releaseEarnings += release.earnings || 0
    })

    // Calculate total revenue per user
    Object.values(userRevenue).forEach(user => {
      user.totalRevenue = user.subscriptionRevenue + user.releaseEarnings
    })

    const topRevenueUsers = Object.values(userRevenue)
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 10)

    // Calculate growth metrics
    const currentMonth = new Date()
    const lastMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    const twoMonthsAgo = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 2, 1)

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

    const financeData = {
      // Summary metrics
      totalRevenue,
      subscriptionMetrics,
      revenueShareMetrics,
      releaseEarnings,
      walletMetrics,
      platformMetrics,
      
      // Time series data
      monthlyFinancials,
      
      // Top performers
      topRevenueUsers,
      
      // Growth
      revenueGrowth: Math.round(revenueGrowth * 10) / 10,
      thisMonthRevenue,
      
      // Financial health indicators
      financialHealth: {
        subscriptionRetention: subscriptionMetrics.activeSubscriptions / Math.max(subscriptionMetrics.totalSubscriptions, 1) * 100,
        averageRevenuePerUser: users.length > 0 ? totalRevenue / users.length : 0,
        walletSuccessRate: walletMetrics.successRate,
        monthlyGrowthRate: revenueGrowth
      },
      
      // Export data for reports
      exportData: {
        subscriptions: filteredSubscriptions.map(s => ({
          date: s.created_at,
          userEmail: s.user?.email || 'Unknown',
          tier: s.tier,
          amount: s.amount,
          currency: s.currency || currency,
          status: s.status,
          billingCycle: s.billing_cycle
        })),
        revenueShares: filteredRevenueShares.map(r => ({
          date: r.created_at,
          releaseTitle: r.release?.title || 'Unknown',
          artistName: r.release?.artist?.artist_name || 'Unknown',
          amount: r.amount,
          currency: r.currency || currency,
          shareType: r.share_type
        })),
        transactions: filteredTransactions.map(t => ({
          date: t.created_at,
          userEmail: t.user?.email || 'Unknown',
          type: t.type,
          amount: t.amount,
          currency: t.currency || currency,
          status: t.status,
          description: t.description
        }))
      },
      
      // Filters and metadata
      currency,
      filters: {
        startDate,
        endDate
      },
      
      // System info
      lastUpdated: new Date().toISOString(),
      reportGenerated: new Date().toISOString()
    }

    res.status(200).json({
      success: true,
      data: financeData,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Company Admin finance error:', error)
    res.status(500).json({ 
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Failed to fetch financial data'
    })
  }
}
