/**
 * GET /api/notifications/list
 *
 * Get notifications for the current user
 */

import { getUserFromSession } from '@/lib/permissions';
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
    const user = await getUserFromSession(req, res);
    if (!user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { unread_only, limit = 50 } = req.query;

    let query = supabase
      .from('admin_notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(parseInt(limit));

    if (unread_only === 'true') {
      query = query.eq('read', false);
    }

    const { data: notifications, error } = await query;

    if (error) throw error;

    // Get unread count
    const { count: unreadCount } = await supabase
      .from('admin_notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('read', false);

    return res.json({
      success: true,
      notifications: notifications || [],
      unread_count: unreadCount || 0
    });

  } catch (error) {
    console.error('List notifications error:', error);
    return res.status(500).json({
      error: 'Failed to fetch notifications',
      details: error.message
    });
  }
}
