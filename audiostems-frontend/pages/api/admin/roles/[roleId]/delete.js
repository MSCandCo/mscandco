import { createClient } from '@supabase/supabase-js';
import { requirePermission } from '@/lib/rbac/middleware';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { roleId } = req.query;

  if (!roleId) {
    return res.status(400).json({
      success: false,
      error: 'Role ID is required'
    });
  }

  try {
    // Get role information
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

    // Protect standard system roles
    const protectedRoles = ['super_admin', 'company_admin', 'label_admin', 'artist', 'distribution_partner'];
    if (protectedRoles.includes(role.name)) {
      return res.status(403).json({
        success: false,
        error: 'Cannot delete system roles'
      });
    }

    // Check if any users are assigned to this role
    const { data: usersWithRole, error: usersError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('role', role.name)
      .limit(1);

    if (usersError) {
      console.error('Error checking users:', usersError);
      return res.status(500).json({
        success: false,
        error: 'Failed to check role usage'
      });
    }

    if (usersWithRole && usersWithRole.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete role that is assigned to users. Please reassign users first.'
      });
    }

    // Delete role permissions first (foreign key constraint)
    const { error: permissionsError } = await supabase
      .from('role_permissions')
      .delete()
      .eq('role_id', roleId);

    if (permissionsError) {
      console.error('Error deleting role permissions:', permissionsError);
      return res.status(500).json({
        success: false,
        error: 'Failed to delete role permissions'
      });
    }

    // Delete the role
    const { error: deleteError } = await supabase
      .from('roles')
      .delete()
      .eq('id', roleId);

    if (deleteError) {
      console.error('Error deleting role:', deleteError);
      return res.status(500).json({
        success: false,
        error: 'Failed to delete role'
      });
    }

    res.status(200).json({
      success: true,
      message: `Role "${role.name}" deleted successfully`
    });

  } catch (error) {
    console.error('Delete role error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

// V2 Permission: Requires delete permission for permissions & roles management
export default requirePermission('users_access:permissions_roles:delete')(handler);
