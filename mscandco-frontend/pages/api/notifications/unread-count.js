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

    // Add cache headers for Safari and other browsers
    // Shorter cache for notifications (1 minute) since they change frequently
    res.setHeader('Cache-Control', 'private, max-age=60, stale-while-revalidate=30');
    res.setHeader('CDN-Cache-Control', 'private, max-age=60');
    res.setHeader('Vary', 'Authorization, Cookie');

    return res.json({ count });

  } catch (error) {
    console.error('❌ API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Allow multiple permission patterns for notifications/messages
// - Role-specific: artist:messages:access, label_admin:messages:access, etc.
// - Legacy: notification:read:own, notification:view:own
// - Super admin: dropdown:platform_messages:read
export default requirePermission([
  'artist:messages:access',
  'label_admin:messages:access',
  'distribution_partner:messages:access',
  'company_admin:messages:access',
  'super_admin:messages:access',
  'notification:read:own',
  'notification:view:own',
  'dropdown:platform_messages:read'
])(handler);
