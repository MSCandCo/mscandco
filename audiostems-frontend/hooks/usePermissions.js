/**
 * usePermissions Hook
 * Provides permission checking functionality for React components
 * Integrates with RBAC system and Supabase authentication
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import {
  hasPermission as checkPermission,
  hasAnyPermission as checkAnyPermission,
  hasAllPermissions as checkAllPermissions,
  ROLES
} from '@/lib/rbac/roles';

/**
 * Hook to manage user permissions in React components
 *
 * @returns {Object} Permission checking functions and state
 * @property {Function} hasPermission - Check if user has a specific permission
 * @property {Function} hasAnyPermission - Check if user has any of the provided permissions
 * @property {Function} hasAllPermissions - Check if user has all of the provided permissions
 * @property {string|null} role - Current user's role
 * @property {boolean} isLoading - Whether role is being fetched
 * @property {Error|null} error - Error object if role fetch failed
 * @property {Function} refetch - Manually refetch the user's role
 *
 * @example
 * const { hasPermission, role, isLoading } = usePermissions();
 *
 * if (isLoading) return <Spinner />;
 *
 * return (
 *   <>
 *     {hasPermission('release:create') && <CreateReleaseButton />}
 *     {hasAnyPermission(['release:edit:own', 'release:edit:label']) && <EditButton />}
 *   </>
 * );
 */
export function usePermissions() {
  const [role, setRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Fetch user's role from Supabase
   */
  const fetchUserRole = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        throw sessionError;
      }

      if (!session?.user) {
        // No authenticated user
        setRole(null);
        setIsLoading(false);
        return;
      }

      const user = session.user;

      // Try to get role from user metadata first (faster)
      if (user.user_metadata?.role) {
        setRole(user.user_metadata.role);
        setIsLoading(false);
        return;
      }

      // Fallback: Fetch from database
      const { data: roleData, error: roleError } = await supabase
        .from('user_role_assignments')
        .select('role_name')
        .eq('user_id', user.id)
        .single();

      if (roleError) {
        // If no role assignment found, default to artist
        if (roleError.code === 'PGRST116') {
          console.warn('No role assignment found, defaulting to artist');
          setRole(ROLES.ARTIST);
        } else {
          throw roleError;
        }
      } else {
        setRole(roleData?.role_name || ROLES.ARTIST);
      }
    } catch (err) {
      console.error('Error fetching user role:', err);
      setError(err);
      setRole(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Initialize role fetch and set up auth state listener
   */
  useEffect(() => {
    let isMounted = true;

    // Initial fetch
    fetchUserRole();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;

        // Only refetch on relevant events
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
          await fetchUserRole();
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [fetchUserRole]);

  /**
   * Check if current user has a specific permission
   * @param {string} permission - Permission string to check
   * @returns {boolean} - True if user has the permission
   */
  const hasPermission = useCallback((permission) => {
    if (!role) return false;
    return checkPermission(role, permission);
  }, [role]);

  /**
   * Check if current user has any of the specified permissions
   * @param {string[]} permissions - Array of permission strings
   * @returns {boolean} - True if user has at least one permission
   */
  const hasAnyPermission = useCallback((permissions) => {
    if (!role) return false;
    return checkAnyPermission(role, permissions);
  }, [role]);

  /**
   * Check if current user has all of the specified permissions
   * @param {string[]} permissions - Array of permission strings
   * @returns {boolean} - True if user has all permissions
   */
  const hasAllPermissions = useCallback((permissions) => {
    if (!role) return false;
    return checkAllPermissions(role, permissions);
  }, [role]);

  /**
   * Check if user has a specific role
   * @param {string|string[]} requiredRole - Role or array of roles to check
   * @returns {boolean} - True if user has the role
   */
  const hasRole = useCallback((requiredRole) => {
    if (!role) return false;

    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(role);
    }

    return role === requiredRole;
  }, [role]);

  /**
   * Check if user is authenticated
   * @returns {boolean} - True if user has a role (is authenticated)
   */
  const isAuthenticated = useCallback(() => {
    return role !== null;
  }, [role]);

  return {
    // Permission checking functions
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    isAuthenticated,

    // State
    role,
    isLoading,
    error,

    // Manual refetch
    refetch: fetchUserRole,
  };
}

/**
 * Hook variant that throws if not authenticated
 * Useful for pages that require authentication
 *
 * @throws {Error} If user is not authenticated
 * @returns {Object} Same as usePermissions but guarantees role is not null
 *
 * @example
 * const { hasPermission, role } = useRequireAuth();
 * // role is guaranteed to be non-null here
 */
export function useRequireAuth() {
  const permissions = usePermissions();

  useEffect(() => {
    if (!permissions.isLoading && !permissions.role) {
      // Redirect to login or show error
      console.error('Authentication required but user is not authenticated');

      // You can customize this behavior
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  }, [permissions.isLoading, permissions.role]);

  return permissions;
}

/**
 * Simple hook to just get the current user's role
 * Lighter weight if you only need the role
 *
 * @returns {Object} Role and loading state
 * @property {string|null} role - Current user's role
 * @property {boolean} isLoading - Whether role is being fetched
 *
 * @example
 * const { role, isLoading } = useUserRole();
 */
export function useUserRole() {
  const [role, setRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchRole() {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!isMounted) return;

        if (!session?.user) {
          setRole(null);
          setIsLoading(false);
          return;
        }

        const user = session.user;

        // Try user metadata first
        if (user.user_metadata?.role) {
          setRole(user.user_metadata.role);
          setIsLoading(false);
          return;
        }

        // Fetch from database
        const { data: roleData } = await supabase
          .from('user_role_assignments')
          .select('role_name')
          .eq('user_id', user.id)
          .single();

        if (isMounted) {
          setRole(roleData?.role_name || ROLES.ARTIST);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Error fetching role:', err);
        if (isMounted) {
          setRole(null);
          setIsLoading(false);
        }
      }
    }

    fetchRole();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      if (isMounted) {
        fetchRole();
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { role, isLoading };
}

export default usePermissions;
