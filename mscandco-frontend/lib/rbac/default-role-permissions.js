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
    // Core Distribution Access (MAIN FEATURES)
    'distribution:read:any',
    'distribution:manage:any',
    'revenue:read',
    'revenue:create',
    'revenue:update',
    // Distribution Access Permissions (page-level)
    'distribution:distribution_hub:access',
    'distribution:revenue_reporting:access',
    'distribution:releases:access',
    'distribution:settings:access',
    // Basic User Access (ESSENTIAL)
    'dashboard:access',
    'profile:read',
    'profile:update',
    'messages:access',
    'settings:access',
    // Message Tabs
    'messages:system:view',
    // Settings Tabs
    'settings:preferences:edit',
    'settings:security:edit',
    'settings:notifications:edit',
    // Own User Permissions
    'user:read:own',
    'user:update:own',
    'notification:read:own',
    'message:read:own',
  ],

  financial_admin: [
    'dashboard:access',
    // Finance-specific permissions
    'finance:earnings_management:read',
    'finance:earnings_management:create',
    'finance:earnings_management:update',
    'finance:earnings_management:delete',
    'finance:wallet_management:read',
    'finance:wallet_management:create',
    'finance:wallet_management:update',
    'finance:wallet_management:delete',
    'finance:split_configuration:read',
    'finance:split_configuration:create',
    'finance:split_configuration:update',
    'finance:split_configuration:delete',
    // Basic admin permissions (profile and settings for own account)
    'profile:read',
    'profile:update',
    'settings:access',
    'settings:read',
    'settings:preferences:edit',
    'settings:notifications:edit',
    'settings:security:edit',
    // Messages access (to receive system messages)
    'messages:access',
    'messages:system:view',
    // Own user permissions
    'user:read:own',
    'user:update:own',
    'notification:read:own',
    'message:read:own',
  ],

  analytics_admin: [
    'dashboard:access',
    // Analytics-specific permissions
    'analytics:analytics_management:read',
    'analytics:analytics_management:create',
    'analytics:analytics_management:update',
    'analytics:analytics_management:delete',
    'analytics:platform_analytics:read',
    'analytics:requests:read',
    'analytics:requests:update',
    // Basic admin permissions (profile and settings for own account)
    'profile:read',
    'profile:update',
    'settings:access',
    'settings:read',
    'settings:preferences:edit',
    'settings:notifications:edit',
    'settings:security:edit',
    // Messages access (to receive system messages)
    'messages:access',
    'messages:system:view',
    // Own user permissions
    'user:read:own',
    'user:update:own',
    'notification:read:own',
    'message:read:own',
  ],

  support_admin: [
    'dashboard:access',
    // Support-specific permissions
    'analytics:requests:read',
    'analytics:requests:update',
    // Messages access (essential for support)
    'messages:access',
    'messages:all:view',
    'messages:system:view',
    // Basic admin permissions (profile and settings for own account)
    'profile:read',
    'profile:update',
    'settings:access',
    'settings:read',
    'settings:preferences:edit',
    'settings:notifications:edit',
    'settings:security:edit',
    // Own user permissions
    'user:read:own',
    'user:update:own',
    'notification:read:own',
    'message:read:own',
  ],

  marketing_admin: [
    'dashboard:access',
    // Marketing-specific permissions
    'platform_messages:read',
    'platform_messages:create',
    'platform_messages:update',
    'platform_messages:delete',
    // Basic admin permissions (profile and settings for own account)
    'profile:read',
    'profile:update',
    'settings:access',
    'settings:read',
    'settings:preferences:edit',
    'settings:notifications:edit',
    'settings:security:edit',
    // Messages access (to receive system messages)
    'messages:access',
    'messages:system:view',
    // Own user permissions
    'user:read:own',
    'user:update:own',
    'notification:read:own',
    'message:read:own',
  ],

  requests_admin: [
    'dashboard:access',
    // Requests-specific permissions
    'analytics:requests:read',
    'analytics:requests:update',
    // Basic admin permissions (profile and settings for own account)
    'profile:read',
    'profile:update',
    'settings:access',
    'settings:read',
    'settings:preferences:edit',
    'settings:notifications:edit',
    'settings:security:edit',
    // Messages access (to receive system messages)
    'messages:access',
    'messages:system:view',
    // Own user permissions
    'user:read:own',
    'user:update:own',
    'notification:read:own',
    'message:read:own',
  ],

  roster_admin: [
    'dashboard:access',
    // Roster-specific permissions
    'users_access:master_roster:read',
    'users_access:master_roster:create',
    'users_access:master_roster:update',
    'users_access:master_roster:delete',
    // Basic admin permissions (profile and settings for own account)
    'profile:read',
    'profile:update',
    'settings:access',
    'settings:read',
    'settings:preferences:edit',
    'settings:notifications:edit',
    'settings:security:edit',
    // Messages access (to receive system messages)
    'messages:access',
    'messages:system:view',
    // Own user permissions
    'user:read:own',
    'user:update:own',
    'notification:read:own',
    'message:read:own',
  ],

  content_moderator: [
    'dashboard:access',
    // Content moderation-specific permissions
    'content:asset_library:read',
    'content:asset_library:delete',
    'users_access:master_roster:read',
    'analytics:requests:read',
    'analytics:requests:update',
    // Messages access (essential for moderation)
    'messages:access',
    'messages:all:view',
    'platform_messages:read',
    // Basic admin permissions (profile and settings for own account)
    'profile:read',
    'profile:update',
    'settings:access',
    'settings:read',
    'settings:preferences:edit',
    'settings:notifications:edit',
    'settings:security:edit',
    // Own user permissions
    'user:read:own',
    'user:update:own',
    'notification:read:own',
    'message:read:own',
  ],

  company_admin: [
    'dashboard:access',
    // User & Access Management
    'users_access:user_management:read',
    'users_access:user_management:create',
    'users_access:user_management:update',
    'users_access:user_management:delete',
    'users_access:master_roster:read',
    'users_access:master_roster:create',
    'users_access:master_roster:update',
    'users_access:master_roster:delete',
    // Content Management
    'content:asset_library:read',
    'content:asset_library:delete',
    // Finance Management (Full CRUD)
    'finance:earnings_management:read',
    'finance:earnings_management:create',
    'finance:earnings_management:update',
    'finance:earnings_management:delete',
    'finance:wallet_management:read',
    'finance:wallet_management:create',
    'finance:wallet_management:update',
    'finance:wallet_management:delete',
    'finance:split_configuration:read',
    'finance:split_configuration:create',
    'finance:split_configuration:update',
    'finance:split_configuration:delete',
    // Analytics
    'analytics:access',
    'analytics:platform_analytics:read',
    'analytics:analytics_management:read',
    'analytics:requests:read',
    'analytics:requests:update',
    // Releases
    'releases:access',
    // Messages
    'messages:access',
    'messages:all:view',
    'platform_messages:read',
    'platform_messages:create',
    'platform_messages:update',
    'platform_messages:delete',
    // Basic admin permissions (profile and settings for own account)
    'profile:read',
    'profile:update',
    'settings:access',
    'settings:read',
    'settings:preferences:edit',
    'settings:notifications:edit',
    'settings:security:edit',
    'settings:billing:view',
    'settings:billing:edit',
    // Own user permissions
    'user:read:own',
    'user:update:own',
    'notification:read:own',
    'message:read:own',
  ],

  // Custom Admin: Empty by default - permissions should be assigned individually per user
  // This role is designed for custom administrative roles that need specific, tailored permissions
  custom_admin: [],

  // Test Admin: Empty by default - for testing purposes
  // Permissions should be assigned as needed for specific test scenarios
  test_admin: [],

  // Super Admin: Should never be reset - protected by UI and API
  // Uses wildcard permission (*:*:*) which grants all permissions automatically
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
