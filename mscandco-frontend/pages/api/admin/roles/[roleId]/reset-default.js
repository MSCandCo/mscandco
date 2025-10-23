import { createClient } from '@supabase/supabase-js';
import { requireAuth } from '@/lib/rbac/middleware';
import { hasPermission } from '@/lib/rbac/roles';
import { getDefaultPermissionsForRole } from '@/lib/rbac/default-role-permissions';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Master Admin ID for ultimate permission protection
const MASTER_ADMIN_ID = process.env.MASTER_ADMIN_ID || 'cd4c6d06-c733-4c2f-a67c-abf914e06b0d';

async function handler(req, res) {
  console.log('=== RESET DEFAULT PERMISSIONS API CALLED ===');
  console.log('Method:', req.method);
  console.log('User:', req.user?.id, req.user?.email);
  console.log('User Role:', req.userRole);

  if (req.method !== 'POST') {
    console.log('Method not allowed');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check update permission for permissions & roles
  console.log('Checking permission: users_access:permissions_roles:update');
  const canUpdate = await hasPermission(req.userRole, 'users_access:permissions_roles:update', req.user.id);
  console.log('Permission check result:', canUpdate);

  if (!canUpdate) {
    console.log('PERMISSION DENIED - User lacks permission to reset role permissions');
    return res.status(403).json({ error: 'Insufficient permissions to reset role permissions' });
  }

  const { roleId } = req.query;
  console.log('Role ID:', roleId);

  if (!roleId) {
    console.log('Role ID missing');
    return res.status(400).json({
      success: false,
      error: 'Role ID is required'
    });
  }

  try {
    // Get role information
    console.log('Fetching role information...');
    const { data: role, error: roleError } = await supabase
      .from('roles')
      .select('name')
      .eq('id', roleId)
      .single();

    console.log('Role query result:', { role, roleError });

    if (roleError || !role) {
      console.log('Role not found');
      return res.status(404).json({
        success: false,
        error: 'Role not found'
      });
    }

    // Protect Ultimate Super Admin
    if (role.name === 'super_admin' && req.user.id !== MASTER_ADMIN_ID) {
      console.log('Cannot reset Ultimate Super Admin permissions');
      return res.status(403).json({
        success: false,
        error: 'Cannot reset Ultimate Super Admin permissions'
      });
    }

    /**
     * Reset to Default: This will restore the role's permissions to the defaults
     * defined in the default-role-permissions.js configuration file
     *
     * Step 1: Get default permission names for this role from config
     * Step 2: Look up permission IDs from permission names
     * Step 3: Delete all current role_permissions entries for this role
     * Step 4: Insert default permissions into role_permissions
     */

    // Step 1: Get default permission names from config
    console.log('Step 1: Getting default permissions from config...');
    const defaultPermissionNames = getDefaultPermissionsForRole(role.name);
    console.log(`Found ${defaultPermissionNames.length} default permissions for ${role.name}`);

    if (defaultPermissionNames.length === 0) {
      console.log('No default permissions defined for this role');
      return res.status(200).json({
        success: true,
        message: `No default permissions defined for ${role.name}`,
        defaultPermissionsCount: 0
      });
    }

    // Step 2: Look up permission IDs from permission names
    console.log('Step 2: Looking up permission IDs...');
    const { data: permissions, error: permLookupError } = await supabase
      .from('permissions')
      .select('id, name')
      .in('name', defaultPermissionNames);

    console.log('Permissions lookup result:', { count: permissions?.length, error: permLookupError });

    if (permLookupError) {
      console.error('Error looking up permissions:', permLookupError);
      return res.status(500).json({
        success: false,
        error: 'Failed to look up permissions'
      });
    }

    if (!permissions || permissions.length === 0) {
      console.log('No matching permissions found in database');
      return res.status(404).json({
        success: false,
        error: 'No matching permissions found in database'
      });
    }

    // Step 3: Delete all current role_permissions for this role
    console.log('Step 3: Deleting current role permissions...');
    const { error: deleteError } = await supabase
      .from('role_permissions')
      .delete()
      .eq('role_id', roleId);

    if (deleteError) {
      console.error('Error deleting current role permissions:', deleteError);
      return res.status(500).json({
        success: false,
        error: 'Failed to delete current role permissions'
      });
    }
    console.log('Current permissions deleted successfully');

    // Step 4: Insert default permissions into role_permissions
    console.log('Step 4: Inserting default permissions...');
    const permissionsToInsert = permissions.map(perm => ({
      role_id: roleId,
      permission_id: perm.id
    }));

    console.log('Permissions to insert:', permissionsToInsert.length);

    const { error: insertError } = await supabase
      .from('role_permissions')
      .insert(permissionsToInsert);

    if (insertError) {
      console.error('Error inserting default permissions:', insertError);
      return res.status(500).json({
        success: false,
        error: 'Failed to restore default permissions'
      });
    }
    console.log('Default permissions inserted successfully');

    console.log('Reset completed successfully');
    res.status(200).json({
      success: true,
      message: `Successfully reset ${role.name} to default permissions`,
      defaultPermissionsCount: permissions?.length || 0
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


