import { useAuth0 } from '@auth0/auth0-react';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { COMPANY_INFO } from '@/lib/brand-config';
import RoleProtectedRoute from '@/components/auth/RoleProtectedRoute';
import RoleBasedNavigation from '@/components/navigation/RoleBasedNavigation';
import { Button, Badge, Card, Modal, TextInput, Label, Select } from 'flowbite-react';
import { 
  HiUsers, 
  HiPlus, 
  HiPencil, 
  HiTrash, 
  HiEye,
  HiShieldCheck,
  HiOfficeBuilding,
  HiGlobeAlt,
  HiMusicNote,
  HiCube
} from 'react-icons/hi';
import { getUserRole, ROLES } from '@/lib/role-config';

function UserManagement() {
  const { user } = useAuth0();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [filters, setFilters] = useState({
    role: '',
    status: '',
    search: ''
  });

  const roleIcons = {
    super_admin: HiShieldCheck,
    company_admin: HiOfficeBuilding,
    distribution_partner: HiGlobeAlt,
    artist: HiMusicNote,
    distributor: HiCube
  };

  const roleColors = {
    super_admin: 'red',
    company_admin: 'purple',
    distribution_partner: 'blue',
    artist: 'green',
    distributor: 'indigo'
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // Mock data for now - replace with actual API call
      const mockUsers = [
        {
          id: '1',
          email: 'admin@mscandco.com',
          name: 'Super Admin',
          role: 'super_admin',
          status: 'active',
          createdAt: '2024-01-01',
          lastLogin: '2024-01-15'
        },
        {
          id: '2',
          email: 'company@mscandco.com',
          name: 'Company Admin',
          role: 'company_admin',
          status: 'active',
          createdAt: '2024-01-02',
          lastLogin: '2024-01-14'
        },
        {
          id: '3',
          email: 'partner@mscandco.com',
          name: 'Distribution Partner',
          role: 'distribution_partner',
          status: 'active',
          createdAt: '2024-01-03',
          lastLogin: '2024-01-13'
        },
        {
          id: '4',
          email: 'artist@mscandco.com',
          name: 'Music Artist',
          role: 'artist',
          status: 'active',
          createdAt: '2024-01-04',
          lastLogin: '2024-01-12'
        }
      ];
      setUsers(mockUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesRole = !filters.role || user.role === filters.role;
    const matchesStatus = !filters.status || user.status === filters.status;
    const matchesSearch = !filters.search || 
      user.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      user.email.toLowerCase().includes(filters.search.toLowerCase());
    
    return matchesRole && matchesStatus && matchesSearch;
  });

  const handleEditUser = (user) => {
    setEditingUser(user);
    setShowModal(true);
  };

  const handleDeleteUser = async (userId) => {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        // API call to delete user
        setUsers(users.filter(user => user.id !== userId));
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const getRoleIcon = (roleId) => {
    const IconComponent = roleIcons[roleId] || HiUsers;
    return <IconComponent className="w-4 h-4" />;
  };

  const getRoleColor = (roleId) => {
    return roleColors[roleId] || 'gray';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>User Management - {COMPANY_INFO.name}</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <Link href="/admin/dashboard" className="text-gray-600 hover:text-gray-900 mr-4">
                  ← Back to Admin Dashboard
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
              </div>
              <Button color="blue" onClick={() => setShowModal(true)}>
                <HiPlus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <HiShieldCheck className="w-6 h-6 text-red-500" />
                  <h2 className="text-lg font-semibold text-gray-900">Admin Navigation</h2>
                </div>
                <RoleBasedNavigation />
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="space-y-6">
                {/* Filters */}
                <Card>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="search">Search</Label>
                      <TextInput
                        id="search"
                        placeholder="Search users..."
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="role">Role</Label>
                      <Select
                        id="role"
                        value={filters.role}
                        onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                      >
                        <option value="">All Roles</option>
                        {Object.values(ROLES).map(role => (
                          <option key={role.id} value={role.id}>{role.displayName}</option>
                        ))}
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select
                        id="status"
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                      >
                        <option value="">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="suspended">Suspended</option>
                      </Select>
                    </div>
                  </div>
                </Card>

                {/* Users Table */}
                <Card>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            User
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Role
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Last Login
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
                                <div className="flex-shrink-0 h-10 w-10">
                                  <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                    <span className="text-sm font-medium text-gray-700">
                                      {user.name.charAt(0)}
                                    </span>
                                  </div>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                  <div className="text-sm text-gray-500">{user.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className={`w-3 h-3 rounded-full bg-${getRoleColor(user.role)}-500 mr-2`}></div>
                                <span className="text-sm text-gray-900">
                                  {ROLES[user.role.toUpperCase()]?.displayName || user.role}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge color={user.status === 'active' ? 'success' : 'gray'}>
                                {user.status}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(user.lastLogin).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <Button size="xs" color="gray" onClick={() => handleEditUser(user)}>
                                  <HiEye className="w-4 h-4" />
                                </Button>
                                <Button size="xs" color="blue" onClick={() => handleEditUser(user)}>
                                  <HiPencil className="w-4 h-4" />
                                </Button>
                                <Button size="xs" color="failure" onClick={() => handleDeleteUser(user.id)}>
                                  <HiTrash className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* Edit User Modal */}
        <Modal show={showModal} onClose={() => setShowModal(false)} size="md">
          <Modal.Header>
            {editingUser ? 'Edit User' : 'Add New User'}
          </Modal.Header>
          <Modal.Body>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <TextInput
                  id="name"
                  defaultValue={editingUser?.name || ''}
                  placeholder="Enter user name"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <TextInput
                  id="email"
                  type="email"
                  defaultValue={editingUser?.email || ''}
                  placeholder="Enter user email"
                />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Select
                  id="role"
                  defaultValue={editingUser?.role || ''}
                >
                  {Object.values(ROLES).map(role => (
                    <option key={role.id} value={role.id}>{role.displayName}</option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  id="status"
                  defaultValue={editingUser?.status || 'active'}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </Select>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button color="blue" onClick={() => setShowModal(false)}>
              {editingUser ? 'Update User' : 'Create User'}
            </Button>
            <Button color="gray" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </>
  );
}

export default function UserManagementPage() {
  return (
    <RoleProtectedRoute requiredRoles={['super_admin']}>
      <UserManagement />
    </RoleProtectedRoute>
  );
} 