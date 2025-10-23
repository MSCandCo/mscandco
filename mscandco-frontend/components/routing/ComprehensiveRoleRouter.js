'use client'

// Comprehensive Role Router - Handles All 6 Roles + Permissions
import { useUser } from '@/components/providers/SupabaseProvider';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getUserRoleSync } from '@/lib/user-utils';
import { getUserPermissions, canAccessPage } from '@/lib/permissions-utils';

export default function ComprehensiveRoleRouter({ children, requiredPermissions = [], fallbackPath = '/dashboard' }) {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [userPermissions, setUserPermissions] = useState([]);
  const [accessDenied, setAccessDenied] = useState(false);
  const [denialReason, setDenialReason] = useState('');

  useEffect(() => {
    checkAccess();
  }, [user, router.pathname]);

  const checkAccess = async () => {
    if (isLoading) return;

    if (!user) {
      router.push('/login');
      return;
    }

    try {
      const userRole = getUserRoleSync(user);
      console.log('🔐 Checking access:', { 
        userRole, 
        path: router.pathname, 
        requiredPermissions 
      });

      // Load user permissions for custom admins and permission checks
      const permissions = await getUserPermissions(user.id);
      setUserPermissions(permissions);

      // Check if user can access this page
      if (requiredPermissions.length > 0) {
        const hasRequiredPermissions = requiredPermissions.some(permission =>
          permissions.some(perm => perm.permission_key === permission)
        );

        // Super admin always has access
        if (userRole !== 'super_admin' && !hasRequiredPermissions) {
          setAccessDenied(true);
          setDenialReason(`Access denied. Required permissions: ${requiredPermissions.join(', ')}`);
          setTimeout(() => router.push(fallbackPath), 3000);
          setChecking(false);
          return;
        }
      }

      // Role-based page access (for pages without specific permission requirements)
      const hasPageAccess = canAccessPage(permissions, userRole, router.pathname);
      if (!hasPageAccess) {
        setAccessDenied(true);
        setDenialReason(`Access denied. Your role (${userRole}) cannot access this page.`);
        setTimeout(() => router.push(fallbackPath), 3000);
        setChecking(false);
        return;
      }

      setAccessDenied(false);
      setChecking(false);

    } catch (error) {
      console.error('Access check error:', error);
      setAccessDenied(true);
      setDenialReason('Error checking permissions. Please try again.');
      setChecking(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Checking permissions...</p>
        </div>
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto text-center">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Access Denied</h2>
            <p className="text-slate-600 mb-6">{denialReason}</p>
            <div className="text-sm text-slate-500">
              Redirecting to dashboard in a few seconds...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
