import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '@/components/providers/SupabaseProvider';
import { supabase } from '@/lib/supabase';
// import { MASTER_ADMIN_ID } from '@/lib/permissions'; // Remove this for now
import MainLayout from '@/components/layouts/mainLayout';
import {
  CheckIcon,
  XMarkIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

export default function PermissionsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useUser();

  // State
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [groupedPermissions, setGroupedPermissions] = useState({});
  const [expandedGroups, setExpandedGroups] = useState({});
  const [loading, setLoading] = useState(true);
  const [permissionsLoading, setPermissionsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [togglingPermission, setTogglingPermission] = useState(null);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  // Form state
  const [roleForm, setRoleForm] = useState({ name: '', description: '' });
  const [formErrors, setFormErrors] = useState({});

  // Toast state
  const [toast, setToast] = useState(null);

  // Auth check
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Load roles on mount
  useEffect(() => {
    if (user) {
      loadRoles();
    }
  }, [user]);

  // Auto-collapse all groups initially
  useEffect(() => {
    if (Object.keys(groupedPermissions).length > 0) {
      const allCollapsed = {};
      Object.keys(groupedPermissions).forEach(key => {
        allCollapsed[key] = false;
      });
      setExpandedGroups(allCollapsed);
    }
  }, [groupedPermissions]);

  // Helper to get auth headers
  const getAuthHeaders = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      throw new Error('No active session');
    }
    return {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json'
    };
  };

  // Load roles
  const loadRoles = async () => {
    try {
      setLoading(true);
      console.log('🔍 Loading roles...');
      
      const headers = await getAuthHeaders();
      console.log('✅ Got auth headers');
      
      const response = await fetch('/api/admin/roles/list', { headers });
      console.log('📡 API Response status:', response.status);
      
      const data = await response.json();
      console.log('📄 API Response data:', data);

      if (data.success) {
        setRoles(data.roles);
        console.log('✅ Roles loaded:', data.roles.length);
        
        // Auto-select first role
        if (data.roles.length > 0 && !selectedRole) {
          selectRole(data.roles[0]);
        }
      } else {
        console.error('❌ API Error:', data.error);
        showToast('error', data.error || 'Failed to load roles');
      }
    } catch (error) {
      console.error('❌ Exception loading roles:', error);
      showToast('error', `Failed to load roles: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Select role and load its permissions
  const selectRole = async (role) => {
    setSelectedRole(role);
    setPermissionsLoading(true);

    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`/api/admin/roles/${role.id}/permissions`, { headers });
      const data = await response.json();

      if (data.success) {
        setPermissions(data.permissions);
        setGroupedPermissions(data.grouped);
      } else {
        showToast('error', data.error || 'Failed to load permissions');
      }
    } catch (error) {
      console.error('Error loading permissions:', error);
      showToast('error', 'Failed to load permissions');
    } finally {
      setPermissionsLoading(false);
    }
  };

  // Toggle permission
  const togglePermission = async (permission) => {
    if (!selectedRole || togglingPermission) return;

    setTogglingPermission(permission.id);

    try {
      const headers = await getAuthHeaders();
      
      // Check if this is a wildcard permission
      const isWildcard = permission.name === '*:*:*';
      const isGranting = !permission.granted;

      if (isWildcard && isGranting) {
        // If granting wildcard, grant all permissions
        const allPermissionIds = permissions.map(p => p.id);
        
        // Grant wildcard first
        const wildcardResponse = await fetch(`/api/admin/roles/${selectedRole.id}/permissions`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            permission_id: permission.id,
            grant: true
          })
        });

        if (wildcardResponse.ok) {
          // Update local state to show all permissions as granted
          setPermissions(prev => prev.map(p => ({ ...p, granted: true })));
          setGroupedPermissions(prev => {
            const updated = { ...prev };
            Object.keys(updated).forEach(resource => {
              updated[resource] = updated[resource].map(p => ({ ...p, granted: true }));
            });
            return updated;
          });
          showToast('success', 'Wildcard permission granted - all permissions enabled');
          loadRoles();
        }
      } else {
        // Normal permission toggle
        const response = await fetch(`/api/admin/roles/${selectedRole.id}/permissions`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            permission_id: permission.id,
            grant: !permission.granted
          })
        });

        const data = await response.json();

        if (data.success) {
          // Update local state
          setPermissions(prev => prev.map(p =>
            p.id === permission.id ? { ...p, granted: !p.granted } : p
          ));
          setGroupedPermissions(prev => {
            const updated = { ...prev };
            Object.keys(updated).forEach(resource => {
              updated[resource] = updated[resource].map(p =>
                p.id === permission.id ? { ...p, granted: !p.granted } : p
              );
            });
            return updated;
          });
          showToast('success', data.message);
          loadRoles();
        } else {
          showToast('error', data.error || 'Failed to update permission');
        }
      }
    } catch (error) {
      console.error('Error toggling permission:', error);
      showToast('error', 'Failed to update permission');
    } finally {
      setTogglingPermission(null);
    }
  };

  // Create role
  const handleCreateRole = async (e) => {
    e.preventDefault();
    setFormErrors({});

    if (!roleForm.name.trim()) {
      setFormErrors({ name: 'Role name is required' });
      return;
    }

    try {
      const headers = await getAuthHeaders();
      const response = await fetch('/api/admin/roles/create', {
        method: 'POST',
        headers,
        body: JSON.stringify(roleForm)
      });

      const data = await response.json();

      if (data.success) {
        showToast('success', 'Role created successfully');
        setShowCreateModal(false);
        setRoleForm({ name: '', description: '' });
        loadRoles();
      } else {
        showToast('error', data.error || 'Failed to create role');
        if (data.details) {
          setFormErrors({ submit: data.details });
        }
      }
    } catch (error) {
      console.error('Error creating role:', error);
      showToast('error', 'Failed to create role');
    }
  };

  // Update role
  const handleUpdateRole = async (e) => {
    e.preventDefault();
    setFormErrors({});

    if (!roleForm.name.trim()) {
      setFormErrors({ name: 'Role name is required' });
      return;
    }

    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`/api/admin/roles/${selectedRole.id}/update`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(roleForm)
      });

      const data = await response.json();

      if (data.success) {
        showToast('success', 'Role updated successfully');
        setShowEditModal(false);
        setRoleForm({ name: '', description: '' });
        loadRoles();
        setSelectedRole(data.role);
      } else {
        showToast('error', data.error || 'Failed to update role');
      }
    } catch (error) {
      console.error('Error updating role:', error);
      showToast('error', 'Failed to update role');
    }
  };

  // Delete role
  const handleDeleteRole = async () => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`/api/admin/roles/${selectedRole.id}/delete`, {
        method: 'DELETE',
        headers
      });

      const data = await response.json();

      if (data.success) {
        showToast('success', 'Role deleted successfully');
        setShowDeleteModal(false);
        setSelectedRole(null);
        loadRoles();
      } else {
        showToast('error', data.error || 'Failed to delete role');
      }
    } catch (error) {
      console.error('Error deleting role:', error);
      showToast('error', 'Failed to delete role');
    }
  };

  // Toggle group expansion
  const toggleGroup = (resource) => {
    setExpandedGroups(prev => ({
      ...prev,
      [resource]: !prev[resource]
    }));
  };

  // Filter permissions by search term and reorder (Wildcard last)
  const filteredGroupedPermissions = () => {
    let permissions = searchTerm ? {} : groupedPermissions;
    
    if (searchTerm) {
      Object.keys(groupedPermissions).forEach(resource => {
        const matchingPerms = groupedPermissions[resource].filter(p =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.description?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        if (matchingPerms.length > 0) {
          permissions[resource] = matchingPerms;
        }
      });
    }

    // Reorder to put Wildcard at the end
    const orderedPermissions = {};
    const keys = Object.keys(permissions);
    
    // Add all non-wildcard resources first
    keys.filter(key => key !== '*').sort().forEach(key => {
      orderedPermissions[key] = permissions[key];
    });
    
    // Add wildcard at the end if it exists
    if (permissions['*']) {
      orderedPermissions['*'] = permissions['*'];
    }
    
    return orderedPermissions;
  };

  // Toast notification
  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // Calculate granted count
  const grantedCount = permissions.filter(p => p.granted).length;

  // Open edit modal
  const openEditModal = () => {
    setRoleForm({
      name: selectedRole.name,
      description: selectedRole.description || ''
    });
    setShowEditModal(true);
  };

  // Open delete modal
  const openDeleteModal = () => {
    setShowDeleteModal(true);
  };

  // Reset role to default permissions - show modal
  const handleResetToDefault = () => {
    if (!selectedRole) return;
    setShowResetModal(true);
  };

  // Confirm and execute reset
  const confirmReset = async () => {
    setShowResetModal(false);
    if (!selectedRole) return;

    try {
      const headers = await getAuthHeaders();
      const response = await fetch(
        `/api/admin/roles/${selectedRole.id}/reset-default`,
        {
          method: 'POST',
          headers
        }
      );

      const data = await response.json();

      if (data.success) {
        showToast('success', data.message);
         // Reload permissions for current role
         await selectRole(selectedRole);
         await loadRoles();
      } else {
        showToast('error', data.error || 'Failed to reset role');
      }
    } catch (error) {
      console.error('Error resetting role:', error);
      showToast('error', 'Failed to reset role to defaults');
    }
  };

  if (authLoading || loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-charcoal"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <ShieldCheckIcon className="h-8 w-8 text-charcoal" />
            Permissions & Roles
          </h1>
          <p className="mt-2 text-gray-600">
            Manage roles and their associated permissions
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT COLUMN - Roles List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              {/* Create Role Button */}
              <button
                onClick={() => setShowCreateModal(true)}
                className="w-full mb-4 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
              >
                <PlusIcon className="h-5 w-5" />
                Create Custom Role
              </button>

              {/* Roles List */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  All Roles ({roles.length})
                </h3>
                {/* System Roles */}
                <div className="mb-4">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    System Roles
                  </h4>
                  {roles.filter(role => role.is_system_role).map(role => (
                    <div
                      key={role.id}
                      onClick={() => selectRole(role)}
                      className={`p-3 rounded-lg cursor-pointer transition-all mb-2 ${
                        selectedRole?.id === role.id
                          ? 'bg-gray-800 text-white border-2 border-gray-700 shadow-lg'
                          : 'bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium capitalize">
                          {role.name.replace(/_/g, ' ')}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          selectedRole?.id === role.id 
                            ? 'bg-white bg-opacity-20 text-white' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          System
                        </span>
                      </div>
                      <div className={`text-xs ${selectedRole?.id === role.id ? 'text-gray-300' : 'text-gray-600'}`}>
                        {role.permission_count} permissions
                      </div>
                    </div>
                  ))}
                </div>

                {/* Custom Roles */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Custom Roles ({roles.filter(role => !role.is_system_role).length})
                    </h4>
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="text-xs px-2 py-1 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors flex items-center gap-1"
                    >
                      <PlusIcon className="h-3 w-3" />
                      Add
                    </button>
                  </div>
                  {roles.filter(role => !role.is_system_role).map(role => (
                    <div
                      key={role.id}
                      onClick={() => selectRole(role)}
                      className={`p-3 rounded-lg cursor-pointer transition-all mb-2 ${
                        selectedRole?.id === role.id
                          ? 'bg-gray-800 text-white border-2 border-gray-700 shadow-lg'
                          : 'bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium capitalize">
                          {role.name.replace(/_/g, ' ')}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          selectedRole?.id === role.id 
                            ? 'bg-white bg-opacity-20 text-white' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          Custom
                        </span>
                      </div>
                      <div className={`text-xs ${selectedRole?.id === role.id ? 'text-gray-300' : 'text-gray-600'}`}>
                        {role.permission_count} permissions
                      </div>
                    </div>
                  ))}
                  {roles.filter(role => !role.is_system_role).length === 0 && (
                    <div className="text-sm text-gray-500 italic p-3 bg-gray-50 rounded-lg">
                      No custom roles yet. Create one above!
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN - Permissions Manager */}
          <div className="lg:col-span-2">
            {selectedRole ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                {/* Role Header */}
                <div className="mb-6 pb-4 border-b border-gray-200">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 capitalize flex items-center gap-2">
                        {selectedRole.name.replace(/_/g, ' ')}
                        {selectedRole.is_system_role && (
                          <span className="text-sm px-2 py-1 bg-blue-100 text-blue-800 rounded">
                            System Role
                          </span>
                        )}
                      </h2>
                      <p className="mt-1 text-sm text-gray-600">
                        {selectedRole.description || 'No description'}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {selectedRole.is_system_role && selectedRole.name !== 'super_admin' ? (
                        <button
                          onClick={handleResetToDefault}
                          className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors flex items-center gap-2 text-sm font-medium"
                          title="Reset to default permissions"
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Reset to Default
                        </button>
                      ) : selectedRole.is_system_role && selectedRole.name === 'super_admin' ? (
                        null
                      ) : (
                        <>
                          <button
                            onClick={openEditModal}
                             className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
                            title="Edit role"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={openDeleteModal}
                            className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                            title="Delete role"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Permission Count */}
                  <div className="text-sm font-medium text-gray-700">
                    {grantedCount} of {permissions.length} permissions granted
                  </div>
                </div>

                {/* Search Box */}
                <div className="mb-6">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search permissions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-6 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-charcoal focus:border-transparent bg-gray-50 focus:bg-white transition-colors"
                    />
                  </div>
                  {searchTerm && (
                    <div className="mt-2 text-sm text-gray-600">
                      Searching for: <span className="font-medium">"{searchTerm}"</span>
                    </div>
                  )}
                  
                  {/* Expand/Collapse All */}
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => {
                        const allExpanded = {};
                        Object.keys(groupedPermissions).forEach(key => {
                          allExpanded[key] = true;
                        });
                        setExpandedGroups(allExpanded);
                      }}
                      className="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                    >
                      Expand All
                    </button>
                    <button
                      onClick={() => {
                        const allCollapsed = {};
                        Object.keys(groupedPermissions).forEach(key => {
                          allCollapsed[key] = false;
                        });
                        setExpandedGroups(allCollapsed);
                      }}
                      className="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                    >
                      Collapse All
                    </button>
                  </div>
                </div>

                 {/* Super Admin Protection Warning */}
                 {selectedRole?.name === 'super_admin' && (
                   <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                     <div className="flex items-start gap-3">
                       <ShieldCheckIcon className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                       <div>
                         <p className="text-sm font-semibold text-yellow-900">Super Admin Protection</p>
                         <p className="text-xs text-yellow-700 mt-1">
                           Super Admin has full system access. Permission changes may not affect actual access levels.
                         </p>
                       </div>
                     </div>
                   </div>
                 )}

                {/* Permissions List */}
                {permissionsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800"></div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {Object.keys(filteredGroupedPermissions()).map(resource => (
                      <div key={resource} className="border border-gray-200 rounded-lg overflow-hidden">
                        {/* Group Header */}
                        <button
                          onClick={() => toggleGroup(resource)}
                          className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            {expandedGroups[resource] ? (
                              <ChevronDownIcon className="h-5 w-5 text-gray-600" />
                            ) : (
                              <ChevronRightIcon className="h-5 w-5 text-gray-600" />
                            )}
                            <span className="font-semibold text-gray-900 capitalize">
                              {resource === '*' ? 'Wildcard' : resource}
                            </span>
                            <span className="text-sm text-gray-600">
                              ({filteredGroupedPermissions()[resource].filter(p => p.granted).length}/{filteredGroupedPermissions()[resource].length})
                            </span>
                          </div>
                        </button>

                        {/* Group Permissions */}
                        {expandedGroups[resource] && (
                          <div className="p-3 space-y-2">
                            {filteredGroupedPermissions()[resource].map(permission => (
                              <label
                                key={permission.id}
                                className={`flex items-start gap-3 p-2 rounded hover:bg-gray-50 cursor-pointer transition-colors ${
                                  togglingPermission === permission.id ? 'opacity-50' : ''
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={permission.granted}
                                  onChange={() => togglePermission(permission)}
                                   disabled={togglingPermission === permission.id}
                                  className="mt-1 h-4 w-4 text-gray-800 focus:ring-gray-800 border-gray-300 rounded"
                                />
                                <div className="flex-1">
                                  <div className="font-medium text-sm text-gray-900">
                                    {permission.name}
                                  </div>
                                  <div className="text-xs text-gray-600">
                                    {permission.description}
                                  </div>
                                </div>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <ShieldCheckIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Select a Role
                </h3>
                <p className="text-gray-600">
                  Choose a role from the list to view and manage its permissions
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Create Role Modal */}
        {showCreateModal && (
          <Modal
            title="Create New Role"
            onClose={() => {
              setShowCreateModal(false);
              setRoleForm({ name: '', description: '' });
              setFormErrors({});
            }}
          >
            <form onSubmit={handleCreateRole} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role Name *
                </label>
                <input
                  type="text"
                  value={roleForm.name}
                  onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                  placeholder="e.g., content_moderator"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300"
                  style={{ maxWidth: '300px' }}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Lowercase, alphanumeric, underscores only
                </p>
                {formErrors.name && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={roleForm.description}
                  onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                  rows={3}
                  placeholder="Describe what this role does..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300"
                  style={{ maxWidth: '300px' }}
                />
              </div>

              {formErrors.submit && (
                <p className="text-sm text-red-600">{formErrors.submit}</p>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setRoleForm({ name: '', description: '' });
                    setFormErrors({});
                  }}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Create Role
                </button>
              </div>
            </form>
          </Modal>
        )}

        {/* Edit Role Modal */}
        {showEditModal && (
          <Modal
            title="Edit Role"
            onClose={() => {
              setShowEditModal(false);
              setRoleForm({ name: '', description: '' });
              setFormErrors({});
            }}
          >
            <form onSubmit={handleUpdateRole} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role Name *
                </label>
                <input
                  type="text"
                  value={roleForm.name}
                  onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300"
                  style={{ maxWidth: '300px' }}
                />
                {formErrors.name && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={roleForm.description}
                  onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300"
                  style={{ maxWidth: '300px' }}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setRoleForm({ name: '', description: '' });
                    setFormErrors({});
                  }}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Update Role
                </button>
              </div>
            </form>
          </Modal>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <Modal
            title="Delete Role"
            onClose={() => setShowDeleteModal(false)}
          >
            <div className="space-y-4">
              <p className="text-gray-700">
                Are you sure you want to delete the role <strong className="capitalize">{selectedRole?.name.replace(/_/g, ' ')}</strong>?
              </p>
              <p className="text-sm text-red-600">
                This action cannot be undone. All permission assignments for this role will be removed.
              </p>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteRole}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete Role
                </button>
              </div>
            </div>
          </Modal>
        )}

        {/* Reset to Default Confirmation Modal */}
        {showResetModal && selectedRole && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Reset {selectedRole.name.replace(/_/g, ' ')} to default permissions?
              </h3>
              <p className="text-gray-600 mb-4">
                This will remove all current permissions and restore the standard set for this role.
              </p>
              <p className="text-sm text-amber-600 mb-6">
                ⚠️ This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowResetModal(false)}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmReset}
                  className="px-4 py-2 bg-[#1f2937] text-white rounded-lg hover:bg-gray-900 transition-colors"
                >
                  Reset to Default
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Toast Notification */}
        {toast && (
          <Toast
            type={toast.type}
            message={toast.message}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </MainLayout>
  );
}

// Modal Component
function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

// Toast Component
function Toast({ type, message, onClose }) {
  const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
      <div className={`${bgColor} text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 max-w-md`}>
        {type === 'success' ? (
          <CheckIcon className="h-5 w-5 flex-shrink-0" />
        ) : (
          <XMarkIcon className="h-5 w-5 flex-shrink-0" />
        )}
        <span className="flex-1">{message}</span>
        <button onClick={onClose} className="flex-shrink-0 hover:opacity-75 transition-opacity">
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
