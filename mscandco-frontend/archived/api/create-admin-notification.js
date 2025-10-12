/**
 * POST /api/notifications/create-admin-notification
 *
 * Creates notifications for all admins with specific permission
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      permission,
      type,
      title,
      message,
      link,
      metadata
    } = req.body;

    if (!permission || !type || !title || !message) {
      return res.status(400).json({
        error: 'Missing required fields: permission, type, title, message'
      });
    }

    // Get all users with the specified permission
    const { data: usersWithPermission, error: permError } = await supabase.rpc(
      'get_users_with_permission',
      { permission_name: permission }
    );

    if (permError) {
      console.error('Error fetching users with permission:', permError);
      // Fallback: get all super_admins and company_admins
      const { data: fallbackUsers } = await supabase
        .from('user_profiles')
        .select('id')
        .in('role', ['super_admin', 'company_admin']);

      if (fallbackUsers && fallbackUsers.length > 0) {
        const notifications = fallbackUsers.map(user => ({
          user_id: user.id,
          type,
          title,
          message,
          link,
          metadata,
          read: false
        }));

        const { error: insertError } = await supabase
          .from('admin_notifications')
          .insert(notifications);

        if (insertError) throw insertError;

        return res.json({
          success: true,
          count: notifications.length,
          message: `Notifications sent to ${notifications.length} admins (fallback)`
        });
      }
    }

    if (!usersWithPermission || usersWithPermission.length === 0) {
      return res.json({
        success: true,
        count: 0,
        message: 'No users with specified permission found'
      });
    }

    // Create notifications for all users with permission
    const notifications = usersWithPermission.map(user => ({
      user_id: user.user_id,
      type,
      title,
      message,
      link,
      metadata,
      read: false
    }));

    const { error: insertError } = await supabase
      .from('admin_notifications')
      .insert(notifications);

    if (insertError) throw insertError;

    return res.json({
      success: true,
      count: notifications.length,
      message: `Notifications sent to ${notifications.length} admins`
    });

  } catch (error) {
    console.error('Create admin notification error:', error);
    return res.status(500).json({
      error: 'Failed to create notifications',
      details: error.message
    });
  }
}
