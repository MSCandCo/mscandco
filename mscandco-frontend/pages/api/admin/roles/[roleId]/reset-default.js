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
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check update permission for permissions & roles
  const canUpdate = await hasPermission(req.userRole, 'users_access:permissions_roles:update', req.user.id);
  if (!canUpdate) {
    return res.status(403).json({ error: 'Insufficient permissions to reset role permissions' });
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

    // Protect Ultimate Super Admin
    if (role.name === 'super_admin' && req.user.id !== MASTER_ADMIN_ID) {
      return res.status(403).json({
        success: false,
        error: 'Cannot reset Ultimate Super Admin permissions'
      });
    }

    /**
     * NOTE: Default permissions are now managed in the role_permissions table
     * This was done by running scripts/setup-default-role-permissions.js
     *
     * The "Reset to Default" functionality simply clears any user-specific
     * permission overrides, allowing the user to inherit the role's default permissions
     * from the role_permissions table.
     *
     * If you need to change the default permissions for a role, update them in
     * the role_permissions table via the Permissions & Roles UI or by running
     * the setup script again.
     */

    // For "Reset to Default", we don't actually modify the role_permissions table
    // Instead, we clear any user-specific permission overrides for users with this role
    // This allows them to inherit the role's default permissions

    // Get all users with this role
    const { data: usersWithRole, error: usersError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('role', role.name);

    if (usersError) {
      console.error('Error fetching users with role:', usersError);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch users with this role'
      });
    }

    // Clear user-specific permission overrides for these users
    if (usersWithRole && usersWithRole.length > 0) {
      const userIds = usersWithRole.map(u => u.id);

      const { error: clearUserPermsError } = await supabase
        .from('user_permissions')
        .delete()
        .in('user_id', userIds);

      if (clearUserPermsError) {
        console.error('Error clearing user permissions:', clearUserPermsError);
        return res.status(500).json({
          success: false,
          error: 'Failed to clear user permission overrides'
        });
      }
    }

    // Get the count of default permissions for this role
    const { data: rolePerms, error: rolePermsError } = await supabase
      .from('role_permissions')
      .select('permission_id')
      .eq('role_id', roleId);

    if (rolePermsError) {
      console.error('Error fetching role permissions:', rolePermsError);
    }

    const permissionsCount = rolePerms?.length || 0;

    res.status(200).json({
      success: true,
      message: `Reset ${usersWithRole?.length || 0} user(s) with role ${role.name} to default permissions`,
      defaultPermissionsCount: permissionsCount,
      usersAffected: usersWithRole?.length || 0
    });

  } catch (error) {
    console.error('Reset default permissions error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

// V2 Permission: Requires authentication - permission checks are done inside handler
// NOTE: This endpoint contains legacy hardcoded permissions that need to be updated to V2 format
export default requireAuth(handler);


