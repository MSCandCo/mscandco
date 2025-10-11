import { createClient } from '@supabase/supabase-js';
import { requirePermission } from '@/lib/rbac/middleware';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('📊 Fetching platform analytics data...');

    const { timeRange = '30' } = req.query; // days
    const daysAgo = parseInt(timeRange);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);

    // 1. Fetch earnings data
    const { data: earnings, error: earningsError } = await supabase
      .from('earnings_log')
      .select('*')
      .gte('created_at', startDate.toISOString());

    if (earningsError) {
      console.error('❌ Error fetching earnings:', earningsError);
      return res.status(500).json({ error: 'Failed to fetch earnings data' });
    }

    // 2. Fetch all user profiles
    const { data: users, error: usersError } = await supabase
      .from('user_profiles')
      .select('id, role, created_at, last_active_at');

    if (usersError) {
      console.error('❌ Error fetching users:', usersError);
      return res.status(500).json({ error: 'Failed to fetch user data' });
    }

    // 3. Fetch all releases
    const { data: releases, error: releasesError } = await supabase
      .from('releases')
      .select('id, status, created_at, submitted_at');

    if (releasesError) {
      console.error('❌ Error fetching releases:', releasesError);
      return res.status(500).json({ error: 'Failed to fetch releases data' });
    }

    // Calculate summary metrics
    const totalRevenue = earnings.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
    const totalUsers = users.length;
    const totalReleases = releases.length;

    // Active users (logged in within last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const activeUsers = users.filter(u =>
      u.last_active_at && new Date(u.last_active_at) > thirtyDaysAgo
    ).length;

    // Revenue by earning type
    const revenueByType = {};
    earnings.forEach(e => {
      const type = e.earning_type || 'other';
      revenueByType[type] = (revenueByType[type] || 0) + (parseFloat(e.amount) || 0);
    });

    // Revenue by status
    const revenueByStatus = {};
    earnings.forEach(e => {
      const status = e.status || 'unknown';
      revenueByStatus[status] = (revenueByStatus[status] || 0) + (parseFloat(e.amount) || 0);
    });

    // Revenue trend over time (group by day)
    const revenueTrend = {};
    earnings.forEach(e => {
      const date = new Date(e.created_at).toISOString().split('T')[0];
      revenueTrend[date] = (revenueTrend[date] || 0) + (parseFloat(e.amount) || 0);
    });

    // Sort revenue trend by date
    const sortedRevenueTrend = Object.entries(revenueTrend)
      .sort((a, b) => new Date(a[0]) - new Date(b[0]))
      .map(([date, amount]) => ({ date, amount }));

    // Top earning artists
    const artistEarnings = {};
    earnings.forEach(e => {
      const artistId = e.artist_id;
      if (artistId) {
        artistEarnings[artistId] = (artistEarnings[artistId] || 0) + (parseFloat(e.amount) || 0);
      }
    });

    // Get top 10 artists by earnings
    const topArtists = Object.entries(artistEarnings)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([artistId, amount]) => ({ artistId, amount }));

    // Fetch artist names for top artists
    const topArtistIds = topArtists.map(a => a.artistId);
    const { data: artistProfiles } = await supabase
      .from('user_profiles')
      .select('id, first_name, last_name, artist_name, display_name, email')
      .in('id', topArtistIds);

    const artistMap = {};
    artistProfiles?.forEach(p => {
      artistMap[p.id] = p.artist_name || p.display_name || `${p.first_name || ''} ${p.last_name || ''}`.trim() || p.email;
    });

    const topArtistsWithNames = topArtists.map(a => ({
      name: artistMap[a.artistId] || 'Unknown Artist',
      earnings: a.amount
    }));

    // Users by role
    const usersByRole = {};
    users.forEach(u => {
      const role = u.role || 'unknown';
      usersByRole[role] = (usersByRole[role] || 0) + 1;
    });

    // User growth over time (group by day)
    const userGrowth = {};
    users.forEach(u => {
      if (u.created_at) {
        const date = new Date(u.created_at).toISOString().split('T')[0];
        userGrowth[date] = (userGrowth[date] || 0) + 1;
      }
    });

    // Calculate cumulative user growth
    const sortedUserGrowth = Object.entries(userGrowth)
      .sort((a, b) => new Date(a[0]) - new Date(b[0]));

    let cumulative = 0;
    const cumulativeUserGrowth = sortedUserGrowth.map(([date, count]) => {
      cumulative += count;
      return { date, count: cumulative };
    });

    // Releases by status
    const releasesByStatus = {};
    releases.forEach(r => {
      const status = r.status || 'unknown';
      releasesByStatus[status] = (releasesByStatus[status] || 0) + 1;
    });

    // Release trend over time (group by day)
    const releaseTrend = {};
    releases.forEach(r => {
      const date = r.submitted_at || r.created_at;
      if (date) {
        const dateStr = new Date(date).toISOString().split('T')[0];
        releaseTrend[dateStr] = (releaseTrend[dateStr] || 0) + 1;
      }
    });

    // Calculate cumulative releases
    const sortedReleaseTrend = Object.entries(releaseTrend)
      .sort((a, b) => new Date(a[0]) - new Date(b[0]));

    let cumulativeReleases = 0;
    const cumulativeReleaseTrend = sortedReleaseTrend.map(([date, count]) => {
      cumulativeReleases += count;
      return { date, count: cumulativeReleases };
    });

    // Revenue by platform
    const revenueByPlatform = {};
    earnings.forEach(e => {
      const platform = e.platform || 'Unknown';
      revenueByPlatform[platform] = (revenueByPlatform[platform] || 0) + (parseFloat(e.amount) || 0);
    });

    // Top platforms by revenue
    const topPlatforms = Object.entries(revenueByPlatform)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([platform, amount]) => ({ platform, amount }));

    console.log('✅ Platform analytics calculated successfully');

    return res.status(200).json({
      success: true,
      summary: {
        totalRevenue,
        totalUsers,
        totalReleases,
        activeUsers,
        averageRevenuePerUser: totalUsers > 0 ? totalRevenue / totalUsers : 0,
        averageRevenuePerRelease: totalReleases > 0 ? totalRevenue / totalReleases : 0
      },
      revenue: {
        byType: Object.entries(revenueByType).map(([type, amount]) => ({ type, amount })),
        byStatus: Object.entries(revenueByStatus).map(([status, amount]) => ({ status, amount })),
        trend: sortedRevenueTrend,
        byPlatform: topPlatforms
      },
      users: {
        byRole: Object.entries(usersByRole).map(([role, count]) => ({ role, count })),
        growth: cumulativeUserGrowth.slice(-30), // Last 30 data points
        activeCount: activeUsers,
        inactiveCount: totalUsers - activeUsers
      },
      releases: {
        byStatus: Object.entries(releasesByStatus).map(([status, count]) => ({ status, count })),
        trend: cumulativeReleaseTrend.slice(-30) // Last 30 data points
      },
      topArtists: topArtistsWithNames
    });

  } catch (error) {
    console.error('❌ Error in platform analytics API:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
}

// Only superadmins with wildcard permission can access
export default requirePermission('*:*:*')(handler);
