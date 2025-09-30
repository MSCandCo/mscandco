// MARK NOTIFICATION AS READ API
import { createClient } from '@supabase/supabase-js';
import { getUserFromRequest } from '@/lib/auth';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // PROPER AUTHENTICATION - No hardcoded IDs
    const { user, error: authError } = await getUserFromRequest(req);
    if (authError || !user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { notification_id } = req.body;

    if (!notification_id) {
      return res.status(400).json({ error: 'Notification ID required' });
    }

    console.log('📧 Marking notification as read:', notification_id);

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notification_id)
      .eq('user_id', user.id); // Security: only mark own notifications

    if (error) {
      console.error('❌ Error marking as read:', error);
      return res.status(500).json({ error: 'Failed to mark as read' });
    }

    console.log('✅ Notification marked as read');

    return res.json({ success: true });

  } catch (error) {
    console.error('❌ API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
