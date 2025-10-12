// SUPER ADMIN NOTIFICATIONS API - Returns ALL platform notifications
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
    const user = req.user;
    const { type } = req.query;

    console.log('🔔 Super Admin fetching ALL platform notifications');

    // Build query to get ALL notifications from ALL users
    let query = supabase
      .from('notifications')
      .select(`
        *,
        user_profiles!notifications_user_id_fkey (
          email,
          full_name
        )
      `)
      .order('created_at', { ascending: false })
      .limit(100); // Limit to most recent 100 to avoid overwhelming

    if (type && type !== 'all') {
      query = query.eq('type', type);
    }

    const { data: notifications, error } = await query;

    if (error) {
      console.error('❌ Error fetching notifications:', error);
      return res.status(500).json({ error: 'Failed to fetch notifications' });
    }

    // Transform data to include user_email
    const transformedNotifications = notifications.map(notif => ({
      ...notif,
      user_email: notif.user_profiles?.email || 'Unknown',
      user_name: notif.user_profiles?.full_name || 'Unknown User'
    }));

    console.log(`✅ Retrieved ${transformedNotifications.length} platform notifications`);

    return res.json({
      success: true,
      notifications: transformedNotifications
    });

  } catch (error) {
    console.error('❌ API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Require system admin permission (only super admin has notification:read:any)
export default requirePermission('notification:read:any')(handler);
