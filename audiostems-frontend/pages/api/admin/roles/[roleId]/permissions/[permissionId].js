import { requirePermission, MASTER_ADMIN_ID } from '@/lib/permissions';
import { supabaseService } from '@/lib/permissions';

export default async function handler(req, res) {
  if (!['POST', 'DELETE'].includes(req.method)) {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check permission
  const authorized = await requirePermission(req, res, 'permission:assign:any');
  if (!authorized) return;

  const { roleId, permissionId } = req.query;

  if (!roleId || !permissionId) {
    return res.status(400).json({
      success: false,
      error: 'Role ID and Permission ID are required'
    });
  }

  try {
    // Get role information to check if it's super_admin
    const { data: role, error: roleError } = await supabaseService
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
      const { error } = await supabaseService
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
      const { error } = await supabaseService
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


