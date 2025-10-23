/**
 * usePermissions Hook
 *
 * Optimized React hook for permission-based UI rendering
 * Loads user permissions once and caches them for the component lifecycle
 * Supports wildcard pattern matching for flexible permission checks
 *
 * Updated to use new RBAC permission system from @/lib/permissions
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useUser } from '@/components/providers/SupabaseProvider';
import { getUserPermissions } from '@/lib/permissions';

// In-memory cache for permissions (shared across all hook instances)
const permissionsCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

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
  const { user: contextUser, session: contextSession, supabase } = useUser();
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(userId);

  /**
   * Fetch user's permissions from Supabase with caching
   */
  const fetchPermissions = useCallback(async (forceRefresh = false) => {
    // Wait for supabase client to be available
    if (!supabase) {
      console.log('🔑 usePermissions: Waiting for supabase client...');
      return;
    }

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

      // Check cache first (unless force refresh)
      if (!forceRefresh) {
        const cached = permissionsCache.get(targetUserId);
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
          console.log('🔑 usePermissions: Using cached permissions for', targetUserId);
          setPermissions(cached.permissions);
          setLoading(false);
          return;
        }
      }

      // Get user permissions via API endpoint (server-side with proper permissions)
      console.log('🔑 usePermissions: Fetching permissions from API...');
      console.log('🔑 Session available?', !!session);
      console.log('🔑 Access token available?', !!session?.access_token);
      console.log('🔑 Access token length:', session?.access_token?.length || 0);
      
      const response = await fetch('/api/user/permissions', {
        headers: {
          'Authorization': `Bearer ${session.access_token || ''}`
        }
      });

      console.log('🔑 API Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('🔑 API Error response:', errorText);
        throw new Error(`Failed to fetch permissions: ${response.status}`);
      }

      const data = await response.json();
      console.log('🔑 API Response data:', data);
      console.log('🔑 API Response data.permissions:', data.permissions);
      console.log('🔑 API Response data.permissions type:', typeof data.permissions);
      console.log('🔑 API Response data.permissions isArray?', Array.isArray(data.permissions));
      const permissionNames = data.permissions || [];
      console.log('🔑 Extracted permissionNames:', permissionNames);
      console.log('🔑 permissionNames length:', permissionNames.length);

      console.log('🔑 usePermissions hook received:', {
        user_id: data.user_id,
        user_email: data.user_email,
        permissions: permissionNames,
        hasWildcard: permissionNames.includes('*:*:*')
      });

      // Cache the permissions
      permissionsCache.set(targetUserId, {
        permissions: permissionNames,
        timestamp: Date.now()
      });

      setPermissions(permissionNames);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching permissions:', err);
      setError(err);
      setPermissions([]);
      setLoading(false);
    }
  }, [currentUserId, supabase]);

  /**
   * Initialize permissions fetch and set up auth state listener
   */
  useEffect(() => {
    if (!supabase) return;

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

    // Listen for custom permission refresh events (force refresh when triggered)
    const handlePermissionRefresh = () => {
      if (isMounted) {
        console.log('🔄 Permission refresh event received, refetching...');
        fetchPermissions(true); // Force refresh, bypass cache
      }
    };

    // Listen for both window events and visibility changes
    if (typeof window !== 'undefined') {
      window.addEventListener('permissionsChanged', handlePermissionRefresh);
      // Don't refetch on visibility change - use cache instead
    }

    return () => {
      isMounted = false;
      subscription.unsubscribe();
      if (typeof window !== 'undefined') {
        window.removeEventListener('permissionsChanged', handlePermissionRefresh);
      }
    };
  }, [fetchPermissions, supabase]);

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

    if (!currentUserId && !contextUser) return false;

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
  }, [permissions, currentUserId, contextUser, loading]);

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
