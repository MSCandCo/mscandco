import React, { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useRouter } from 'next/router';
import { Button, Alert } from 'flowbite-react';
import { HiShieldExclamation, HiLogin } from 'react-icons/hi';
import { getUserRole, canAccessRoute, ROLES } from '@/lib/role-config';

export default function RoleProtectedRoute({ 
  children, 
  requiredRoles = [], 
  requiredPermissions = [],
  fallbackComponent = null,
  redirectTo = '/dashboard'
}) {
  const { isAuthenticated, isLoading, user, loginWithRedirect } = useAuth0();
  const router = useRouter();
  const [accessGranted, setAccessGranted] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      checkAccess();
    }
  }, [isLoading, isAuthenticated, user]);

  const checkAccess = () => {
    if (!isAuthenticated) {
      setAccessGranted(false);
      setChecking(false);
      return;
    }

    const userRole = getUserRole(user);
    
    // Check role-based access
    let hasRoleAccess = true;
    if (requiredRoles.length > 0) {
      hasRoleAccess = requiredRoles.includes(userRole.id);
    }

    // Check permission-based access
    let hasPermissionAccess = true;
    if (requiredPermissions.length > 0) {
      hasPermissionAccess = requiredPermissions.every(permission => 
        userRole.permissions.includes(permission)
      );
    }

    // Check route-based access
    const hasRouteAccess = canAccessRoute(user, router.pathname);

    const granted = hasRoleAccess && hasPermissionAccess && hasRouteAccess;
    setAccessGranted(granted);
    setChecking(false);

    // Redirect if access denied
    if (!granted && !checking) {
      router.push(redirectTo);
    }
  };

  if (isLoading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <HiLogin className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Authentication Required
            </h2>
            <p className="text-gray-600 mb-6">
              Please log in to access this page.
            </p>
            <Button
              color="blue"
              className="w-full"
              onClick={() => loginWithRedirect()}
            >
              Sign In
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!accessGranted) {
    const userRole = getUserRole(user);
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <HiShieldExclamation className="mx-auto h-12 w-12 text-red-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Access Denied
            </h2>
            <p className="text-gray-600 mb-4">
              You don't have permission to access this page.
            </p>
            
            <Alert color="warning" className="mb-4">
              <div>
                <div className="font-medium">Current Role: {userRole.displayName}</div>
                <div className="text-sm text-gray-600 mt-1">
                  Required: {requiredRoles.length > 0 ? requiredRoles.join(', ') : 'Any authenticated user'}
                </div>
              </div>
            </Alert>

            <div className="space-y-2">
              <Button
                color="blue"
                className="w-full"
                onClick={() => router.push('/dashboard')}
              >
                Go to Dashboard
              </Button>
              <Button
                color="gray"
                className="w-full"
                onClick={() => router.push('/')}
              >
                Go to Home
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// Higher-order component for role-based protection
export function withRoleProtection(Component, options = {}) {
  return function ProtectedComponent(props) {
    return (
      <RoleProtectedRoute {...options}>
        <Component {...props} />
      </RoleProtectedRoute>
    );
  };
}

// Hook for checking permissions in components
export function useRolePermissions() {
  const { user, isAuthenticated } = useAuth0();
  
  const hasPermission = (permission) => {
    if (!isAuthenticated || !user) return false;
    const userRole = getUserRole(user);
    return userRole.permissions.includes(permission);
  };

  const hasRole = (roleId) => {
    if (!isAuthenticated || !user) return false;
    const userRole = getUserRole(user);
    return userRole.id === roleId;
  };

  const getUserRoleInfo = () => {
    if (!isAuthenticated || !user) return null;
    return getUserRole(user);
  };

  return {
    hasPermission,
    hasRole,
    getUserRoleInfo,
    isAuthenticated,
    user
  };
} 