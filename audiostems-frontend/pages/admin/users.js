import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useRouter } from 'next/router';
import { 
  Users, Search, Filter, Plus, Eye, Trash2, 
  UserCheck, UserX, Shield, Calendar, Mail, Phone, 
  Building2, TrendingUp, DollarSign
} from 'lucide-react';
import MainLayout from '@/components/layouts/mainLayout';
import SEO from '@/components/seo';
import CurrencySelector, { formatCurrency, useCurrencySync } from '@/components/shared/CurrencySelector';
import { getApprovedArtistsByLabel } from '@/lib/mockData';
import { getUsers } from '@/lib/mockDatabase';
import { getUserRole } from '@/lib/auth0-config';
import Avatar from '@/components/shared/Avatar';
import { SuccessModal } from '@/components/shared/SuccessModal';

export default function AdminUsersPage() {
  const { user, isLoading, isAuthenticated } = useAuth0();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [selectedCurrency, updateCurrency] = useCurrencySync('GBP');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddUserModal, setShowAddUserModal] = useState(false);

  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Get user role
  const userRole = getUserRole(user);

  // Get all users data from universal mock database based on current user role
  const getAllUsers = () => {
    const allUsers = getUsers().map(user => {
      if (user.role === 'label_admin') {
        // For label admins, calculate aggregated data from their artists
        const approvedArtists = getApprovedArtistsByLabel(user.labelId);
        const totalReleases = approvedArtists.reduce((sum, artist) => sum + (artist.totalReleases || 0), 0);
        const totalStreams = approvedArtists.reduce((sum, artist) => sum + (artist.totalStreams || 0), 0);
        const totalEarnings = approvedArtists.reduce((sum, artist) => sum + (artist.totalRevenue || artist.totalEarnings || 0), 0);
        
        return {
          ...user,
          releases: totalReleases,
          totalStreams: totalStreams,
          totalEarnings: totalEarnings
        };
      } else {
        // For other roles, use their individual data
        return {
          ...user,
          releases: user.totalReleases || 0,
          totalStreams: user.totalStreams || 0,
          totalEarnings: user.totalRevenue || user.totalEarnings || 0
        };
      }
    });

    // Filter users based on current user role
    if (userRole === 'company_admin') {
      // Company admins can only see artists and label admins
      return allUsers.filter(user => ['artist', 'label_admin'].includes(user.role));
    } else if (userRole === 'super_admin') {
      // Super admins can see all users
      return allUsers;
    }
    
    return [];
  };

  const [users, setUsers] = useState([]);

  // Check admin access and load users
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      const role = getUserRole(user);
      if (!['super_admin', 'company_admin'].includes(role)) {
        router.push('/dashboard');
        return;
      }
      
      // Use the universal database function
      setUsers(getAllUsers());
      setLoading(false);
    }
  }, [isAuthenticated, isLoading, user, router]);

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.brand?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  // User statistics
  const userStats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.status === 'active').length,
    newThisMonth: users.filter(u => new Date(u.joinDate) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length,
    totalRevenue: users.reduce((sum, u) => sum + (u.totalEarnings || 0), 0)
  };

  // Handle actions
  const handleAddUser = () => {
    setShowAddUserModal(true);
  };



  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

  const handleDeleteUser = (userId) => {
    // Check if current user has permission to delete this user
    const userToDelete = users.find(u => u.id === userId);
    if (userRole === 'company_admin' && !['artist', 'label_admin'].includes(userToDelete?.role)) {
      setSuccessMessage('You do not have permission to delete this user.');
      setShowSuccessModal(true);
      return;
    }
    
    if (confirm('Are you sure you want to delete this user?')) {
      setUsers(prev => prev.filter(u => u.id !== userId));
      setSuccessMessage('User deleted successfully!');
      setShowSuccessModal(true);
    }
  };

  const handleSaveUser = (userData) => {
    console.log('handleSaveUser called with:', userData);
    console.log('Current userRole:', userRole);
    
    // Add new user (only super admins can do this)
    if (userRole !== 'super_admin') {
      console.log('Permission denied for adding new user');
      setSuccessMessage('You do not have permission to add new users.');
      setShowSuccessModal(true);
      return;
    }
    console.log('Adding new user');
    const newUser = { ...userData, id: Date.now() };
    setUsers(prev => [...prev, newUser]);
    setSuccessMessage('User added successfully!');
    setShowAddUserModal(false);
    setSelectedUser(null);
    setShowSuccessModal(true);
    console.log('Save completed');
  };

  // Get role badge color
  const getRoleBadgeColor = (role) => {
    const colors = {
      super_admin: 'bg-red-100 text-red-800',
      company_admin: 'bg-purple-100 text-purple-800',
      label_admin: 'bg-blue-100 text-blue-800',
      artist: 'bg-green-100 text-green-800',
      distribution_partner: 'bg-yellow-100 text-yellow-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  // Loading state
  if (isLoading || loading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading user management...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <SEO 
        title={userRole === 'company_admin' ? 'User Overview' : 'User Management'}
        description={userRole === 'company_admin' 
          ? 'View and edit artists and label administrators' 
          : 'Manage users and their roles across the platform'
        }
      />
      
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white mb-8">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  {userRole === 'company_admin' ? 'User Overview' : 'User Management'}
                </h1>
                <p className="text-blue-100 text-lg">
                  {userRole === 'company_admin' 
                    ? 'View and edit artists and label administrators' 
                    : 'Manage users and their roles across the platform'
                  }
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-blue-100">Platform Health</div>
                <div className="text-2xl font-bold">98.5%</div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex justify-between items-center mb-6">
            <CurrencySelector 
              selectedCurrency={selectedCurrency}
              onCurrencyChange={updateCurrency}
            />
            {userRole === 'super_admin' && (
              <button
                onClick={handleAddUser}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New User
              </button>
            )}

          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-3xl font-bold text-gray-900">{userStats.totalUsers}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Users</p>
                  <p className="text-3xl font-bold text-green-600">{userStats.activeUsers}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-xl">
                  <UserCheck className="w-8 h-8 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">New This Month</p>
                  <p className="text-3xl font-bold text-blue-600">{userStats.newThisMonth}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <TrendingUp className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-3xl font-bold text-purple-600">{formatCurrency(userStats.totalRevenue, selectedCurrency)}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-xl">
                  <DollarSign className="w-8 h-8 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Search Users</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name, email, or brand..."
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Role</label>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                                  <option value="all">All Roles</option>
                {userRole === 'super_admin' && (
                  <>
                    <option value="super_admin">Super Admin</option>
                    <option value="company_admin">Company Admin</option>
                  </>
                )}
                <option value="label_admin">Label Admin</option>
                <option value="artist">Artist</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Platform Users ({filteredUsers.length})</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Brand</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Avatar 
                            name={user.name}
                            image={user.avatar}
                            size="w-10 h-10"
                            textSize="text-sm"
                          />
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                          {user.role.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.brand}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.status === 'active' ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex flex-col">
                          <span>{user.releases} releases</span>
                          <span className="text-xs text-gray-500">{formatCurrency(user.totalEarnings, selectedCurrency)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.lastLogin).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewUser(user)}
                            className="flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                          >
                            <Eye className="w-3 h-3" />
                          </button>

                          {userRole === 'super_admin' && (
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="flex items-center px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                            >
                              <Trash2 className="w-3 h-3 mr-1" />
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <SuccessModal 
          message={successMessage}
          onClose={() => setShowSuccessModal(false)}
        />
      )}

      {/* Add User Modal */}
      {showAddUserModal && (
        <UserModal
          title="Add New User"
          onClose={() => setShowAddUserModal(false)}
          onSave={handleSaveUser}
        />
      )}




      {/* View User Modal */}
      {showViewModal && selectedUser && (
        <ViewUserModal
          user={selectedUser}
          onClose={() => setShowViewModal(false)}
          onEdit={null}
          selectedCurrency={selectedCurrency}
        />
      )}
    </MainLayout>
  );
}

