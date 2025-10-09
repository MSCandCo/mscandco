import { requirePermission } from '@/lib/permissions';
import { supabaseService } from '@/lib/permissions';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check permission
  const authorized = await requirePermission(req, res, 'role:read:any');
  if (!authorized) return;

  const { roleId } = req.query;

  if (!roleId) {
    return res.status(400).json({
      success: false,
      error: 'Role ID is required'
    });
  }

  try {
    // Fetch permissions for the specific role
    const { data: permissions, error } = await supabaseService
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