/**
 * GET /api/superadmin/roles/list
 *
 * List all roles with permission counts
 * Protected by: role:read:any
 */

import { requirePermission } from '@/lib/permissions';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    // Check permission
    const authorized = await requirePermission(req, res, 'role:manage:any');
    if (!authorized) return;

    // Fetch all roles
    const { data: roles, error: rolesError } = await supabase
      .from('roles')
      .select('*')
      .order('created_at', { ascending: true });

    if (rolesError) {
      console.error('Error fetching roles:', rolesError);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch roles',
        details: rolesError.message
      });
    }

    // Fetch permission counts
    const { data: rolePermissions, error: countsError } = await supabase
      .from('role_permissions')
      .select('role_id');

    if (countsError) {
      console.error('Error fetching permission counts:', countsError);
    }

    // Calculate permission counts
    const permissionCounts = {};
    if (rolePermissions && Array.isArray(rolePermissions)) {
      rolePermissions.forEach(rp => {
        permissionCounts[rp.role_id] = (permissionCounts[rp.role_id] || 0) + 1;
      });
    }

    // Attach permission counts to roles
    const rolesWithCounts = roles.map(role => ({
      ...role,
      permission_count: permissionCounts[role.id] || 0
    }));

    return res.status(200).json({
      success: true,
      roles: rolesWithCounts,
      total: roles.length
    });

  } catch (error) {
    console.error('Roles list error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
}
