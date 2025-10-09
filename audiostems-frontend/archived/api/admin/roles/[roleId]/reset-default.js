/**
 * POST /api/superadmin/roles/[roleId]/reset-default
 *
 * Reset a role to its default permissions
 * Protected by: role:manage:any
 */

import { requirePermission } from '@/lib/permissions';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function getDefaultPermissions(roleName) {
  const defaults = {
    // SUPER ADMIN - Only wildcard
    super_admin: [
      '*:*:*'
    ],

    // COMPANY ADMIN - ALL "any" scope + essential "own" permissions
    company_admin: [
      // User Management - any
      'user:create:any',
      'user:read:any',
      'user:update:any',
      'user:delete:label',
      'user:delete:partner',
      'user:delete:any',
      'user:suspend:any',
      'user:impersonate:any',

      // Release Management - any
      'release:read:any',
      'release:update:any',
      'release:delete:any',
      'release:approve:any',
      'release:reject:any',
      'release:distribute:any',
      'release:takedown:any',

      // Earnings - any
      'earnings:read:any',
      'earnings:update:any',
      'earnings:distribute:any',
      'earnings:export:any',

      // Payouts - any
      'payout:read:any',
      'payout:approve:any',
      'payout:reject:any',
      'payout:process:any',

      // Splits - any
      'split:read:any',
      'split:update:any',
      'split:delete:any',

      // Analytics - any
      'analytics:read:any',
      'analytics:export:any',

      // Distribution - any
      'distribution:read:any',
      'distribution:manage:any',
      'distribution:monitor:any',

      // Labels - any
      'label:create:any',
      'label:read:any',
      'label:update:any',
      'label:delete:any',
      'label:manage_roster:any',
      'label:remove_artists:any',

      // Subscriptions - any
      'subscription:read:any',
      'subscription:update:any',
      'subscription:cancel:any',
      'subscription:manage_plans:any',

      // Support - any
      'support:read:any',
      'support:update:any',
      'support:assign:any',
      'support:respond:any',
      'support:close:any',
      'support:escalate:any',

      // Messaging - any
      'notification:send:any',
      'message:send:any',
      'message:broadcast:any',

      // RBAC - any
      'role:create:any',
      'role:read:any',
      'role:update:any',
      'role:delete:any',
      'role:assign:any',
      'permission:grant:any',
      'permission:revoke:any',

      // Platform - any
      'platform:manage:any',
      'audit:read:any',

      // Personal account essentials - own
      'user:read:own',
      'user:update:own',
      'notification:manage:own',
      'message:read:own',
      'support:create:own'
    ],

    // LABEL ADMIN - Manage label + own
    label_admin: [
      // User - own and label
      'user:read:own',
      'user:update:own',
      'user:read:label',
      'user:update:label',
      'user:delete:label',

      // Releases - own and label
      'release:create:own',
      'release:read:own',
      'release:update:own',
      'release:delete:own',
      'release:read:label',
      'release:update:label',
      'release:delete:label',

      // Earnings - own and label
      'earnings:read:own',
      'earnings:export:own',
      'earnings:read:label',
      'earnings:export:label',

      // Payouts - own and label
      'payout:create:own',
      'payout:read:own',
      'payout:create:label',
      'payout:read:label',

      // Splits - own and label (can create/manage for label)
      'split:create:label',
      'split:read:own',
      'split:read:label',
      'split:update:label',
      'split:delete:label',
      'split:accept:own',
      'split:decline:own',

      // Analytics - own and label
      'analytics:read:own',
      'analytics:export:own',
      'analytics:read:label',
      'analytics:export:label',

      // Label management - own label only
      'label:read:own',
      'label:update:own',
      'label:manage_roster:own',
      'label:invite_artists:own',
      'label:remove_artists:own',

      // Support - own and label
      'support:create:own',
      'support:read:own',
      'support:read:label',

      // Messaging - label and own
      'notification:send:label',
      'notification:manage:own',
      'message:read:own',

      // Subscription - own
      'subscription:read:own',
      'subscription:update:own'
    ],

    // DISTRIBUTION PARTNER - Review releases and manage distribution
    distribution_partner: [
      // Releases - partner scope + approval
      'release:read:partner',
      'release:update:partner',
      'release:approve:any',
      'release:reject:any',
      'release:distribute:any',

      // Earnings - partner
      'earnings:read:partner',

      // Payouts - partner processing
      'payout:read:partner',
      'payout:process:any',

      // Distribution - partner management
      'distribution:read:partner',
      'distribution:manage:partner',
      'distribution:monitor:partner',

      // Analytics - partner
      'analytics:read:partner',

      // Support - partner
      'support:create:partner',
      'support:read:partner',

      // Personal essentials
      'user:read:own',
      'user:update:own',
      'notification:manage:own',
      'message:read:own'
    ],

    // ARTIST - Only "own" scope
    artist: [
      // User - own only
      'user:read:own',
      'user:update:own',

      // Releases - own only
      'release:create:own',
      'release:read:own',
      'release:update:own',
      'release:delete:own',

      // Earnings - own only
      'earnings:read:own',
      'earnings:export:own',

      // Payouts - own only
      'payout:create:own',
      'payout:read:own',

      // Splits - own (accept/decline only)
      'split:read:own',
      'split:accept:own',
      'split:decline:own',

      // Analytics - own only
      'analytics:read:own',
      'analytics:export:own',

      // Support - own only
      'support:create:own',
      'support:read:own',

      // Messaging - own only
      'notification:manage:own',
      'message:read:own',

      // Subscription - own only
      'subscription:read:own',
      'subscription:update:own',
      'subscription:cancel:own'
    ]
  };

  return defaults[roleName] || [];
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    // Check permission
    const authorized = await requirePermission(req, res, 'role:manage:any');
    if (!authorized) return;

    const { roleId } = req.query;

    if (!roleId) {
      return res.status(400).json({
        success: false,
        error: 'Role ID is required'
      });
    }

    // Get the role
    const { data: role, error: roleError } = await supabase
      .from('roles')
      .select('id, name, description, is_system_role, created_at, updated_at')
      .eq('id', roleId)
      .single();

    if (roleError || !role) {
      console.error('Error fetching role:', roleError);
      return res.status(404).json({
        success: false,
        error: 'Role not found'
      });
    }

    // Check if it's a system role
    if (!role.is_system_role) {
      return res.status(400).json({
        success: false,
        error: 'Can only reset system roles to default permissions'
      });
    }

    // Get default permissions for this role
    const defaultPermissionNames = getDefaultPermissions(role.name);

    if (!defaultPermissionNames || defaultPermissionNames.length === 0) {
      return res.status(400).json({
        success: false,
        error: `No default permissions defined for role: ${role.name}`
      });
    }

    // Get permission IDs for the default permission names
    const { data: permissions, error: permissionsError } = await supabase
      .from('permissions')
      .select('id, name')
      .in('name', defaultPermissionNames);

    if (permissionsError) {
      console.error('Error fetching permissions:', permissionsError);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch permissions'
      });
    }

    // Clear all existing permissions for this role
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

    // Add default permissions
    if (permissions.length > 0) {
      const rolePermissions = permissions.map(permission => ({
        role_id: roleId,
        permission_id: permission.id,
        granted_at: new Date().toISOString()
      }));

      const { error: insertError } = await supabase
        .from('role_permissions')
        .insert(rolePermissions);

      if (insertError) {
        console.error('Error inserting default permissions:', insertError);
        return res.status(500).json({
          success: false,
          error: 'Failed to set default permissions'
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: `Role "${role.name}" has been reset to default permissions`,
      permissions_set: permissions.length
    });

  } catch (error) {
    console.error('Reset role error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
}