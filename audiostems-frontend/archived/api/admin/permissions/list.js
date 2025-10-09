/**
 * GET /api/admin/permissions/list
 *
 * List all permissions grouped by resource
 * Protected by: permission:read:any
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
    const authorized = await requirePermission(req, res, 'permission:read:any');
    if (!authorized) return;

    // Fetch all permissions
    const { data: permissions, error } = await supabase
      .from('permissions')
      .select('*')
      .order('resource', { ascending: true })
      .order('action', { ascending: true })
      .order('scope', { ascending: true });

    if (error) {
      console.error('Error fetching permissions:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch permissions',
        details: error.message
      });
    }

    // Group by resource
    const grouped = {};
    for (const perm of permissions) {
      const resource = perm.resource;
      if (!grouped[resource]) {
        grouped[resource] = [];
      }
      grouped[resource].push(perm);
    }

    // Calculate totals
    const totals = {
      total: permissions.length,
      byResource: Object.keys(grouped).reduce((acc, key) => {
        acc[key] = grouped[key].length;
        return acc;
      }, {})
    };

    return res.status(200).json({
      success: true,
      permissions,
      grouped,
      totals
    });

  } catch (error) {
    console.error('Permissions list error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
}
