'use client'

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/components/providers/SupabaseProvider';
import { supabase } from '@/lib/supabase';
import { Loader2, AlertCircle, Shield } from 'lucide-react';

const RoleBasedRouter = ({ children, allowedRoles = [], requiredPermissions = [], fallbackPath = '/dashboard' }) => {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const [userProfile, setUserProfile] = useState(null);
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);
  const [accessDeniedReason, setAccessDeniedReason] = useState('');

  useEffect(() => {
    checkUserAccess();
  }, [user, isLoading, router.pathname]);

  const checkUserAccess = async () => {
    if (isLoading) return;

    if (!user) {
      router.push('/login');
      return;
    }

    try {
      // Get comprehensive user profile with hierarchical relationships
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select(`
          *,
          labelAdmin:user_profiles!label_admin_id(id, first_name, last_name, display_name, role),
          companyAdmin:user_profiles!company_admin_id(id, first_name, last_name, display_name, role),
          defaultLabelAdmin:user_profiles!default_label_admin_id(id, first_name, last_name, display_name, role)
        `)
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        setAccessDeniedReason('Unable to verify user permissions');
        setIsCheckingAccess(false);
        return;
      }

      setUserProfile(profile);

      // Check role-based access
      if (allowedRoles.length > 0 && !allowedRoles.includes(profile.role)) {
        setAccessDeniedReason(`Access denied. Required roles: ${allowedRoles.join(', ')}. Your role: ${profile.role}`);
        setTimeout(() => router.push(fallbackPath), 2000);
        setIsCheckingAccess(false);
        return;
      }

      // Check hierarchical permissions
      const hasHierarchicalAccess = checkHierarchicalAccess(profile, router.pathname);
      if (!hasHierarchicalAccess.allowed) {
        setAccessDeniedReason(hasHierarchicalAccess.reason);
        setTimeout(() => router.push(fallbackPath), 2000);
        setIsCheckingAccess(false);
        return;
      }

      // Check specific permissions
      if (requiredPermissions.length > 0) {
        const userPermissions = profile.permissions || [];
        const hasRequiredPermissions = requiredPermissions.every(permission => 
          userPermissions.includes(permission)
        );

        if (!hasRequiredPermissions) {
          setAccessDeniedReason(`Missing required permissions: ${requiredPermissions.join(', ')}`);
          setTimeout(() => router.push(fallbackPath), 2000);
          setIsCheckingAccess(false);
          return;
        }
      }

      setIsCheckingAccess(false);
    } catch (error) {
      console.error('Error checking user access:', error);
      setAccessDeniedReason('Error verifying access permissions');
      setIsCheckingAccess(false);
    }
  };

  const checkHierarchicalAccess = (profile, pathname) => {
    // Define hierarchical access rules
    const hierarchyRules = {
      // Artist can only access their own content
      artist: {
        allowedPaths: [
          '/artist/*',
          '/dashboard',
          '/releases/create',
          '/profile',
          '/wallet',
          '/settings/*'
        ],
        restrictions: {
          // Artists can only see their own releases, not others
          '/admin/*': 'Admin access required',
          '/labeladmin/*': 'Label admin access required',
          '/companyadmin/*': 'Company admin access required',
          '/distributionpartner/*': 'Distribution partner access required'
        }
      },
      
      // Label Admin can access assigned artists + their own content
      label_admin: {
        allowedPaths: [
          '/artist/*',
          '/labeladmin/*',
          '/dashboard',
          '/releases/create',
          '/profile',
          '/wallet',
          '/settings/*'
        ],
        restrictions: {
          '/admin/*': 'Admin access required',
          '/companyadmin/*': 'Company admin access required',
          '/distributionpartner/*': 'Distribution partner access required'
        },
        hierarchicalAccess: (profile, path) => {
          // Label admin can access artists under their label
          if (path.startsWith('/artist/') && profile.role === 'label_admin') {
            // Additional check would be needed to verify the artist belongs to this label
            return { allowed: true };
          }
          return { allowed: true };
        }
      },
      
      // Company Admin can access all artists and label admins under their company
      company_admin: {
        allowedPaths: [
          '/artist/*',
          '/labeladmin/*',
          '/companyadmin/*',
          '/dashboard',
          '/releases/create',
          '/profile',
          '/wallet',
          '/settings/*',
          '/reports/*',
          '/analytics/*'
        ],
        restrictions: {
          '/distributionpartner/*': 'Distribution partner access required',
          '/superadmin/*': 'Super admin access required'
        },
        hierarchicalAccess: (profile, path) => {
          // Company admin can access all content under their company
          return { allowed: true };
        }
      },
      
      // Distribution Partner can access all releases and workflow management
      distribution_partner: {
        allowedPaths: [
          '/artist/*',
          '/labeladmin/*',
          '/companyadmin/*',
          '/distributionpartner/*',
          '/dashboard',
          '/releases/*',
          '/workflow/*',
          '/profile',
          '/wallet',
          '/settings/*',
          '/reports/*',
          '/analytics/*'
        ],
        restrictions: {
          '/superadmin/*': 'Super admin access required'
        },
        hierarchicalAccess: (profile, path) => {
          // Distribution partner has broad access to manage releases
          return { allowed: true };
        }
      },
      
      // Super Admin has access to everything
      super_admin: {
        allowedPaths: ['/*'],
        restrictions: {},
        hierarchicalAccess: () => ({ allowed: true })
      }
    };

    const userRole = profile.role;
    const rules = hierarchyRules[userRole];

    if (!rules) {
      return { allowed: false, reason: `Unknown role: ${userRole}` };
    }

    // Check if path is explicitly restricted
    for (const [restrictedPath, reason] of Object.entries(rules.restrictions)) {
      if (pathname.startsWith(restrictedPath.replace('*', ''))) {
        return { allowed: false, reason };
      }
    }

    // Check if path is in allowed paths
    const isAllowed = rules.allowedPaths.some(allowedPath => {
      if (allowedPath === '/*') return true;
      if (allowedPath.endsWith('*')) {
        return pathname.startsWith(allowedPath.replace('*', ''));
      }
      return pathname === allowedPath;
    });

    if (!isAllowed) {
      return { allowed: false, reason: `Path not allowed for role: ${userRole}` };
    }

    // Check hierarchical access if function exists
    if (rules.hierarchicalAccess) {
      return rules.hierarchicalAccess(profile, pathname);
    }

    return { allowed: true };
  };

  // Show loading state
  if (isLoading || isCheckingAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Verifying Access</h2>
          <p className="text-gray-600">Checking your permissions...</p>
        </div>
      </div>
    );
  }

  // Show access denied
  if (accessDeniedReason) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto">
          <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">{accessDeniedReason}</p>
          <div className="space-y-3">
            <button
              onClick={() => router.push(fallbackPath)}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Return to Dashboard
            </button>
            <button
              onClick={() => router.back()}
              className="w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Go Back
            </button>
          </div>
          <div className="mt-6 text-sm text-gray-500">
            <p>If you believe this is an error, please contact support.</p>
            {userProfile && (
              <p className="mt-1">Your role: <span className="font-medium">{userProfile.role}</span></p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Show authorized content
  return (
    <div>
      {children}
      
      {/* Role indicator for debugging/admin use */}
      {userProfile && process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 bg-gray-800 text-white px-3 py-2 rounded-lg text-xs opacity-75 hover:opacity-100 transition-opacity">
          <div className="flex items-center space-x-2">
            <Shield className="h-3 w-3" />
            <span>Role: {userProfile.role}</span>
          </div>
        </div>
      )}
    </div>
  );
};

