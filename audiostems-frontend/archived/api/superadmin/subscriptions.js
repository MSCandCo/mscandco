import { supabase } from '@/lib/supabase';
import { requireRole } from '@/lib/rbac/middleware';

async function handler(req, res) {
  // req.user and req.userRole are automatically attached by middleware
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {

    // Get all subscriptions with user details
    const { data: subscriptions, error } = await supabase
      .from('subscriptions')
      .select(`
        *,
        user:auth.users(email),
        profile:user_profiles(firstName, lastName)
      `)
      .order('started_at', { ascending: false });

    if (error) {
      console.error('Error fetching subscriptions:', error);
      return res.status(500).json({ error: 'Failed to fetch subscriptions' });
    }

    // Format the data for frontend
    const formattedSubscriptions = subscriptions.map(sub => ({
      id: sub.id,
      user_id: sub.user_id,
      user_email: sub.user?.email || 'Unknown',
      firstName: sub.profile?.firstName || '',
      lastName: sub.profile?.lastName || '',
      tier: sub.tier,
      status: sub.status,
      started_at: sub.started_at,
      // Add plan limits based on tier
      plan_limits: getPlanLimits(sub.tier)
    }));

    res.status(200).json({ 
      subscriptions: formattedSubscriptions,
      total: formattedSubscriptions.length
    });

  } catch (error) {
    console.error('Super Admin subscriptions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

function getPlanLimits(tier) {
  const limits = {
    'artist_starter': '5 releases max',
    'artist_pro': 'Unlimited releases',
    'label_admin_starter': '4 artists, 8 releases max',
    'label_admin_pro': 'Unlimited artists and releases'
  };
  return limits[tier] || 'Unknown plan';
}

export default requireRole('super_admin')(handler);
