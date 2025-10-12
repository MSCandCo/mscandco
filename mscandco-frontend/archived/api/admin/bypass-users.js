// Bypass Users API - Uses Service Role Key to Bypass RLS
import { createClient } from '@supabase/supabase-js';
import { requireRole } from '@/lib/rbac/middleware';

// Server-side Supabase client with service role key (bypasses RLS)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('👥 Loading users with SERVICE ROLE KEY (bypasses RLS)');

    // Direct database query with service role (bypasses RLS)
    const { data: users, error } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Database error:', error);
      return res.status(500).json({ 
        error: 'Database error', 
        details: error.message 
      });
    }

    console.log('✅ Users loaded from database:', users?.length || 0);

    // Get releases data
    const { data: releases, error: releasesError } = await supabase
      .from('releases')
      .select('*');

    // Get subscriptions data
    const { data: subscriptions, error: subsError } = await supabase
      .from('subscriptions')
      .select('*');

    // Calculate real statistics
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

    const subscriptionMap = {};
    if (subscriptions && !subsError) {
      subscriptions.forEach(sub => {
        if (sub.status === 'active') {
          subscriptionMap[sub.user_id] = sub;
        }
      });
    }

    // Enhance users with real data
    const enhancedUsers = (users || []).map(user => {
      const releaseStats = releaseCountMap[user.id] || { total: 0, live: 0, draft: 0 };
      const subscription = subscriptionMap[user.id];
      
      return {
        ...user,
        totalReleases: releaseStats.total,
        liveReleases: releaseStats.live || 0,
        draftReleases: releaseStats.draft || 0,
        hasActiveSubscription: !!subscription,
        subscriptionTier: subscription?.tier || 'none',
        hasAnalyticsData: !!user.analytics_data,
        hasEarningsData: !!user.earnings_data,
        displayName: user.artist_name || 
                    `${user.first_name || ''} ${user.last_name || ''}`.trim() || 
                    user.email,
        roleDisplay: user.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
      };
    });

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
      totalReleases: releases?.length || 0,
      liveReleases: releases?.filter(r => r.status === 'live').length || 0,
      usersWithAnalytics: enhancedUsers.filter(u => u.hasAnalyticsData).length,
      usersWithEarnings: enhancedUsers.filter(u => u.hasEarningsData).length
    };

    console.log('📊 REAL STATS from database:', stats);

    return res.status(200).json({
      success: true,
      users: enhancedUsers,
      stats,
      releases: releases || [],
      subscriptions: subscriptions || [],
      source: 'real_database_service_role',
      message: `Loaded ${enhancedUsers.length} real users`
    });

  } catch (error) {
    console.error('❌ Bypass users API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}

// Protect with super_admin role requirement
export default requireRole('super_admin')(handler);
