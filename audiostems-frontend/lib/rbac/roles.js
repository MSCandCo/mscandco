/**
 * Role-Based Access Control (RBAC) Configuration
 * Defines roles, permissions, and their mappings for the platform
 */

// Role definitions
export const ROLES = {
  ARTIST: 'artist',
  LABEL_ADMIN: 'label_admin',
  COMPANY_ADMIN: 'company_admin',
  SUPER_ADMIN: 'super_admin',
  DISTRIBUTION_PARTNER: 'distribution_partner'
};

// Permission definitions organized by resource
export const PERMISSIONS = {
  // Profile permissions
  'profile:view:own': [ROLES.ARTIST, ROLES.LABEL_ADMIN, ROLES.COMPANY_ADMIN, ROLES.SUPER_ADMIN, ROLES.DISTRIBUTION_PARTNER],
  'profile:edit:own': [ROLES.ARTIST, ROLES.LABEL_ADMIN, ROLES.COMPANY_ADMIN, ROLES.SUPER_ADMIN, ROLES.DISTRIBUTION_PARTNER],
  'profile:view:any': [ROLES.LABEL_ADMIN, ROLES.COMPANY_ADMIN, ROLES.SUPER_ADMIN],
  'profile:edit:any': [ROLES.COMPANY_ADMIN, ROLES.SUPER_ADMIN],
  'profile:delete:any': [ROLES.SUPER_ADMIN],

  // Release permissions
  'release:view:own': [ROLES.ARTIST, ROLES.LABEL_ADMIN, ROLES.COMPANY_ADMIN, ROLES.SUPER_ADMIN],
  'release:create': [ROLES.ARTIST, ROLES.LABEL_ADMIN, ROLES.COMPANY_ADMIN, ROLES.SUPER_ADMIN],
  'release:edit:own': [ROLES.ARTIST, ROLES.LABEL_ADMIN, ROLES.COMPANY_ADMIN, ROLES.SUPER_ADMIN],
  'release:delete:own': [ROLES.ARTIST, ROLES.LABEL_ADMIN, ROLES.COMPANY_ADMIN, ROLES.SUPER_ADMIN],
  'release:view:label': [ROLES.LABEL_ADMIN, ROLES.COMPANY_ADMIN, ROLES.SUPER_ADMIN],
  'release:edit:label': [ROLES.LABEL_ADMIN, ROLES.COMPANY_ADMIN, ROLES.SUPER_ADMIN],
  'release:delete:label': [ROLES.LABEL_ADMIN, ROLES.COMPANY_ADMIN, ROLES.SUPER_ADMIN],
  'release:view:any': [ROLES.COMPANY_ADMIN, ROLES.SUPER_ADMIN, ROLES.DISTRIBUTION_PARTNER],
  'release:edit:any': [ROLES.COMPANY_ADMIN, ROLES.SUPER_ADMIN],
  'release:delete:any': [ROLES.SUPER_ADMIN],
  'release:approve': [ROLES.COMPANY_ADMIN, ROLES.SUPER_ADMIN],
  'release:publish': [ROLES.COMPANY_ADMIN, ROLES.SUPER_ADMIN],

  // Analytics permissions
  'analytics:view:own': [ROLES.ARTIST, ROLES.LABEL_ADMIN, ROLES.COMPANY_ADMIN, ROLES.SUPER_ADMIN],
  'analytics:view:label': [ROLES.LABEL_ADMIN, ROLES.COMPANY_ADMIN, ROLES.SUPER_ADMIN],
  'analytics:view:any': [ROLES.COMPANY_ADMIN, ROLES.SUPER_ADMIN, ROLES.DISTRIBUTION_PARTNER],
  'analytics:edit:any': [ROLES.COMPANY_ADMIN, ROLES.SUPER_ADMIN],
  'analytics:export': [ROLES.ARTIST, ROLES.LABEL_ADMIN, ROLES.COMPANY_ADMIN, ROLES.SUPER_ADMIN],

  // Artist management permissions
  'artist:view:own': [ROLES.ARTIST, ROLES.LABEL_ADMIN, ROLES.COMPANY_ADMIN, ROLES.SUPER_ADMIN],
  'artist:view:label': [ROLES.LABEL_ADMIN, ROLES.COMPANY_ADMIN, ROLES.SUPER_ADMIN],
  'artist:view:any': [ROLES.COMPANY_ADMIN, ROLES.SUPER_ADMIN],
  'artist:invite': [ROLES.LABEL_ADMIN, ROLES.COMPANY_ADMIN, ROLES.SUPER_ADMIN],
  'artist:remove:label': [ROLES.LABEL_ADMIN, ROLES.COMPANY_ADMIN, ROLES.SUPER_ADMIN],
  'artist:manage:any': [ROLES.COMPANY_ADMIN, ROLES.SUPER_ADMIN],

  // Earnings/Revenue permissions
  'earnings:view:own': [ROLES.ARTIST, ROLES.LABEL_ADMIN, ROLES.COMPANY_ADMIN, ROLES.SUPER_ADMIN],
  'earnings:view:label': [ROLES.LABEL_ADMIN, ROLES.COMPANY_ADMIN, ROLES.SUPER_ADMIN],
  'earnings:view:any': [ROLES.COMPANY_ADMIN, ROLES.SUPER_ADMIN],
  'earnings:edit:any': [ROLES.COMPANY_ADMIN, ROLES.SUPER_ADMIN],
  'earnings:approve': [ROLES.COMPANY_ADMIN, ROLES.SUPER_ADMIN],

  // Wallet permissions
  'wallet:view:own': [ROLES.ARTIST, ROLES.LABEL_ADMIN, ROLES.COMPANY_ADMIN, ROLES.SUPER_ADMIN],
  'wallet:topup:own': [ROLES.ARTIST, ROLES.LABEL_ADMIN, ROLES.COMPANY_ADMIN, ROLES.SUPER_ADMIN],
  'wallet:withdraw:own': [ROLES.ARTIST, ROLES.LABEL_ADMIN, ROLES.COMPANY_ADMIN, ROLES.SUPER_ADMIN],
  'wallet:view:any': [ROLES.COMPANY_ADMIN, ROLES.SUPER_ADMIN],
  'wallet:topup:any': [ROLES.SUPER_ADMIN],
  'wallet:manage:any': [ROLES.SUPER_ADMIN],

  // Subscription permissions
  'subscription:view:own': [ROLES.ARTIST, ROLES.LABEL_ADMIN, ROLES.COMPANY_ADMIN, ROLES.SUPER_ADMIN],
  'subscription:manage:own': [ROLES.ARTIST, ROLES.LABEL_ADMIN, ROLES.COMPANY_ADMIN, ROLES.SUPER_ADMIN],
  'subscription:view:any': [ROLES.COMPANY_ADMIN, ROLES.SUPER_ADMIN],
  'subscription:manage:any': [ROLES.SUPER_ADMIN],

  // User management permissions
  'user:view:any': [ROLES.COMPANY_ADMIN, ROLES.SUPER_ADMIN],
  'user:create': [ROLES.SUPER_ADMIN],
  'user:edit:any': [ROLES.SUPER_ADMIN],
  'user:delete:any': [ROLES.SUPER_ADMIN],
  'user:impersonate': [ROLES.SUPER_ADMIN],

  // Notification permissions
  'notification:view:own': [ROLES.ARTIST, ROLES.LABEL_ADMIN, ROLES.COMPANY_ADMIN, ROLES.SUPER_ADMIN],
  'notification:manage:own': [ROLES.ARTIST, ROLES.LABEL_ADMIN, ROLES.COMPANY_ADMIN, ROLES.SUPER_ADMIN],
  'notification:send:label': [ROLES.LABEL_ADMIN, ROLES.COMPANY_ADMIN, ROLES.SUPER_ADMIN],
  'notification:send:any': [ROLES.COMPANY_ADMIN, ROLES.SUPER_ADMIN],

  // Label management permissions
  'label:view:own': [ROLES.LABEL_ADMIN, ROLES.COMPANY_ADMIN, ROLES.SUPER_ADMIN],
  'label:edit:own': [ROLES.LABEL_ADMIN, ROLES.COMPANY_ADMIN, ROLES.SUPER_ADMIN],
  'label:view:any': [ROLES.COMPANY_ADMIN, ROLES.SUPER_ADMIN],
  'label:edit:any': [ROLES.COMPANY_ADMIN, ROLES.SUPER_ADMIN],
  'label:create': [ROLES.COMPANY_ADMIN, ROLES.SUPER_ADMIN],
  'label:delete': [ROLES.SUPER_ADMIN],

  // Company management permissions
  'company:view': [ROLES.COMPANY_ADMIN, ROLES.SUPER_ADMIN],
  'company:edit': [ROLES.COMPANY_ADMIN, ROLES.SUPER_ADMIN],
  'company:settings': [ROLES.COMPANY_ADMIN, ROLES.SUPER_ADMIN],
  'company:delete': [ROLES.SUPER_ADMIN],

  // System administration permissions
  'system:settings': [ROLES.SUPER_ADMIN],
  'system:logs': [ROLES.SUPER_ADMIN],
  'system:reports': [ROLES.COMPANY_ADMIN, ROLES.SUPER_ADMIN],
  'system:analytics': [ROLES.COMPANY_ADMIN, ROLES.SUPER_ADMIN],

  // Content management permissions
  'content:view:own': [ROLES.ARTIST, ROLES.LABEL_ADMIN, ROLES.COMPANY_ADMIN, ROLES.SUPER_ADMIN, ROLES.DISTRIBUTION_PARTNER],
  'content:edit:own': [ROLES.ARTIST, ROLES.LABEL_ADMIN, ROLES.COMPANY_ADMIN, ROLES.SUPER_ADMIN],
  'content:view:any': [ROLES.COMPANY_ADMIN, ROLES.SUPER_ADMIN, ROLES.DISTRIBUTION_PARTNER],
  'content:manage:any': [ROLES.COMPANY_ADMIN, ROLES.SUPER_ADMIN, ROLES.DISTRIBUTION_PARTNER],

  // Upload permissions
  'upload:audio': [ROLES.ARTIST, ROLES.LABEL_ADMIN, ROLES.COMPANY_ADMIN, ROLES.SUPER_ADMIN],
  'upload:artwork': [ROLES.ARTIST, ROLES.LABEL_ADMIN, ROLES.COMPANY_ADMIN, ROLES.SUPER_ADMIN],
  'upload:profile_picture': [ROLES.ARTIST, ROLES.LABEL_ADMIN, ROLES.COMPANY_ADMIN, ROLES.SUPER_ADMIN, ROLES.DISTRIBUTION_PARTNER],

  // Change request permissions
  'change_request:create:own': [ROLES.ARTIST, ROLES.LABEL_ADMIN],
  'change_request:view:label': [ROLES.LABEL_ADMIN, ROLES.COMPANY_ADMIN, ROLES.SUPER_ADMIN],
  'change_request:view:any': [ROLES.COMPANY_ADMIN, ROLES.SUPER_ADMIN],
  'change_request:approve': [ROLES.COMPANY_ADMIN, ROLES.SUPER_ADMIN],
  'change_request:reject': [ROLES.COMPANY_ADMIN, ROLES.SUPER_ADMIN],
};

