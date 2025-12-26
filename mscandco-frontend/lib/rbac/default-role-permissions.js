/**
 * Default Role Permissions Configuration
 *
 * This file defines the default permissions for each system role.
 * Used by the "Reset to Default" functionality.
 */

export const DEFAULT_ROLE_PERMISSIONS = {
  artist: [
    // Page Access (from create_consolidated_permissions.sql)
    'dashboard:access',
    'analytics:access',
    'earnings:access',
    'releases:access',
    'roster:access',
    'profile:access',
    'platform:access',
    'messages:access',
    'settings:access',
    // Message Tabs
    'messages:invitations:view',
    'messages:earnings:view',
    'messages:payouts:view',
    // Settings Tabs
    'settings:preferences:edit',
    'settings:security:edit',
    'settings:notifications:edit',
    'settings:billing:view',
    'settings:billing:edit',
    'settings:api_keys:view',
    'settings:api_keys:manage',
    // Analytics Tabs
    'analytics:basic:view',
    'analytics:advanced:view',
    // Touring permissions (from add_touring_admin_permissions.sql)
    'touring:access',
    'touring:create',
    'touring:read:own',
    'touring:update:own',
    'touring:delete:own',
    // Own user permissions (standard for all users)
    'user:read:own',
    'user:update:own',
    'notification:read:own',
    'message:read:own',
  ],

  labeladmin: [
    // Page Access (from create_consolidated_permissions.sql)
    'dashboard:access',
    'analytics:access',
    'earnings:access',
    'releases:access',
    'roster:access',
    'profile:access',
    'platform:access',
    'messages:access',
    'settings:access',
    // Message Tabs (from create_rbac_system.sql - label_admin uses messages:invitations:view, not invitation_responses)
    // Note: create_consolidated_permissions.sql uses labeladmin with invitation_responses, but create_rbac_system.sql uses label_admin with invitations
    // We use invitations:view to match create_rbac_system.sql and add-missing-label-admin-permissions.sql
    'messages:invitations:view',
    'messages:earnings:view',
    'messages:payouts:view',
    'messages:system:view',
    // Settings Tabs
    'settings:preferences:edit',
    'settings:security:edit',
    'settings:notifications:edit',
    'settings:billing:view',
    'settings:billing:edit',
    'settings:api_keys:view',
    'settings:api_keys:manage',
    // Analytics Tabs
    'analytics:basic:view',
    'analytics:advanced:view',
    // Touring permissions (from add_touring_admin_permissions.sql)
    'touring:access',
    'touring:create',
    'touring:read:own',
    'touring:update:own',
    'touring:delete:own',
    'touring:read:label',
    'touring:update:label',
    'touring:delete:label',
    // Own user permissions (standard for all users)
    'user:read:own',
    'user:update:own',
    'notification:read:own',
    'message:read:own',
    // Label-Specific permissions (from create_rbac_system.sql and add-missing-label-admin-permissions.sql)
    'label:read:own',
    'label:update:own',
    'label:roster:read:own',
    'label:roster:manage:own',
    'artist:invite:label',
    'artist:manage:label',
    // Legacy labeladmin-specific page permissions (still used in codebase - from refactor_permission_system_v2.sql)
    // These are role-specific permissions that some pages still check for
    // Note: The standardization migration converts label_admin:* to labeladmin:*
    'labeladmin:profile:access',
    'labeladmin:my_artists:access',
    'labeladmin:messages:access',
    'labeladmin:artists:access', // Used by dashboard (alias for my_artists)
    'labeladmin:releases:access', // Used by dashboard
    'labeladmin:analytics:access', // Used by dashboard
    'labeladmin:earnings:access', // Used by dashboard
    'labeladmin:roster:access', // Used by dashboard
    'labeladmin:settings:access', // Used by dashboard
    'labeladmin:dashboard:access', // Used by dashboard
    'labeladmin:platform:access', // Used by dashboard
  ],

  distribution_partner: [
    // Core Distribution Access (MAIN FEATURES - from create_rbac_system.sql)
    'distribution:read:any',
    'distribution:manage:any',
    'revenue:read',
    'revenue:create',
    'revenue:update',
    // Distribution Access Permissions (page-level - from add_distribution_access_permissions.sql)
    'distribution:distribution_hub:access',
    'distribution:distribution_hub:read',
    'distribution:distribution_hub:create',
    'distribution:distribution_hub:update',
    'distribution:distribution_hub:delete',
    'distribution:revenue_reporting:access',
    'distribution:revenue_reporting:read',
    'distribution:releases:access',
    'distribution:settings:access',
    // Basic User Access (ESSENTIAL - from create_rbac_system.sql)
    'dashboard:access',
    'profile:access',
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
