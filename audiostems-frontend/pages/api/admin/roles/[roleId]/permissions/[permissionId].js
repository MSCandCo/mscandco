import { createClient } from '@supabase/supabase-js';
import { requireAuth } from '@/lib/rbac/middleware';
import { hasPermission } from '@/lib/rbac/roles';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Master Admin ID for ultimate permission protection
const MASTER_ADMIN_ID = process.env.MASTER_ADMIN_ID || 'cd4c6d06-c733-4c2f-a67c-abf914e06b0d';

async function handler(req, res) {
  if (!['POST', 'DELETE'].includes(req.method)) {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check update permission for permissions & roles
  const canUpdate = await hasPermission(req.userRole, 'users_access:permissions_roles:update', req.user.id);
  if (!canUpdate) {
    return res.status(403).json({ error: 'Insufficient permissions to modify role permissions' });
  }

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

    // Protect Ultimate Super Admin - prevent modification of super_admin role by non-master users
    if (role.name === 'super_admin' && req.user.id !== MASTER_ADMIN_ID) {
      return res.status(403).json({
        success: false,
        error: 'Cannot modify Ultimate Super Admin permissions'
      });
    }

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


