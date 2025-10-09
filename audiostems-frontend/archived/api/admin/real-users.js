// Real Users API - No Mock Data, Direct Database Access
import { supabase } from '@/lib/supabase';
import { requirePermission } from '@/lib/rbac/middleware';

// req.user and req.userRole are automatically attached by middleware
async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('👥 Loading REAL users from database (no mock data)...');

    // Direct database query - no auth required for testing
    const { data: users, error } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Database error loading users:', error);
      return res.status(500).json({ 
        error: 'Database error', 
        details: error.message,
        table: 'user_profiles'
      });
    }

    console.log('✅ Raw users from database:', users?.length || 0);

    // Get release counts from releases table
    const { data: releases, error: releasesError } = await supabase
      .from('releases')
      .select('artist_id, status');

    const releaseCountMap = {};
    if (releases && !releasesError) {
      releases.forEach(release => {
        if (!releaseCountMap[release.artist_id]) {
          releaseCountMap[release.artist_id] = { total: 0, live: 0, draft: 0 };
        }
        releaseCountMap[release.artist_id].total++;
        releaseCountMap[release.artist_id][release.status] = 
          (releaseCountMap[release.artist_id][release.status] || 0) + 1;
      });
    }

    // Get subscription data
    const { data: subscriptions, error: subsError } = await supabase
      .from('subscriptions')
      .select('user_id, tier, status, expires_at');

    const subscriptionMap = {};
    if (subscriptions && !subsError) {
      subscriptions.forEach(sub => {
        if (sub.status === 'active') {
          subscriptionMap[sub.user_id] = sub;
        }
      });
    }

    // Enhance users with real calculated data
    const enhancedUsers = (users || []).map(user => {
      const releaseStats = releaseCountMap[user.id] || { total: 0, live: 0, draft: 0 };
      const subscription = subscriptionMap[user.id];
      
      return {
        ...user,
        // Real data calculations
        totalReleases: releaseStats.total,
        liveReleases: releaseStats.live || 0,
        draftReleases: releaseStats.draft || 0,
        
        // Real subscription data
        hasActiveSubscription: !!subscription,
        subscriptionTier: subscription?.tier || 'none',
        subscriptionExpiresAt: subscription?.expires_at,
        
        // Display formatting
        displayName: user.artist_name || 
                    `${user.first_name || ''} ${user.last_name || ''}`.trim() || 
                    user.email,
        
        roleDisplay: user.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        
        // Data availability
        hasAnalyticsData: !!user.analytics_data,
        hasEarningsData: !!user.earnings_data,
        
        lastActiveFormatted: user.last_active_at ? 
          new Date(user.last_active_at).toLocaleDateString() : 'Never'
      };
    });

    // Real statistics
    const stats = {
      total: enhancedUsers.length,
      byRole: {
        artist: enhancedUsers.filter(u => u.role === 'artist').length,
        label_admin: enhancedUsers.filter(u => u.role === 'label_admin').length,
        company_admin: enhancedUsers.filter(u => u.role === 'company_admin').length,
        super_admin: enhancedUsers.filter(u => u.role === 'super_admin').length,
        distribution_partner: enhancedUsers.filter(u => u.role === 'distribution_partner').length,
        custom_admin: enhancedUsers.filter(u => u.role === 'custom_admin').length
      },
      activeSubscriptions: enhancedUsers.filter(u => u.hasActiveSubscription).length,
      totalReleases: Object.values(releaseCountMap).reduce((sum, stats) => sum + stats.total, 0),
      liveReleases: Object.values(releaseCountMap).reduce((sum, stats) => sum + (stats.live || 0), 0)
    };

    console.log('📊 REAL DATABASE STATS:', stats);

    return res.status(200).json({
      success: true,
      users: enhancedUsers,
      stats,
      source: 'real_database',
      message: `Loaded ${enhancedUsers.length} real users from database`
    });

  } catch (error) {
    console.error('❌ Real users API error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
}

export default requirePermission('user:view:any')(handler);
