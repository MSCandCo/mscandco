/**
 * Superadmin User Management
 *
 * View and manage all users, assign roles
 * Requires: user:read:any permission
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import MainLayout from '@/components/layouts/mainLayout';
import { useUser } from '@/components/providers/SupabaseProvider';
import usePermissions from '@/hooks/usePermissions';
import { supabase } from '@/lib/supabase';
import {
  Users,
  Search,
  Loader2,
  XCircle,
  RefreshCw,
  AlertTriangle,
  UserCircle,
  Mail,
  Calendar,
  CheckCircle,
  Clock,
  UserCheck,
  UserX,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';

export default function UserManagementPage() {
  const router = useRouter();
  const { user } = useUser();
  const { hasPermission, loading: permissionsLoading } = usePermissions();

  // State
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [newRole, setNewRole] = useState('');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusAction, setStatusAction] = useState(null); // 'activate' or 'deactivate'
  const [sortColumn, setSortColumn] = useState('created_at'); // Default sort by creation date
  const [sortDirection, setSortDirection] = useState('desc'); // 'asc' or 'desc'
  const [showQuickRoleModal, setShowQuickRoleModal] = useState(false);
  const [quickRoleChange, setQuickRoleChange] = useState(null); // { user, oldRole, newRole }

  // Check permission on mount
  useEffect(() => {
    if (!permissionsLoading && !hasPermission('user:read:any')) {
      console.log('❌ Missing user:read:any permission, redirecting to dashboard');
      router.push('/dashboard');
    }
  }, [permissionsLoading, hasPermission, router]);

  // Load data on mount
  useEffect(() => {
    if (!permissionsLoading && user && hasPermission('user:read:any')) {
      loadData();
    }
  }, [user, permissionsLoading]);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        throw new Error('No authentication token');
      }

      // Load users and roles in parallel
      const [usersRes, rolesRes] = await Promise.all([
        fetch('/api/admin/users/list', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/admin/roles/list', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (!usersRes.ok) {
        throw new Error('Failed to load users');
      }

      if (!rolesRes.ok) {
        throw new Error('Failed to load roles');
      }

      const usersData = await usersRes.json();
      const rolesData = await rolesRes.json();

      setUsers(usersData.users || []);
      setRoles(rolesData.roles || []);
      setLoading(false);

    } catch (err) {
      console.error('Error loading data:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  const handleChangeRole = (user) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setShowRoleModal(true);
  };

  const confirmRoleChange = async () => {
    if (!selectedUser || !newRole) return;

    try {
      setSaving(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const response = await fetch(`/api/admin/users/${selectedUser.id}/update-role`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: newRole })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update role');
      }

      const result = await response.json();

      // Update local state
      setUsers(users.map(u =>
        u.id === selectedUser.id ? { ...u, role: newRole } : u
      ));

      // Broadcast role change to user's active sessions (for immediate badge update)
      if (typeof window !== 'undefined') {
        const roleChangeEvent = {
          type: 'ROLE_UPDATED',
          userId: selectedUser.id,
          email: selectedUser.email,
          newRole: newRole,
          timestamp: Date.now()
        };
        
        // Broadcast to all tabs via localStorage
        localStorage.setItem('user_role_update', JSON.stringify(roleChangeEvent));
        setTimeout(() => localStorage.removeItem('user_role_update'), 100);
        
        console.log(`📢 Broadcast role change for ${selectedUser.email} to ${newRole}`);
      }

      setShowRoleModal(false);
      setSelectedUser(null);

    } catch (err) {
      console.error('Error updating role:', err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = (user, action) => {
    setSelectedUser(user);
    setStatusAction(action);
    setShowStatusModal(true);
  };

  const confirmStatusChange = async () => {
    if (!selectedUser || !statusAction) return;

    try {
      setSaving(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const response = await fetch(`/api/admin/users/${selectedUser.id}/update-status`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: statusAction })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update status');
      }

      // Update local state
      const newStatus = statusAction === 'activate' ? 'active' : 'pending';
      setUsers(users.map(u =>
        u.id === selectedUser.id ? { ...u, status: newStatus } : u
      ));

      setShowStatusModal(false);
      setSelectedUser(null);
      setStatusAction(null);

    } catch (err) {
      console.error('Error updating status:', err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSort = (column) => {
    if (sortColumn === column) {
      // Toggle direction if clicking the same column
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New column, default to ascending
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (column) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="h-4 w-4 text-gray-400" />;
    }
    return sortDirection === 'asc'
      ? <ArrowUp className="h-4 w-4 text-gray-700" />
      : <ArrowDown className="h-4 w-4 text-gray-700" />;
  };

  // System roles that should be shown separately
  const systemRoles = ['artist', 'label_admin', 'company_admin', 'super_admin', 'distribution_partner'];

  // Filter and sort users
  const filteredUsers = users
    .filter(user => {
      const matchesSearch =
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.last_name?.toLowerCase().includes(searchTerm.toLowerCase());

      let matchesRole = false;
      if (roleFilter === 'all') {
        matchesRole = true;
      } else if (roleFilter === 'custom_admin') {
        // Custom admin is any role that's not in the system roles list
        matchesRole = !systemRoles.includes(user.role);
      } else {
        matchesRole = user.role === roleFilter;
      }

      return matchesSearch && matchesRole;
    })
    .sort((a, b) => {
      let aValue, bValue;

      switch (sortColumn) {
        case 'name':
          aValue = a.full_name?.toLowerCase() || '';
          bValue = b.full_name?.toLowerCase() || '';
          break;
        case 'email':
          aValue = a.email?.toLowerCase() || '';
          bValue = b.email?.toLowerCase() || '';
          break;
        case 'role':
          aValue = a.role?.toLowerCase() || '';
          bValue = b.role?.toLowerCase() || '';
          break;
        case 'status':
          aValue = a.status?.toLowerCase() || '';
          bValue = b.status?.toLowerCase() || '';
          break;
        case 'created_at':
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  // Get counts for each role type
  const getRoleCounts = () => {
    const counts = {
      all: users.length,
      artist: 0,
      label_admin: 0,
      company_admin: 0,
      super_admin: 0,
      distribution_partner: 0,
      custom_admin: 0
    };

    users.forEach(user => {
      if (systemRoles.includes(user.role)) {
        counts[user.role] = (counts[user.role] || 0) + 1;
      } else {
        counts.custom_admin += 1;
      }
    });

    return counts;
  };

  const roleCounts = getRoleCounts();

  // Show loading state
  if (permissionsLoading || loading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-gray-700 mx-auto mb-4" />
            <p className="text-gray-600">Loading users...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Show error state
  if (error) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <XCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Data</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={loadData}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800"
            >
              Retry
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Users className="h-8 w-8 mr-3 text-gray-700" />
                User Management
              </h1>
              <p className="mt-2 text-gray-600">
                View and manage all platform users and their roles
              </p>
            </div>
            <button
              onClick={loadData}
              disabled={loading}
              className="flex items-center px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {/* Icon Legend */}
          <div className="mt-4 flex items-center gap-6 text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
            <span className="font-medium text-gray-700">Actions:</span>
            <div className="flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-green-600" />
              <span>Activate User</span>
            </div>
            <div className="flex items-center gap-2">
              <UserX className="h-4 w-4 text-orange-600" />
              <span>Deactivate User</span>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-700"
                style={{ maxWidth: '300px' }}
              />
            </div>

            {/* Role Filter */}
            <div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-700"
              >
                <option value="all">All Roles ({roleCounts.all})</option>
                <optgroup label="System Roles">
                  {roleCounts.artist > 0 && (
                    <option value="artist">Artist ({roleCounts.artist})</option>
                  )}
                  {roleCounts.label_admin > 0 && (
                    <option value="label_admin">Label Admin ({roleCounts.label_admin})</option>
                  )}
                  {roleCounts.company_admin > 0 && (
                    <option value="company_admin">Company Admin ({roleCounts.company_admin})</option>
                  )}
                  {roleCounts.super_admin > 0 && (
                    <option value="super_admin">Super Admin ({roleCounts.super_admin})</option>
                  )}
                  {roleCounts.distribution_partner > 0 && (
                    <option value="distribution_partner">Distribution Partner ({roleCounts.distribution_partner})</option>
                  )}
                </optgroup>
                {roleCounts.custom_admin > 0 && (
                  <optgroup label="Custom Roles">
                    <option value="custom_admin">Custom Admin Roles ({roleCounts.custom_admin})</option>
                  </optgroup>
                )}
              </select>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredUsers.length} of {users.length} users
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('name')}
                      className="flex items-center gap-2 hover:text-gray-700 transition-colors"
                    >
                      User
                      {getSortIcon('name')}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('email')}
                      className="flex items-center gap-2 hover:text-gray-700 transition-colors"
                    >
                      Email
                      {getSortIcon('email')}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('role')}
                      className="flex items-center gap-2 hover:text-gray-700 transition-colors"
                    >
                      Role
                      {getSortIcon('role')}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('status')}
                      className="flex items-center gap-2 hover:text-gray-700 transition-colors"
                    >
                      Status
                      {getSortIcon('status')}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('created_at')}
                      className="flex items-center gap-2 hover:text-gray-700 transition-colors"
                    >
                      Joined
                      {getSortIcon('created_at')}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <UserCircle className="h-10 w-10 text-gray-400" />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.full_name || 'No name'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.first_name} {user.last_name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Mail className="h-4 w-4 mr-2 text-gray-400" />
                        {user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={user.role}
                        onChange={(e) => {
                          const newRoleValue = e.target.value;
                          if (newRoleValue === user.role) return;

                          // Show branded confirmation modal
                          setQuickRoleChange({
                            user: user,
                            oldRole: user.role,
                            newRole: newRoleValue
                          });
                          setShowQuickRoleModal(true);

                          // Reset dropdown to current value (will update if confirmed)
                          e.target.value = user.role;
                        }}
                        disabled={saving}
                        className="px-3 py-1 text-xs font-semibold rounded-lg bg-gray-100 text-gray-800 border border-gray-300 hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:outline-none disabled:opacity-50 cursor-pointer"
                      >
                        {roles.map((role) => (
                          <option key={role.id} value={role.name}>
                            {role.name.replace(/_/g, ' ').toUpperCase()}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.status === 'active' ? (
                        <span className="flex items-center text-sm text-green-600">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Active
                        </span>
                      ) : (
                        <span className="flex items-center text-sm text-yellow-600">
                          <Clock className="h-4 w-4 mr-1" />
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        {new Date(user.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => handleChangeRole(user)}
                          disabled={saving}
                          className="text-gray-700 hover:text-gray-900 font-medium disabled:opacity-50"
                        >
                          Change Role
                        </button>
                        <span className="text-gray-300">|</span>
                        {user.status === 'pending' ? (
                          <button
                            onClick={() => handleStatusChange(user, 'activate')}
                            disabled={saving}
                            className="text-green-600 hover:text-green-800 disabled:opacity-50 transition-colors"
                            title="Activate user"
                          >
                            <UserCheck className="h-5 w-5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStatusChange(user, 'deactivate')}
                            disabled={saving}
                            className="text-orange-600 hover:text-orange-800 disabled:opacity-50 transition-colors"
                            title="Deactivate user"
                          >
                            <UserX className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No users found matching your filters</p>
            </div>
          )}
        </div>
      </div>

      {/* Change Role Modal */}
      {showRoleModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                  <Users className="h-6 w-6 text-gray-700" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Change User Role</h3>
                  <p className="text-sm text-gray-600">{selectedUser.email}</p>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select New Role
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-700"
                >
                  {roles.map((role) => (
                    <option key={role.id} value={role.name}>
                      {role.name.replace('_', ' ').toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-center">
                    <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
                    <span className="text-sm text-red-800">{error}</span>
                  </div>
                </div>
              )}

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowRoleModal(false);
                    setSelectedUser(null);
                    setError(null);
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmRoleChange}
                  disabled={saving || newRole === selectedUser.role}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 font-medium transition-colors disabled:opacity-50"
                >
                  {saving ? 'Updating...' : 'Update Role'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Role Change Modal */}
      {showQuickRoleModal && quickRoleChange && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                  <Users className="h-6 w-6 text-gray-700" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Change User Role</h3>
                  <p className="text-sm text-gray-600">{quickRoleChange.user.email}</p>
                </div>
              </div>

              <div className="mb-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-700 mb-3">
                  Change role from <strong className="text-gray-900">{quickRoleChange.oldRole.replace(/_/g, ' ').toUpperCase()}</strong> to <strong className="text-gray-900">{quickRoleChange.newRole.replace(/_/g, ' ').toUpperCase()}</strong>?
                </p>
                {user && user.id === quickRoleChange.user.id ? (
                  <p className="text-xs text-gray-600">
                    This will change your own role. The page will reload to apply the changes.
                  </p>
                ) : (
                  <p className="text-xs text-gray-600">
                    User must logout and login again to see the new role badge in the header.
                  </p>
                )}
              </div>

              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-center">
                    <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
                    <span className="text-sm text-red-800">{error}</span>
                  </div>
                </div>
              )}

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowQuickRoleModal(false);
                    setQuickRoleChange(null);
                    setError(null);
                  }}
                  disabled={saving}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    try {
                      setSaving(true);
                      setError(null);

                      const { data: { session } } = await supabase.auth.getSession();
                      const token = session?.access_token;

                      const response = await fetch(`/api/admin/users/${quickRoleChange.user.id}/update-role`, {
                        method: 'POST',
                        headers: {
                          'Authorization': `Bearer ${token}`,
                          'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ role: quickRoleChange.newRole })
                      });

                      if (!response.ok) {
                        const data = await response.json();
                        throw new Error(data.error || 'Failed to update role');
                      }

                      // Update local state
                      setUsers(users.map(u =>
                        u.id === quickRoleChange.user.id ? { ...u, role: quickRoleChange.newRole } : u
                      ));

                      // If this is the current user, update their session context immediately
                      if (user && user.id === quickRoleChange.user.id) {
                        // Trigger a page reload to refresh the auth context
                        window.location.reload();
                      }

                      setShowQuickRoleModal(false);
                      setQuickRoleChange(null);
                    } catch (err) {
                      console.error('Error updating role:', err);
                      setError(err.message);
                    } finally {
                      setSaving(false);
                    }
                  }}
                  disabled={saving}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 font-medium transition-colors disabled:opacity-50"
                >
                  {saving ? 'Updating...' : 'Confirm Change'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Change Status Modal */}
      {showStatusModal && selectedUser && statusAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  statusAction === 'activate' ? 'bg-green-100' : 'bg-orange-100'
                }`}>
                  {statusAction === 'activate' ? (
                    <UserCheck className="h-6 w-6 text-green-600" />
                  ) : (
                    <UserX className="h-6 w-6 text-orange-600" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {statusAction === 'activate' ? 'Activate User' : 'Deactivate User'}
                  </h3>
                  <p className="text-sm text-gray-600">{selectedUser.email}</p>
                </div>
              </div>

              <div className="mb-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-700">
                  {statusAction === 'activate' ? (
                    <>
                      This will <strong>manually confirm</strong> the user's email address and grant them immediate access to the platform.
                    </>
                  ) : (
                    <>
                      This will <strong>revoke the email confirmation</strong> and require the user to verify their email again before accessing the platform.
                    </>
                  )}
                </p>
              </div>

              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-center">
                    <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
                    <span className="text-sm text-red-800">{error}</span>
                  </div>
                </div>
              )}

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowStatusModal(false);
                    setSelectedUser(null);
                    setStatusAction(null);
                    setError(null);
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmStatusChange}
                  disabled={saving}
                  className={`px-4 py-2 text-white rounded-lg font-medium transition-colors disabled:opacity-50 ${
                    statusAction === 'activate'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-orange-600 hover:bg-orange-700'
                  }`}
                >
                  {saving ? 'Processing...' : (statusAction === 'activate' ? 'Activate User' : 'Deactivate User')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
