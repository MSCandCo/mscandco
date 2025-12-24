/**
 * Default Role Permissions Configuration
 *
 * This file defines the default permissions for each system role.
 * Used by the "Reset to Default" functionality.
 */

export const DEFAULT_ROLE_PERMISSIONS = {
  artist: [
    'dashboard:access',
    'profile:read',
    'profile:update',
    'releases:access',
    'analytics:access',
    'analytics:basic:view',
    'earnings:access',
    'roster:access',
    'messages:access',
    'messages:releases:view',
    'messages:earnings:view',
    'messages:payouts:view',
    'messages:invitations:view',
    'artist:messages:access',
    'settings:access',
    'artist:settings:access',
    'settings:read',
    'settings:preferences:edit',
    'settings:notifications:edit',
    'settings:security:edit',
  ],

  labeladmin: [
    'dashboard:access',
    'profile:read',
    'profile:update',
    'labeladmin:artists:access',
    'labeladmin:my_artists:access',
    'releases:access',
    'analytics:access',
    'analytics:basic:view',
    'analytics:advanced:view',
    'earnings:access',
    'roster:access',
    'messages:access',
    'messages:releases:view',
    'messages:earnings:view',
    'messages:payouts:view',
    'messages:invitation_responses:view',
    'messages:invitations:view',
    'labeladmin:messages:access',
    'settings:access',
    'labeladmin:settings:access',
    'settings:read',
    'settings:preferences:edit',
    'settings:notifications:edit',
    'settings:security:edit',
    'settings:billing:view',
    'settings:billing:edit',
  ],

  distribution_partner: [
    'dashboard:access',
    'profile:read',
    'profile:update',
    'distribution:distribution_hub:access',
    'distribution:distribution_hub:read',
    'distribution:distribution_hub:create',
    'distribution:distribution_hub:update',
    'distribution:distribution_hub:delete',
    'distribution:revenue_reporting:access',
    'distribution:revenue_reporting:read',
    'distribution:releases:access',
    'analytics:access',
    'analytics:platform_analytics:read',
    'messages:access',
    'messages:releases:view',
    'messages:system:view',
    'settings:access',
    'distribution:settings:access',
    'settings:read',
    'settings:preferences:edit',
    'settings:notifications:edit',
    'settings:security:edit',
    'settings:api_keys:view',
    'settings:api_keys:manage',
  ],

  financial_admin: [
    'dashboard:access',
    'finance:earnings_management:read',
    'finance:wallet_management:read',
    'finance:split_configuration:read',
  ],

  analytics_admin: [
    'dashboard:access',
    'analytics:analytics_management:read',
    'analytics:analytics_management:create',
    'analytics:analytics_management:update',
    'analytics:analytics_management:delete',
    'analytics:platform_analytics:read',
    'analytics:requests:read',
    'analytics:requests:update',
  ],

  support_admin: [
    'dashboard:access',
    'analytics:requests:read',
    'analytics:requests:update',
    'messages:access',
  ],

  marketing_admin: [
    'dashboard:access',
    'platform_messages:read',
    'platform_messages:create',
  ],

  requests_admin: [
    'dashboard:access',
    'analytics:requests:read',
  ],

  roster_admin: [
    'dashboard:access',
    'users_access:master_roster:read',
  ],

  content_moderator: [
    'dashboard:access',
    'profile:read',
    'profile:update',
    'content:asset_library:read',
    'users_access:master_roster:read',
    'analytics:requests:read',
    'analytics:requests:update',
    'messages:access',
    'messages:all:view',
    'platform_messages:read',
    'settings:access',
    'settings:read',
    'settings:preferences:edit',
    'settings:notifications:edit',
    'settings:security:edit',
  ],

  company_admin: [
    'dashboard:access',
    'profile:read',
    'profile:update',
    'users_access:user_management:read',
    'users_access:user_management:create',
    'users_access:user_management:update',
    'users_access:master_roster:read',
    'users_access:master_roster:create',
    'users_access:master_roster:update',
    'users_access:master_roster:delete',
    'content:asset_library:read',
    'content:asset_library:delete',
    'finance:earnings_management:read',
    'finance:wallet_management:read',
    'finance:split_configuration:read',
    'finance:split_configuration:create',
    'finance:split_configuration:update',
    'analytics:access',
    'analytics:platform_analytics:read',
    'analytics:analytics_management:read',
    'analytics:requests:read',
    'analytics:requests:update',
    'releases:access',
    'messages:access',
    'messages:all:view',
    'platform_messages:read',
    'platform_messages:create',
    'platform_messages:update',
    'settings:access',
    'settings:read',
    'settings:preferences:edit',
    'settings:notifications:edit',
    'settings:security:edit',
    'settings:billing:view',
    'settings:billing:edit',
  ],

  custom_admin: [],
  test_admin: [],

  // Super Admin should never be reset - protected by UI and API
  super_admin: []
}

/**
 * Get default permissions for a role
 * @param {string} roleName - The name of the role
 * @returns {string[]} Array of permission names
 */
export function getDefaultPermissionsForRole(roleName) {
  return DEFAULT_ROLE_PERMISSIONS[roleName] || []
}
