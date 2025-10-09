import { useState, useEffect } from 'react';
import { useUser } from '@/components/providers/SupabaseProvider';
import { createClient } from '@supabase/supabase-js';
import { getUserRoleSync } from '@/lib/user-utils';
import Layout from '@/components/layouts/mainLayout';
import CurrencySelector, { formatCurrency as sharedFormatCurrency, useCurrencySync } from '@/components/shared/CurrencySelector';
import NotificationModal from '@/components/shared/NotificationModal';
import useModals from '@/hooks/useModals';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function WalletManagement() {
  const { user, isLoading } = useUser();
  const [selectedCurrency, updateCurrency] = useCurrencySync('GBP');
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserType, setSelectedUserType] = useState('all');
  const [showTopupModal, setShowTopupModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [topupAmount, setTopupAmount] = useState('');
  const [topupDescription, setTopupDescription] = useState('');
  const [operation, setOperation] = useState('add'); // 'add' or 'subtract'
  const [allowNegative, setAllowNegative] = useState(false);
  const [negativeLimit, setNegativeLimit] = useState('');
  const [processing, setProcessing] = useState(false);

  // Initialize modals hook
  const {
    notificationModal,
    showError,
    showSuccess,
    closeNotificationModal
  } = useModals();

  // Load users from API
  const loadUsers = async () => {
    try {
      setLoadingUsers(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log('No session found for loading users');
        return;
      }

      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        console.log('👥 Loaded users for wallet management:', result.data?.length || 0);
        setUsers(result.data || []);
      } else {
        console.error('Failed to load users:', response.status);
        showError('Failed to load users', 'Loading Error');
      }
    } catch (error) {
      console.error('Error loading users:', error);
      showError('Error loading users', 'Loading Error');
    } finally {
      setLoadingUsers(false);
    }
  };

  // Handle wallet adjustment (add/subtract)
  const handleWalletAdjustment = async () => {
    if (!selectedUser || !topupAmount || parseFloat(topupAmount) <= 0) {
      showError('Please enter a valid amount', 'Invalid Input');
      return;
    }

    // Validate negative limit if provided
    if (negativeLimit && parseFloat(negativeLimit) < 0) {
      showError('Negative limit must be a positive number', 'Invalid Input');
      return;
    }

    try {
      setProcessing(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        showError('Please log in to continue', 'Authentication Required');
        return;
      }

      const requestBody = {
        targetUserId: selectedUser.id,
        amount: parseFloat(topupAmount),
        currency: selectedCurrency,
        operation: operation,
        description: topupDescription || `Admin ${operation} by ${user.email}`,
        allowNegative: allowNegative
      };

      // Add negative limit if specified
      if (negativeLimit && parseFloat(negativeLimit) > 0) {
        requestBody.negativeLimit = parseFloat(negativeLimit);
      }

      const response = await fetch('/api/wallet/admin-topup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(requestBody)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to adjust wallet');
      }

      console.log('Wallet adjusted:', result);

      // Refresh user data from API to get updated balance
      await loadUsers();

      // Reset all form fields
      setTopupAmount('');
      setTopupDescription('');
      setOperation('add');
      setAllowNegative(false);
      setNegativeLimit('');
      setShowTopupModal(false);
      setSelectedUser(null);
      
      const actionText = operation === 'add' ? 'added to' : 'subtracted from';
      const userName = selectedUser.artistName || `${selectedUser.firstName} ${selectedUser.lastName}`;
      showSuccess(
        `Successfully ${actionText} ${userName}'s wallet: ${sharedFormatCurrency(parseFloat(topupAmount), selectedCurrency)}`, 
        `Wallet ${operation === 'add' ? 'Topped Up' : 'Debited'}`
      );

    } catch (error) {
      console.error('Wallet top-up failed:', error);
      showError(error.message || 'Failed to top up wallet', 'Top-up Failed');
    } finally {
      setProcessing(false);
    }
  };

  // Load users when component mounts
  useEffect(() => {
    if (user) {
      loadUsers();
    }
  }, [user]);

  // Filter users based on search and type
  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchQuery || 
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.firstName && user.firstName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (user.lastName && user.lastName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (user.artistName && user.artistName.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesType = selectedUserType === 'all' || user.role === selectedUserType;
    
    return matchesSearch && matchesType;
  });

  // Calculate summary stats
  const summaryStats = {
    totalUsers: users.length,
    artists: users.filter(u => u.role === 'artist').length,
    labelAdmins: users.filter(u => u.role === 'label_admin').length,
    totalWalletValue: users.reduce((sum, u) => sum + (u.totalEarnings || 0), 0)
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600">Please log in to access this page.</p>
        </div>
      </div>
    );
  }

  const userRole = getUserRoleSync(user);
  
  if (!['super_admin', 'company_admin'].includes(userRole)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Wallet Management</h1>
                <p className="text-sm text-gray-500">Top up artist and label admin wallets</p>
              </div>
              <div className="flex items-center space-x-4">
                <CurrencySelector
                  selectedCurrency={selectedCurrency}
                  onCurrencyChange={updateCurrency}
                  compact={true}
                />
                <button
                  onClick={loadUsers}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-gray-500">Total Users</div>
              <div className="text-2xl font-bold text-gray-900">{summaryStats.totalUsers}</div>
              <div className="text-sm text-gray-600">All platform users</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-blue-600">Artists</div>
              <div className="text-2xl font-bold text-blue-900">{summaryStats.artists}</div>
              <div className="text-sm text-blue-700">With wallets</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-purple-600">Label Admins</div>
              <div className="text-2xl font-bold text-purple-900">{summaryStats.labelAdmins}</div>
              <div className="text-sm text-purple-700">With wallets</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-green-600">Total Wallet Value</div>
              <div className="text-2xl font-bold text-green-900">{sharedFormatCurrency(summaryStats.totalWalletValue, selectedCurrency)}</div>
              <div className="text-sm text-green-700">Across all wallets</div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <label htmlFor="user-type-filter" className="block text-sm font-medium text-gray-700 mb-1">
                  User Type
                </label>
                <select
                  id="user-type-filter"
                  value={selectedUserType}
                  onChange={(e) => setSelectedUserType(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Users</option>
                  <option value="artist">Artists</option>
                  <option value="label_admin">Label Admins</option>
                  <option value="distribution_partner">Distribution Partners</option>
                </select>
              </div>
              <div className="flex-1 min-w-64">
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                  Search
                </label>
                <input
                  id="search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, email, or artist name..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">User Wallets</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Wallet Balance</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loadingUsers ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-2 text-gray-500">Loading users...</p>
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                        {searchQuery || selectedUserType !== 'all' ? 'No users match your filters.' : 'No users found.'}
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((userData) => (
                      <tr key={userData.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center">
                              <span className="text-white text-sm font-bold">
                                {(userData.artistName || userData.firstName || userData.email).charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">
                                {userData.artistName || `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'No Name'}
                              </div>
                              {userData.artistName && (
                                <div className="text-xs text-gray-500">
                                  {`${userData.firstName || ''} ${userData.lastName || ''}`.trim()}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {userData.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            userData.role === 'artist'
                              ? 'bg-blue-100 text-blue-800'
                              : userData.role === 'label_admin'
                              ? 'bg-purple-100 text-purple-800'
                              : userData.role === 'distribution_partner'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {userData.role.replace('_', ' ').toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {sharedFormatCurrency(userData.totalEarnings || 0, selectedCurrency)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            userData.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {userData.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {['artist', 'label_admin'].includes(userData.role) && (
                            <button
                              onClick={() => {
                                setSelectedUser(userData);
                                setShowTopupModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Top Up Wallet
                            </button>
                          )}
                          {!['artist', 'label_admin'].includes(userData.role) && (
                            <span className="text-gray-400">No wallet</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Top-up Modal */}
      {showTopupModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 lg:w-1/3 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Wallet Management</h3>
                <button
                  onClick={() => setShowTopupModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">User Details:</div>
                  <div className="mt-2 space-y-1">
                    <div><strong>Name:</strong> {selectedUser.artistName || `${selectedUser.firstName} ${selectedUser.lastName}`}</div>
                    <div><strong>Email:</strong> {selectedUser.email}</div>
                    <div><strong>Role:</strong> {selectedUser.role.replace('_', ' ')}</div>
                    <div><strong>Current Balance:</strong> {sharedFormatCurrency(selectedUser.totalEarnings || 0, selectedCurrency)}</div>
                  </div>
                </div>

                {/* Operation Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Operation *
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="add"
                        checked={operation === 'add'}
                        onChange={(e) => setOperation(e.target.value)}
                        className="mr-2"
                      />
                      <span className="text-green-600 font-medium">Add Funds</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="subtract"
                        checked={operation === 'subtract'}
                        onChange={(e) => setOperation(e.target.value)}
                        className="mr-2"
                      />
                      <span className="text-red-600 font-medium">Subtract Funds</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount ({selectedCurrency}) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={topupAmount}
                    onChange={(e) => setTopupAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Negative Balance Settings */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-gray-700">
                      Allow Negative Balance
                    </label>
                    <input
                      type="checkbox"
                      checked={allowNegative}
                      onChange={(e) => setAllowNegative(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </div>
                  
                  {allowNegative && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Negative Balance Limit ({selectedCurrency})
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={negativeLimit}
                        onChange={(e) => setNegativeLimit(e.target.value)}
                        placeholder="e.g., 100.00 (user can go -£100)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Maximum amount the user can go into negative balance
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (optional)
                  </label>
                  <textarea
                    value={topupDescription}
                    onChange={(e) => setTopupDescription(e.target.value)}
                    rows="3"
                    placeholder="Reason for wallet top-up..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {topupAmount && parseFloat(topupAmount) > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="text-sm text-blue-800">
                      <strong>Action:</strong> This will add {sharedFormatCurrency(parseFloat(topupAmount), selectedCurrency)} to {selectedUser.artistName || selectedUser.firstName}'s wallet.
                      <br />
                      <strong>New Balance:</strong> {sharedFormatCurrency((selectedUser.totalEarnings || 0) + parseFloat(topupAmount), selectedCurrency)}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowTopupModal(false)}
                  disabled={processing}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleWalletAdjustment}
                  disabled={processing || !topupAmount || parseFloat(topupAmount) <= 0}
                  className={`px-4 py-2 text-white rounded-lg disabled:opacity-50 ${
                    operation === 'add' 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {processing ? 'Processing...' : `${operation === 'add' ? 'Add' : 'Subtract'} Funds`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notification Modal */}
      <NotificationModal
        isOpen={notificationModal.isOpen}
        onClose={closeNotificationModal}
        title={notificationModal.title}
        message={notificationModal.message}
        type={notificationModal.type}
        buttonText={notificationModal.buttonText}
      />
    </Layout>
  );
}
