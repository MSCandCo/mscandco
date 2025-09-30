// GET UNREAD NOTIFICATION COUNT API
import { createClient } from '@supabase/supabase-js';
import { getUserFromRequest } from '@/lib/auth';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // For development, use Henry's ID directly
    // In production, use proper auth: const { user } = await getUserFromRequest(req);
    const userId = '0a060de5-1c94-4060-a1c2-860224fc348d'; // Henry's ID

    console.log('🔔 Getting unread count for user:', userId);

    const { data, error } = await supabase
      .from('notifications')
      .select('id')
      .eq('user_id', userId)
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
