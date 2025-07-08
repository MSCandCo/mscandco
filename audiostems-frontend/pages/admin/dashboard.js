import { useAuth0 } from '@auth0/auth0-react';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { COMPANY_INFO } from '@/lib/brand-config';
import RoleProtectedRoute from '@/components/auth/RoleProtectedRoute';
import RoleBasedNavigation from '@/components/navigation/RoleBasedNavigation';
import { 
  HiUsers, 
  HiCog, 
  HiShieldCheck, 
  HiChartBar,
  HiDocumentText,
  HiCurrencyDollar,
  HiCreditCard,
  HiOfficeBuilding,
  HiGlobeAlt,
  HiMusicNote
} from 'react-icons/hi';

function SuperAdminDashboard() {
  const { user } = useAuth0();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalContent: 0,
    systemHealth: 100,
    alerts: 0,
    revenue: 0
  });

  return (
    <>
      <Head>
        <title>Super Admin Dashboard - {COMPANY_INFO.name}</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 mr-4">
                  ← Back to Dashboard
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">Super Admin Dashboard</h1>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-sm font-medium text-gray-700">Super Administrator</span>
                </div>
              </div>
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
                {/* System Overview */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">System Overview</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-red-50 rounded-lg p-4">
                      <div className="flex items-center">
                        <HiUsers className="w-8 h-8 text-red-500" />
                        <div className="ml-4">
                          <div className="text-2xl font-bold text-red-600">{stats.totalUsers}</div>
                          <div className="text-sm text-red-600">Total Users</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="flex items-center">
                        <HiChartBar className="w-8 h-8 text-green-500" />
                        <div className="ml-4">
                          <div className="text-2xl font-bold text-green-600">{stats.totalContent}</div>
                          <div className="text-sm text-green-600">Total Content</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-center">
                        <HiShieldCheck className="w-8 h-8 text-blue-500" />
                        <div className="ml-4">
                          <div className="text-2xl font-bold text-blue-600">{stats.systemHealth}%</div>
                          <div className="text-sm text-blue-600">System Health</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-purple-50 rounded-lg p-4">
                      <div className="flex items-center">
                        <HiCurrencyDollar className="w-8 h-8 text-purple-500" />
                        <div className="ml-4">
                          <div className="text-2xl font-bold text-purple-600">${stats.revenue.toLocaleString()}</div>
                          <div className="text-sm text-purple-600">Total Revenue</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-yellow-50 rounded-lg p-4">
                      <div className="flex items-center">
                        <HiDocumentText className="w-8 h-8 text-yellow-500" />
                        <div className="ml-4">
                          <div className="text-2xl font-bold text-yellow-600">{stats.alerts}</div>
                          <div className="text-sm text-yellow-600">System Alerts</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">User Management</h3>
                    <div className="space-y-3">
                      <Link href="/admin/users" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50">
                        <HiUsers className="w-5 h-5 text-gray-400" />
                        <span>Manage Users</span>
                      </Link>
                      <Link href="/admin/roles" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50">
                        <HiShieldCheck className="w-5 h-5 text-gray-400" />
                        <span>Role Management</span>
                      </Link>
                      <Link href="/admin/audit" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50">
                        <HiDocumentText className="w-5 h-5 text-gray-400" />
                        <span>Audit Logs</span>
                      </Link>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">System Administration</h3>
                    <div className="space-y-3">
                      <Link href="/admin/settings" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50">
                        <HiCog className="w-5 h-5 text-gray-400" />
                        <span>System Settings</span>
                      </Link>
                      <Link href="/admin/finance" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50">
                        <HiCurrencyDollar className="w-5 h-5 text-gray-400" />
                        <span>Financial Reports</span>
                      </Link>
                      <Link href="/admin/billing" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50">
                        <HiCreditCard className="w-5 h-5 text-gray-400" />
                        <span>Billing Management</span>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Recent System Activity</h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">System backup completed successfully</span>
                      <span className="text-xs text-gray-400 ml-auto">2 minutes ago</span>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">New user registration: john.doe@example.com</span>
                      <span className="text-xs text-gray-400 ml-auto">5 minutes ago</span>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">Database maintenance scheduled for tonight</span>
                      <span className="text-xs text-gray-400 ml-auto">10 minutes ago</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function AdminDashboard() {
  return (
    <RoleProtectedRoute requiredRoles={['super_admin']}>
      <SuperAdminDashboard />
    </RoleProtectedRoute>
  );
} 