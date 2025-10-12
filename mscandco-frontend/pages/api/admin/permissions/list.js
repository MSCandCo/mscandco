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

  try {
    // Fetch all permissions
    const { data: permissions, error } = await supabase
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

// V2 Permission: Requires read permission for permissions & roles management
export default requirePermission('users_access:permissions_roles:read')(handler);