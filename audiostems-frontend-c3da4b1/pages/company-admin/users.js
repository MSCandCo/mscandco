import { useState, useEffect } from 'react';
import { useUser } from '@/components/providers/SupabaseProvider';
import { useRouter } from 'next/router';
import { 
  Users, Search, Filter, Eye, 
  UserCheck, UserX, Shield, Calendar, Mail, Phone, 
  Building2, TrendingUp, DollarSign
} from 'lucide-react';
import MainLayout from '@/components/layouts/mainLayout';
import SEO from '@/components/seo';
import CurrencySelector, { formatCurrency, useCurrencySync } from '@/components/shared/CurrencySelector';
import { getApprovedArtistsByLabel, getUsers } from '@/lib/emptyData';
import { getUserRole } from '@/lib/user-utils';
import Avatar from '@/components/shared/Avatar';
import { SuccessModal } from '@/components/shared/SuccessModal';
import ConfirmationModal from '@/components/shared/ConfirmationModal';
import NotificationModal from '@/components/shared/NotificationModal';
import useModals from '@/hooks/useModals';

export default function CompanyAdminUsersPage() {
  const { user, isLoading } = useUser();
  const isAuthenticated = !!user;
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [selectedCurrency, updateCurrency] = useCurrencySync('GBP');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Initialize modals hook
  const {
    confirmModal,
    notificationModal,
    confirmDelete,
    showSuccess,
    showError,
    closeConfirmModal,
    closeNotificationModal
  } = useModals();

  // Get user role
  const userRole = getUserRole(user);

  // Company Admin can only see Label Admins and Artists (no Super Admin, Company Admin, or Distribution Partner)
  const allUsers = getUsers();
  const filteredUsersByRole = allUsers.filter(u => ['label_admin', 'artist'].includes(u.role));

  // Check admin access
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      const role = getUserRole(user);
      if (role !== 'company_admin') {
        router.push('/dashboard');
        return;
      }
      setLoading(false);
    } else if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, user, router]);

  // Apply filters
  const filteredUsers = filteredUsersByRole.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (u.brand && u.brand.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    
    // Status logic: active if has releases/earnings or recent login
    const hasActivity = (u.totalReleases && u.totalReleases > 0) || 
                       (u.totalEarnings && u.totalEarnings > 0) ||
                       (u.totalRevenue && u.totalRevenue > 0);
    const isActive = hasActivity && u.status === 'active';
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && isActive) ||
                         (statusFilter === 'inactive' && !isActive);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Calculate user statistics
  const userStats = {
    totalUsers: filteredUsersByRole.length,
    activeUsers: filteredUsersByRole.filter(u => {
      const hasActivity = (u.totalReleases && u.totalReleases > 0) || 
                         (u.totalEarnings && u.totalEarnings > 0) ||
                         (u.totalRevenue && u.totalRevenue > 0);
      return hasActivity && u.status === 'active';
    }).length,
    newThisMonth: filteredUsersByRole.filter(u => {
      const joinDate = new Date(u.joinDate || u.createdAt || '2023-01-01');
      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      return joinDate >= thisMonth;
    }).length,
    totalRevenue: filteredUsersByRole.reduce((sum, u) => sum + (u.totalRevenue || u.totalEarnings || 0), 0)
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

  const handleEditUser = (user) => {
    // Navigate to edit page or show edit modal
    router.push(`/company-admin/users/edit/${user.id}`);
  };

  const getRoleDisplayName = (role) => {
    const roleNames = {
      'artist': 'Artist',
      'label_admin': 'Label Admin'
    };
    return roleNames[role] || role;
  };

  const getStatusColor = (user) => {
    const hasActivity = (user.totalReleases && user.totalReleases > 0) || 
                       (user.totalEarnings && user.totalEarnings > 0) ||
                       (user.totalRevenue && user.totalRevenue > 0);
    const isActive = hasActivity && user.status === 'active';
    return isActive ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100';
  };

  const getStatusText = (user) => {
    const hasActivity = (user.totalReleases && user.totalReleases > 0) || 
                       (user.totalEarnings && user.totalEarnings > 0) ||
                       (user.totalRevenue && user.totalRevenue > 0);
    const isActive = hasActivity && user.status === 'active';
    return isActive ? 'Active' : 'Inactive';
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <SEO 
        title="User Management - Company Admin"
        description="Manage label admins and artists in your organization"
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600 mt-2">Manage label admins and artists in your organization</p>
          </div>
          <div className="flex items-center space-x-4">
            <CurrencySelector 
              selectedCurrency={selectedCurrency}
              onCurrencyChange={updateCurrency}
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="font-bold text-blue-600" style={{
                  fontSize: `${Math.min(32, Math.max(18, 280 / userStats.totalUsers.toString().length))}px`
                }}>
                  {userStats.totalUsers}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="font-bold text-green-600" style={{
                  fontSize: `${Math.min(32, Math.max(18, 280 / userStats.activeUsers.toString().length))}px`
                }}>
                  {userStats.activeUsers}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <UserCheck className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-600">New This Month</p>
                <p className="font-bold text-purple-600" style={{
                  fontSize: `${Math.min(32, Math.max(18, 280 / userStats.newThisMonth.toString().length))}px`
                }}>
                  {userStats.newThisMonth}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="font-bold text-purple-600" style={{
                  fontSize: `${Math.min(32, Math.max(18, 280 / formatCurrency(userStats.totalRevenue, selectedCurrency).length))}px`
                }}>
                  {formatCurrency(userStats.totalRevenue, selectedCurrency)}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <DollarSign className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Users</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by name, email, or brand..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Role</label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Roles</option>
                <option value="artist">Artist</option>
                <option value="label_admin">Label Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Brand/Label</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Avatar 
                          src={user.profileImage} 
                          name={user.name} 
                          size="w-10 h-10" 
                        />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {getRoleDisplayName(user.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.brand || user.label || '---'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user)}`}>
                        {getStatusText(user)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(user.totalRevenue || user.totalEarnings || 0, selectedCurrency)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewUser(user)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded"
                          title="View User"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* View User Modal */}
        {showViewModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">User Details</h3>
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="text-gray-400 hover:text-gray-600 p-1"
                  >
                    ✕
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <p className="text-sm text-gray-900">{selectedUser.name}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <p className="text-sm text-gray-900">{selectedUser.email}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <p className="text-sm text-gray-900">{getRoleDisplayName(selectedUser.role)}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedUser)}`}>
                      {getStatusText(selectedUser)}
                    </span>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Brand/Label</label>
                    <p className="text-sm text-gray-900">{selectedUser.brand || selectedUser.label || '---'}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Join Date</label>
                    <p className="text-sm text-gray-900">
                      {new Date(selectedUser.joinDate || selectedUser.createdAt || '2023-01-01').toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Revenue</label>
                    <p className="text-sm text-gray-900">
                      {formatCurrency(selectedUser.totalRevenue || selectedUser.totalEarnings || 0, selectedCurrency)}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Releases</label>
                    <p className="text-sm text-gray-900">{selectedUser.totalReleases || 0}</p>
                  </div>

                  {selectedUser.role === 'label_admin' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Total Streams</label>
                        <p className="text-sm text-gray-900">{selectedUser.totalStreams?.toLocaleString() || 0}</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Approved Artists</label>
                        <p className="text-sm text-gray-900">
                          {getApprovedArtistsByLabel(selectedUser.brand || selectedUser.label).length}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modals */}
        <ConfirmationModal
          isOpen={confirmModal.isOpen}
          title={confirmModal.title}
          message={confirmModal.message}
          onConfirm={confirmModal.onConfirm}
          onCancel={closeConfirmModal}
          confirmText={confirmModal.confirmText}
          cancelText={confirmModal.cancelText}
        />

        <NotificationModal
          isOpen={notificationModal.isOpen}
          type={notificationModal.type}
          title={notificationModal.title}
          message={notificationModal.message}
          onClose={closeNotificationModal}
        />
      </div>
    </MainLayout>
  );
}