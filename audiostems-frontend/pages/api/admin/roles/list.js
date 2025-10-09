import { requirePermission } from '@/lib/permissions';
import { supabaseService } from '@/lib/permissions';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check permission - only users with role management access
  const authorized = await requirePermission(req, res, 'role:read:any');
  if (!authorized) return;

  try {
    // Fetch all roles with permission counts
    const { data: roles, error: rolesError } = await supabaseService
      .from('roles')
      .select(`
        id,
        name,
        description,
        created_at
      `)
      .order('name');

    if (rolesError) {
      console.error('Error fetching roles:', rolesError);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch roles',
        hint: rolesError.hint
      });
    }

    // Get permission counts for each role
    const rolesWithCounts = await Promise.all(
      roles.map(async (role) => {
        const { count, error: countError } = await supabaseService
          .from('role_permissions')
          .select('*', { count: 'exact', head: true })
          .eq('role_id', role.id);

        if (countError) {
          console.error(`Error counting permissions for role ${role.id}:`, countError);
        }

        return {
          ...role,
          permission_count: count || 0
        };
      })
    );

    res.status(200).json({
      success: true,
      roles: rolesWithCounts
    });

  } catch (error) {
    console.error('Roles list error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

