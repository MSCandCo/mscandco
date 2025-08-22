import { useState, useEffect } from 'react';
import { useUser } from '@/components/providers/SupabaseProvider';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/router';
import { 
  Users, Search, Filter, Eye, 
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

export default function CompanyAdminUsersPage() {
  const { user, isLoading } = useUser();
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

  // Revenue Split Configuration State (Company Admin has full control)
  const [revenueSplit, setRevenueSplit] = useState({
    distributionPartnerPercentage: 15,  // Default: 15% (Code Group)
    companyAdminPercentage: 10,         // Default: 10% (Company Admin)
    labelAdminPercentage: 25,           // Default: 25% of final pool (after Code Group & Company Admin)
    artistPercentage: 75,               // Default: 75% of final pool (after Code Group & Company Admin)
  });
  const [showSplitConfig, setShowSplitConfig] = useState(false);
  const [splitConfigSaved, setSplitConfigSaved] = useState(false);
  
  // Individual Label Admin Percentages (Company Admin can override for their brand)
  const [individualLabelAdminPercentages, setIndividualLabelAdminPercentages] = useState({});
  
  // Individual Artist Percentages (Company Admin can override for their brand)
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

  // Company Admin can only see Label Admins and Artists (no Super Admin, Company Admin, or Distribution Partner)
  const allUsers = getUsers();
  const filteredUsersByRole = allUsers.filter(u => ['label_admin', 'artist'].includes(u.role));

  // Check admin access
  useEffect(() => {
    if (!isLoading && user) {
      const role = getUserRole(user);
      if (role !== 'company_admin') {
        router.push('/dashboard');
        return;
      }
      setLoading(false);
    } else if (!isLoading && !user) {
      router.push('/login');
    }
  }, [isLoading, user, user, router]);

  // Load saved revenue split configuration
  useEffect(() => {
    if (user) {
      loadRevenueSplitConfiguration();
    }
  }, [user]);

  const loadRevenueSplitConfiguration = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const response = await fetch('/api/companyadmin/revenue-splits', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Loaded revenue split configuration:', data);
        
        if (data.revenueSplit) {
          setRevenueSplit(data.revenueSplit);
        }
        if (data.individualLabelAdminPercentages) {
          setIndividualLabelAdminPercentages(data.individualLabelAdminPercentages);
        }
        if (data.individualArtistPercentages) {
          setIndividualArtistPercentages(data.individualArtistPercentages);
        }
        
        // If configuration was previously saved, mark as saved
        if (data.lastUpdated) {
          setSplitConfigSaved(true);
        }
      }
    } catch (error) {
      console.error('Error loading revenue split configuration:', error);
    }
  };

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
    router.push(`/companyadmin/users/edit/${user.id}`);
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

  // Revenue Split Management Functions (Company Admin has limited control within their brand)
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

  const saveSplitConfiguration = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const response = await fetch('/api/companyadmin/revenue-splits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          revenueSplit,
          individualLabelAdminPercentages,
          individualArtistPercentages
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Revenue split configuration saved:', result);
        
        setSplitConfigSaved(true);
        setSuccessMessage('Revenue split configuration saved successfully to database!');
        setShowSuccessModal(true);
        
        // Reset saved status after 3 seconds
        setTimeout(() => {
          setSplitConfigSaved(false);
        }, 3000);
      } else {
        const errorData = await response.json();
        console.error('Failed to save revenue splits:', errorData);
        setSuccessMessage(`Failed to save: ${errorData.error}`);
        setShowSuccessModal(true);
        
        setTimeout(() => {
          setShowSuccessModal(false);
        }, 5000);
      }
    } catch (error) {
      console.error('Error saving revenue split configuration:', error);
      setSuccessMessage('Error saving configuration. Please try again.');
      setShowSuccessModal(true);
      
      setTimeout(() => {
        setShowSuccessModal(false);
      }, 5000);
    }
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
                <p className="text-sm font-medium text-gray-600 mb-2">Total Users</p>
                <p className="text-3xl font-bold text-blue-600">
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
                <p className="text-sm font-medium text-gray-600 mb-2">Active Users</p>
                <p className="text-3xl font-bold text-green-600">
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
                <p className="text-sm font-medium text-gray-600 mb-2">New This Month</p>
                <p className="text-3xl font-bold text-purple-600">
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
                <p className="text-sm font-medium text-gray-600 mb-2">Total Revenue</p>
                <p className="text-3xl font-bold text-purple-600">
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

        {/* Revenue Split Configuration - Company Admin Control */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">General Revenue Splits</h3>
              <p className="text-sm text-gray-600">Company Admin full control over complete revenue distribution flow including Code Group and Company Admin percentages</p>
            </div>
            <button
              onClick={() => setShowSplitConfig(!showSplitConfig)}
              className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              <Settings className="w-4 h-4 mr-2" />
              {showSplitConfig ? 'Hide Settings' : 'Configure Splits'}
            </button>
          </div>

          {/* Brand Revenue Overview */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex-1 pr-6">
                <h4 className="text-xl font-bold text-gray-900 mb-3">Total Brand Revenue</h4>
                <div className="mb-4">
                  <p className="text-3xl font-bold text-purple-600 mb-2">
                    {formatCurrency(userStats.totalRevenue, selectedCurrency)}
                  </p>
                  <p className="text-base text-gray-600 mb-2">Across all brand users and artists</p>
                  <p className="text-sm text-gray-500">
                    After Code Group ({revenueSplit.distributionPartnerPercentage}%) and Company Admin ({revenueSplit.companyAdminPercentage}%) deductions
                  </p>
                </div>
              </div>
              <div className="flex-shrink-0">
                <Building2 className="w-16 h-16 text-purple-500" />
              </div>
            </div>
          </div>

          {/* Complete Split Overview - 5 Step Flow */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
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

          {/* Configuration Panel */}
          {showSplitConfig && (
            <div className="border-t border-gray-200 pt-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <Target className="w-5 h-5 text-green-600 mr-2" />
                  <div>
                    <p className="font-medium text-green-800">Company Admin Revenue Control</p>
                    <p className="text-sm text-green-700">Full control over revenue distribution including Code Group and Company Admin percentages for your brand operations.</p>
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
                  <p className="text-xs text-gray-500 mt-1">Step 3: Artist gets {revenueSplit.artistPercentage}%</p>
                </div>
              </div>

              {/* Individual Label Admin Percentages */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Individual Label Admin Percentages</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredUsers.filter(u => u.role === 'label_admin').map((labelAdmin) => (
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

              {/* Individual Artist Percentages */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Individual Artist Percentages</h4>
                <p className="text-sm text-gray-600 mb-4">Override default percentages for specific artists with custom agreements</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredUsers.filter(u => u.role === 'artist').map((artist) => (
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
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                >
                  {splitConfigSaved ? '✓ General Revenue Splits Saved!' : 'Save General Revenue Splits'}
                </button>
              </div>
            </div>
          )}
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