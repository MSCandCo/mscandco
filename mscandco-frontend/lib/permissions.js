/**
 * Permission utilities for user permission management
 * Works with the RBAC system to fetch and manage user permissions
 */

import { createClient } from '@supabase/supabase-js';

/**
 * Get user permissions from database
 * @param {string} userId - The user ID to get permissions for
 * @param {boolean} useServiceRole - Whether to use service role key (for server-side)
 * @returns {Promise<Array>} - Array of permission objects with permission_name
 */
export async function getUserPermissions(userId, useServiceRole = false) {
  try {
    // Create Supabase client with appropriate key
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      useServiceRole ? process.env.SUPABASE_SERVICE_ROLE_KEY : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // First, get the user's profile to find their role
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      return [];
    }

    if (!profile?.role) {
      console.warn('User has no role assigned:', userId);
      return [];
    }

    // Get the role ID
    const { data: roleData, error: roleError } = await supabase
      .from('roles')
      .select('id')
      .eq('name', profile.role)
      .single();

    if (roleError || !roleData) {
      console.error('Error fetching role:', roleError);
      return [];
    }

    // Get role-based permissions
    const { data: rolePermissions, error: rolePermError } = await supabase
      .from('role_permissions')
      .select(`
        permissions (
          name,
          description
        )
      `)
      .eq('role_id', roleData.id);

    if (rolePermError) {
      console.error('Error fetching role permissions:', rolePermError);
      return [];
    }

    // Get user-specific permissions (both granted and denied)
    const { data: userPermissions, error: userPermError } = await supabase
      .from('user_permissions')
      .select(`
        denied,
        permissions (
          name,
          description
        )
      `)
      .eq('user_id', userId);

    if (userPermError) {
      console.error('Error fetching user permissions:', userPermError);
    }

    // Separate denied permissions from granted user permissions
    const deniedPermissionNames = (userPermissions || [])
      .filter(up => up.denied === true)
      .map(up => up.permissions.name);

    const grantedUserPermissions = (userPermissions || [])
      .filter(up => up.denied === false)
      .map(up => ({
        permission_name: up.permissions.name,
        description: up.permissions.description
      }));

    // Combine role permissions with granted user permissions
    const allPermissions = [
      ...(rolePermissions?.map(rp => ({
        permission_name: rp.permissions.name,
        description: rp.permissions.description
      })) || []),
      ...grantedUserPermissions
    ];

    // Remove duplicates based on permission_name
    let uniquePermissions = allPermissions.reduce((acc, curr) => {
      if (!acc.find(p => p.permission_name === curr.permission_name)) {
        acc.push(curr);
      }
      return acc;
    }, []);

    // Filter out explicitly denied permissions
    uniquePermissions = uniquePermissions.filter(p =>
      !deniedPermissionNames.includes(p.permission_name)
    );

    console.log(`✅ getUserPermissions: Found ${uniquePermissions.length} permissions for user ${userId}`);
    console.log(`📋 getUserPermissions: Permissions list:`, uniquePermissions.map(p => p.permission_name).join(', '));

    return uniquePermissions;

  } catch (error) {
    console.error('Error in getUserPermissions:', error);
    return [];
  }
}

/**
 * Check if a user has a specific permission
 * Supports wildcard matching
 * @param {string} userId - The user ID
 * @param {string} permission - The permission to check (e.g., 'user:read:any')
 * @param {boolean} useServiceRole - Whether to use service role key
 * @returns {Promise<boolean>}
 */
export async function userHasPermission(userId, permission, useServiceRole = false) {
  const permissions = await getUserPermissions(userId, useServiceRole);
  const permissionNames = permissions.map(p => p.permission_name);

  // Check for wildcard super admin permission
  if (permissionNames.includes('*:*:*')) {
    return true;
  }

  // Check exact match
  if (permissionNames.includes(permission)) {
    return true;
  }

  // Check wildcard patterns
  const [resource, action, scope] = permission.split(':');

  // Check resource:*:*
  if (permissionNames.includes(`${resource}:*:*`)) {
    return true;
  }

  // Check resource:action:*
  if (permissionNames.includes(`${resource}:${action}:*`)) {
    return true;
  }

  return false;
}

/**
 * Check if user has any of the specified permissions
 * @param {string} userId - The user ID
 * @param {string[]} permissionList - Array of permissions to check
 * @param {boolean} useServiceRole - Whether to use service role key
 * @returns {Promise<boolean>}
 */
export async function userHasAnyPermission(userId, permissionList, useServiceRole = false) {
  for (const permission of permissionList) {
    if (await userHasPermission(userId, permission, useServiceRole)) {
      return true;
    }
  }
  return false;
}

/**
 * Check if user has all of the specified permissions
 * @param {string} userId - The user ID
 * @param {string[]} permissionList - Array of permissions to check
 * @param {boolean} useServiceRole - Whether to use service role key
 * @returns {Promise<boolean>}
 */
export async function userHasAllPermissions(userId, permissionList, useServiceRole = false) {
  for (const permission of permissionList) {
    if (!(await userHasPermission(userId, permission, useServiceRole))) {
      return false;
    }
  }
  return true;
}

/**
 * Create a Supabase client with service role key for server-side operations
 * This is used for API routes that need elevated permissions
 */
export const supabaseService = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

/**
 * Middleware function to require a specific permission for an API route
 * Usage: const authorized = await requirePermission(req, res, 'permission:action:scope');
 * @param {object} req - Next.js request object
 * @param {object} res - Next.js response object
 * @param {string} permission - The permission to check
 * @returns {Promise<boolean>} - True if authorized, false if not (and sends 403 response)
 */
export async function requirePermission(req, res, permission) {
  try {
    // Get user from session cookie
    const cookies = req.cookies;
    const accessToken = cookies['sb-access-token'] || cookies['sb-localhost-auth-token'];

    if (!accessToken) {
      console.log('❌ requirePermission: No access token found');
      res.status(401).json({ error: 'Unauthorized - No access token' });
      return false;
    }

    // Get user from token
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      console.log('❌ requirePermission: Invalid token or user not found');
      res.status(401).json({ error: 'Unauthorized - Invalid token' });
      return false;
    }

    // Check if user has the required permission
    const hasPermission = await userHasPermission(user.id, permission, true);

    if (!hasPermission) {
      console.log(`❌ requirePermission: User ${user.id} does not have permission: ${permission}`);
      res.status(403).json({
        error: 'Forbidden - Insufficient permissions',
        required: permission
      });
      return false;
    }

    console.log(`✅ requirePermission: User ${user.id} has permission: ${permission}`);
    return true;

  } catch (error) {
    console.error('Error in requirePermission:', error);
    res.status(500).json({ error: 'Internal server error' });
    return false;
  }
}
