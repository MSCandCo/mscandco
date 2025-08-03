import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useRouter } from 'next/router';
import { 
  Users, Search, Eye, LogIn, AlertTriangle, Shield,
  User, Mail, Calendar, Activity, Filter
} from 'lucide-react';
import MainLayout from '@/components/layouts/mainLayout';
import SEO from '@/components/seo';
import { getUserRole } from '../../lib/auth0-config';
import { ARTISTS } from '../../lib/mockData';

export default function GhostLogin() {
  const { user, isLoading, isAuthenticated } = useAuth0();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isGhostLoginActive, setIsGhostLoginActive] = useState(false);

  // Mock user database - in production this would come from your user management system
  const allUsers = [
    // Artists from our centralized data
    ...ARTISTS.map(artist => ({
      id: artist.id,
      name: artist.name,
      email: `${artist.name.toLowerCase().replace(/\s+/g, '.')}@artist.com`,
      role: 'artist',
      status: artist.status,
      lastLogin: '2024-01-15T10:30:00Z',
      avatar: null
    })),
    // Label Admins
    {
      id: 'label_admin_1',
      name: 'Label Admin User',
      email: 'label.admin.yhwh@mscandco.com',
      role: 'label_admin',
      status: 'active',
      lastLogin: '2024-01-15T09:15:00Z',
      avatar: null
    },
    // Distribution Partners
    {
      id: 'dist_partner_1',
      name: 'Distribution Partner',
      email: 'dist.partner@codegroup.com',
      role: 'distribution_partner',
      status: 'active',
      lastLogin: '2024-01-15T11:45:00Z',
      avatar: null
    },
    // Company Admins
    {
      id: 'company_admin_1',
      name: 'Company Admin User',
      email: 'company.admin@mscandco.com',
      role: 'company_admin',
      status: 'active',
      lastLogin: '2024-01-15T08:30:00Z',
      avatar: null
    }
  ];

  // Check super admin access
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      const role = getUserRole(user);
      if (role !== 'super_admin') {
        router.push('/dashboard');
        return;
      }
      setLoading(false);
    }
  }, [isAuthenticated, isLoading, user, router]);

  // Filter users based on search and role
  const filteredUsers = allUsers.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Role badge colors
  const getRoleBadgeColor = (role) => {
    const colors = {
      artist: 'bg-blue-100 text-blue-800',
      label_admin: 'bg-purple-100 text-purple-800',
      distribution_partner: 'bg-green-100 text-green-800',
      company_admin: 'bg-yellow-100 text-yellow-800',
      super_admin: 'bg-red-100 text-red-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  // Handle ghost login
  const handleGhostLogin = (targetUser) => {
    setSelectedUser(targetUser);
    
    // In production, this would make an API call to your backend to:
    // 1. Verify super admin permissions
    // 2. Create a temporary session for the target user
    // 3. Log the action for audit purposes
    // 4. Redirect to the target user's dashboard
    
    console.log('Ghost login initiated for:', targetUser);
    
    // Simulate API call
    setTimeout(() => {
      setIsGhostLoginActive(true);
      
      // Redirect to the user's appropriate dashboard
      const dashboardRoutes = {
        artist: '/dashboard',
        label_admin: '/dashboard',
        distribution_partner: '/dashboard',
        company_admin: '/company-admin/dashboard'
      };
      
      const targetRoute = dashboardRoutes[targetUser.role] || '/dashboard';
      
      // In production, you'd set session tokens here
      router.push(`${targetRoute}?ghost_session=${targetUser.id}`);
    }, 1000);
  };

  // Loading state
  if (isLoading || loading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading ghost login interface...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <SEO 
        title="Super Admin - Ghost Login"
        description="Super admin ghost login feature for platform oversight"
      />
      
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 to-pink-600 rounded-2xl p-8 text-white mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Ghost Login</h1>
                <p className="text-red-100 text-lg">
                  Super Admin feature - Log in as any user for support and oversight
                </p>
              </div>
              <Shield className="w-12 h-12 text-red-200" />
            </div>
          </div>

          {/* Warning Banner */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-600 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Security Notice</h3>
                <p className="text-sm text-red-700 mt-1">
                  Ghost login actions are logged for audit purposes. Use this feature responsibly and only for legitimate support or oversight purposes.
                </p>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Search Users</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name or email..."
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Role</label>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                >
                  <option value="all">All Roles</option>
                  <option value="artist">Artists</option>
                  <option value="label_admin">Label Admins</option>
                  <option value="distribution_partner">Distribution Partners</option>
                  <option value="company_admin">Company Admins</option>
                </select>
              </div>
            </div>
          </div>

          {/* Users List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Platform Users ({filteredUsers.length})</h3>
            </div>
            
            <div className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <div key={user.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gradient-to-r from-gray-400 to-gray-600 rounded-full flex items-center justify-center text-white font-bold">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      
                      <div className="ml-4">
                        <h4 className="text-lg font-semibold text-gray-900">{user.name}</h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Mail className="w-4 h-4 mr-1" />
                            {user.email}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            Last login: {new Date(user.lastLogin).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex items-center mt-2 space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                            {user.role.replace('_', ' ').toUpperCase()}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {user.status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <button
                        className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Profile
                      </button>
                      
                      <button
                        onClick={() => handleGhostLogin(user)}
                        disabled={user.status !== 'active'}
                        className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        <LogIn className="w-4 h-4 mr-2" />
                        Ghost Login
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredUsers.length === 0 && (
                <div className="p-12 text-center">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                  <p className="text-gray-500">
                    Try adjusting your search terms or filters to find the user you're looking for.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Ghost Login Modal */}
          {selectedUser && isGhostLoginActive && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Initiating Ghost Login</h3>
                  <p className="text-gray-600">
                    Logging in as {selectedUser.name}...
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}