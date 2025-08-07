import { useAuth0 } from '@auth0/auth0-react';
import Head from 'next/head';
import { AdminRoute } from '@/components/auth/RoleProtectedRoute';
import { Card, Button, Badge } from 'flowbite-react';
import { useState } from 'react';
import CurrencySelector, { formatCurrency, useCurrencySync } from '@/components/shared/CurrencySelector';
import { ARTISTS, ADMINS } from '@/lib/mockData';

export default function AdminUsersPage() {
  return (
    <AdminRoute>
      <AdminUsersContent />
    </AdminRoute>
  );
}

function AdminUsersContent() {
  const { user } = useAuth0();
  const [selectedCurrency, updateCurrency] = useCurrencySync('GBP');

  // Comprehensive mock user data - includes all artists and roles from our database
  const mockUsers = [
    {
      id: 1,
      email: 'superadmin@mscandco.com',
      name: 'Super Admin User',
      role: 'super_admin',
      brand: 'MSC & Co',
      status: 'active',
      lastLogin: '2024-01-15T10:30:00Z',
      releases: 0,
      totalStreams: 0,
      permissions: ['all']
    },
    {
      id: 2,
      email: 'companyadmin@mscandco.com',
      name: 'Company Admin User',
      role: 'company_admin',
      brand: 'MSC & Co',
      status: 'active',
      lastLogin: '2024-01-14T15:45:00Z',
      releases: 0,
      totalStreams: 0,
      permissions: ['user_management', 'content_oversight']
    },
    {
      id: 3,
      email: 'yhwh@mscandco.com',
      name: 'YHWH MSC',
      role: 'artist',
      brand: 'YHWH MSC',
      status: 'active',
      lastLogin: '2024-01-16T09:20:00Z',
      releases: 6,
      totalStreams: 125000,
      totalEarnings: 2840,
      permissions: ['releases', 'earnings', 'analytics']
    },
    {
      id: 4,
      email: 'distributor@codegroup.com',
      name: 'Code Group Distribution',
      role: 'distribution_partner',
      brand: 'Code Group',
      status: 'active',
      lastLogin: '2024-01-16T11:15:00Z',
      releases: 21,
      totalStreams: 15000000,
      totalEarnings: 180000,
      permissions: ['release_management', 'analytics', 'reports']
    },
    {
      id: 5,
      email: 'global.superstar@majorlabel.com',
      name: 'Global Superstar',
      role: 'artist',
      brand: 'Major Label Music',
      status: 'active',
      lastLogin: '2024-01-15T14:30:00Z',
      releases: 1,
      totalStreams: 2800000,
      totalEarnings: 45600,
      permissions: ['releases', 'earnings', 'analytics']
    },
    {
      id: 6,
      email: 'contact@seoulstars.kr',
      name: 'Seoul Stars',
      role: 'artist',
      brand: 'K-Entertainment',
      status: 'active',
      lastLogin: '2024-01-16T08:45:00Z',
      releases: 1,
      totalStreams: 4500000,
      permissions: ['releases', 'earnings', 'analytics']
    },
    {
      id: 7,
      email: 'management@rocklegends.com',
      name: 'Rock Legends',
      role: 'artist',
      brand: 'Live Music Records',
      status: 'active',
      lastLogin: '2024-01-14T16:20:00Z',
      releases: 1,
      totalStreams: 1200000,
      permissions: ['releases', 'earnings', 'analytics']
    },
    {
      id: 8,
      email: 'dj.phoenix@digitalbeats.com',
      name: 'DJ Phoenix',
      role: 'artist',
      brand: 'Digital Beats',
      status: 'pending',
      lastLogin: '2024-01-12T12:00:00Z',
      releases: 1,
      totalStreams: 0,
      permissions: ['releases']
    },
    {
      id: 9,
      email: 'emma@indiesounds.com',
      name: 'Emma Rodriguez',
      role: 'artist',
      brand: 'Indie Sounds',
      status: 'pending',
      lastLogin: '2024-01-10T10:15:00Z',
      releases: 1,
      totalStreams: 0,
      permissions: ['releases']
    },
    {
      id: 10,
      email: 'marcus@jazzheritage.com',
      name: 'Marcus Williams',
      role: 'artist',
      brand: 'Jazz Heritage',
      status: 'inactive',
      lastLogin: '2024-01-05T14:30:00Z',
      releases: 1,
      totalStreams: 0,
      permissions: ['releases']
    },
    {
      id: 11,
      email: 'basement@undergroundrecords.com',
      name: 'The Basement Band',
      role: 'artist',
      brand: 'Underground Records',
      status: 'pending',
      lastLogin: '2024-01-11T19:45:00Z',
      releases: 1,
      totalStreams: 0,
      permissions: ['releases']
    },
    {
      id: 12,
      email: 'carlos@latinbeats.com',
      name: 'Carlos Mendez',
      role: 'artist',
      brand: 'Latin Beats Records',
      status: 'active',
      lastLogin: '2024-01-15T13:20:00Z',
      releases: 1,
      totalStreams: 280000,
      permissions: ['releases', 'earnings', 'analytics']
    },
    {
      id: 13,
      email: 'composer@cinematicmusic.com',
      name: 'Film Composer Orchestra',
      role: 'artist',
      brand: 'Cinematic Music',
      status: 'pending',
      lastLogin: '2024-01-08T11:30:00Z',
      releases: 1,
      totalStreams: 0,
      permissions: ['releases']
    },
    {
      id: 14,
      email: 'nashville@countrymusic.com',
      name: 'Nashville Dreams',
      role: 'artist',
      brand: 'Audio MSC',
      status: 'inactive',
      lastLogin: '2024-01-10T14:15:00Z'
    }
  ];

  const getStatusBadge = (status) => {
    return status === 'active' ? (
      <Badge color="green">Active</Badge>
    ) : (
      <Badge color="gray">Inactive</Badge>
    );
  };

  const getRoleBadge = (role) => {
    const colorMap = {
      super_admin: 'red',
      company_admin: 'purple',
      artist: 'green',
      distribution_partner: 'blue',
      distributor: 'indigo'
    };
    
    return (
      <Badge color={colorMap[role] || 'gray'}>
        {role.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  return (
    <>
      <Head>
        <title>User Management - MSC & Co</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="px-4 py-6 sm:px-0">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  User Management
                </h1>
                <p className="mt-2 text-gray-600">
                  Manage users and their roles across the platform
                </p>
              </div>
              
              <div className="flex items-center space-x-4">
                <CurrencySelector 
                  selectedCurrency={selectedCurrency}
                  onCurrencyChange={updateCurrency}
                  compact={true}
                />
                <Button color="blue">
                  + Add New User
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="px-4 py-6 sm:px-0">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">156</div>
                  <div className="text-sm text-gray-600">Total Users</div>
                </div>
              </Card>
              
              <Card>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">142</div>
                  <div className="text-sm text-gray-600">Active Users</div>
                </div>
              </Card>
              
              <Card>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">14</div>
                  <div className="text-sm text-gray-600">New This Month</div>
                </div>
              </Card>
              
              <Card>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(
                      mockUsers.reduce((sum, user) => sum + (user.totalEarnings || 0), 0), 
                      selectedCurrency, 
                      { compact: true }
                    )}
                  </div>
                  <div className="text-sm text-gray-600">Total Revenue</div>
                </div>
              </Card>
            </div>

            {/* Users Table */}
            <Card>
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Platform Users
                </h3>
              </div>
              
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
                        Brand
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
                    {mockUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <img
                                className="h-10 w-10 rounded-full"
                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`}
                                alt=""
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {user.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getRoleBadge(user.role)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.brand}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(user.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(user.lastLogin).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Button size="xs" color="blue">
                              Edit
                            </Button>
                            <Button size="xs" color="gray">
                              View
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
    </>
  );
} 