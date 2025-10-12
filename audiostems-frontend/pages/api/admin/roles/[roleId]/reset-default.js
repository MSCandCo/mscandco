import { createClient } from '@supabase/supabase-js';
import { requireAuth } from '@/lib/rbac/middleware';
import { hasPermission } from '@/lib/rbac/roles';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Master Admin ID for ultimate permission protection
const MASTER_ADMIN_ID = process.env.MASTER_ADMIN_ID || 'cd4c6d06-c733-4c2f-a67c-abf914e06b0d';

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check update permission for permissions & roles
  const canUpdate = await hasPermission(req.userRole, 'users_access:permissions_roles:update', req.user.id);
  if (!canUpdate) {
    return res.status(403).json({ error: 'Insufficient permissions to reset role permissions' });
  }

  const { roleId } = req.query;

  if (!roleId) {
    return res.status(400).json({
      success: false,
      error: 'Role ID is required'
    });
  }

  try {
    // Get role information
    const { data: role, error: roleError } = await supabase
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
    const { error: clearError } = await supabase
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
      ],

      content_moderator: [
        // Content review
        'content:read:any',
        'content:moderate:any',
        'content:flag:any',
        'content:approve:any',
        'content:reject:any',

        // Release review
        'release:read:any',
        'release:moderate:any',

        // User content
        'user:read:any',

        // Communication
        'message:read:own',
        'notification:read:own',
        'notification:send:any'
      ],

      financial_admin: [
        // Earnings management
        'earnings:read:any',
        'earnings:create:any',
        'earnings:update:any',
        'earnings:export:any',
        'earnings:calculate:any',

        // Payout management
        'payout:read:any',
        'payout:create:any',
        'payout:approve:any',
        'payout:process:any',
        'payout:cancel:any',

        // Splits
        'split:read:any',
        'split:approve:any',

        // Analytics
        'analytics:read:any',
        'analytics:export:any',

        // Users (for payment info)
        'user:read:any',

        // Communication
        'message:read:own',
        'notification:read:own',
        'notification:send:any'
      ],

      support_admin: [
        // Support tickets
        'support:read:any',
        'support:create:any',
        'support:respond:any',
        'support:update:any',
        'support:assign:any',
        'support:escalate:any',
        'support:close:any',

        // User management (read only)
        'user:read:any',

        // Communication
        'message:send:any',
        'message:read:any',
        'notification:send:any',
        'notification:read:any',

        // Own profile
        'user:read:own',
        'user:update:own'
      ],

      marketing_admin: [
        // Communications
        'message:send:any',
        'message:read:any',
        'notification:send:any',
        'notification:read:any',
        'announcement:create:any',
        'announcement:update:any',
        'announcement:delete:any',

        // Content access
        'content:read:any',
        'content:create:any',
        'content:update:any',

        // User data (for targeting)
        'user:read:any',

        // Analytics (for campaigns)
        'analytics:read:any',

        // Own profile
        'user:read:own',
        'user:update:own'
      ],

      requests_admin: [
        // User change requests
        'user:read:any',
        'user:approve_changes:any',
        'user:reject_changes:any',

        // Label affiliation
        'label:affiliation:read:any',
        'label:affiliation:approve:any',
        'label:affiliation:reject:any',

        // Artist requests
        'artist:request:read:any',
        'artist:request:approve:any',
        'artist:request:reject:any',

        // Communication
        'message:read:own',
        'notification:read:own',
        'notification:send:any',

        // Own profile
        'user:read:own',
        'user:update:own'
      ],

      release_admin: [
        // Release management
        'release:read:any',
        'release:create:any',
        'release:update:any',
        'release:delete:any',
        'release:approve:any',
        'release:reject:any',
        'release:distribute:any',

        // Distribution
        'distribution:read:any',
        'distribution:manage:any',

        // Analytics
        'analytics:read:any',
        'analytics:export:any',

        // Users (artists)
        'user:read:any',

        // Communication
        'message:read:own',
        'notification:read:own',
        'notification:send:any',

        // Own profile
        'user:read:own',
        'user:update:own'
      ],

      roster_admin: [
        // Label roster management
        'label:read:any',
        'label:roster:read:any',
        'label:roster:manage:any',
        'label:affiliation:read:any',
        'label:affiliation:approve:any',
        'label:affiliation:reject:any',

        // Artist management
        'user:read:any',
        'user:create:any',
        'user:update:any',

        // Artist requests
        'artist:request:read:any',
        'artist:request:approve:any',
        'artist:request:reject:any',

        // Releases (read only)
        'release:read:any',

        // Communication
        'message:send:any',
        'message:read:any',
        'notification:send:any',
        'notification:read:any',

        // Own profile
        'user:read:own',
        'user:update:own'
      ],

      request_admin: [
        // User change requests
        'user:read:any',
        'user:approve_changes:any',
        'user:reject_changes:any',

        // Communication
        'message:read:own',
        'notification:read:own',
        'notification:send:any',

        // Own profile
        'user:read:own',
        'user:update:own'
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
    const { data: permissions, error: permError } = await supabase
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

    const { error: insertError } = await supabase
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

// V2 Permission: Requires authentication - permission checks are done inside handler
// NOTE: This endpoint contains legacy hardcoded permissions that need to be updated to V2 format
export default requireAuth(handler);


