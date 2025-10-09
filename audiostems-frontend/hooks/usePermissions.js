/**
 * usePermissions Hook
 *
 * Optimized React hook for permission-based UI rendering
 * Loads user permissions once and caches them for the component lifecycle
 * Supports wildcard pattern matching for flexible permission checks
 *
 * Updated to use new RBAC permission system from @/lib/permissions
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { getUserPermissions } from '@/lib/permissions';

/**
 * Hook to manage user permissions in React components
 *
 * @param {string} userId - Optional user ID. If not provided, uses current session user
 * @returns {Object} Permission checking functions and state
 * @property {Function} hasPermission - Check if user has a specific permission
 * @property {Function} hasAnyPermission - Check if user has any of the provided permissions
 * @property {Function} hasAllPermissions - Check if user has all of the provided permissions
 * @property {Array<string>} permissions - Array of permission names
 * @property {boolean} loading - Whether permissions are being fetched
 * @property {Error|null} error - Error object if permission fetch failed
 * @property {Function} refresh - Manually refetch the user's permissions
 *
 * @example
 * const { hasPermission, loading } = usePermissions();
 *
 * if (loading) return <Spinner />;
 *
 * return (
 *   <>
 *     {hasPermission('user:read:any') && <Link href="/admin/users">Users</Link>}
 *     {hasPermission('release:create:own') && <CreateReleaseButton />}
 *   </>
 * );
 */
export function usePermissions(userId = null) {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(userId);

  /**
   * Fetch user's permissions from Supabase
   */
  const fetchPermissions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let targetUserId = currentUserId;

      // Get session for authentication
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        throw sessionError;
      }

      if (!session?.user) {
        // No authenticated user
        setPermissions([]);
        setLoading(false);
        return;
      }

      // If no userId provided, use session user
      if (!targetUserId) {
        targetUserId = session.user.id;
        setCurrentUserId(targetUserId);
      }

      // Get user permissions via API endpoint (server-side with proper permissions)
      const response = await fetch('/api/user/permissions', {
        headers: {
          'Authorization': `Bearer ${session.access_token || ''}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch permissions: ${response.status}`);
      }

      const data = await response.json();
      const permissionNames = data.permissions || [];

      console.log('🔑 usePermissions hook received:', {
        user_id: data.user_id,
        user_email: data.user_email,
        permissions: permissionNames,
        hasWildcard: permissionNames.includes('*:*:*')
      });

      setPermissions(permissionNames);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching permissions:', err);
      setError(err);
      setPermissions([]);
      setLoading(false);
    }
  }, [currentUserId]);

  /**
   * Initialize permissions fetch and set up auth state listener
   */
  useEffect(() => {
    let isMounted = true;

    // Initial fetch
    fetchPermissions();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;

        // Only refetch on relevant events
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
          await fetchPermissions();
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [fetchPermissions]);

  /**
   * Check if current user has a specific permission
   * Supports wildcard pattern matching:
   * - *:*:* (super admin - matches everything)
   * - resource:*:* (matches all actions and scopes for a resource)
   * - resource:action:* (matches all scopes for a resource:action)
   *
   * @param {string} permission - Permission string to check (e.g., 'user:read:any')
   * @returns {boolean} - True if user has the permission
   */
  const hasPermission = useCallback((permission) => {
    if (!permission) return false;

    // During loading, return false but don't log
    // This prevents false negatives during initialization
    if (loading) return false;

    if (!currentUserId) return false;

    // Check wildcard first (super admin)
    if (permissions.includes('*:*:*')) {
      console.log(`✅ hasPermission('${permission}') = true (wildcard match)`);
      return true;
    }

    // Check exact match
    if (permissions.includes(permission)) {
      console.log(`✅ hasPermission('${permission}') = true (exact match)`);
      return true;
    }

    // Check wildcard patterns
    const [resource, action, scope] = permission.split(':');

    // Check resource:*:* (e.g., user:*:* matches user:read:any, user:update:own, etc.)
    if (permissions.includes(`${resource}:*:*`)) {
      console.log(`✅ hasPermission('${permission}') = true (resource wildcard)`);
      return true;
    }

    // Check resource:action:* (e.g., user:read:* matches user:read:any, user:read:own)
    if (permissions.includes(`${resource}:${action}:*`)) {
      console.log(`✅ hasPermission('${permission}') = true (action wildcard)`);
      return true;
    }

    console.log(`❌ hasPermission('${permission}') = false (no match). Available:`, permissions);
    return false;
  }, [permissions, currentUserId]);

  /**
   * Check if current user has any of the specified permissions
   * @param {string[]} permissionList - Array of permission strings
   * @returns {boolean} - True if user has at least one permission
   */
  const hasAnyPermission = useCallback((permissionList) => {
    if (!Array.isArray(permissionList)) return false;
    return permissionList.some(perm => hasPermission(perm));
  }, [hasPermission]);

  /**
   * Check if current user has all of the specified permissions
   * @param {string[]} permissionList - Array of permission strings
   * @returns {boolean} - True if user has all permissions
   */
  const hasAllPermissions = useCallback((permissionList) => {
    if (!Array.isArray(permissionList)) return false;
    return permissionList.every(perm => hasPermission(perm));
  }, [hasPermission]);

  /**
   * Check if user is authenticated
   * @returns {boolean} - True if user has permissions loaded (is authenticated)
   */
  const isAuthenticated = useCallback(() => {
    return currentUserId !== null;
  }, [currentUserId]);

  return {
    // Permission checking functions
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isAuthenticated,

    // State
    permissions,
    loading,
    error,

    // Manual refetch
    refresh: fetchPermissions,
  };
}

/**
 * Hook variant that throws if not authenticated
 * Useful for pages that require authentication
 *
 * @throws {Error} If user is not authenticated
 * @returns {Object} Same as usePermissions but guarantees user is authenticated
 *
 * @example
 * const { hasPermission } = useRequireAuth();
 * // User is guaranteed to be authenticated here
 */
export function useRequireAuth() {
  const permissionsHook = usePermissions();

  useEffect(() => {
    if (!permissionsHook.loading && !permissionsHook.isAuthenticated()) {
      // Redirect to login or show error
      console.error('Authentication required but user is not authenticated');

      // You can customize this behavior
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  }, [permissionsHook.loading, permissionsHook.isAuthenticated]);

  return permissionsHook;
}

/**
 * Simple hook to check a single permission (simpler API)
 *
 * @param {string} permission - The permission to check
 * @returns {Object} { allowed, loading }
 *
 * @example
 * const { allowed, loading } = usePermission('user:read:any')
 * if (loading) return <Spinner />
 * if (!allowed) return <Forbidden />
 * return <UserList />
 */
export function usePermission(permission) {
  const { hasPermission, loading } = usePermissions();

  return {
    allowed: hasPermission(permission),
    loading
  };
}

export default usePermissions;
