import { createClient } from '@supabase/supabase-js';
import { requirePermission } from '@/lib/rbac/middleware';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function handler(req, res) {
  try {
    const user = req.user;

    if (req.method === 'GET') {
      // Get notification settings from database
      const { data, error } = await supabase
        .from('user_profiles')
        .select('notification_settings')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      const settings = data?.notification_settings || {};

      return res.status(200).json({
        success: true,
        data: {
          emailNotifications: settings.emailNotifications ?? true,
          pushNotifications: settings.pushNotifications ?? true,
          releaseStatus: settings.releaseStatus ?? true,
          earnings: settings.earnings ?? true,
          messages: settings.messages ?? true,
          announcements: settings.announcements ?? true,
          frequency: settings.frequency || 'immediate'
        }
      });
    }

    if (req.method === 'POST') {
      const notificationSettings = req.body;

      // Update notification settings in database
      const { error } = await supabase
        .from('user_profiles')
        .update({
          notification_settings: notificationSettings
        })
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (error) {
    console.error('Error in notifications API:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

export default requirePermission(['distribution:settings:access'])(handler);