// User Modal Component
function UserModal({ title, user = null, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || 'artist',
    brand: user?.brand || '',
    status: user?.status || 'active',
    phone: user?.phone || '',
    ...user
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <select
                value={formData.role}
                onChange={(e) => handleChange('role', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="artist">Artist</option>
                <option value="label_admin">Label Admin</option>
                {userRole === 'super_admin' && (
                  <>
                    <option value="distribution_partner">Distribution Partner</option>
                    <option value="company_admin">Company Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => handleChange('brand', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {user ? 'Update User' : 'Add User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// View User Modal Component
function ViewUserModal({ user, onClose, onEdit, selectedCurrency }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">User Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          {/* User Profile */}
          <div className="flex items-center space-x-4 p-6 bg-gray-50 rounded-lg">
            <Avatar 
              name={user.name}
              image={user.avatar}
              size="w-16 h-16"
              textSize="text-xl"
            />
            <div>
              <h3 className="text-xl font-bold text-gray-900">{user.name}</h3>
              <p className="text-gray-600">{user.email}</p>
              <div className="flex items-center space-x-3 mt-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800`}>
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

          {/* User Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
              <p className="text-gray-900">{user.brand}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <p className="text-gray-900">{user.phone || 'Not provided'}</p>
            </div>
            {user.role !== 'label_admin' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Earnings</label>
                <p className="text-gray-900 font-semibold">{formatCurrency(user.totalEarnings || 0, selectedCurrency)}</p>
              </div>
            )}
            {user.role === 'label_admin' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Approved Artists</label>
                <div className="text-gray-900">
                  {(() => {
                    const approvedArtists = getApprovedArtistsByLabel(user.labelId);
                    if (approvedArtists.length === 0) {
                      return <span className="text-gray-500 italic">No approved artists yet</span>;
                    }
                    return (
                      <div className="space-y-1">
                        {approvedArtists.map((artist, index) => (
                          <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mr-1 mb-1">
                            {artist.name}
                          </span>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Join Date</label>
              <p className="text-gray-900">{new Date(user.joinDate).toLocaleDateString()}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Login</label>
              <p className="text-gray-900">{new Date(user.lastLogin).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Performance Stats */}
          {user.role === 'artist' && (
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="text-lg font-bold text-gray-900 mb-4">Performance</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{user.releases}</div>
                  <div className="text-sm text-gray-600">Releases</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{user.totalStreams?.toLocaleString() || '0'}</div>
                  <div className="text-sm text-gray-600">Streams</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{formatCurrency(user.totalEarnings || 0, selectedCurrency)}</div>
                  <div className="text-sm text-gray-600">Earnings</div>
                </div>
              </div>
            </div>
          )}

          {/* Label Admin Performance Stats */}
          {user.role === 'label_admin' && (
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="text-lg font-bold text-gray-900 mb-4">Label Performance</h4>
              {(() => {
                const approvedArtists = getApprovedArtistsByLabel(user.labelId);
                const totalReleases = approvedArtists.reduce((sum, artist) => sum + (artist.totalReleases || 0), 0);
                const totalStreams = approvedArtists.reduce((sum, artist) => sum + (artist.totalStreams || 0), 0);
                const totalEarnings = approvedArtists.reduce((sum, artist) => sum + (artist.totalRevenue || artist.totalEarnings || 0), 0);
                
                return (
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{totalReleases}</div>
                      <div className="text-sm text-gray-600">Total Releases</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{totalStreams.toLocaleString()}</div>
                      <div className="text-sm text-gray-600">Total Streams</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{formatCurrency(totalEarnings, selectedCurrency)}</div>
                      <div className="text-sm text-gray-600">Total Earnings</div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
            {onEdit && (
              <button
                onClick={onEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Edit User
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}