// Convenience components for specific roles
export const ArtistRoute = ({ children, fallbackPath = '/dashboard' }) => (
  <RoleBasedRouter allowedRoles={['artist']} fallbackPath={fallbackPath}>
    {children}
  </RoleBasedRouter>
);

export const LabelAdminRoute = ({ children, fallbackPath = '/dashboard' }) => (
  <RoleBasedRouter allowedRoles={['label_admin']} fallbackPath={fallbackPath}>
    {children}
  </RoleBasedRouter>
);

export const CompanyAdminRoute = ({ children, fallbackPath = '/dashboard' }) => (
  <RoleBasedRouter allowedRoles={['company_admin']} fallbackPath={fallbackPath}>
    {children}
  </RoleBasedRouter>
);

export const DistributionPartnerRoute = ({ children, fallbackPath = '/dashboard' }) => (
  <RoleBasedRouter allowedRoles={['distribution_partner']} fallbackPath={fallbackPath}>
    {children}
  </RoleBasedRouter>
);

export const SuperAdminRoute = ({ children, fallbackPath = '/dashboard' }) => (
  <RoleBasedRouter allowedRoles={['super_admin']} fallbackPath={fallbackPath}>
    {children}
  </RoleBasedRouter>
);

export const AdminRoute = ({ children, fallbackPath = '/dashboard' }) => (
  <RoleBasedRouter allowedRoles={['company_admin', 'super_admin']} fallbackPath={fallbackPath}>
    {children}
  </RoleBasedRouter>
);

export const ManagementRoute = ({ children, fallbackPath = '/dashboard' }) => (
  <RoleBasedRouter allowedRoles={['label_admin', 'company_admin', 'super_admin']} fallbackPath={fallbackPath}>
    {children}
  </RoleBasedRouter>
);

export default RoleBasedRouter;
