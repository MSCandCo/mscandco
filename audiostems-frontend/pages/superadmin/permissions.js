/**
 * Superadmin Permissions & Roles Management
 *
 * Clean rebuild - Function by function
 * Requires: role:read:any permission
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import MainLayout from '@/components/layouts/mainLayout';
import { useUser } from '@/components/providers/SupabaseProvider';
import usePermissions from '@/hooks/usePermissions';
import { supabase } from '@/lib/supabase';
import {
  Shield,
  Users,
  Search,
  Loader2,
  XCircle,
} from 'lucide-react';
import {
  ArrowPathIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

export default function PermissionsPage() {
  const router = useRouter();
  const { user } = useUser();
  const { hasPermission, loading: permissionsLoading } = usePermissions();

  // State
  const [permissions, setPermissions] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [rolePermissions, setRolePermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedGroups, setExpandedGroups] = useState({});
  const [showResetModal, setShowResetModal] = useState(false);
  const [showCreateRoleModal, setShowCreateRoleModal] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDescription, setNewRoleDescription] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState(null);

  // Ultimate Super Admin protection
  const ULTIMATE_SUPER_ADMIN = 'superadmin@mscandco.com';
  const isUltimateSuperAdmin = user?.email === ULTIMATE_SUPER_ADMIN;

  // Check permission on mount
  useEffect(() => {
    if (!permissionsLoading && !hasPermission('role:read:any')) {
      router.push('/dashboard');
    }
  }, [permissionsLoading, hasPermission, router]);

  // Load data on mount
  useEffect(() => {
    if (!permissionsLoading && user && hasPermission('role:read:any')) {
      loadData();
    }
  }, [user, permissionsLoading]);

  /**
   * Load permissions and roles from database
   */
  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        throw new Error('No authentication token');
      }

      // Load permissions and roles in parallel
      const [permissionsRes, rolesRes] = await Promise.all([
        fetch('/api/admin/permissions/list', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/admin/roles/list', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (!permissionsRes.ok) {
        throw new Error('Failed to load permissions');
      }

      if (!rolesRes.ok) {
        throw new Error('Failed to load roles');
      }

      const permissionsData = await permissionsRes.json();
      const rolesData = await rolesRes.json();

      setPermissions(permissionsData.permissions || []);
      setRoles(rolesData.roles || []);

      // Auto-select first role
      if (rolesData.roles && rolesData.roles.length > 0) {
        selectRole(rolesData.roles[0]);
      }

      setLoading(false);
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  const selectRole = async (role) => {
    try {
      setSelectedRole(role);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const response = await fetch(`/api/admin/roles/${role.id}/permissions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error(`Failed to load role permissions: ${response.status}`);
      }

      const data = await response.json();
      setRolePermissions(data.permissions || []);

      // Collapse all groups by default
      setExpandedGroups({});

    } catch (err) {
      console.error('Error loading role permissions:', err);
      setError(err.message);
    }
  };

  const togglePermission = async (permission) => {
    // Protect Ultimate Super Admin from losing permissions
    if (selectedRole?.name === 'super_admin' && user?.email === ULTIMATE_SUPER_ADMIN) {
      alert('Cannot modify Ultimate Super Admin permissions');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const hasPermission = rolePermissions.some(p => p.permission_name === permission.name);
      const method = hasPermission ? 'DELETE' : 'POST';
      const endpoint = `/api/admin/roles/${selectedRole.id}/permissions/${permission.id}`;

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to ${hasPermission ? 'remove' : 'add'} permission`);
      }

      // Reload role permissions
      await selectRole(selectedRole);

    } catch (err) {
      console.error('Error toggling permission:', err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleResetClick = () => {
    if (!selectedRole) return;

    // Protect Ultimate Super Admin
    if (selectedRole.name === 'super_admin' && user?.email === ULTIMATE_SUPER_ADMIN) {
      alert('Cannot reset Ultimate Super Admin permissions');
      return;
    }

    setShowResetModal(true);
  };

  const confirmReset = async () => {
    try {
      setSaving(true);
      setError(null);
      setShowResetModal(false);

      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const response = await fetch(`/api/admin/roles/${selectedRole.id}/reset-default`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Failed to reset permissions');
      }

      // Reload role permissions
      await selectRole(selectedRole);

    } catch (err) {
      console.error('Error resetting permissions:', err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateRole = () => {
    setNewRoleName('');
    setNewRoleDescription('');
    setSelectedPermissions([]);
    setShowCreateRoleModal(true);
  };

  const togglePermissionSelection = (permissionId) => {
    setSelectedPermissions(prev =>
      prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const createRole = async () => {
    if (!newRoleName.trim()) {
      setError('Role name is required');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const response = await fetch('/api/admin/roles/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: newRoleName.toLowerCase().replace(/\s+/g, '_'),
          description: newRoleDescription,
          permission_ids: selectedPermissions
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create role');
      }

      // Close modal and reload data
      setShowCreateRoleModal(false);
      await loadData();

    } catch (err) {
      console.error('Error creating role:', err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRole = (role) => {
    setRoleToDelete(role);
    setShowDeleteModal(true);
  };

  const confirmDeleteRole = async () => {
    if (!roleToDelete) return;

    try {
      setSaving(true);
      setError(null);
      setShowDeleteModal(false);

      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const response = await fetch(`/api/admin/roles/${roleToDelete.id}/delete`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete role');
      }

      // Reload data
      await loadData();

    } catch (err) {
      console.error('Error deleting role:', err);
      setError(err.message);
    } finally {
      setSaving(false);
      setRoleToDelete(null);
    }
  };

  // Group permissions by resource
  const groupedPermissions = permissions.reduce((groups, permission) => {
    const resource = permission.name.split(':')[0] || 'other';
    if (!groups[resource]) {
      groups[resource] = [];
    }
    groups[resource].push(permission);
    return groups;
  }, {});

  // Filter permissions by search term
  const filteredGroups = Object.entries(groupedPermissions).reduce((filtered, [resource, perms]) => {
    const matchingPerms = perms.filter(p =>
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (matchingPerms.length > 0) {
      filtered[resource] = matchingPerms;
    }
    return filtered;
  }, {});

  // Move wildcard to bottom
  const sortedGroups = Object.entries(filteredGroups).sort(([a], [b]) => {
    if (a === '*') return 1;
    if (b === '*') return -1;
    return a.localeCompare(b);
  });

  // Check if role has wildcard permission
  const hasWildcard = rolePermissions.some(p => p.permission_name === '*:*:*');

  // Separate standard and custom roles
  const standardRoleNames = ['super_admin', 'company_admin', 'label_admin', 'artist', 'distribution_partner'];
  const systemRoles = roles.filter(role => standardRoleNames.includes(role.name));
  const customRoles = roles.filter(role => !standardRoleNames.includes(role.name));

  // Show loading state
  if (permissionsLoading || loading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading permissions...</p>
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
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
                <Shield className="h-8 w-8 mr-3 text-blue-600" />
                Permissions & Roles
              </h1>
              <p className="mt-2 text-gray-600">
                Manage role-based access control and permissions
              </p>
            </div>
            <button
              onClick={loadData}
              disabled={loading}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <ArrowPathIcon className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2" />
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Roles Panel - LEFT SIDE */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Roles
                </h2>
              </div>

              {/* System Roles */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">System Roles</h3>
                <div className="space-y-2">
                  {systemRoles.map((role) => (
                    <button
                      key={role.id}
                      onClick={() => selectRole(role)}
                      className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
                        selectedRole?.id === role.id
                          ? 'bg-blue-600 text-white border-blue-600 shadow-lg'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">
                            {role.name.replace('_', ' ').toUpperCase()}
                          </div>
                          <div className={`text-sm ${
                            selectedRole?.id === role.id ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            {role.permission_count || 0} permissions
                          </div>
                        </div>
                        {role.name === 'super_admin' && user?.email === ULTIMATE_SUPER_ADMIN && (
                          <div className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                            ULTIMATE
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Roles Section */}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-700">Custom Roles</h3>
                  <button
                    onClick={handleCreateRole}
                    className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    + Create
                  </button>
                </div>

                {customRoles.length === 0 ? (
                  <p className="text-xs text-gray-500 text-center py-3">No custom roles yet</p>
                ) : (
                  <div className="space-y-2">
                    {customRoles.map((role) => (
                      <div
                        key={role.id}
                        className={`rounded-lg border transition-colors ${
                          selectedRole?.id === role.id
                            ? 'bg-blue-600 text-white border-blue-600 shadow-lg'
                            : 'bg-white text-gray-700 border-gray-200'
                        }`}
                      >
                        <button
                          onClick={() => selectRole(role)}
                          className="w-full text-left px-4 py-3 hover:bg-opacity-90 rounded-t-lg"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">
                                {role.name.replace('_', ' ').toUpperCase()}
                              </div>
                              <div className={`text-sm ${
                                selectedRole?.id === role.id ? 'text-blue-100' : 'text-gray-500'
                              }`}>
                                {role.permission_count || 0} permissions
                              </div>
                            </div>
                          </div>
                        </button>
                        <div className="px-4 pb-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteRole(role);
                            }}
                            className={`text-xs px-2 py-1 rounded transition-colors ${
                              selectedRole?.id === role.id
                                ? 'bg-red-500 text-white hover:bg-red-600'
                                : 'bg-red-50 text-red-600 hover:bg-red-100'
                            }`}
                          >
                            Delete Role
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Permissions Panel - RIGHT SIDE */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              {selectedRole ? (
                <>
                  {/* Role Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        {selectedRole.name.replace('_', ' ').toUpperCase()} Permissions
                      </h2>
                      <p className="text-sm text-gray-600">
                        {rolePermissions.length} permissions assigned
                      </p>
                    </div>
                    <button
                      onClick={handleResetClick}
                      disabled={saving || (selectedRole.name === 'super_admin' && isUltimateSuperAdmin)}
                      className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                    >
                      Reset to Default
                    </button>
                  </div>

                  {/* Search */}
                  <div className="mb-6">
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search permissions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-6 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Permissions Groups */}
                  <div className="space-y-4">
                    {sortedGroups.map(([resource, resourcePermissions]) => (
                      <PermissionGroup
                        key={resource}
                        resource={resource}
                        permissions={resourcePermissions}
                        rolePermissions={rolePermissions}
                        hasWildcard={hasWildcard}
                        expandedGroups={expandedGroups}
                        setExpandedGroups={setExpandedGroups}
                        togglePermission={togglePermission}
                        saving={saving}
                        isProtected={selectedRole.name === 'super_admin' && isUltimateSuperAdmin}
                      />
                    ))}
                  </div>

                  {sortedGroups.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No permissions found matching "{searchTerm}"
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Shield className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Select a role to manage permissions</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                  <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Reset to Default Permissions?</h3>
              </div>

              <p className="text-gray-600 mb-6">
                Are you sure you want to reset <span className="font-semibold">{selectedRole?.name.replace('_', ' ').toUpperCase()}</span> to its default permissions? This will remove all custom permission assignments.
              </p>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowResetModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmReset}
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50"
                >
                  {saving ? 'Resetting...' : 'Reset to Default'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Role Modal */}
      {showDeleteModal && roleToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Custom Role?</h3>
              </div>

              <p className="text-gray-600 mb-6">
                Are you sure you want to delete <span className="font-semibold">{roleToDelete.name.replace('_', ' ').toUpperCase()}</span>?
                This will remove all users assigned to this role and cannot be undone.
              </p>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setRoleToDelete(null);
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteRole}
                  disabled={saving}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors disabled:opacity-50"
                >
                  {saving ? 'Deleting...' : 'Delete Role'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Role Modal */}
      {showCreateRoleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 my-8">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Create Custom Role</h3>
                  <p className="text-sm text-gray-600">Define a new role with specific permissions</p>
                </div>
              </div>

              {/* Role Details */}
              <div className="mb-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role Name *
                  </label>
                  <input
                    type="text"
                    value={newRoleName}
                    onChange={(e) => setNewRoleName(e.target.value)}
                    placeholder="e.g., Content Manager, Regional Admin"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Will be converted to: {newRoleName ? newRoleName.toLowerCase().replace(/\s+/g, '_') : 'example_role'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (optional)
                  </label>
                  <textarea
                    value={newRoleDescription}
                    onChange={(e) => setNewRoleDescription(e.target.value)}
                    placeholder="Describe the purpose and responsibilities of this role"
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Permissions Selection */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-700">
                    Select Permissions ({selectedPermissions.length} selected)
                  </h4>
                  <button
                    onClick={() => setSelectedPermissions([])}
                    className="text-xs text-blue-600 hover:text-blue-700"
                  >
                    Clear All
                  </button>
                </div>

                {/* Permission Groups */}
                <div className="border border-gray-200 rounded-lg max-h-96 overflow-y-auto">
                  {Object.entries(groupedPermissions).sort(([a], [b]) => {
                    if (a === '*') return 1;
                    if (b === '*') return -1;
                    return a.localeCompare(b);
                  }).map(([resource, resourcePermissions]) => {
                    const allSelected = resourcePermissions.every(p => selectedPermissions.includes(p.id));
                    const someSelected = resourcePermissions.some(p => selectedPermissions.includes(p.id));

                    return (
                      <div key={resource} className="border-b border-gray-200 last:border-b-0">
                        {/* Resource Header with Select All */}
                        <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={allSelected}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedPermissions(prev => [
                                    ...prev,
                                    ...resourcePermissions.filter(p => !prev.includes(p.id)).map(p => p.id)
                                  ]);
                                } else {
                                  setSelectedPermissions(prev =>
                                    prev.filter(id => !resourcePermissions.find(p => p.id === id))
                                  );
                                }
                              }}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <span className="font-medium text-gray-900 capitalize">
                              {resource === '*' ? 'Wildcard (All Permissions)' : `${resource} Permissions`}
                            </span>
                          </div>
                          <span className="text-sm text-gray-500">
                            {resourcePermissions.filter(p => selectedPermissions.includes(p.id)).length}/{resourcePermissions.length}
                          </span>
                        </div>

                        {/* Individual Permissions */}
                        <div className="p-2">
                          {resourcePermissions.map((permission) => (
                            <label
                              key={permission.id}
                              className="flex items-start gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={selectedPermissions.includes(permission.id)}
                                onChange={() => togglePermissionSelection(permission.id)}
                                className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-gray-900">
                                  {permission.name}
                                </div>
                                {permission.description && (
                                  <div className="text-xs text-gray-600 mt-0.5">
                                    {permission.description}
                                  </div>
                                )}
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-center">
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2" />
                    <span className="text-sm text-red-800">{error}</span>
                  </div>
                </div>
              )}

              {/* Modal Actions */}
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowCreateRoleModal(false);
                    setError(null);
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={createRole}
                  disabled={saving || !newRoleName.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50"
                >
                  {saving ? 'Creating...' : 'Create Role'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}

/**
 * Permission Group Component
 */
function PermissionGroup({
  resource,
  permissions,
  rolePermissions,
  hasWildcard,
  expandedGroups,
  setExpandedGroups,
  togglePermission,
  saving,
  isProtected
}) {
  return (
    <div className="border border-gray-200 rounded-lg">
      <button
        onClick={() => setExpandedGroups(prev => ({
          ...prev,
          [resource]: !prev[resource]
        }))}
        className="w-full px-4 py-3 text-left bg-gray-50 hover:bg-gray-100 rounded-t-lg flex items-center justify-between"
      >
        <span className="font-medium text-gray-900 capitalize">
          {resource === '*' ? 'Wildcard (All Permissions)' : `${resource} Permissions`}
        </span>
        <span className="text-sm text-gray-500">
          {permissions.length} permissions
        </span>
      </button>

      {expandedGroups[resource] && (
        <div className="p-4 space-y-2">
          {permissions.map((permission) => {
            const isGranted = rolePermissions.some(p => p.permission_name === permission.name);
            const isWildcardGranted = hasWildcard && permission.name !== '*:*:*';
            const effectivelyGranted = isGranted || isWildcardGranted;

            return (
              <div
                key={permission.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    {permission.name}
                  </div>
                  {permission.description && (
                    <div className="text-sm text-gray-600">
                      {permission.description}
                    </div>
                  )}
                  {isWildcardGranted && (
                    <div className="text-xs text-blue-600 mt-1">
                      Granted via wildcard permission
                    </div>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePermission(permission);
                  }}
                  disabled={saving || isProtected || isWildcardGranted}
                  className={`ml-4 w-12 h-6 rounded-full transition-colors relative ${
                    effectivelyGranted
                      ? 'bg-green-500'
                      : 'bg-gray-300'
                  } ${
                    isProtected || isWildcardGranted ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                      effectivelyGranted ? 'translate-x-6' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
