/**
 * RBAC Middleware for Next.js API Routes
 * Provides permission and role-based access control for API endpoints
 */

import { createClient } from '@supabase/supabase-js';
import { hasPermission, hasAnyPermission, ROLES } from './roles';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Get authenticated user and their role from request
 * @param {Object} req - Next.js request object
 * @returns {Promise<Object>} - { user, role, error }
 */
async function getUserAndRole(req) {
  try {
    // Extract auth token
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return { user: null, role: null, error: 'No authorization token provided' };
    }

    // Verify user with Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return { user: null, role: null, error: authError?.message || 'Invalid token' };
    }

    // Use email-based role detection (same as other APIs)
    const userEmail = user.email?.toLowerCase() || '';
    let userRole = user.user_metadata?.role || user.app_metadata?.role;
    
    // Email-based role detection for known users
    if (!userRole) {
      if (userEmail === 'superadmin@mscandco.com') {
        userRole = 'super_admin';
      } else if (userEmail === 'companyadmin@mscandco.com') {
        userRole = 'company_admin';
      } else if (userEmail === 'labeladmin@mscandco.com') {
        userRole = 'label_admin';
      } else if (userEmail === 'codegroup@mscandco.com') {
        userRole = 'distribution_partner';
      } else if (userEmail.includes('codegroup') || userEmail.includes('code-group')) {
        userRole = 'distribution_partner';
      } else if (userEmail.includes('super') || userEmail.includes('superadmin')) {
        userRole = 'super_admin';
      } else if (userEmail.includes('companyadmin') || userEmail.includes('admin@')) {
        userRole = 'company_admin';
      } else {
        userRole = 'artist'; // default
      }
    }

    if (!userRole) {
      return { user, role: null, error: 'User role not found' };
    }

    return { user, role: userRole, error: null };
  } catch (error) {
    console.error('Auth exception:', error);
    return { user: null, role: null, error: 'Authentication failed' };
  }
}

/**
 * Log failed permission check for audit purposes
 * @param {Object} details - Audit log details
 */
