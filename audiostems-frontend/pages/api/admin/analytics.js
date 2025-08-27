import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get authorization token
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Authorization token required' });
    }

    // Verify user and check admin role
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role, email')
      .eq('id', user.id)
      .single();

    if (!profile || !['super_admin', 'company_admin'].includes(profile.role)) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Get real analytics data from database
    const [
      releasesData,
      usersData,
      revenueData,
      streamsData,
      subscriptionsData
    ] = await Promise.all([
      // Releases analytics
      supabase
        .from('releases')
        .select('id, status, created_at, artist_id, title, streams, earnings')
        .order('created_at', { ascending: false }),
      
      // Users analytics
      supabase
        .from('user_profiles')
        .select('id, role, created_at, subscription_tier, wallet_balance, first_name, last_name, email')
        .order('created_at', { ascending: false }),
      
      // Revenue analytics from revenue_reports
      supabase
        .from('revenue_reports')
        .select('id, amount, status, created_at, platform, artist_id, asset_id')
        .order('created_at', { ascending: false }),
      
      // Streams data from assets
      supabase
        .from('assets')
        .select('id, name, streams, earnings, platform_stats, created_at, artist_id')
        .order('created_at', { ascending: false }),
      
      // Subscriptions data
      supabase
        .from('subscriptions')
        .select('id, tier, status, created_at, amount, user_id')
        .order('created_at', { ascending: false })
    ]);

    // Process workflow statistics
    const workflowStats = releasesData.data?.map(release => ({
      id: release.id,
      title: release.title || 'Untitled Release',
      status: release.status || 'draft',
      created_at: release.created_at,
      streams: release.streams || 0,
      earnings: release.earnings || 0,
      artist_id: release.artist_id
    })) || [];

    // Process platform statistics
    const platformStats = {};
    streamsData.data?.forEach(asset => {
      if (asset.platform_stats) {
        Object.entries(asset.platform_stats).forEach(([platform, stats]) => {
          if (!platformStats[platform]) {
            platformStats[platform] = {
              platform,
              totalStreams: 0,
              totalEarnings: 0,
              releases: 0
            };
          }
          platformStats[platform].totalStreams += stats.streams || 0;
          platformStats[platform].totalEarnings += stats.earnings || 0;
          platformStats[platform].releases += 1;
        });
      }
    });

    // Process user statistics
    const userStats = usersData.data?.map(user => ({
      id: user.id,
      name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email,
      email: user.email,
      role: user.role,
      subscription_tier: user.subscription_tier,
      wallet_balance: user.wallet_balance || 0,
      created_at: user.created_at
    })) || [];

    // Calculate summary metrics
    const totalUsers = userStats.length;
    const activeUsers = userStats.filter(u => u.subscription_tier && u.subscription_tier !== 'free').length;
    const totalReleases = workflowStats.length;
    const liveReleases = workflowStats.filter(r => r.status === 'live').length;
    const totalRevenue = revenueData.data?.reduce((sum, report) => sum + (report.amount || 0), 0) || 0;
    const totalStreams = streamsData.data?.reduce((sum, asset) => sum + (asset.streams || 0), 0) || 0;
    const totalSubscriptionRevenue = subscriptionsData.data?.reduce((sum, sub) => sum + (sub.amount || 0), 0) || 0;

    // Monthly growth calculations
    const currentMonth = new Date();
    const lastMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    
    const thisMonthUsers = userStats.filter(u => new Date(u.created_at) >= lastMonth).length;
    const thisMonthReleases = workflowStats.filter(r => new Date(r.created_at) >= lastMonth).length;
    const thisMonthRevenue = revenueData.data?.filter(r => new Date(r.created_at) >= lastMonth)
      .reduce((sum, report) => sum + (report.amount || 0), 0) || 0;

    const analytics = {
      summary: {
        totalUsers,
        activeUsers,
        totalReleases,
        liveReleases,
        totalRevenue,
        totalStreams,
        totalSubscriptionRevenue,
        conversionRate: totalUsers > 0 ? ((activeUsers / totalUsers) * 100).toFixed(1) : 0,
        avgRevenuePerUser: activeUsers > 0 ? (totalRevenue / activeUsers).toFixed(2) : 0
      },
      growth: {
        newUsersThisMonth: thisMonthUsers,
        newReleasesThisMonth: thisMonthReleases,
        revenueThisMonth: thisMonthRevenue,
        userGrowthRate: totalUsers > thisMonthUsers ? (((thisMonthUsers / (totalUsers - thisMonthUsers)) * 100).toFixed(1)) : 0
      },
      workflowStats,
      platformStats: Object.values(platformStats),
      userStats,
      recentActivity: {
        recentReleases: workflowStats.slice(0, 10),
        recentUsers: userStats.slice(0, 10),
        recentRevenue: revenueData.data?.slice(0, 10) || []
      }
    };

    res.json(analytics);

  } catch (error) {
    console.error('Admin analytics error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch analytics data',
      details: error.message 
    });
  }
}
