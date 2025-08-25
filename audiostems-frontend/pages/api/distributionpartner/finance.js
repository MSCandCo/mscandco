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

    // Get query parameters for filtering
    const { startDate, endDate, currency = 'GBP' } = req.query

    // Query financial data
    const [
      revenueSharesResult,
      walletTransactionsResult,
      releasesResult,
      subscriptionsResult
    ] = await Promise.all([
      // Get all revenue shares for this distribution partner
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
        .eq('distribution_partner_id', userId)
        .order('created_at', { ascending: false }),
      
      // Get wallet transactions for this partner
      supabase
        .from('wallet_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),
      
      // Get releases distributed by this partner with earnings
      supabase
        .from('releases')
        .select(`
          *,
          artist:user_profiles!releases_artist_id_fkey (
            first_name,
            last_name,
            artist_name
          )
        `)
        .eq('distribution_partner_id', userId)
        .not('earnings', 'is', null),
      
      // Get subscription revenue (if partner has subscription model)
      supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
    ])

    const revenueShares = revenueSharesResult.data || []
    const walletTransactions = walletTransactionsResult.data || []
    const releases = releasesResult.data || []
    const subscriptions = subscriptionsResult.data || []

    // Apply date filtering if provided
    let filteredRevenueShares = revenueShares
    let filteredTransactions = walletTransactions
    let filteredReleases = releases

    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      
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
    }

    // Calculate revenue metrics
    const totalRevenueShares = filteredRevenueShares.reduce((sum, r) => sum + (r.amount || 0), 0)
    const totalReleaseEarnings = filteredReleases.reduce((sum, r) => sum + (r.earnings || 0), 0)
    const totalSubscriptionRevenue = subscriptions.reduce((sum, s) => sum + (s.amount || 0), 0)
    const totalRevenue = totalRevenueShares + totalReleaseEarnings + totalSubscriptionRevenue

    // Calculate wallet metrics
    const totalEarnings = filteredTransactions
      .filter(t => t.type === 'earning' && t.status === 'completed')
      .reduce((sum, t) => sum + (t.amount || 0), 0)
    
    const totalWithdrawals = filteredTransactions
      .filter(t => t.type === 'withdrawal' && t.status === 'completed')
      .reduce((sum, t) => sum + (t.amount || 0), 0)
    
    const pendingWithdrawals = filteredTransactions
      .filter(t => t.type === 'withdrawal' && t.status === 'pending')
      .reduce((sum, t) => sum + (t.amount || 0), 0)
    
    const availableBalance = totalEarnings - totalWithdrawals

    // Monthly revenue breakdown (last 12 months)
    const monthlyRevenue = []
    for (let i = 11; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0)

      const monthRevenueShares = revenueShares
        .filter(r => {
          const createdAt = new Date(r.created_at)
          return createdAt >= monthStart && createdAt <= monthEnd
        })
        .reduce((sum, r) => sum + (r.amount || 0), 0)

      const monthReleaseEarnings = releases
        .filter(r => {
          const createdAt = new Date(r.created_at)
          return createdAt >= monthStart && createdAt <= monthEnd
        })
        .reduce((sum, r) => sum + (r.earnings || 0), 0)

      monthlyRevenue.push({
        month: date.toISOString().slice(0, 7),
        revenueShares: monthRevenueShares,
        releaseEarnings: monthReleaseEarnings,
        total: monthRevenueShares + monthReleaseEarnings
      })
    }

    // Revenue by source
    const revenueBySource = {
      revenueShares: totalRevenueShares,
      releaseEarnings: totalReleaseEarnings,
      subscriptions: totalSubscriptionRevenue
    }

    // Top earning releases
    const topEarningReleases = filteredReleases
      .sort((a, b) => (b.earnings || 0) - (a.earnings || 0))
      .slice(0, 10)
      .map(release => ({
        id: release.id,
        title: release.title,
        artistName: release.artist?.artist_name || `${release.artist?.first_name} ${release.artist?.last_name}`.trim(),
        earnings: release.earnings || 0,
        streams: release.streams || 0,
        releaseDate: release.release_date
      }))

    // Revenue by artist
    const revenueByArtist = {}
    filteredReleases.forEach(release => {
      const artistName = release.artist?.artist_name || `${release.artist?.first_name} ${release.artist?.last_name}`.trim() || 'Unknown Artist'
      revenueByArtist[artistName] = (revenueByArtist[artistName] || 0) + (release.earnings || 0)
    })

    // Recent transactions
    const recentTransactions = filteredTransactions
      .slice(0, 20)
      .map(transaction => ({
        id: transaction.id,
        type: transaction.type,
        amount: transaction.amount,
        currency: transaction.currency || currency,
        status: transaction.status,
        description: transaction.description,
        createdAt: transaction.created_at,
        revolutPaymentId: transaction.revolut_payment_id
      }))

    // Payment summary
    const paymentSummary = {
      totalProcessed: filteredTransactions
        .filter(t => t.status === 'completed')
        .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0),
      
      successfulPayments: filteredTransactions.filter(t => t.status === 'completed').length,
      failedPayments: filteredTransactions.filter(t => t.status === 'failed').length,
      pendingPayments: filteredTransactions.filter(t => t.status === 'pending').length,
      
      successRate: filteredTransactions.length > 0 ? 
        (filteredTransactions.filter(t => t.status === 'completed').length / filteredTransactions.length) * 100 : 100
    }

    // Calculate growth metrics
    const currentMonth = new Date()
    const lastMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    const twoMonthsAgo = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 2, 1)

    const thisMonthRevenue = revenueShares
      .filter(r => new Date(r.created_at) >= lastMonth)
      .reduce((sum, r) => sum + (r.amount || 0), 0)
    
    const lastMonthRevenue = revenueShares
      .filter(r => {
        const createdAt = new Date(r.created_at)
        return createdAt >= twoMonthsAgo && createdAt < lastMonth
      })
      .reduce((sum, r) => sum + (r.amount || 0), 0)

    const revenueGrowth = lastMonthRevenue > 0 ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0

    const financeData = {
      // Summary metrics
      totalRevenue,
      totalRevenueShares,
      totalReleaseEarnings,
      totalSubscriptionRevenue,
      
      // Wallet metrics
      availableBalance,
      totalEarnings,
      totalWithdrawals,
      pendingWithdrawals,
      
      // Breakdowns
      monthlyRevenue,
      revenueBySource,
      revenueByArtist,
      topEarningReleases,
      
      // Transactions
      recentTransactions,
      paymentSummary,
      
      // Growth
      revenueGrowth: Math.round(revenueGrowth * 10) / 10,
      thisMonthRevenue,
      
      // Filters and metadata
      currency,
      filters: {
        startDate,
        endDate
      },
      
      // Export data for reports
      exportData: {
        revenueShares: filteredRevenueShares.map(r => ({
          date: r.created_at,
          amount: r.amount,
          currency: r.currency || currency,
          releaseTitle: r.release?.title || 'Unknown',
          artistName: r.release?.artist?.artist_name || 'Unknown',
          type: 'Revenue Share'
        })),
        transactions: filteredTransactions.map(t => ({
          date: t.created_at,
          type: t.type,
          amount: t.amount,
          currency: t.currency || currency,
          status: t.status,
          description: t.description
        }))
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
    console.error('Distribution Partner finance error:', error)
    res.status(500).json({ 
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Failed to fetch financial data'
    })
  }
}
