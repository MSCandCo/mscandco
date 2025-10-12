// Custom Admin Dashboard - Permission-Based Access
import { useState, useEffect } from 'react';
import { useUser } from '@/components/providers/SupabaseProvider';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { 
  Shield, Settings, BarChart3, Users, DollarSign, FileText,
  TrendingUp, Eye, Edit3, CheckCircle, Clock, AlertTriangle
} from 'lucide-react';
import MainLayout from '@/components/layouts/mainLayout';
import SEO from '@/components/seo';
import { getUserRole } from '@/lib/user-utils';

export default function CustomAdminDashboard() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [permissionsByCategory, setPermissionsByCategory] = useState({});
  const [accessiblePages, setAccessiblePages] = useState({});

  useEffect(() => {
    if (!isLoading && user) {
      const role = getUserRole(user);
      if (role !== 'custom_admin') {
        router.push('/dashboard');
        return;
      }
      loadCustomAdminData();
      setLoading(false);
    } else if (!isLoading && !user) {
      router.push('/login');
    }
  }, [isLoading, user, router]);

  const loadCustomAdminData = async () => {
    try {
      console.log('🔐 Loading custom admin permissions...');

      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const response = await fetch('/api/auth/check-permissions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const result = await response.json();

      if (result.success) {
        setUserProfile(result.user);
        setPermissions(result.permissions);
        setPermissionsByCategory(result.permissionsByCategory);
        setAccessiblePages(result.accessiblePages);
        
        console.log('✅ Custom admin data loaded:', {
          title: result.user.customAdminTitle,
          permissionCount: result.permissions.length,
          categories: Object.keys(result.permissionsByCategory)
        });
      } else {
        console.error('Failed to load permissions:', result.error);
      }
    } catch (error) {
      console.error('Error loading custom admin data:', error);
    }
  };

  if (loading || !userProfile) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
            <p className="text-slate-600 text-lg">Loading your custom admin permissions...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Generate dashboard cards based on permissions
  const getDashboardCards = () => {
    const cards = [];

    // Analytics Management
    if (permissionsByCategory.analytics?.length > 0) {
      cards.push({
        title: 'Analytics Management',
        description: 'Manage artist analytics and performance data',
        icon: BarChart3,
        color: 'blue',
        href: '/companyadmin/analytics-management',
        permissions: permissionsByCategory.analytics.map(p => p.permission_definitions.permission_name)
      });
    }

    // User Management
    if (permissionsByCategory.user_management?.length > 0) {
      cards.push({
        title: 'User Management',
        description: 'Manage platform users and profiles',
        icon: Users,
        color: 'green',
        href: '/companyadmin/users',
        permissions: permissionsByCategory.user_management.map(p => p.permission_definitions.permission_name)
      });
    }

    // Earnings Management
    if (permissionsByCategory.earnings?.length > 0) {
      cards.push({
        title: 'Earnings Management',
        description: 'Manage artist earnings and financial data',
        icon: DollarSign,
        color: 'emerald',
        href: '/companyadmin/earnings-management',
        permissions: permissionsByCategory.earnings.map(p => p.permission_definitions.permission_name)
      });
    }

    // Request Management
    if (permissionsByCategory.requests?.length > 0) {
      cards.push({
        title: 'Request Management',
        description: 'Monitor and manage platform requests',
        icon: FileText,
        color: 'orange',
        href: '/companyadmin/requests',
        permissions: permissionsByCategory.requests.map(p => p.permission_definitions.permission_name)
      });
    }

    // Release Management
    if (permissionsByCategory.releases?.length > 0) {
      cards.push({
        title: 'Release Management',
        description: 'Manage releases and distribution',
        icon: TrendingUp,
        color: 'purple',
        href: '/companyadmin/releases',
        permissions: permissionsByCategory.releases.map(p => p.permission_definitions.permission_name)
      });
    }

    // Financial Management
    if (permissionsByCategory.finance?.length > 0) {
      cards.push({
        title: 'Financial Management',
        description: 'Manage platform finances and revenue',
        icon: DollarSign,
        color: 'indigo',
        href: '/companyadmin/finance',
        permissions: permissionsByCategory.finance.map(p => p.permission_definitions.permission_name)
      });
    }

    return cards;
  };

  const dashboardCards = getDashboardCards();

  return (
    <MainLayout>
      <SEO 
        title={`${userProfile.customAdminTitle} Dashboard`}
        description="Custom admin dashboard with permission-based access"
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 text-white mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center mb-2">
                <Shield className="w-8 h-8 mr-3" />
                <h1 className="text-3xl font-bold">{userProfile.customAdminTitle || 'Custom Admin'}</h1>
              </div>
              <p className="text-purple-100 text-lg">
                Welcome {userProfile.displayName} - You have {permissions.length} active permissions
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-purple-100">Permission Categories</div>
              <div className="text-2xl font-bold">{Object.keys(permissionsByCategory).length}</div>
              <div className="text-xs text-purple-200">Areas of access</div>
            </div>
          </div>
        </div>

        {/* Permission Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {Object.entries(permissionsByCategory).map(([category, perms]) => (
            <div key={category} className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Settings className="w-6 h-6 text-purple-600" />
                </div>
                <p className="text-2xl font-bold text-slate-900">{perms.length}</p>
                <p className="text-sm text-slate-600 capitalize">{category.replace('_', ' ')}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Available Functions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Your Available Functions</h2>
          
          {dashboardCards.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-12 text-center">
              <AlertTriangle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No Permissions Assigned</h3>
              <p className="text-slate-600 mb-6">
                Contact your Super Admin to assign permissions to your custom admin account.
              </p>
              <div className="text-sm text-slate-500">
                Custom Admin Title: {userProfile.customAdminTitle || 'Not Set'}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dashboardCards.map((card, index) => (
                <Link key={index} href={card.href}>
                  <div className={`bg-white rounded-xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-all cursor-pointer hover:-translate-y-1`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center bg-${card.color}-100`}>
                        <card.icon className={`w-6 h-6 text-${card.color}-600`} />
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-slate-500">Access Level</div>
                        <div className="text-sm font-medium text-green-600">Full</div>
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">{card.title}</h3>
                    <p className="text-slate-600 text-sm mb-4">{card.description}</p>
                    <div className="space-y-1">
                      {card.permissions.slice(0, 3).map((perm, i) => (
                        <div key={i} className="flex items-center text-xs text-slate-500">
                          <CheckCircle className="w-3 h-3 text-green-500 mr-1" />
                          {perm}
                        </div>
                      ))}
                      {card.permissions.length > 3 && (
                        <div className="text-xs text-slate-400">
                          +{card.permissions.length - 3} more permissions
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Detailed Permissions */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900">Your Permissions ({permissions.length})</h3>
            <p className="text-sm text-slate-600">Detailed breakdown of your access rights</p>
          </div>

          {permissions.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 text-lg">No permissions assigned</p>
              <p className="text-slate-400 text-sm">Contact your administrator to assign permissions</p>
            </div>
          ) : (
            <div className="p-6">
              {Object.entries(permissionsByCategory).map(([category, perms]) => (
                <div key={category} className="mb-6 last:mb-0">
                  <h4 className="text-md font-semibold text-slate-900 mb-3 capitalize">
                    {category.replace('_', ' ')} ({perms.length})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {perms.map((perm) => (
                      <div key={perm.permission_key} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-slate-900">
                              {perm.permission_definitions.permission_name}
                            </div>
                            <div className="text-xs text-slate-500">
                              {perm.permission_definitions.description}
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-slate-400">
                          {perm.expires_at ? (
                            `Expires ${new Date(perm.expires_at).toLocaleDateString()}`
                          ) : (
                            'Permanent'
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
