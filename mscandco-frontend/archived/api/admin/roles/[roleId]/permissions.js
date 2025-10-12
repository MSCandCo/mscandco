/**
 * GET /api/admin/roles/[roleId]/permissions
 * POST /api/admin/roles/[roleId]/permissions
 *
 * Get or toggle permissions for a role
 * Protected by: role:update:any
 */

import { requirePermission } from '@/lib/permissions';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  const { roleId } = req.query;

  if (!roleId) {
    return res.status(400).json({
      success: false,
      error: 'Role ID is required'
    });
  }

  try {
    // Check permission for both GET and POST
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

    if (req.method === 'GET') {
      return await handleGetPermissions(req, res, roleId, role);
    } else if (req.method === 'POST') {
      return await handleTogglePermission(req, res, roleId, role);
    } else {
      return res.status(405).json({
        success: false,
        error: 'Method not allowed'
      });
    }

  } catch (error) {
    console.error('Role permissions error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
}

async function handleGetPermissions(req, res, roleId, role) {
  try {
    // Get all permissions for this role
    const { data: rolePermissions, error } = await supabase
      .from('role_permissions')
      .select(`
        id,
        granted_at,
        permission:permissions(*)
      `)
      .eq('role_id', roleId);

    if (error) {
      console.error('Error fetching role permissions:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch permissions',
        details: error.message
      });
    }

    // Get all available permissions
    const { data: allPermissions } = await supabase
      .from('permissions')
      .select('*')
      .order('resource', { ascending: true })
      .order('action', { ascending: true });

    // Map which permissions are granted
    const grantedPermissionIds = new Set(
      rolePermissions.map(rp => rp.permission.id)
    );

    const permissionsWithStatus = allPermissions.map(perm => ({
      ...perm,
      granted: grantedPermissionIds.has(perm.id)
    }));

    // Group by resource
    const grouped = {};
    for (const perm of permissionsWithStatus) {
      if (!grouped[perm.resource]) {
        grouped[perm.resource] = [];
      }
      grouped[perm.resource].push(perm);
    }

    return res.status(200).json({
      success: true,
      role,
      permissions: permissionsWithStatus,
      grouped,
      granted_count: rolePermissions.length,
      total_count: allPermissions.length
    });

  } catch (error) {
    console.error('Get permissions error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
}

async function handleTogglePermission(req, res, roleId, role) {
  const { permission_id, grant } = req.body;

  if (!permission_id || typeof grant !== 'boolean') {
    return res.status(400).json({
      success: false,
      error: 'permission_id and grant (boolean) are required'
    });
  }

  try {
    // Verify permission exists
    const { data: permission, error: permError } = await supabase
      .from('permissions')
      .select('*')
      .eq('id', permission_id)
      .single();

    if (permError || !permission) {
      return res.status(404).json({
        success: false,
        error: 'Permission not found'
      });
    }

    if (grant) {
      // Grant permission
      const { error: insertError } = await supabase
        .from('role_permissions')
        .insert({
          role_id: roleId,
          permission_id: permission_id
        })
        .select()
        .single();

      if (insertError) {
        // Check if already exists
        if (insertError.code === '23505') {
          return res.status(200).json({
            success: true,
            message: 'Permission already granted',
            permission: permission.name,
            role: role.name
          });
        }

        console.error('Error granting permission:', insertError);
        return res.status(500).json({
          success: false,
          error: 'Failed to grant permission',
          details: insertError.message
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Permission granted successfully',
        permission: permission.name,
        role: role.name
      });

    } else {
      // Revoke permission
      const { error: deleteError } = await supabase
        .from('role_permissions')
        .delete()
        .eq('role_id', roleId)
        .eq('permission_id', permission_id);

      if (deleteError) {
        console.error('Error revoking permission:', deleteError);
        return res.status(500).json({
          success: false,
          error: 'Failed to revoke permission',
          details: deleteError.message
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Permission revoked successfully',
        permission: permission.name,
        role: role.name
      });
    }

  } catch (error) {
    console.error('Toggle permission error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
}
