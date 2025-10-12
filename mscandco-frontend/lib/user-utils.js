import { supabase } from './supabase';

/**
 * Get user role synchronously from user object
 * @param {Object} user - The user object from Supabase auth
 * @returns {string} - The user's role (artist, label_admin, company_admin, super_admin, etc.)
 */
export function getUserRoleSync(user) {
  if (!user) return null;
  
  // Check user metadata first (most reliable source)
  if (user.user_metadata?.role) {
    return user.user_metadata.role;
  }
  
  // Check app_metadata (set by admin)
  if (user.app_metadata?.role) {
    return user.app_metadata.role;
  }
  
  // Fallback to 'artist' as default role
  return 'artist';
}

/**
 * Get user role asynchronously (with database fallback)
 * @param {Object} user - The user object from Supabase auth
 * @returns {Promise<string>} - The user's role
 */
export async function getUserRole(user) {
  if (!user) return null;
  
  // Try sync method first
  const syncRole = getUserRoleSync(user);
  if (syncRole) return syncRole;
  
  // Fallback to database query
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();
    
    if (error) {
      console.error('Error fetching user role:', error);
      return 'artist'; // Default fallback
    }
    
    return data?.role || 'artist';
  } catch (err) {
    console.error('Error in getUserRole:', err);
    return 'artist';
  }
}

/**
 * Get the default display brand based on user's role
 * @param {Object} user - The user object
 * @returns {string} - Brand name to display
 */
export function getDefaultDisplayBrand(user) {
  const role = getUserRoleSync(user);
  
  // Super admins and company admins see 'MSC & Co'
  if (role === 'super_admin' || role === 'company_admin') {
    return 'MSC & Co';
  }
  
  // Label admins see their label name or 'MSC & Co' as fallback
  if (role === 'label_admin') {
    return getUserBrand(user) || 'MSC & Co';
  }
  
  // Artists see 'MSC & Co'
  return 'MSC & Co';
}

/**
 * Get user's custom brand name from their profile
 * @param {Object} user - The user object
 * @returns {string|null} - Brand name or null
 */
export function getUserBrand(user) {
  if (!user) return null;
  
  // Check metadata for label name
  if (user.user_metadata?.label_name) {
    return user.user_metadata.label_name;
  }
  
  if (user.app_metadata?.label_name) {
    return user.app_metadata.label_name;
  }
  
  // Check for display name as fallback
  if (user.user_metadata?.display_name) {
    return user.user_metadata.display_name;
  }
  
  return null;
}

/**
 * Check if user has a specific role
 * @param {Object} user - The user object
 * @param {string} role - Role to check against
 * @returns {boolean}
 */
export function userHasRole(user, role) {
  return getUserRoleSync(user) === role;
}

/**
 * Check if user is an admin (any admin type)
 * @param {Object} user - The user object
 * @returns {boolean}
 */
export function isUserAdmin(user) {
  const role = getUserRoleSync(user);
  return ['super_admin', 'company_admin', 'label_admin'].includes(role);
}

/**
 * Format user's full name from metadata
 * @param {Object} user - The user object
 * @returns {string} - Full name or email as fallback
 */
export function getUserFullName(user) {
  if (!user) return 'User';
  
  // Check for full name in metadata
  if (user.user_metadata?.full_name) {
    return user.user_metadata.full_name;
  }
  
  // Try first_name + last_name
  const firstName = user.user_metadata?.first_name || '';
  const lastName = user.user_metadata?.last_name || '';
  if (firstName || lastName) {
    return `${firstName} ${lastName}`.trim();
  }
  
  // Fallback to email (before @)
  return user.email?.split('@')[0] || 'User';
}