async function logPermissionDenied(details) {
  const { userId, userEmail, role, permission, ip, path } = details;

  try {
    await supabase.from('audit_logs').insert({
      event_type: 'permission_denied',
      user_id: userId,
      user_email: userEmail,
      user_role: role,
      details: {
        permission,
        path,
        ip,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    // Log to console if database logging fails
    console.error('Failed to log permission denial:', error);
    console.warn('Permission denied:', details);
  }
}

/**
 * Middleware to require specific permission(s) for API route access
 * Supports single permission string or array of permissions (OR logic)
 *
 * @param {string|string[]} requiredPermissions - Permission(s) required to access route
 * @param {Object} options - Additional options
 * @param {boolean} options.requireAll - If true, require ALL permissions (AND logic). Default: false (OR logic)
 * @returns {Function} - Middleware function
 *
 * @example
 * // Single permission
 * export default requirePermission('release:create')(handler);
 *
 * @example
 * // Multiple permissions (OR logic - user needs ANY of these)
 * export default requirePermission(['release:edit:own', 'release:edit:label'])(handler);
 *
 * @example
 * // Multiple permissions (AND logic - user needs ALL of these)
 * export default requirePermission(['release:view:any', 'analytics:view:any'], { requireAll: true })(handler);
 */
export function requirePermission(requiredPermissions, options = {}) {
  const { requireAll = false } = options;

  return function middleware(handler) {
    return async function wrappedHandler(req, res) {
      try {
        // Get user and role
        const { user, role, error } = await getUserAndRole(req);

        if (error || !user) {
          return res.status(401).json({
            error: 'Unauthorized',
            message: error || 'Authentication required'
          });
        }

        if (!role) {
          return res.status(403).json({
            error: 'Forbidden',
            message: 'User role not assigned'
          });
        }

        // Normalize permissions to array
        const permissions = Array.isArray(requiredPermissions)
          ? requiredPermissions
          : [requiredPermissions];

        // Check permissions based on logic type
        let hasAccess = false;

        if (requireAll) {
          // AND logic - must have all permissions
          hasAccess = permissions.every(permission => hasPermission(role, permission));
        } else {
          // OR logic - must have at least one permission
          hasAccess = hasAnyPermission(role, permissions);
        }

        if (!hasAccess) {
          // Log failed permission check
          await logPermissionDenied({
            userId: user.id,
            userEmail: user.email,
            role,
            permission: permissions.join(requireAll ? ' AND ' : ' OR '),
            ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
            path: req.url
          });

          return res.status(403).json({
            error: 'Forbidden',
            message: 'Insufficient permissions to access this resource',
            required_permissions: permissions,
            user_role: role
          });
        }

        // Attach user and role to request for handler use
        req.user = user;
        req.userRole = role;

        // Call the actual handler
        return handler(req, res);
      } catch (error) {
        console.error('Permission middleware error:', error);
        return res.status(500).json({
          error: 'Internal Server Error',
          message: 'An error occurred while checking permissions'
        });
      }
    };
  };
}

/**
 * Middleware to require specific role(s) for API route access
 * Supports single role string or array of roles (OR logic)
 *
 * @param {string|string[]} requiredRoles - Role(s) required to access route
 * @returns {Function} - Middleware function
 *
 * @example
 * // Single role
 * export default requireRole('super_admin')(handler);
 *
 * @example
 * // Multiple roles (user needs to have ANY of these roles)
 * export default requireRole(['company_admin', 'super_admin'])(handler);
 */
export function requireRole(requiredRoles) {
  return function middleware(handler) {
    return async function wrappedHandler(req, res) {
      try {
        // Get user and role
        const { user, role, error } = await getUserAndRole(req);

        if (error || !user) {
          return res.status(401).json({
            error: 'Unauthorized',
            message: error || 'Authentication required'
          });
        }

        if (!role) {
          return res.status(403).json({
            error: 'Forbidden',
            message: 'User role not assigned'
          });
        }

        // Normalize roles to array
        const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];

        // Check if user has required role
        if (!roles.includes(role)) {
          // Log failed role check
          await logPermissionDenied({
            userId: user.id,
            userEmail: user.email,
            role,
            permission: `role:${roles.join('|')}`,
            ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
            path: req.url
          });

          return res.status(403).json({
            error: 'Forbidden',
            message: 'Insufficient role to access this resource',
            required_roles: roles,
            user_role: role
          });
        }

        // Attach user and role to request for handler use
        req.user = user;
        req.userRole = role;

        // Call the actual handler
        return handler(req, res);
      } catch (error) {
        console.error('Role middleware error:', error);
        return res.status(500).json({
          error: 'Internal Server Error',
          message: 'An error occurred while checking role'
        });
      }
    };
  };
}

/**
 * Middleware to require authentication but no specific permission
 * Useful for routes that need authenticated user but have custom permission logic
 *
 * @returns {Function} - Middleware function
 *
 * @example
 * export default requireAuth(async (req, res) => {
 *   // req.user and req.userRole are available
 *   // Custom permission logic here
 * });
 */
export function requireAuth(handler) {
  return async function wrappedHandler(req, res) {
    try {
      // Get user and role
      const { user, role, error } = await getUserAndRole(req);

      if (error || !user) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: error || 'Authentication required'
        });
      }

      // Attach user and role to request for handler use
      req.user = user;
      req.userRole = role;

      // Call the actual handler
      return handler(req, res);
    } catch (error) {
      console.error('Auth middleware error:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'An error occurred during authentication'
      });
    }
  };
}

/**
 * Helper function to check if user owns a resource
 * Common pattern for checking "own" permissions
 *
 * @param {string} userId - The authenticated user's ID
 * @param {string} resourceOwnerId - The owner ID of the resource
 * @returns {boolean} - True if user owns the resource
 *
 * @example
 * if (!isOwner(req.user.id, release.user_id)) {
 *   return res.status(403).json({ error: 'Not authorized to edit this release' });
 * }
 */
export function isOwner(userId, resourceOwnerId) {
  return userId === resourceOwnerId;
}

/**
 * Export getUserAndRole for use in custom permission logic
 */
export { getUserAndRole };
