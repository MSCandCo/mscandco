// GET UNREAD NOTIFICATION COUNT API
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
    // req.user and req.userRole are automatically attached by middleware
    const user = req.user;

    console.log('🔔 Getting unread count for user:', user.id);

    const { data, error } = await supabase
      .from('notifications')
      .select('id')
      .eq('user_id', user.id)
      .eq('read', false);

    if (error) {
      console.error('❌ Error getting unread count:', error);
      return res.status(500).json({ error: 'Failed to get unread count' });
    }

    const count = data?.length || 0;
    console.log(`✅ Unread notifications: ${count}`);

    return res.json({ count });

  } catch (error) {
    console.error('❌ API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export default requirePermission('notification:read:own')(handler);
