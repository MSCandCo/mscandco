/**
 * DELETE /api/superadmin/roles/[roleId]/delete
 *
 * Delete role (only if not is_system_role)
 * Protected by: role:delete:any
 */

import { requirePermission } from '@/lib/permissions';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { roleId } = req.query;

  if (!roleId) {
    return res.status(400).json({
      success: false,
      error: 'Role ID is required'
    });
  }

  try {
    // Check permission
    const authorized = await requirePermission(req, res, 'role:manage:any');
    if (!authorized) return;

    // Verify role exists
    const { data: role, error: roleError } = await supabase
      .from('roles')
      .select('*')
      .eq('id', roleId)
      .single();

    if (roleError || !role) {
      return res.status(404).json({
        success: false,
        error: 'Role not found'
      });
    }

    // Prevent deleting system roles
    if (role.is_system_role) {
      return res.status(403).json({
        success: false,
        error: 'Cannot delete system roles',
        role: role.name
      });
    }

    // Check if any users have this role
    const { data: usersWithRole, error: usersError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('role', role.name)
      .limit(1);

    if (usersError) {
      console.error('Error checking users with role:', usersError);
      return res.status(500).json({
        success: false,
        error: 'Failed to verify role usage',
        details: usersError.message
      });
    }

    if (usersWithRole && usersWithRole.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'Cannot delete role that is assigned to users',
        hint: 'Reassign users to a different role first'
      });
    }

    // Delete the role (CASCADE will delete role_permissions)
    const { error: deleteError } = await supabase
      .from('roles')
      .delete()
      .eq('id', roleId);

    if (deleteError) {
      console.error('Error deleting role:', deleteError);
      return res.status(500).json({
        success: false,
        error: 'Failed to delete role',
        details: deleteError.message
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Role deleted successfully',
      deleted_role: role.name
    });

  } catch (error) {
    console.error('Delete role error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
}
