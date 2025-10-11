import { createClient } from '@supabase/supabase-js';
import { requireAuth } from '@/lib/rbac/middleware';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const userId = req.user.id;
    const notificationSettings = req.body;

    console.log('🔔 Updating notification settings for user:', userId);

    // Update notification settings in user_profiles
    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        notification_settings: notificationSettings,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('❌ Error updating notification settings:', error);
      return res.status(500).json({
        error: 'Failed to update notification settings',
        details: error.message
      });
    }

    console.log('✅ Notification settings updated successfully');

    return res.status(200).json({
      success: true,
      notification_settings: data.notification_settings
    });

  } catch (error) {
    console.error('❌ Error in notifications update API:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
}

export default requireAuth(handler);
