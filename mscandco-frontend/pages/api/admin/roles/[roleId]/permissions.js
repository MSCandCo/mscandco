import { createClient } from '@supabase/supabase-js';
import { requirePermission } from '@/lib/rbac/middleware';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function handler(req, res) {
  if (req.method !== 'GET') {
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
    // Fetch permissions for the specific role
    const { data: permissions, error } = await supabase
      .from('role_permissions')
      .select(`
        permission_id,
        permissions (
          id,
          name,
          description,
          resource,
          action,
          scope
        )
      `)
      .eq('role_id', roleId);

    if (error) {
      console.error('Error fetching role permissions:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch role permissions',
        hint: error.hint
      });
    }

    // Transform the data to flatten the permissions
    const flattenedPermissions = permissions.map(rp => ({
      permission_id: rp.permission_id,
      permission_name: rp.permissions.name,
      description: rp.permissions.description,
      resource: rp.permissions.resource,
      action: rp.permissions.action,
      scope: rp.permissions.scope
    }));

    res.status(200).json({
      success: true,
      permissions: flattenedPermissions
    });

  } catch (error) {
    console.error('Role permissions error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

// V2 Permission: Requires read permission for permissions & roles management
export default requirePermission('users_access:permissions_roles:read')(handler);