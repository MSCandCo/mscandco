/**
 * SINGLE SOURCE OF TRUTH FOR ROLE CONFIGURATION
 * 
 * This file defines which roles use which header and their characteristics.
 * Import this file anywhere you need to check role-based behavior.
 */

/**
 * Platform Admin Roles - Use AdminHeader
 * These users manage the platform itself
 */
export const PLATFORM_ADMIN_ROLES = [
  'super_admin',
  'company_admin',
  'analytics_admin',
  'distribution_partner',
  'requests_admin'
];

/**
 * Content Creator Roles - Use Standard Header
 * These users create and manage content (their own or their label's)
 */
export const CONTENT_CREATOR_ROLES = [
  'artist',
  'label_admin',   // Manages multiple artists, but NOT a platform admin (with underscore)
  'labeladmin'     // Same as label_admin but without underscore (database variation)
];

/**
 * Check if a role is a platform admin
 * @param {string} role - The user's role
 * @returns {boolean}
 */
export function isPlatformAdmin(role) {
  return PLATFORM_ADMIN_ROLES.includes(role);
}

/**
 * Check if a role is a content creator
 * @param {string} role - The user's role
 * @returns {boolean}
 */
export function isContentCreator(role) {
  return CONTENT_CREATOR_ROLES.includes(role);
}

/**
 * Get the appropriate header type for a role
 * @param {string} role - The user's role
 * @returns {'admin' | 'standard' | null}
 */
export function getHeaderType(role) {
  if (!role) return null;
  if (isPlatformAdmin(role)) return 'admin';
  if (isContentCreator(role)) return 'standard';
  return null;
}

/**
 * All valid roles in the system
 */
export const ALL_ROLES = [
  ...PLATFORM_ADMIN_ROLES,
  ...CONTENT_CREATOR_ROLES
];

/**
 * Role display names
 */
export const ROLE_DISPLAY_NAMES = {
  'super_admin': 'Super Admin',
  'company_admin': 'Company Admin',
  'analytics_admin': 'Analytics Admin',
  'distribution_partner': 'Distribution Partner',
  'requests_admin': 'Request Manager',
  'artist': 'Artist',
  'label_admin': 'Label Admin',
  'labeladmin': 'Label Admin'  // Same as label_admin, no underscore
};

/**
 * Get display name for a role
 * @param {string} role - The user's role
 * @returns {string}
 */
export function getRoleDisplayName(role) {
  return ROLE_DISPLAY_NAMES[role] || role
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

