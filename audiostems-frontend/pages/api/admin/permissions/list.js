import { requirePermission } from '@/lib/permissions';
import { supabaseService } from '@/lib/permissions';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check permission - only users with permission management access
  const authorized = await requirePermission(req, res, 'permission:read:any');
  if (!authorized) return;

  try {
    // Fetch all permissions
    const { data: permissions, error } = await supabaseService
      .from('permissions')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching permissions:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch permissions',
        hint: error.hint
      });
    }

    res.status(200).json({
      success: true,
      permissions: permissions || []
    });

  } catch (error) {
    console.error('Permissions list error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}