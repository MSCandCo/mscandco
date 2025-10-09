// Check User Permissions API - Real Database Integration
import { supabase } from '@/lib/supabase';
import { requireAuth } from '@/lib/rbac/middleware';

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // req.user and req.userRole are automatically attached by middleware
    const user = req.user;

    console.log('🔐 Checking permissions for user:', user.email);

    // Get user profile and role
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !userProfile) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    // Get user permissions
    const { data: permissions, error: permError } = await supabase
      .from('user_permissions')
      .select(`
        permission_key,
        is_active,
        expires_at,
        granted_at,
        notes,
        permission_definitions!user_permissions_permission_key_fkey(
          permission_name,
          description,
          category
        )
      `)
      .eq('user_id', user.id)
      .eq('is_active', true);

    if (permError) {
      console.error('Error loading permissions:', permError);
      return res.status(500).json({ error: 'Failed to load permissions' });
    }

    // Filter out expired permissions
    const activePermissions = (permissions || []).filter(perm => {
      if (!perm.expires_at) return true;
      return new Date(perm.expires_at) > new Date();
    });

    // Group permissions by category
    const permissionsByCategory = {};
    activePermissions.forEach(perm => {
      const category = perm.permission_definitions?.category || 'other';
      if (!permissionsByCategory[category]) {
        permissionsByCategory[category] = [];
      }
      permissionsByCategory[category].push(perm);
    });

    // Determine accessible pages based on role and permissions
    const accessiblePages = {
      // Always accessible to logged-in users
      '/dashboard': true,
      '/profile': true,
      
      // Role-specific defaults
      '/artist/analytics': userProfile.role === 'artist' || hasPermission('analytics.view'),
      '/artist/earnings': userProfile.role === 'artist' || hasPermission('earnings.view'),
      '/artist/releases': userProfile.role === 'artist' || hasPermission('releases.view'),
      
      '/labeladmin/artists': userProfile.role === 'label_admin' || hasPermission('users.view'),
      '/labeladmin/releases': userProfile.role === 'label_admin' || hasPermission('releases.view'),
      
      '/companyadmin/users': hasPermission('users.view'),
      '/companyadmin/analytics': hasPermission('analytics.view'),
      '/companyadmin/analytics-management': hasPermission('analytics.manage_all'),
      '/companyadmin/earnings': hasPermission('earnings.view'),
      '/companyadmin/earnings-management': hasPermission('earnings.manage_all'),
      '/companyadmin/requests': hasPermission('requests.monitor_all'),
      
      '/superadmin/users': userProfile.role === 'super_admin',
      '/superadmin/permissionsroles': hasPermission('admin.permissions'),
      
      '/distributionpartner/reports': hasPermission('revenue.report'),
      
      '/customadmin/dashboard': userProfile.role === 'custom_admin'
    };

    function hasPermission(permissionKey) {
      return activePermissions.some(perm => perm.permission_key === permissionKey);
    }

    console.log('✅ Permissions loaded:', {
      role: userProfile.role,
      customAdminTitle: userProfile.custom_admin_title,
      activePermissions: activePermissions.length,
      categories: Object.keys(permissionsByCategory)
    });

    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: userProfile.role,
        customAdminTitle: userProfile.custom_admin_title,
        displayName: userProfile.artist_name || 
                    `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim() ||
                    userProfile.email
      },
      permissions: activePermissions,
      permissionsByCategory,
      accessiblePages,
      message: `Loaded ${activePermissions.length} active permissions`
    });

  } catch (error) {
    console.error('Permissions check error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export default requireAuth()(handler);
