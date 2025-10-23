'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Users, Search, Loader2, XCircle, RefreshCw, AlertTriangle, UserCircle,
  Mail, Calendar, CheckCircle, Clock, UserCheck, UserX, ArrowUpDown,
  ArrowUp, ArrowDown, Edit2, Trash2, Plus
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import CreateUserModal from '@/components/admin/CreateUserModal'
import EditUserModal from '@/components/admin/EditUserModal'
import { useRoles } from '@/hooks/useRoles'

export default function UserManagementClient({ user }) {
  const supabase = createClient()
  const { formatRoleName } = useRoles()

  // State
  const [users, setUsers] = useState([])
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortColumn, setSortColumn] = useState('created_at')
  const [sortDirection, setSortDirection] = useState('desc')

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [newRole, setNewRole] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState('')

  // Load data
  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user])

  // Real-time subscriptions
  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel('user_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'user_profiles' },
        (payload) => {
          console.log('User profile changed:', payload)
          loadData()
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'user_role_assignments' },
        (payload) => {
          console.log('Role assignment changed:', payload)
          loadData()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  const loadData = async () => {
    setLoading(true)
    setError(null)

    try {
      // EXACT COPY from staging: Use API routes with service role key
      // IMPORTANT: Include credentials: 'include' to send cookies with request
      const [usersRes, rolesRes] = await Promise.all([
        fetch('/api/admin/users/list', {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        }),
        fetch('/api/admin/roles/list', {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        })
      ])

      if (!usersRes.ok) {
        const errorData = await usersRes.json()
        throw new Error(errorData.message || 'Failed to load users')
      }

      if (!rolesRes.ok) {
        const errorData = await rolesRes.json()
        throw new Error(errorData.message || 'Failed to load roles')
      }

      const usersData = await usersRes.json()
      const rolesData = await rolesRes.json()

      // Format roles with display names
      const availableRoles = (rolesData.roles || []).map(role => ({
        id: role.id,
        name: role.name,
        display_name: formatRoleName(role.name)
      }))

      setUsers(usersData.users || [])
      setRoles(availableRoles)

    } catch (err) {
      console.error('Error loading data:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  const getSortIcon = (column) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="h-4 w-4 text-gray-400" />
    }
    return sortDirection === 'asc'
      ? <ArrowUp className="h-4 w-4 text-gray-700" />
      : <ArrowDown className="h-4 w-4 text-gray-700" />
  }

  const handleChangeRole = (user) => {
    setSelectedUser(user)
    setNewRole(typeof user.role === 'string' ? user.role : user.role?.name || '')
    setShowRoleModal(true)
  }

  const confirmRoleChange = async () => {
    if (!selectedUser || !newRole) return

    try {
      setSaving(true)
      setError(null)

      // EXACT COPY from staging: Use API route to update role
      const response = await fetch(`/api/admin/users/${selectedUser.id}/update-role`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: newRole })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update role')
      }

      setShowRoleModal(false)
      setSelectedUser(null)
      await loadData()

    } catch (err) {
      console.error('Error updating role:', err)
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteUser = async () => {
    if (!selectedUser) return

    try {
      setSaving(true)
      setError(null)

      // Delete user from auth and profile
      const { error: authError } = await supabase.auth.admin.deleteUser(selectedUser.id)
      if (authError) throw authError

      // Profile will be deleted automatically via CASCADE

      setShowDeleteModal(false)
      setSelectedUser(null)
      setDeleteConfirmation('')
      await loadData()

    } catch (err) {
      console.error('Error deleting user:', err)
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleStatusToggle = async (user) => {
    try {
      setSaving(true)
      setError(null)

      const newStatus = user.status === 'active' ? 'inactive' : 'active'

      // Update user status via Supabase Admin API
      if (newStatus === 'active') {
        const { error } = await supabase.auth.admin.updateUserById(
          user.id,
          { email_confirm: true }
        )
        if (error) throw error
      } else {
        // Deactivate by un-confirming email
        const { error } = await supabase.auth.admin.updateUserById(
          user.id,
          { email_confirm: false }
        )
        if (error) throw error
      }

      await loadData()

    } catch (err) {
      console.error('Error updating status:', err)
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  // Filter and sort users
  const filteredUsers = users
    .filter(user => {
      const matchesSearch =
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.auth_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.last_name?.toLowerCase().includes(searchTerm.toLowerCase())

      const userRole = typeof user.role === 'string' ? user.role : user.role?.name
      const matchesRole = roleFilter === 'all' || userRole === roleFilter
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter

      return matchesSearch && matchesRole && matchesStatus
    })
    .sort((a, b) => {
      let aValue, bValue

      switch (sortColumn) {
        case 'email':
          aValue = (a.email || a.auth_email || '').toLowerCase()
          bValue = (b.email || b.auth_email || '').toLowerCase()
          break
        case 'role':
          aValue = (typeof a.role === 'string' ? a.role : a.role?.name || '').toLowerCase()
          bValue = (typeof b.role === 'string' ? b.role : b.role?.name || '').toLowerCase()
          break
        case 'status':
          aValue = a.status?.toLowerCase() || ''
          bValue = b.status?.toLowerCase() || ''
          break
        case 'created_at':
          aValue = new Date(a.created_at).getTime()
          bValue = new Date(b.created_at).getTime()
          break
        default:
          return 0
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

  // Get unique roles
  const getUniqueRoles = () => {
    const uniqueRoles = new Set()
    users.forEach(user => {
      const roleName = typeof user.role === 'string' ? user.role : user.role?.name
      if (roleName) {
        uniqueRoles.add(roleName)
      }
    })
    return Array.from(uniqueRoles).sort()
  }

  const uniqueRoles = getUniqueRoles()

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'inactive':
        return 'bg-gray-100 text-gray-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'deleted':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleBadgeColor = (roleName) => {
    if (!roleName) return 'bg-gray-100 text-gray-800'

    // Get first 2 characters and generate a color based on them
    const firstTwo = roleName.substring(0, 2).toLowerCase()

    // Color palette with distinct colors (removed borders for cleaner look)
    const colorPalette = {
      'ar': 'bg-purple-100 text-purple-800',      // artist
      'la': 'bg-cyan-100 text-cyan-800',           // labeladmin
      'ad': 'bg-orange-100 text-orange-800',     // admin
      'su': 'bg-red-100 text-red-800',              // super_admin
      'di': 'bg-emerald-100 text-emerald-800',  // distribution_partner
      'fi': 'bg-pink-100 text-pink-800',           // financial_admin
      're': 'bg-indigo-100 text-indigo-800',     // requests_admin
      'co': 'bg-teal-100 text-teal-800',           // company_admin
      'ma': 'bg-amber-100 text-amber-800',        // manager
      'ed': 'bg-lime-100 text-lime-800',           // editor
      'vi': 'bg-violet-100 text-violet-800',     // viewer
      'mo': 'bg-fuchsia-100 text-fuchsia-800',  // moderator
      'us': 'bg-rose-100 text-rose-800',           // user
      'gu': 'bg-sky-100 text-sky-800',              // guest
      'me': 'bg-yellow-100 text-yellow-800',     // member
      'st': 'bg-green-100 text-green-800',        // staff
      'de': 'bg-blue-100 text-blue-800',           // developer
      'te': 'bg-slate-100 text-slate-800',        // tester
      'an': 'bg-orange-100 text-orange-800',     // analyst
      'pa': 'bg-purple-100 text-purple-800',     // partner
    }

    // Return the color if we have it, otherwise generate a default unique one
    if (colorPalette[firstTwo]) {
      return colorPalette[firstTwo]
    }

    // Fallback: generate a color based on character codes
    const charCode1 = firstTwo.charCodeAt(0) || 97
    const charCode2 = firstTwo.charCodeAt(1) || 97
    const hue = ((charCode1 + charCode2) * 137.5) % 360

    // Use inline styles for dynamic colors
    return `bg-gray-100 text-gray-800`
  }


  if (loading && users.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-gray-700 mx-auto mb-4" />
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
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
        <div className="flex space-x-2">
          <Button
            onClick={loadData}
            variant="outline"
            disabled={loading}
            className="flex items-center"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create User
          </Button>
        </div>
      </div>

      {/* Action Legend */}
      <div className="flex items-center gap-6 text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
        <span className="font-medium text-gray-700">Actions:</span>
        <div className="flex items-center gap-2">
          <UserCheck className="h-4 w-4 text-blue-600" />
          <span>Activate User</span>
        </div>
        <div className="flex items-center gap-2">
          <UserX className="h-4 w-4 text-red-600" />
          <span>Deactivate User</span>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Role Filter */}
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {uniqueRoles.map((role) => (
                <SelectItem key={role} value={role}>
                  {formatRoleName(role)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('email')}
                >
                  <div className="flex items-center">
                    User
                    {getSortIcon('email')}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('role')}
                >
                  <div className="flex items-center">
                    Role
                    {getSortIcon('role')}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center">
                    Status
                    {getSortIcon('status')}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('created_at')}
                >
                  <div className="flex items-center">
                    Created
                    {getSortIcon('created_at')}
                  </div>
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
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
                          {user.first_name} {user.last_name}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {user.email || user.auth_email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded ${getRoleBadgeColor(typeof user.role === 'string' ? user.role : user.role?.name)}`}>
                      {formatRoleName(typeof user.role === 'string' ? user.role : user.role?.name)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded ${getStatusBadgeColor(user.status)}`}>
                      {user.status ? user.status.charAt(0).toUpperCase() + user.status.slice(1) : 'Unknown'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      {new Date(user.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex space-x-2 justify-end">
                      <Button
                        onClick={() => handleStatusToggle(user)}
                        variant="outline"
                        size="sm"
                        disabled={saving}
                        className={user.status === 'active'
                          ? 'text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200'
                          : 'text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200'}
                      >
                        {user.status === 'active' ? (
                          <UserX className="h-4 w-4" />
                        ) : (
                          <UserCheck className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        onClick={() => handleChangeRole(user)}
                        variant="outline"
                        size="sm"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => {
                          setSelectedUser(user)
                          setShowEditModal(true)
                        }}
                        variant="outline"
                        size="sm"
                      >
                        Edit
                      </Button>
                      <Button
                        onClick={() => {
                          setSelectedUser(user)
                          setShowDeleteModal(true)
                        }}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <UserCircle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || roleFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Get started by creating a new user'}
            </p>
          </div>
        )}
      </div>

      {/* Stats Footer */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg px-6 py-4">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            Showing <strong className="text-gray-900">{filteredUsers.length}</strong> of{' '}
            <strong className="text-gray-900">{users.length}</strong> users
          </span>
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateUserModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false)
            loadData()
          }}
          roles={roles}
        />
      )}

      {showEditModal && selectedUser && (
        <EditUserModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false)
            setSelectedUser(null)
          }}
          onSuccess={() => {
            setShowEditModal(false)
            setSelectedUser(null)
            loadData()
          }}
          user={selectedUser}
          roles={roles}
        />
      )}

      {/* Role Change Modal */}
      {showRoleModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Change User Role
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Change role for <strong>{selectedUser.email}</strong>
            </p>
            <Select value={newRole} onValueChange={setNewRole}>
              <SelectTrigger className="w-full mb-4">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={role.name}>
                    {role.display_name || role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex space-x-2 justify-end">
              <Button
                onClick={() => {
                  setShowRoleModal(false)
                  setSelectedUser(null)
                }}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmRoleChange}
                disabled={saving || !newRole}
              >
                {saving ? 'Saving...' : 'Confirm'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600 mr-2" />
              <h3 className="text-lg font-semibold text-red-900">
                Delete User
              </h3>
            </div>
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-2">
                Are you sure you want to delete <strong>{selectedUser.email}</strong>?
              </p>
              <p className="text-sm text-red-600 font-medium mb-4">
                This action cannot be undone.
              </p>
              <p className="text-sm text-gray-700 mb-2">
                Type <span className="font-mono font-bold bg-gray-100 px-2 py-1 rounded">DELETE</span> to confirm:
              </p>
              <Input
                type="text"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder="Type DELETE to confirm"
                className="w-full"
                autoFocus
              />
            </div>
            <div className="flex space-x-2 justify-end">
              <Button
                onClick={() => {
                  setShowDeleteModal(false)
                  setSelectedUser(null)
                  setDeleteConfirmation('')
                }}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteUser}
                disabled={saving || deleteConfirmation !== 'DELETE'}
                className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Deleting...' : 'Delete User'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}







