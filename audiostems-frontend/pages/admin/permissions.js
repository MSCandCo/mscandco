import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '@/components/providers/SupabaseProvider';
import MainLayout from '@/components/layouts/mainLayout';
import { supabase } from '@/lib/supabase';
import usePermissions from '@/hooks/usePermissions';
import {
  ShieldCheckIcon,
  UserGroupIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

export default function PermissionsPage() {
  const router = useRouter();
  const { user, isLoading } = useUser();
  const { hasPermission, loading: permissionsLoading } = usePermissions();

  // State management
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [rolePermissions, setRolePermissions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedGroups, setExpandedGroups] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Ultimate Super Admin protection
  const ULTIMATE_SUPER_ADMIN = 'superadmin@mscandco.com';
  const isUltimateSuperAdmin = user?.email === ULTIMATE_SUPER_ADMIN;

  // Authentication and permission check
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
    if (!permissionsLoading && !hasPermission('role:read:any')) {
      router.push('/dashboard');
    }
  }, [user, isLoading, permissionsLoading, hasPermission, router]);

  // Load initial data
  useEffect(() => {
    if (!permissionsLoading && user && hasPermission('role:read:any')) {
      loadData();
    }
  }, [user, permissionsLoading, hasPermission]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        throw new Error('No authentication token');
      }

      // Load roles and permissions in parallel
      const [rolesResponse, permissionsResponse] = await Promise.all([
        fetch('/api/admin/roles/list', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/admin/permissions/list', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (!rolesResponse.ok) {
        throw new Error(`Failed to load roles: ${rolesResponse.status}`);
      }

      if (!permissionsResponse.ok) {
        throw new Error(`Failed to load permissions: ${permissionsResponse.status}`);
      }

      const rolesData = await rolesResponse.json();
      const permissionsData = await permissionsResponse.json();

      setRoles(rolesData.roles || []);
      setPermissions(permissionsData.permissions || []);

      // Auto-select first role
      if (rolesData.roles && rolesData.roles.length > 0) {
        selectRole(rolesData.roles[0]);
      }

    } catch (err) {
      console.error('Error loading data:', err);
      setError(err.message);
    } finally {
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

  const resetToDefault = async () => {
    if (!selectedRole) return;

    // Protect Ultimate Super Admin
    if (selectedRole.name === 'super_admin' && user?.email === ULTIMATE_SUPER_ADMIN) {
      alert('Cannot reset Ultimate Super Admin permissions');
      return;
    }

    if (!confirm(`Reset ${selectedRole.name} to default permissions?`)) {
      return;
    }

    try {
      setSaving(true);
      setError(null);

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

  if (isLoading || permissionsLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800"></div>
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
                <ShieldCheckIcon className="h-8 w-8 mr-3 text-blue-600" />
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
          {/* Roles Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <UserGroupIcon className="h-5 w-5 mr-2" />
                  Roles
                </h2>
              </div>

              <div className="space-y-2">
                {roles.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => selectRole(role)}
                    className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
                      selectedRole?.id === role.id
                        ? 'bg-gray-800 text-white border-2 border-gray-800 shadow-lg'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">
                          {role.name.replace('_', ' ').toUpperCase()}
                        </div>
                        <div className={`text-sm ${
                          selectedRole?.id === role.id ? 'text-gray-300' : 'text-gray-500'
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

              {/* Custom Roles Section */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-700">Custom Roles</h3>
                  <button className="flex items-center text-xs text-blue-600 hover:text-blue-700">
                    <PlusIcon className="h-3 w-3 mr-1" />
                    Add
                  </button>
                </div>
                <p className="text-xs text-gray-500">Create custom roles with specific permissions</p>
              </div>
            </div>
          </div>

          {/* Permissions Panel */}
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
                      onClick={resetToDefault}
                      disabled={saving || (selectedRole.name === 'super_admin' && isUltimateSuperAdmin)}
                      className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                    >
                      Reset to Default
                    </button>
                  </div>

                  {/* Search */}
                  <div className="mb-6">
                    <div className="relative">
                      <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
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
                      <div key={resource} className="border border-gray-200 rounded-lg">
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
                            {resourcePermissions.length} permissions
                          </span>
                        </button>

                        {expandedGroups[resource] && (
                          <div className="p-4 space-y-2">
                            {resourcePermissions.map((permission) => {
                              const isGranted = rolePermissions.some(p => p.permission_name === permission.name);
                              const isWildcardGranted = hasWildcard && permission.name !== '*:*:*';
                              const effectivelyGranted = isGranted || isWildcardGranted;
                              const isProtected = selectedRole.name === 'super_admin' && isUltimateSuperAdmin;

                              return (
                                <div
                                  key={permission.id}
                                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
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
                                    onClick={() => togglePermission(permission)}
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
                  <ShieldCheckIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Select a role to manage permissions</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}