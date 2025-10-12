/**
 * Super Admin User Management
 *
 * Features:
 * - List all users with role information
 * - Search and filter users
 * - Assign/change user roles
 * - View user details
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import MainLayout from '@/components/layouts/mainLayout';
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';
import {
  UserGroupIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  UserPlusIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

export default function UserManagement({ initialUsers, roles: initialRoles }) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers || []);
  const [roles, setRoles] = useState(initialRoles || []);
  const [filteredUsers, setFilteredUsers] = useState(initialUsers || []);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Load data client-side
  useEffect(() => {
    loadUsersAndRoles();
  }, []);

  const loadUsersAndRoles = async () => {
    try {
      setLoading(true);
      
      // Get auth token for API calls
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      );
      const { data: { session } } = await supabase.auth.getSession();
      
      const headers = {
        'Authorization': `Bearer ${session?.access_token}`
      };
      
      // Load users and roles in parallel
      const [usersResponse, rolesResponse] = await Promise.all([
        fetch('/api/superadmin/users/list', { headers }),
        fetch('/api/superadmin/roles/list', { headers })
      ]);

      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData.users || []);
      } else {
        const errorData = await usersResponse.json();
        console.error('Users API error:', errorData);
        setError('Failed to load users: ' + (errorData.error || 'Unknown error'));
      }

      if (rolesResponse.ok) {
        const rolesData = await rolesResponse.json();
        setRoles(rolesData.roles || []);
      } else {
        const errorData = await rolesResponse.json();
        console.error('Roles API error:', errorData);
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load users and roles: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter users based on search and role filter
  useEffect(() => {
    let filtered = users;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(user =>
        user.full_name?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query)
      );
    }

    // Role filter
    if (roleFilter) {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
  }, [searchQuery, roleFilter, users]);

  const handleEditRole = (user) => {
    setEditingUser(user);
    setSelectedRole(user.role || '');
    setShowEditModal(true);
    setError(null);
    setSuccess(null);
  };

  const handleUpdateRole = async () => {
    if (!editingUser || !selectedRole) return;

    // Prevent changing own role
    const currentUserEmail = localStorage.getItem('user_email');
    if (editingUser.email === currentUserEmail) {
      setError('You cannot change your own role (prevents self-lockout)');
      return;
    }

    setUpdating(true);
    setError(null);

    try {
      // Get auth token for API call
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      );
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(`/api/superadmin/users/${editingUser.id}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ role: selectedRole })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update role');
      }

      // Update local state
      setUsers(prevUsers =>
        prevUsers.map(u =>
          u.id === editingUser.id
            ? { ...u, role: selectedRole, role_display_name: roles.find(r => r.name === selectedRole)?.name }
            : u
        )
      );

      setSuccess(`Successfully updated ${editingUser.full_name || editingUser.email}'s role to ${selectedRole}`);
      setShowEditModal(false);
      setEditingUser(null);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      super_admin: 'bg-purple-100 text-purple-800',
      company_admin: 'bg-blue-100 text-blue-800',
      label_admin: 'bg-green-100 text-green-800',
      distribution_partner: 'bg-yellow-100 text-yellow-800',
      artist: 'bg-gray-100 text-gray-800',
      content_moderator: 'bg-orange-100 text-orange-800',
      financial_admin: 'bg-emerald-100 text-emerald-800',
      support_admin: 'bg-cyan-100 text-cyan-800',
      marketing_admin: 'bg-pink-100 text-pink-800',
      requests_admin: 'bg-indigo-100 text-indigo-800',
      release_admin: 'bg-violet-100 text-violet-800',
      roster_admin: 'bg-lime-100 text-lime-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <UserGroupIcon className="h-8 w-8 text-gray-700" />
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          </div>
          <p className="text-gray-600">Manage user accounts and role assignments</p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
            <CheckIcon className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-800">{success}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Role Filter */}
            <div className="sm:w-64">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Roles</option>
                {roles.map(role => (
                  <option key={role.name} value={role.name}>
                    {role.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-3 text-sm text-gray-600">
            Showing {filteredUsers.length} of {users.length} users
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Sign In
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-600 font-medium">
                              {user.full_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.full_name || 'No name set'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                        {user.role?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'No role'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.status || 'unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(user.last_sign_in_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleEditRole(user)}
                        className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                      >
                        <PencilSquareIcon className="h-4 w-4" />
                        Edit Role
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery || roleFilter ? 'Try adjusting your filters' : 'No users available'}
              </p>
            </div>
          )}
        </div>

        {/* Edit Role Modal */}
        {showEditModal && editingUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Edit User Role</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                {/* User Info */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm font-medium text-gray-700">
                    {editingUser.full_name || 'No name set'}
                  </p>
                  <p className="text-sm text-gray-600">{editingUser.email}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Current Role: <span className="font-medium">{editingUser.role?.replace(/_/g, ' ')}</span>
                  </p>
                </div>

                {/* Role Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Role
                  </label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select a role...</option>
                    {roles.map(role => (
                      <option key={role.name} value={role.name}>
                        {role.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        {role.description ? ` - ${role.description}` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Warning */}
                {selectedRole && selectedRole !== editingUser.role && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
                    <ExclamationTriangleIcon className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-amber-800">
                      <p className="font-medium">This will change their permissions</p>
                      <p className="mt-1">The user's access will be updated immediately.</p>
                    </div>
                  </div>
                )}

                {/* Error in modal */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
                    {error}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                  disabled={updating}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateRole}
                  disabled={!selectedRole || selectedRole === editingUser.role || updating}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updating ? 'Updating...' : 'Update Role'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

export async function getServerSideProps({ req, res }) {
  try {
    // Check authentication only - data will be loaded client-side
    const supabase = createPagesServerClient({ req, res });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return {
        redirect: {
          destination: '/login',
          permanent: false,
        },
      };
    }

    // Return empty props - data will be loaded client-side to avoid SSR API issues
    return {
      props: {
        initialUsers: [],
        roles: [],
      },
    };
  } catch (error) {
    console.error('Error loading user management page:', error);
    return {
      props: {
        initialUsers: [],
        roles: [],
      },
    };
  }
}
