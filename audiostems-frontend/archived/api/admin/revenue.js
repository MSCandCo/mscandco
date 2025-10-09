import { createClient } from '@supabase/supabase-js'
import { requirePermission } from '@/lib/rbac/middleware'

// Server-side Supabase client with service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // req.user and req.userRole are automatically attached by middleware

    // Query all revenue-related data
    const [
      subscriptionsResult,
      revenueSharesResult,
      walletTransactionsResult,
      releasesResult,
      profilesResult
    ] = await Promise.all([
      // Subscription revenue
      supabase
        .from('subscriptions')
        .select('*')
        .order('created_at', { ascending: false }),
      
      // Revenue shares from releases
      supabase
        .from('revenue_shares')
        .select('*')
        .order('created_at', { ascending: false }),
      
      // Wallet transactions
      supabase
        .from('wallet_transactions')
        .select('*')
        .order('created_at', { ascending: false }),
      
      // Releases with earnings
      supabase
        .from('releases')
        .select('*')
        .not('earnings', 'is', null)
        .order('earnings', { ascending: false }),
      
      // User profiles for user info
      supabase
        .from('user_profiles')
        .select('*')
    ])

    const subscriptions = subscriptionsResult.data || []
    const revenueShares = revenueSharesResult.data || []
    const walletTransactions = walletTransactionsResult.data || []
    const releases = releasesResult.data || []
    const profiles = profilesResult.data || []

    // Calculate revenue metrics
    const totalSubscriptionRevenue = subscriptions.reduce((sum, s) => sum + (s.amount || 0), 0)
    const totalRevenueShares = revenueShares.reduce((sum, r) => sum + (r.amount || 0), 0)
    const totalReleaseEarnings = releases.reduce((sum, r) => sum + (r.earnings || 0), 0)
    const totalPlatformRevenue = totalSubscriptionRevenue + totalRevenueShares + totalReleaseEarnings

    // Calculate pending payouts
    const pendingPayouts = walletTransactions
      .filter(t => t.type === 'withdrawal' && t.status === 'pending')
      .reduce((sum, t) => sum + (t.amount || 0), 0)

    // Calculate available to withdraw
    const completedEarnings = walletTransactions
      .filter(t => t.type === 'earning' && t.status === 'completed')
      .reduce((sum, t) => sum + (t.amount || 0), 0)
    const completedWithdrawals = walletTransactions
      .filter(t => t.type === 'withdrawal' && t.status === 'completed')
      .reduce((sum, t) => sum + (t.amount || 0), 0)
    const availableToWithdraw = completedEarnings - completedWithdrawals

    // Revenue by month (last 12 months)
    const monthlyRevenue = []
    for (let i = 11; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0)

      const monthSubscriptions = subscriptions.filter(s => {
        const createdAt = new Date(s.created_at)
        return createdAt >= monthStart && createdAt <= monthEnd
      }).reduce((sum, s) => sum + (s.amount || 0), 0)

      const monthShares = revenueShares.filter(r => {
        const createdAt = new Date(r.created_at)
        return createdAt >= monthStart && createdAt <= monthEnd
      }).reduce((sum, r) => sum + (r.amount || 0), 0)

      monthlyRevenue.push({
        month: date.toISOString().slice(0, 7), // YYYY-MM format
        subscriptions: monthSubscriptions,
        revenueShares: monthShares,
        total: monthSubscriptions + monthShares
      })
    }

    // Top earning releases
    const topReleases = releases
      .sort((a, b) => (b.earnings || 0) - (a.earnings || 0))
      .slice(0, 10)
      .map(release => {
        const artist = profiles.find(p => p.id === release.artist_id)
        return {
          id: release.id,
          title: release.title,
          artistName: artist?.artist_name || `${artist?.first_name} ${artist?.last_name}`.trim() || 'Unknown Artist',
          earnings: release.earnings || 0,
          streams: release.streams || 0
        }
      })

    // Revenue by user role
    const revenueByRole = {
      artist: 0,
      label_admin: 0,
      distribution_partner: 0,
      company_admin: 0
    }

    subscriptions.forEach(sub => {
      const profile = profiles.find(p => p.id === sub.user_id)
      if (profile) {
        // Determine role from email pattern (temporary solution)
        let role = 'artist'
        if (profile.email?.includes('labeladmin')) role = 'label_admin'
        else if (profile.email?.includes('codegroup')) role = 'distribution_partner'
        else if (profile.email?.includes('companyadmin')) role = 'company_admin'
        
        if (revenueByRole[role] !== undefined) {
          revenueByRole[role] += sub.amount || 0
        }
      }
    })

    // Recent transactions
    const recentTransactions = walletTransactions
      .slice(0, 20)
      .map(transaction => {
        const user = profiles.find(p => p.id === transaction.user_id)
        return {
          id: transaction.id,
          type: transaction.type,
          amount: transaction.amount,
          currency: transaction.currency,
          status: transaction.status,
          description: transaction.description,
          createdAt: transaction.created_at,
          userName: user?.artist_name || `${user?.first_name} ${user?.last_name}`.trim() || 'Unknown User',
          userEmail: user?.email || 'Unknown'
        }
      })

    const revenueData = {
      // Summary metrics
      totalPlatformRevenue,
      totalSubscriptionRevenue,
      totalRevenueShares,
      totalReleaseEarnings,
      availableToWithdraw,
      pendingPayouts,
      
      // Breakdowns
      monthlyRevenue,
      revenueByRole,
      topReleases,
      recentTransactions,
      
      // Counts
      totalSubscriptions: subscriptions.length,
      activeSubscriptions: subscriptions.filter(s => s.status === 'active').length,
      totalTransactions: walletTransactions.length,
      
      // System info
      lastUpdated: new Date().toISOString()
    }

    res.status(200).json({
      success: true,
      data: revenueData,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Revenue data error:', error)
    res.status(500).json({ 
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Failed to fetch revenue data'
    })
  }
}

// Protect with earnings:view:any permission
export default requirePermission('earnings:view:any')(handler);
