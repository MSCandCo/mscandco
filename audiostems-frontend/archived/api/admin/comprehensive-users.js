// Comprehensive Users API - Real Database Integration
import { supabase } from '@/lib/supabase';
import { requirePermission } from '@/lib/rbac/middleware';

// req.user and req.userRole are automatically attached by middleware
async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // req.user and req.userRole are automatically attached by middleware
    console.log('👥 Comprehensive users API called by:', req.user.email);

    // Get all user profiles with subscription data
    const { data: users, error: usersError } = await supabase
      .from('user_profiles')
      .select(`
        *,
        subscriptions!subscriptions_user_id_fkey(
          tier,
          status,
          amount,
          currency,
          expires_at
        )
      `)
      .order('created_at', { ascending: false });

    if (usersError) {
      console.error('Error fetching users:', usersError);
      return res.status(500).json({ error: 'Failed to fetch users' });
    }

    // Get release counts for each user
    const { data: releaseCounts, error: releaseError } = await supabase
      .from('releases')
      .select('artist_id, status')
      .in('status', ['approved', 'live']);

    if (releaseError) {
      console.error('Error fetching release counts:', releaseError);
    }

    // Process release counts
    const releaseCountMap = {};
    if (releaseCounts) {
      releaseCounts.forEach(release => {
        if (!releaseCountMap[release.artist_id]) {
          releaseCountMap[release.artist_id] = 0;
        }
        releaseCountMap[release.artist_id]++;
      });
    }

    // Get pending artist requests count for label admins
    const { data: requestCounts, error: requestError } = await supabase
      .from('artist_requests')
      .select('from_label_id, status');

    const requestCountMap = {};
    if (requestCounts) {
      requestCounts.forEach(request => {
        if (!requestCountMap[request.from_label_id]) {
          requestCountMap[request.from_label_id] = { pending: 0, accepted: 0, declined: 0 };
        }
        requestCountMap[request.from_label_id][request.status]++;
      });
    }

    // Enhance users with real data
    const enhancedUsers = users.map(user => {
      const activeSubscription = user.subscriptions?.find(sub => sub.status === 'active');
      
      return {
        ...user,
        // Real subscription data
        hasActiveSubscription: !!activeSubscription,
        subscriptionTier: activeSubscription?.tier || 'none',
        subscriptionAmount: activeSubscription?.amount || 0,
        subscriptionCurrency: activeSubscription?.currency || 'GBP',
        subscriptionExpiresAt: activeSubscription?.expires_at,
        
        // Real release counts
        totalReleases: releaseCountMap[user.id] || 0,
        
        // Real request counts (for label admins)
        pendingRequests: requestCountMap[user.id]?.pending || 0,
        acceptedRequests: requestCountMap[user.id]?.accepted || 0,
        
        // Analytics data availability
        hasAnalyticsData: !!user.analytics_data,
        hasEarningsData: !!user.earnings_data,
        
        // Last activity
        lastActiveFormatted: user.last_active_at ? 
          new Date(user.last_active_at).toLocaleDateString() : 'Never',
        
        // Display name logic
        displayName: user.display_name || 
                    user.artist_name || 
                    `${user.first_name || ''} ${user.last_name || ''}`.trim() || 
                    user.email
      };
    });

    // Filter by role if requested
    const roleFilter = req.query.role;
    const filteredUsers = roleFilter && roleFilter !== 'all' 
      ? enhancedUsers.filter(user => user.role === roleFilter)
      : enhancedUsers;

    // Generate statistics
    const stats = {
      total: enhancedUsers.length,
      byRole: {
        artist: enhancedUsers.filter(u => u.role === 'artist').length,
        label_admin: enhancedUsers.filter(u => u.role === 'label_admin').length,
        company_admin: enhancedUsers.filter(u => u.role === 'company_admin').length,
        super_admin: enhancedUsers.filter(u => u.role === 'super_admin').length,
        distribution_partner: enhancedUsers.filter(u => u.role === 'distribution_partner').length
      },
      bySubscription: {
        active: enhancedUsers.filter(u => u.hasActiveSubscription).length,
        inactive: enhancedUsers.filter(u => !u.hasActiveSubscription).length
      },
      totalReleases: Object.values(releaseCountMap).reduce((sum, count) => sum + count, 0),
      totalRevenue: 0 // Will be calculated from revenue_reports in future
    };

    console.log('📊 Real users data loaded:', stats);

    return res.status(200).json({
      success: true,
      users: filteredUsers,
      stats,
      message: `Loaded ${filteredUsers.length} users with real database data`
    });

  } catch (error) {
    console.error('Comprehensive users API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export default requirePermission('user:view:any')(handler);
