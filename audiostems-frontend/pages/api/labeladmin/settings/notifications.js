import { supabase } from '@/lib/supabase';

export default async function handler(req, res) {
  try {
    // Verify auth
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

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
