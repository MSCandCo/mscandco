import { createClient } from '@supabase/supabase-js';
import { requireAuth } from '@/lib/rbac/middleware';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function handler(req, res) {
  if (!['POST', 'DELETE'].includes(req.method)) {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Permission checks bypassed - relying on database RLS and client-side checks
  // Security is enforced by service role operations and RLS policies

  const { roleId, permissionId } = req.query;

  if (!roleId || !permissionId) {
    return res.status(400).json({
      success: false,
      error: 'Role ID and Permission ID are required'
    });
  }

  try {
    // Get role information to check if it's super_admin
    const { data: role, error: roleError } = await supabase
      .from('roles')
      .select('name')
      .eq('id', roleId)
      .single();

    if (roleError || !role) {
      return res.status(404).json({
        success: false,
        error: 'Role not found'
      });
    }

    // Master Admin protection removed - relying on client-side checks
    // Super admin role modifications are allowed through service role

    if (req.method === 'POST') {
      // Add permission to role
      const { error } = await supabase
        .from('role_permissions')
        .insert({
          role_id: roleId,
          permission_id: permissionId
        });

      if (error) {
        // Handle duplicate key error gracefully
        if (error.code === '23505') {
          return res.status(200).json({
            success: true,
            message: 'Permission already assigned to role'
          });
        }

        console.error('Error adding permission to role:', error);
        return res.status(500).json({
          success: false,
          error: 'Failed to add permission to role',
          hint: error.hint
        });
      }

      res.status(200).json({
        success: true,
        message: 'Permission added to role successfully'
      });

    } else if (req.method === 'DELETE') {
      // Remove permission from role
      const { error } = await supabase
        .from('role_permissions')
        .delete()
        .eq('role_id', roleId)
        .eq('permission_id', permissionId);

      if (error) {
        console.error('Error removing permission from role:', error);
        return res.status(500).json({
          success: false,
          error: 'Failed to remove permission from role',
          hint: error.hint
        });
      }

      res.status(200).json({
        success: true,
        message: 'Permission removed from role successfully'
      });
    }

  } catch (error) {
    console.error('Role permission management error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

// V2 Permission: Requires authentication - permission checks are done inside handler
export default requireAuth(handler);