/**
 * Check if a role has a specific permission
 * @param {string} role - The role to check
 * @param {string} permission - The permission to verify
 * @returns {boolean} - True if the role has the permission
 */
export function hasPermission(role, permission) {
  const allowedRoles = PERMISSIONS[permission];
  return allowedRoles ? allowedRoles.includes(role) : false;
}

/**
 * Check if a role has any of the specified permissions
 * @param {string} role - The role to check
 * @param {string[]} permissions - Array of permissions to check
 * @returns {boolean} - True if the role has at least one permission
 */
export function hasAnyPermission(role, permissions) {
  return permissions.some(permission => hasPermission(role, permission));
}

/**
 * Check if a role has all of the specified permissions
 * @param {string} role - The role to check
 * @param {string[]} permissions - Array of permissions to check
 * @returns {boolean} - True if the role has all permissions
 */
export function hasAllPermissions(role, permissions) {
  return permissions.every(permission => hasPermission(role, permission));
}

/**
 * Get all permissions for a specific role
 * @param {string} role - The role to get permissions for
 * @returns {string[]} - Array of permission strings
 */
export function getRolePermissions(role) {
  return Object.keys(PERMISSIONS).filter(permission =>
    PERMISSIONS[permission].includes(role)
  );
}

/**
 * Role hierarchy for comparison (higher number = more permissions)
 */
export const ROLE_HIERARCHY = {
  [ROLES.ARTIST]: 1,
  [ROLES.LABEL_ADMIN]: 2,
  [ROLES.DISTRIBUTION_PARTNER]: 2,
  [ROLES.COMPANY_ADMIN]: 3,
  [ROLES.SUPER_ADMIN]: 4,
};

/**
 * Check if one role has higher privileges than another
 * @param {string} role1 - First role
 * @param {string} role2 - Second role
 * @returns {boolean} - True if role1 has higher privileges than role2
 */
export function isRoleHigher(role1, role2) {
  return (ROLE_HIERARCHY[role1] || 0) > (ROLE_HIERARCHY[role2] || 0);
}

/**
 * Get user-friendly role name
 * @param {string} role - The role identifier
 * @returns {string} - Formatted role name
 */
export function getRoleName(role) {
  const roleNames = {
    [ROLES.ARTIST]: 'Artist',
    [ROLES.LABEL_ADMIN]: 'Label Admin',
    [ROLES.COMPANY_ADMIN]: 'Company Admin',
    [ROLES.SUPER_ADMIN]: 'Super Admin',
    [ROLES.DISTRIBUTION_PARTNER]: 'Distribution Partner',
  };
  return roleNames[role] || role;
}
