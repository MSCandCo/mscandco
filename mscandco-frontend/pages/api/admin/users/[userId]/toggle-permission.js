/**
 * API: Toggle User Permission (Testing Endpoint)
 * POST /api/admin/users/[userId]/toggle-permission
 *
 * Toggles a specific permission for a user for testing purposes
 */

import { createClient } from '@supabase/supabase-js';
import { requirePermission } from '@/lib/rbac/middleware';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId } = req.query;
  const { permissionName, enable } = req.body;

  if (!userId || !permissionName) {
    return res.status(400).json({ error: 'Missing userId or permissionName' });
  }

  try {
    // Get the permission ID
    const { data: permission, error: permError } = await supabase
      .from('permissions')
      .select('id, name')
      .eq('name', permissionName)
      .single();

    if (permError || !permission) {
      return res.status(404).json({ error: 'Permission not found' });
    }

    if (enable === false) {
      // Check if permission record already exists
      const { data: existing } = await supabase
        .from('user_permissions')
        .select('*')
        .eq('user_id', userId)
        .eq('permission_id', permission.id)
        .single();

      if (existing) {
        // Update existing record to denied = true
        const { error: updateError } = await supabase
          .from('user_permissions')
          .update({ denied: true })
          .eq('user_id', userId)
          .eq('permission_id', permission.id);

        if (updateError) {
          throw updateError;
        }

        console.log(`✅ Denied permission ${permissionName} for user ${userId}`);

        return res.status(200).json({
          success: true,
          action: 'denied',
          permission: permissionName,
          userId
        });
      } else {
        // Insert new record with denied = true
        const { error: insertError } = await supabase
          .from('user_permissions')
          .insert({
            user_id: userId,
            permission_id: permission.id,
            denied: true
          });

        if (insertError) {
          throw insertError;
        }

        console.log(`✅ Denied permission ${permissionName} for user ${userId}`);

        return res.status(200).json({
          success: true,
          action: 'denied',
          permission: permissionName,
          userId
        });
      }
    } else {
      // Check if permission already exists
      const { data: existing } = await supabase
        .from('user_permissions')
        .select('*')
        .eq('user_id', userId)
        .eq('permission_id', permission.id)
        .single();

      if (existing) {
        if (existing.denied === false) {
          // Already granted
          return res.status(200).json({
            success: true,
            action: 'already_granted',
            permission: permissionName,
            userId
          });
        } else {
          // Update from denied to granted
          const { error: updateError } = await supabase
            .from('user_permissions')
            .update({ denied: false })
            .eq('user_id', userId)
            .eq('permission_id', permission.id);

          if (updateError) {
            throw updateError;
          }

          console.log(`✅ Granted permission ${permissionName} to user ${userId}`);

          return res.status(200).json({
            success: true,
            action: 'granted',
            permission: permissionName,
            userId
          });
        }
      }

      // Add the permission with denied = false
      const { error: insertError } = await supabase
        .from('user_permissions')
        .insert({
          user_id: userId,
          permission_id: permission.id,
          denied: false
        });

      if (insertError) {
        throw insertError;
      }

      console.log(`✅ Granted permission ${permissionName} to user ${userId}`);

      return res.status(200).json({
        success: true,
        action: 'granted',
        permission: permissionName,
        userId
      });
    }

  } catch (error) {
    console.error('Error toggling permission:', error);
    return res.status(500).json({
      error: 'Failed to toggle permission',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
}

// Only super_admin can toggle permissions
export default requirePermission('*:*:*')(handler);
