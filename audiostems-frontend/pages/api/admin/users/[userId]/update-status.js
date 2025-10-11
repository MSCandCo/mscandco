/**
 * API: Update User Email Confirmation Status
 * POST /api/admin/users/[userId]/update-status
 *
 * Manually activate/deactivate user email confirmation
 * Requires: user:update:any permission
 */

import { createClient } from '@supabase/supabase-js';
import { requirePermission } from '@/lib/permissions';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check permission - only users with user update access
  const authorized = await requirePermission(req, res, 'user:update:any');
  if (!authorized) return;

  const { userId } = req.query;
  const { action } = req.body; // 'activate' or 'deactivate'

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  if (!action || !['activate', 'deactivate'].includes(action)) {
    return res.status(400).json({
      error: 'Invalid action',
      validActions: ['activate', 'deactivate']
    });
  }

  try {
    // Get user from auth
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers();

    if (authError) {
      console.error('Error listing users:', authError);
      throw authError;
    }

    const authUser = authData.users.find(u => u.id === userId);

    if (!authUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check current status
    const currentlyActive = !!authUser.email_confirmed_at && !authUser.banned_until;

    if (action === 'activate' && currentlyActive) {
      return res.status(400).json({
        error: 'User is already active',
        email: authUser.email
      });
    }

    if (action === 'deactivate' && !currentlyActive) {
      return res.status(400).json({
        error: 'User is already deactivated',
        email: authUser.email
      });
    }

    let updatedUser, updateError;

    if (action === 'activate') {
      // Activate: Confirm email and unban user
      const updates = { email_confirm: true };

      // If user was banned, unban them
      if (authUser.banned_until) {
        updates.ban_duration = 'none';
      }

      const result = await supabase.auth.admin.updateUserById(userId, updates);
      updatedUser = result.data;
      updateError = result.error;
    } else {
      // Deactivate: Ban user indefinitely (999 years)
      // This prevents login while keeping their data intact
      const result = await supabase.auth.admin.updateUserById(
        userId,
        { ban_duration: '876000h' } // ~100 years
      );
      updatedUser = result.data;
      updateError = result.error;
    }

    if (updateError) {
      console.error('Error updating user status:', updateError);
      throw updateError;
    }

    const newStatus = action === 'activate' ? 'active' : 'pending';

    res.status(200).json({
      success: true,
      message: `User ${action === 'activate' ? 'activated' : 'deactivated'} successfully`,
      user: {
        id: updatedUser.user.id,
        email: updatedUser.user.email,
        status: newStatus,
        email_confirmed_at: updatedUser.user.email_confirmed_at
      }
    });

  } catch (error) {
    console.error('Error in update-status:', error);
    res.status(500).json({
      error: 'Failed to update user status',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
}
