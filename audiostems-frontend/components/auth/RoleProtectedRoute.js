import { useUser } from '@/components/providers/SupabaseProvider';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { getUserRole } from '@/lib/user-utils';

export default function RoleProtectedRoute({ 
  children, 
  allowedRoles = [], 
  fallback = null,
  redirectTo = '/dashboard'
}) {
  const { user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user && user) {
      const userRole = getUserRole(user);
      
      // If no specific roles are required, allow access
      if (allowedRoles.length === 0) {
        return;
      }
      
      // Check if user has required role
      if (!allowedRoles.includes(userRole)) {
        console.warn(`Access denied: User role "${userRole}" not in allowed roles:`, allowedRoles);
        router.push(redirectTo);
      }
    }
  }, [user, isLoading, user, allowedRoles, router, redirectTo]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show fallback if not authenticated
  if (!user) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-4">Please log in to access this page.</p>
          <button 
            onClick={() => router.push('/login')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  // Check role access
  if (allowedRoles.length > 0) {
    const userRole = getUserRole(user);
    
    if (!allowedRoles.includes(userRole)) {
      return fallback || (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
            <p className="text-gray-600 mb-4">
              You don't have permission to access this page. 
              Required roles: {allowedRoles.join(', ')}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Your role: {userRole}
            </p>
            <button 
              onClick={() => router.push(redirectTo)}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      );
    }
  }

  // Render children if access is granted
  return children;
}

// Role constants for easy use
export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  COMPANY_ADMIN: 'company_admin',
  ARTIST: 'artist',
  DISTRIBUTION_PARTNER: 'distribution_partner',
  DISTRIBUTOR: 'distributor'
};

// Pre-configured route protectors
export const SuperAdminRoute = ({ children, fallback }) => (
  <RoleProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN]} fallback={fallback}>
    {children}
  </RoleProtectedRoute>
);

export const AdminRoute = ({ children, fallback }) => (
  <RoleProtectedRoute 
    allowedRoles={[ROLES.SUPER_ADMIN, ROLES.COMPANY_ADMIN]} 
    fallback={fallback}
  >
    {children}
  </RoleProtectedRoute>
);

export const ArtistRoute = ({ children, fallback }) => (
  <RoleProtectedRoute allowedRoles={[ROLES.ARTIST]} fallback={fallback}>
    {children}
  </RoleProtectedRoute>
);

export const PartnerRoute = ({ children, fallback }) => (
  <RoleProtectedRoute 
    allowedRoles={[ROLES.DISTRIBUTION_PARTNER, ROLES.DISTRIBUTOR]} 
    fallback={fallback}
  >
    {children}
  </RoleProtectedRoute>
); 