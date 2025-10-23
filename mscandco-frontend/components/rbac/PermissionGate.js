'use client'

/**
 * PermissionGate Component
 * Conditionally renders children based on user permissions
 */

import { usePermissions } from '@/hooks/usePermissions';

/**
 * Renders children only if user has required permission(s)
 *
 * @param {Object} props
 * @param {string|string[]} props.permission - Required permission(s)
 * @param {React.ReactNode} props.children - Content to render if permission granted
 * @param {React.ReactNode} props.fallback - Optional content to render if permission denied
 * @param {'any'|'all'} props.mode - For multiple permissions: 'any' (OR) or 'all' (AND). Default: 'any'
 * @param {boolean} props.hideLoading - If true, don't render loading state. Default: false
 *
 * @example
 * // Single permission
 * <PermissionGate permission="release:create">
 *   <CreateButton />
 * </PermissionGate>
 *
 * @example
 * // Multiple permissions (OR logic - needs ANY)
 * <PermissionGate permission={['release:edit:own', 'release:edit:label']}>
 *   <EditButton />
 * </PermissionGate>
 *
 * @example
 * // Multiple permissions (AND logic - needs ALL)
 * <PermissionGate permission={['release:view:any', 'analytics:view:any']} mode="all">
 *   <AdminDashboard />
 * </PermissionGate>
 *
 * @example
 * // With fallback content
 * <PermissionGate
 *   permission="subscription:manage:own"
 *   fallback={<UpgradePrompt />}
 * >
 *   <PremiumFeature />
 * </PermissionGate>
 */
export function PermissionGate({
  permission,
  children,
  fallback = null,
  mode = 'any',
  hideLoading = false
}) {
  const { hasPermission, hasAnyPermission, hasAllPermissions, isLoading } = usePermissions();

  // Show loading state
  if (isLoading && !hideLoading) {
    return null; // or return a loading spinner
  }

  // Check permission based on type and mode
  let hasAccess = false;

  if (Array.isArray(permission)) {
    if (mode === 'all') {
      hasAccess = hasAllPermissions(permission);
    } else {
      hasAccess = hasAnyPermission(permission);
    }
  } else {
    hasAccess = hasPermission(permission);
  }

  // Render children if has access, otherwise fallback
  return hasAccess ? children : fallback;
}

/**
 * Renders children only if user has required role(s)
 *
 * @param {Object} props
 * @param {string|string[]} props.role - Required role(s)
 * @param {React.ReactNode} props.children - Content to render if role matches
 * @param {React.ReactNode} props.fallback - Optional content to render if role doesn't match
 * @param {boolean} props.hideLoading - If true, don't render loading state. Default: false
 *
 * @example
 * // Single role
 * <RoleGate role="super_admin">
 *   <AdminPanel />
 * </RoleGate>
 *
 * @example
 * // Multiple roles (user needs ANY of these)
 * <RoleGate role={['company_admin', 'super_admin']}>
 *   <CompanySettings />
 * </RoleGate>
 */
export function RoleGate({
  role,
  children,
  fallback = null,
  hideLoading = false
}) {
  const { hasRole, isLoading } = usePermissions();

  // Show loading state
  if (isLoading && !hideLoading) {
    return null;
  }

  // Check if user has required role
  const hasAccess = hasRole(role);

  return hasAccess ? children : fallback;
}

/**
 * Inverse of PermissionGate - renders children only if user LACKS permission
 * Useful for showing upgrade prompts, locked features, etc.
 *
 * @param {Object} props
 * @param {string|string[]} props.permission - Permission(s) to check
 * @param {React.ReactNode} props.children - Content to render if permission NOT granted
 * @param {'any'|'all'} props.mode - For multiple permissions. Default: 'any'
 *
 * @example
 * // Show upgrade prompt if user can't create releases
 * <WithoutPermission permission="release:create">
 *   <UpgradeToCreateReleases />
 * </WithoutPermission>
 */
export function WithoutPermission({
  permission,
  children,
  mode = 'any'
}) {
  const { hasPermission, hasAnyPermission, hasAllPermissions, isLoading } = usePermissions();

  if (isLoading) {
    return null;
  }

  // Check permission (inverse logic)
  let hasAccess = false;

  if (Array.isArray(permission)) {
    if (mode === 'all') {
      hasAccess = hasAllPermissions(permission);
    } else {
      hasAccess = hasAnyPermission(permission);
    }
  } else {
    hasAccess = hasPermission(permission);
  }

  // Render children only if user LACKS permission
  return !hasAccess ? children : null;
}

/**
 * Higher-order component to wrap a component with permission checking
 *
 * @param {React.Component} Component - Component to wrap
 * @param {string|string[]} permission - Required permission(s)
 * @param {Object} options - Additional options
 * @returns {React.Component} - Wrapped component
 *
 * @example
 * const ProtectedButton = withPermission(CreateButton, 'release:create');
 *
 * @example
 * const AdminPanel = withPermission(
 *   AdminPanelComponent,
 *   ['user:view:any', 'user:edit:any'],
 *   { mode: 'all', fallback: <AccessDenied /> }
 * );
 */
export function withPermission(Component, permission, options = {}) {
  const { mode = 'any', fallback = null } = options;

  return function PermissionWrappedComponent(props) {
    return (
      <PermissionGate permission={permission} mode={mode} fallback={fallback}>
        <Component {...props} />
      </PermissionGate>
    );
  };
}

/**
 * Higher-order component to wrap a component with role checking
 *
 * @param {React.Component} Component - Component to wrap
 * @param {string|string[]} role - Required role(s)
 * @param {Object} options - Additional options
 * @returns {React.Component} - Wrapped component
 *
 * @example
 * const SuperAdminPanel = withRole(AdminPanel, 'super_admin');
 *
 * @example
 * const CompanyDashboard = withRole(
 *   Dashboard,
 *   ['company_admin', 'super_admin'],
 *   { fallback: <AccessDenied /> }
 * );
 */
export function withRole(Component, role, options = {}) {
  const { fallback = null } = options;

  return function RoleWrappedComponent(props) {
    return (
      <RoleGate role={role} fallback={fallback}>
        <Component {...props} />
      </RoleGate>
    );
  };
}

export default PermissionGate;
