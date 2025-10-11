import { requirePermission } from '@/lib/permissions';
import { supabaseService } from '@/lib/permissions';

export default async function handler(req, res) {
  console.log('🎯 [Super Admin Dashboard] API called');

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check permission - super admin should have wildcard or analytics:read:any
  console.log('🔐 [Super Admin Dashboard] Checking permissions...');
  const authorized = await requirePermission(req, res, '*:*:*');
  if (!authorized) {
    console.log('❌ [Super Admin Dashboard] Permission check failed');
    return;
  }
  console.log('✅ [Super Admin Dashboard] Permission check passed');

  try {
    // Get platform-wide statistics for super admin
    const stats = {
      totalUsers: 0,
      userGrowth: 0,
      totalReleases: 0,
      releaseGrowth: 0,
      totalRevenue: 0,
      revenueGrowth: 0,
      activeSubscriptions: 0,
      platformHealth: 100
    };

    // Count total users
    const { count: userCount, error: userError } = await supabaseService
      .from('user_profiles')
      .select('*', { count: 'exact', head: true });

    if (!userError) {
      stats.totalUsers = userCount || 0;
    }

    // Count total releases (if releases table exists)
    try {
      const { count: releaseCount, error: releaseError } = await supabaseService
        .from('releases')
        .select('*', { count: 'exact', head: true });

      if (!releaseError) {
        stats.totalReleases = releaseCount || 0;
      }
    } catch (err) {
      // Releases table might not exist yet
      console.log('Releases table not available:', err.message);
    }

    // Calculate platform revenue (sum of all wallet balances)
    const { data: walletData, error: walletError } = await supabaseService
      .from('user_profiles')
      .select('wallet_balance')
      .not('wallet_balance', 'is', null);

    if (!walletError && walletData) {
      stats.totalRevenue = walletData.reduce((sum, user) => sum + (parseFloat(user.wallet_balance) || 0), 0);
    }

    // Count active subscriptions
    const { count: subscriptionCount, error: subError } = await supabaseService
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('subscription_status', 'active');

    if (!subError) {
      stats.activeSubscriptions = subscriptionCount || 0;
    }

    // Mock growth data (in a real system, you'd calculate this from historical data)
    stats.userGrowth = Math.floor(Math.random() * 15) + 5; // 5-20% growth
    stats.releaseGrowth = Math.floor(Math.random() * 12) + 3; // 3-15% growth
    stats.revenueGrowth = Math.floor(Math.random() * 20) + 8; // 8-28% growth

    console.log('📊 [Super Admin Dashboard] Stats loaded:', stats);

    res.status(200).json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Super admin dashboard stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load dashboard statistics',
      details: error.message
    });
  }
}
