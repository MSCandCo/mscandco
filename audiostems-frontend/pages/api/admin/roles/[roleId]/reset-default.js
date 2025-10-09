import { requirePermission, MASTER_ADMIN_ID } from '@/lib/permissions';
import { supabaseService } from '@/lib/permissions';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check permission
  const authorized = await requirePermission(req, res, 'permission:assign:any');
  if (!authorized) return;

  const { roleId } = req.query;

  if (!roleId) {
    return res.status(400).json({
      success: false,
      error: 'Role ID is required'
    });
  }

  try {
    // Get role information
    const { data: role, error: roleError } = await supabaseService
      .from('roles')
      .select('name')
      .eq('id', roleId)
      .single();

    if (roleError || !role) {
      return res.status(404).json({
        success: false,
        error: 'Role not found'
      });
    }

    // Protect Ultimate Super Admin
    if (role.name === 'super_admin' && req.user.id !== MASTER_ADMIN_ID) {
      return res.status(403).json({
        success: false,
        error: 'Cannot reset Ultimate Super Admin permissions'
      });
    }

    // Clear existing permissions for this role
    const { error: clearError } = await supabaseService
      .from('role_permissions')
      .delete()
      .eq('role_id', roleId);

    if (clearError) {
      console.error('Error clearing role permissions:', clearError);
      return res.status(500).json({
        success: false,
        error: 'Failed to clear existing permissions'
      });
    }

    // Define default permissions for each role
    const defaultPermissions = {
      super_admin: ['*:*:*'], // Wildcard - all permissions

      company_admin: [
        // User management
        'user:read:any',
        'user:create:any',
        'user:update:any',
        'user:delete:any',
        'user:approve_changes:any',
        'user:reject_changes:any',

        // Release management
        'release:read:any',
        'release:create:partner',
        'release:update:any',
        'release:delete:any',
        'release:approve:any',
        'release:distribute:any',

        // Analytics & Earnings
        'analytics:read:any',
        'analytics:export:any',
        'earnings:read:any',
        'earnings:export:any',
        'earnings:calculate:any',

        // Payouts
        'payout:read:any',
        'payout:approve:any',
        'payout:process:any',
        'payout:cancel:any',

        // Labels
        'label:read:any',
        'label:create:any',
        'label:update:any',
        'label:roster:read:any',
        'label:roster:manage:any',
        'label:affiliation:approve:any',

        // Splits
        'split:read:any',
        'split:approve:any',

        // Support
        'support:read:any',
        'support:respond:any',
        'support:assign:any',
        'support:escalate:any',
        'support:close:any',

        // Roles & Permissions
        'role:read:any',

        // Subscriptions
        'subscription:read:any',
        'subscription:manage:any',
        'subscription:billing:any',

        // Communication
        'message:send:any',
        'notification:send:any',
        'announcement:create:any'
      ],

      label_admin: [
        // User management (label scope)
        'user:read:label',
        'user:create:label',
        'user:update:label',
        'user:read:own',
        'user:update:own',

        // Release management (label scope)
        'release:read:label',
        'release:create:label',
        'release:update:label',
        'release:delete:label',
        'release:read:own',
        'release:create:own',
        'release:update:own',

        // Analytics & Earnings (label scope)
        'analytics:read:label',
        'analytics:export:label',
        'analytics:read:own',
        'earnings:read:label',
        'earnings:export:label',
        'earnings:read:own',
        'earnings:export:own',

        // Payouts (label scope)
        'payout:read:label',
        'payout:approve:label',
        'payout:read:own',
        'payout:create:own',

        // Label roster
        'label:read:own',
        'label:update:own',
        'label:roster:read:own',
        'label:roster:manage:own',

        // Splits (label scope)
        'split:read:label',
        'split:create:label',
        'split:update:label',
        'split:delete:label',
        'split:read:own',
        'split:create:own',
        'split:update:own',

        // Support (label scope)
        'support:read:label',
        'support:read:own',
        'support:create:own',
        'support:respond:own',

        // Subscription
        'subscription:read:label',
        'subscription:read:own',

        // Communication (label scope)
        'message:send:label',
        'notification:send:label',
        'message:read:own',
        'notification:read:own'
      ],

      distribution_partner: [
        // Distribution
        'distribution:read:partner',
        'distribution:manage:partner',
        'distribution:approve:partner',

        // Releases (partner scope)
        'release:read:partner',
        'release:create:partner',
        'release:update:partner',
        'release:approve:partner',

        // Analytics & Earnings (partner scope)
        'analytics:read:partner',
        'analytics:export:partner',
        'earnings:read:partner',
        'earnings:export:partner',

        // Payouts (partner scope)
        'payout:read:partner',
        'payout:approve:partner',

        // Users (partner scope)
        'user:read:partner',
        'user:create:partner',
        'user:update:partner',

        // Own profile
        'user:read:own',
        'user:update:own',
        'subscription:read:own',
        'notification:read:own',
        'message:read:own'
      ],

      artist: [
        // Own profile
        'user:read:own',
        'user:update:own',

        // Own releases
        'release:read:own',
        'release:create:own',
        'release:update:own',
        'release:delete:own',

        // Own analytics & earnings
        'analytics:read:own',
        'earnings:read:own',
        'earnings:export:own',

        // Own payouts
        'payout:read:own',
        'payout:create:own',

        // Own splits
        'split:read:own',
        'split:create:own',
        'split:update:own',
        'split:delete:own',

        // Distribution status
        'distribution:read:own',

        // Support
        'support:read:own',
        'support:create:own',
        'support:respond:own',
        'support:update:own',
        'support:close:own',

        // Subscription
        'subscription:read:own',
        'subscription:update:own',
        'subscription:cancel:own',

        // Communication
        'message:read:own',
        'notification:read:own'
      ]
    };

    const rolePermissions = defaultPermissions[role.name] || [];

    if (rolePermissions.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No default permissions defined for this role'
      });
    }

    // Get permission IDs for the default permissions
    const { data: permissions, error: permError } = await supabaseService
      .from('permissions')
      .select('id, name')
      .in('name', rolePermissions);

    if (permError) {
      console.error('Error fetching permissions:', permError);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch permissions'
      });
    }

    // Insert default permissions
    const rolePermissionInserts = permissions.map(perm => ({
      role_id: roleId,
      permission_id: perm.id
    }));

    const { error: insertError } = await supabaseService
      .from('role_permissions')
      .insert(rolePermissionInserts);

    if (insertError) {
      console.error('Error inserting default permissions:', insertError);
      return res.status(500).json({
        success: false,
        error: 'Failed to insert default permissions'
      });
    }

    res.status(200).json({
      success: true,
      message: `Reset ${role.name} to default permissions successfully`,
      permissionsAdded: rolePermissions.length
    });

  } catch (error) {
    console.error('Reset default permissions error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}


