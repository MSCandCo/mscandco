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
    // Verify authentication and Artist role
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
    if (userRole !== 'artist') {
      return res.status(403).json({ error: 'Artist access required' })
    }

    // Query all artist-related data in parallel
    const [
      // Artist's profile information
      profileResult,
      
      // Artist's releases
      releasesResult,
      
      // Artist's subscription
      subscriptionResult,
      
      // Artist's earnings and revenue shares
      earningsResult,
      
      // Artist's wallet transactions
      walletTransactionsResult,
      
      // Artist's streaming data
      streamsResult,
      
      // Label relationship (if any)
      labelRelationshipResult
    ] = await Promise.all([
      // Get artist profile
      supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single(),
      
      // Get artist's releases with detailed information
      supabase
        .from('releases')
        .select(`
          *,
          label_admin:user_profiles!releases_label_admin_id_fkey (
            first_name,
            last_name,
            artist_name,
            email
          ),
          distribution_partner:user_profiles!releases_distribution_partner_id_fkey (
            first_name,
            last_name,
            artist_name,
            email
          )
        `)
        .eq('artist_id', userId)
        .order('created_at', { ascending: false }),
      
      // Get artist's subscription
      supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1),
      
      // Get artist's earnings and revenue shares
      supabase
        .from('revenue_shares')
        .select('*')
        .eq('artist_id', userId)
        .order('created_at', { ascending: false }),
      
      // Get artist's wallet transactions
      supabase
        .from('wallet_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),
      
      // Get streaming data for artist's releases
      supabase
        .from('streams')
        .select('*')
        .in('release_id', []), // Will be populated with release IDs
      
      // Get label relationship
      supabase
        .from('label_artists')
        .select(`
          *,
          label_admin:user_profiles!label_artists_label_admin_id_fkey (
            first_name,
            last_name,
            artist_name,
            email
          )
        `)
        .eq('artist_id', userId)
    ])

    const profile = profileResult.data || {}
    const releases = releasesResult.data || []
    const subscription = subscriptionResult.data?.[0] || null
    const earnings = earningsResult.data || []
    const walletTransactions = walletTransactionsResult.data || []
    const streams = streamsResult.data || []
    const labelRelationship = labelRelationshipResult.data?.[0] || null

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

    // Calculate streaming metrics
    const totalStreams = releases.reduce((sum, r) => sum + (r.streams || 0), 0)
    const totalEarnings = releases.reduce((sum, r) => sum + (r.earnings || 0), 0)
    const averageStreamsPerRelease = totalReleases > 0 ? totalStreams / totalReleases : 0

    // Calculate revenue metrics
    const totalRevenueShares = earnings.reduce((sum, e) => sum + (e.amount || 0), 0)
    const subscriptionAmount = subscription?.amount || 0
    const totalRevenue = totalEarnings + totalRevenueShares

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

    // Release growth
    const releasesThisMonth = releases.filter(r => new Date(r.created_at) >= lastMonth).length
    const releasesLastMonth = releases.filter(r => {
      const createdAt = new Date(r.created_at)
      return createdAt >= twoMonthsAgo && createdAt < lastMonth
    }).length
    const releaseGrowth = releasesLastMonth > 0 ? ((releasesThisMonth - releasesLastMonth) / releasesLastMonth) * 100 : 0

    // Streams growth (based on recent releases)
    const thisMonthStreams = releases
      .filter(r => new Date(r.created_at) >= lastMonth)
      .reduce((sum, r) => sum + (r.streams || 0), 0)
    const lastMonthStreams = releases
      .filter(r => {
        const createdAt = new Date(r.created_at)
        return createdAt >= twoMonthsAgo && createdAt < lastMonth
      })
      .reduce((sum, r) => sum + (r.streams || 0), 0)
    const streamGrowth = lastMonthStreams > 0 ? ((thisMonthStreams - lastMonthStreams) / lastMonthStreams) * 100 : 0

    // Earnings growth
    const thisMonthEarnings = earnings
      .filter(e => new Date(e.created_at) >= lastMonth)
      .reduce((sum, e) => sum + (e.amount || 0), 0)
    const lastMonthEarnings = earnings
      .filter(e => {
        const createdAt = new Date(e.created_at)
        return createdAt >= twoMonthsAgo && createdAt < lastMonth
      })
      .reduce((sum, e) => sum + (e.amount || 0), 0)
    const earningsGrowth = lastMonthEarnings > 0 ? ((thisMonthEarnings - lastMonthEarnings) / lastMonthEarnings) * 100 : 0

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

      const monthEarnings = earnings.filter(e => {
        const createdAt = new Date(e.created_at)
        return createdAt >= monthStart && createdAt <= monthEnd
      }).reduce((sum, e) => sum + (e.amount || 0), 0)

      monthlyPerformance.push({
        month: date.toISOString().slice(0, 7),
        releases: monthReleases,
        streams: monthStreams,
        earnings: monthEarnings
      })
    }

    // Top performing releases
    const topReleases = releases
      .sort((a, b) => (b.streams || 0) - (a.streams || 0))
      .slice(0, 5)
      .map(release => ({
        id: release.id,
        title: release.title,
        streams: release.streams || 0,
        earnings: release.earnings || 0,
        status: release.status,
        releaseDate: release.release_date,
        genre: release.genre,
        platforms: release.platforms || []
      }))

    // Recent activity
    const recentReleases = releases
      .slice(0, 5)
      .map(release => ({
        id: release.id,
        title: release.title,
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
      releasesUsed: totalReleases,
      releasesLimit: subscription?.tier === 'artist_starter' ? 5 : 
                   subscription?.tier === 'artist_pro' ? 999999 : 0
    }

    // Artist career metrics
    const careerMetrics = {
      totalCareerStreams: totalStreams,
      totalCareerEarnings: totalRevenue,
      averageStreamsPerRelease: Math.round(averageStreamsPerRelease),
      averageEarningsPerRelease: totalReleases > 0 ? totalRevenue / totalReleases : 0,
      careerStartDate: releases.length > 0 ? 
        Math.min(...releases.map(r => new Date(r.created_at).getTime())) : null,
      monthsActive: releases.length > 0 ? 
        Math.ceil((Date.now() - Math.min(...releases.map(r => new Date(r.created_at).getTime()))) / (1000 * 60 * 60 * 24 * 30)) : 0
    }

    // Platform distribution (if available)
    const platformDistribution = {}
    releases.forEach(release => {
      if (release.platforms) {
        release.platforms.forEach(platform => {
          const platformStreams = Math.floor((release.streams || 0) / release.platforms.length)
          platformDistribution[platform] = (platformDistribution[platform] || 0) + platformStreams
        })
      }
    })

    // Genre performance
    const genrePerformance = {}
    releases.forEach(release => {
      const genre = release.genre || 'Unknown'
      if (!genrePerformance[genre]) {
        genrePerformance[genre] = {
          releases: 0,
          streams: 0,
          earnings: 0
        }
      }
      genrePerformance[genre].releases++
      genrePerformance[genre].streams += release.streams || 0
      genrePerformance[genre].earnings += release.earnings || 0
    })

    // Prepare response data
    const dashboardStats = {
      // Artist information
      artistName: profile.artist_name || `${profile.first_name} ${profile.last_name}`.trim() || 'Artist',
      artistType: profile.artist_type || 'Solo Artist',
      country: profile.country || 'Unknown',
      
      // Core metrics
      totalReleases,
      totalStreams,
      totalEarnings,
      totalRevenue,
      
      // Release breakdown
      releasesByStatus,
      
      // Growth metrics
      releaseGrowth: Math.round(releaseGrowth * 10) / 10,
      streamGrowth: Math.round(streamGrowth * 10) / 10,
      earningsGrowth: Math.round(earningsGrowth * 10) / 10,
      
      // Financial metrics
      walletBalance,
      totalDeposits,
      totalWithdrawals,
      pendingEarnings,
      totalRevenueShares,
      
      // Performance data
      topReleases,
      recentReleases,
      monthlyPerformance,
      
      // Career metrics
      careerMetrics,
      
      // Platform and genre insights
      platformDistribution,
      genrePerformance,
      
      // Subscription information
      subscriptionStatus,
      
      // Label relationship
      labelInfo: labelRelationship ? {
        hasLabel: true,
        labelAdminName: labelRelationship.label_admin?.artist_name || 
          `${labelRelationship.label_admin?.first_name} ${labelRelationship.label_admin?.last_name}`.trim(),
        labelAdminEmail: labelRelationship.label_admin?.email,
        relationshipStatus: labelRelationship.status,
        joinedAt: labelRelationship.created_at
      } : {
        hasLabel: false
      },
      
      // Profile completion
      profileCompletion: {
        isCompleted: profile.profile_completed || false,
        completionPercentage: calculateProfileCompletion(profile),
        missingFields: getMissingProfileFields(profile)
      },
      
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
    console.error('Artist dashboard stats error:', error)
    res.status(500).json({ 
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Failed to fetch artist statistics'
    })
  }
}

// Helper function to calculate profile completion percentage
function calculateProfileCompletion(profile) {
  const requiredFields = [
    'first_name',
    'last_name', 
    'artist_name',
    'artist_type',
    'country',
    'bio'
  ]
  
  const completedFields = requiredFields.filter(field => 
    profile[field] && profile[field].trim() !== ''
  ).length
  
  return Math.round((completedFields / requiredFields.length) * 100)
}

// Helper function to get missing profile fields
function getMissingProfileFields(profile) {
  const fieldLabels = {
    'first_name': 'First Name',
    'last_name': 'Last Name',
    'artist_name': 'Artist Name',
    'artist_type': 'Artist Type',
    'country': 'Country',
    'bio': 'Biography'
  }
  
  const missingFields = []
  
  Object.keys(fieldLabels).forEach(field => {
    if (!profile[field] || profile[field].trim() === '') {
      missingFields.push(fieldLabels[field])
    }
  })
  
  return missingFields
}
