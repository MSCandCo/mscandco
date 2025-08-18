import { useState, useEffect } from 'react';
import { useUser } from '@/components/providers/SupabaseProvider';
import { useRouter } from 'next/router';
import { 
  Users, Search, Filter, Plus, Eye, Trash2, 
  UserCheck, UserX, Shield, Calendar, Mail, Phone, 
  Building2, TrendingUp, DollarSign, Settings, Globe,
  Target, AlertTriangle
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

export default function AdminUsersPage() {
  const { user, isLoading } = useUser();
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

  // Revenue Split Configuration State (Super Admin has full oversight + control)
  const [revenueSplit, setRevenueSplit] = useState({
    distributionPartnerPercentage: 15,  // Code Group takes 15% first
    companyAdminPercentage: 10,         // Company Admin takes 10% second
    labelAdminPercentage: 25,           // Default: 25% of final remainder
    artistPercentage: 75,               // Default: 75% of final remainder
    distributionPartnerName: 'Code Group'
  });
  const [showSplitConfig, setShowSplitConfig] = useState(false);
  const [splitConfigSaved, setSplitConfigSaved] = useState(false);
  
  // Individual Label Admin Percentages (Super Admin can override individual rates)
  const [individualLabelAdminPercentages, setIndividualLabelAdminPercentages] = useState({});
  
  // Individual Artist Percentages (Super Admin can override individual rates)
  const [individualArtistPercentages, setIndividualArtistPercentages] = useState({});

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
  
  // Debug: Log user role to help diagnose visibility issue
  console.log('Super Admin Users Page - User Role:', userRole, 'User:', user);

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
    if (!isLoading && user) {
      const role = getUserRole(user);
      if (!['super_admin', 'company_admin'].includes(role)) {
        router.push('/dashboard');
        return;
      }
      
      // Use the universal database function
      setUsers(getAllUsers());
      setLoading(false);
    }
  }, [user, isLoading, user, router]);

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
    
    const userToDeleteName = userToDelete ? `${userToDelete.name} (${userToDelete.email})` : 'this user';
    
    confirmDelete(userToDeleteName, () => {
      setUsers(prev => prev.filter(u => u.id !== userId));
      showSuccess('User deleted successfully!');
    });
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

  // Revenue Split Management Functions (Super Admin has full control over all percentages)
  const handleSplitChange = (field, value) => {
    const numValue = value === '' ? 0 : parseInt(value);
    const finalValue = isNaN(numValue) ? 0 : numValue;
    
    if (field === 'labelAdminPercentage') {
      const newLabelPercentage = Math.min(100, Math.max(0, finalValue));
      const newArtistPercentage = 100 - newLabelPercentage;
      setRevenueSplit(prev => ({
        ...prev,
        labelAdminPercentage: newLabelPercentage,
        artistPercentage: newArtistPercentage
      }));
    } else if (field === 'distributionPartnerPercentage') {
      setRevenueSplit(prev => ({
        ...prev,
        distributionPartnerPercentage: Math.min(50, Math.max(0, finalValue))
      }));
    } else if (field === 'companyAdminPercentage') {
      setRevenueSplit(prev => ({
        ...prev,
        companyAdminPercentage: Math.min(50, Math.max(0, finalValue))
      }));
    }
  };

  const handleIndividualLabelAdminChange = (labelAdminId, value) => {
    const numValue = value === '' ? 0 : parseInt(value);
    const finalValue = isNaN(numValue) ? 0 : Math.min(100, Math.max(0, numValue));
    setIndividualLabelAdminPercentages(prev => ({
      ...prev,
      [labelAdminId]: finalValue
    }));
  };

  const handleIndividualArtistChange = (artistId, value) => {
    const numValue = value === '' ? 0 : parseInt(value);
    const finalValue = isNaN(numValue) ? 0 : Math.min(100, Math.max(0, numValue));
    setIndividualArtistPercentages(prev => ({
      ...prev,
      [artistId]: finalValue
    }));
  };

  const calculateSplitAmounts = (totalRevenue) => {
    const distributionPartner = (totalRevenue * revenueSplit.distributionPartnerPercentage) / 100;
    const afterDistributionPartner = totalRevenue - distributionPartner;
    
    const companyAdmin = (afterDistributionPartner * revenueSplit.companyAdminPercentage) / 100;
    const afterCompanyAdmin = afterDistributionPartner - companyAdmin;
    
    const labelAdmin = (afterCompanyAdmin * revenueSplit.labelAdminPercentage) / 100;
    const artist = afterCompanyAdmin - labelAdmin;
    
    return {
      distributionPartner,
      companyAdmin,
      afterCompanyAdmin,
      labelAdmin,
      artist
    };
  };

  const saveSplitConfiguration = () => {
    // Here you would save to your backend/database
    console.log('Saving revenue split configuration:', {
      revenueSplit,
      individualLabelAdminPercentages,
      individualArtistPercentages
    });
    
    setSplitConfigSaved(true);
    setSuccessMessage('Revenue split configuration saved successfully!');
    setShowSuccessModal(true);
    
    // Reset saved status after 3 seconds
    setTimeout(() => {
      setSplitConfigSaved(false);
    }, 3000);
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
                              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="font-bold text-gray-900" style={{
                  fontSize: `${Math.min(32, Math.max(18, 280 / userStats.totalUsers.toString().length))}px`
                }}>{userStats.totalUsers}</p>
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
                }}>{userStats.activeUsers}</p>
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
                <p className="font-bold text-blue-600" style={{
                  fontSize: `${Math.min(32, Math.max(18, 280 / userStats.newThisMonth.toString().length))}px`
                }}>{userStats.newThisMonth}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <TrendingUp className="w-8 h-8 text-blue-600" />
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

        {/* Revenue Split Configuration - Super Admin Control */}
        {userRole === 'super_admin' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-8 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">General Revenue Splits</h3>
                <p className="text-sm text-gray-600">Super Admin control over complete revenue distribution flow including individual user adjustments</p>
              </div>
              <button
                onClick={() => setShowSplitConfig(!showSplitConfig)}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                <Settings className="w-4 h-4 mr-2" />
                {showSplitConfig ? 'Hide Settings' : 'Configure Splits'}
              </button>
            </div>

            {/* Platform Revenue Overview */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-gray-900">Total Platform Revenue</h4>
                  <p className="font-bold text-purple-600" style={{
                    fontSize: `${Math.min(32, Math.max(18, 280 / formatCurrency(userStats.totalRevenue, selectedCurrency).length))}px`
                  }}>
                    {formatCurrency(userStats.totalRevenue, selectedCurrency)}
                  </p>
                  <p className="text-sm text-gray-600">Across all users, labels, and artists</p>
                </div>
                <Globe className="w-12 h-12 text-purple-500" />
              </div>
            </div>

            {/* Complete Split Overview - 5 Step Flow */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-700">Code Group</p>
                    <p className="text-2xl font-bold text-red-600">{revenueSplit.distributionPartnerPercentage}%</p>
                    <p className="text-xs text-red-500">Step 1: First deduction</p>
                  </div>
                  <Target className="w-8 h-8 text-red-500" />
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-700">Company Admin</p>
                    <p className="text-2xl font-bold text-purple-600">{revenueSplit.companyAdminPercentage}%</p>
                    <p className="text-xs text-purple-500">Step 2: From remainder</p>
                  </div>
                  <Building2 className="w-8 h-8 text-purple-500" />
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Final Pool</p>
                    <p className="text-2xl font-bold text-gray-600">{100 - revenueSplit.distributionPartnerPercentage - revenueSplit.companyAdminPercentage}%</p>
                    <p className="text-xs text-gray-500">Step 3: Available</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-gray-500" />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-700">Label Admin</p>
                    <p className="text-2xl font-bold text-blue-600">{revenueSplit.labelAdminPercentage}%</p>
                    <p className="text-xs text-blue-500">Step 4: Of final pool</p>
                  </div>
                  <UserCheck className="w-8 h-8 text-blue-500" />
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-700">Artist</p>
                    <p className="text-2xl font-bold text-green-600">{revenueSplit.artistPercentage}%</p>
                    <p className="text-xs text-green-500">Step 5: Of final pool</p>
                  </div>
                  <Users className="w-8 h-8 text-green-500" />
                </div>
              </div>
            </div>

            {/* Example Calculation with Platform Revenue - Complete 5-Step Flow */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-gray-900 mb-3">Complete Platform Split Example: {formatCurrency(userStats.totalRevenue, selectedCurrency)}</h4>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-sm">
                <div>
                  <span className="text-red-600 font-medium">Code Group:</span>
                  <br />
                  <span className="text-lg font-bold text-red-600">{formatCurrency(calculateSplitAmounts(userStats.totalRevenue).distributionPartner, selectedCurrency)}</span>
                </div>
                <div>
                  <span className="text-purple-600 font-medium">Company Admin:</span>
                  <br />
                  <span className="text-lg font-bold text-purple-600">{formatCurrency(calculateSplitAmounts(userStats.totalRevenue).companyAdmin, selectedCurrency)}</span>
                </div>
                <div>
                  <span className="text-gray-600 font-medium">Final Pool:</span>
                  <br />
                  <span className="text-lg font-bold text-gray-700">{formatCurrency(calculateSplitAmounts(userStats.totalRevenue).afterCompanyAdmin, selectedCurrency)}</span>
                </div>
                <div>
                  <span className="text-blue-600 font-medium">All Label Admins:</span>
                  <br />
                  <span className="text-lg font-bold text-blue-600">{formatCurrency(calculateSplitAmounts(userStats.totalRevenue).labelAdmin, selectedCurrency)}</span>
                </div>
                <div>
                  <span className="text-green-600 font-medium">All Artists:</span>
                  <br />
                  <span className="text-lg font-bold text-green-600">{formatCurrency(calculateSplitAmounts(userStats.totalRevenue).artist, selectedCurrency)}</span>
                </div>
              </div>
            </div>

            {/* Configuration Panel */}
            {showSplitConfig && (
              <div className="border-t border-gray-200 pt-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
                    <div>
                      <p className="font-medium text-yellow-800">Super Admin Revenue Control</p>
                      <p className="text-sm text-yellow-700">Full control over the complete 5-step revenue distribution flow affecting all users, including individual adjustments.</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Code Group Percentage
                    </label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="range"
                        min="0"
                        max="50"
                        value={revenueSplit.distributionPartnerPercentage}
                        onChange={(e) => handleSplitChange('distributionPartnerPercentage', parseInt(e.target.value))}
                        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          min="0"
                          max="50"
                          value={revenueSplit.distributionPartnerPercentage}
                          onChange={(e) => handleSplitChange('distributionPartnerPercentage', e.target.value)}
                          className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                        />
                        <span className="text-gray-500">%</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Step 1: First deduction</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Admin Percentage
                    </label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="range"
                        min="0"
                        max="50"
                        value={revenueSplit.companyAdminPercentage}
                        onChange={(e) => handleSplitChange('companyAdminPercentage', parseInt(e.target.value))}
                        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          min="0"
                          max="50"
                          value={revenueSplit.companyAdminPercentage}
                          onChange={(e) => handleSplitChange('companyAdminPercentage', e.target.value)}
                          className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                        />
                        <span className="text-gray-500">%</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Step 2: From remainder</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Default Label Admin Percentage
                    </label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={revenueSplit.labelAdminPercentage}
                        onChange={(e) => handleSplitChange('labelAdminPercentage', parseInt(e.target.value))}
                        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={revenueSplit.labelAdminPercentage}
                          onChange={(e) => handleSplitChange('labelAdminPercentage', e.target.value)}
                          className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                        />
                        <span className="text-gray-500">%</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Artist gets {revenueSplit.artistPercentage}%</p>
                  </div>
                </div>

                {/* Individual Label Admin Percentages */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Individual Label Admin Percentages</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {users.filter(u => u.role === 'label_admin').map((labelAdmin) => (
                      <div key={labelAdmin.id} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h5 className="font-medium text-blue-900">{labelAdmin.firstName} {labelAdmin.lastName}</h5>
                            <p className="text-sm text-blue-700">{labelAdmin.labelName} Label</p>
                          </div>
                          <UserCheck className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex items-center space-x-3">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={individualLabelAdminPercentages[labelAdmin.id] || revenueSplit.labelAdminPercentage}
                            onChange={(e) => handleIndividualLabelAdminChange(labelAdmin.id, parseInt(e.target.value))}
                            className="flex-1 h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
                          />
                          <div className="flex items-center space-x-2">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={individualLabelAdminPercentages[labelAdmin.id] || revenueSplit.labelAdminPercentage}
                              onChange={(e) => handleIndividualLabelAdminChange(labelAdmin.id, e.target.value)}
                              className="w-16 px-2 py-1 border border-blue-300 rounded text-center"
                            />
                            <span className="text-blue-600">%</span>
                          </div>
                        </div>
                        <p className="text-xs text-blue-600 mt-2">
                          Artists under this label get {100 - (individualLabelAdminPercentages[labelAdmin.id] || revenueSplit.labelAdminPercentage)}%
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Individual Artist Percentages - NEW FEATURE */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Individual Artist Percentages</h4>
                  <p className="text-sm text-gray-600 mb-4">Override default percentages for specific artists with custom agreements</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {users.filter(u => u.role === 'artist').map((artist) => (
                      <div key={artist.id} className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h5 className="font-medium text-green-900">{artist.firstName} {artist.lastName}</h5>
                            <p className="text-sm text-green-700">{artist.stageName || 'Artist'}</p>
                            <p className="text-xs text-green-600">Label: {artist.labelName || 'Independent'}</p>
                          </div>
                          <Users className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="flex items-center space-x-3">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={individualArtistPercentages[artist.id] || revenueSplit.artistPercentage}
                            onChange={(e) => handleIndividualArtistChange(artist.id, parseInt(e.target.value))}
                            className="flex-1 h-2 bg-green-200 rounded-lg appearance-none cursor-pointer"
                          />
                          <div className="flex items-center space-x-2">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={individualArtistPercentages[artist.id] || revenueSplit.artistPercentage}
                              onChange={(e) => handleIndividualArtistChange(artist.id, e.target.value)}
                              className="w-16 px-2 py-1 border border-green-300 rounded text-center"
                            />
                            <span className="text-green-600">%</span>
                          </div>
                        </div>
                        <p className="text-xs text-green-600 mt-2">
                          Custom agreement: {individualArtistPercentages[artist.id] ? 'Custom rate applied' : 'Using default rate'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end mt-6">
                  <button
                    onClick={saveSplitConfiguration}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                      splitConfigSaved 
                        ? 'bg-green-600 text-white' 
                        : 'bg-red-600 text-white hover:bg-red-700'
                    }`}
                  >
                    {splitConfigSaved ? '✓ General Revenue Splits Saved!' : 'Save General Revenue Splits'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
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
          userRole={userRole}
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

      {/* Branded Modals */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={closeConfirmModal}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        confirmText={confirmModal.confirmText}
        cancelText={confirmModal.cancelText}
      />

      <NotificationModal
        isOpen={notificationModal.isOpen}
        onClose={closeNotificationModal}
        title={notificationModal.title}
        message={notificationModal.message}
        type={notificationModal.type}
        buttonText={notificationModal.buttonText}
      />
    </MainLayout>
  );
}

// User Modal Component
function UserModal({ title, user = null, userRole, onClose, onSave }) {
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