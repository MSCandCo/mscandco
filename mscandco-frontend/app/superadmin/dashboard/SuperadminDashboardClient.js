'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import {
  Users,
  Music,
  DollarSign,
  Activity,
  Settings,
  Shield,
  BarChart3,
  Cog,
  ChevronDown,
  Bell,
  TrendingUp,
  TrendingDown
} from 'lucide-react'

export default function SuperadminDashboardClient({ user }) {
  const supabase = createClient()
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalReleases: 0,
    platformRevenue: 0,
    systemHealth: 100
  })
  const [currency, setCurrency] = useState('USD')
  const [notificationCount, setNotificationCount] = useState(3)

  useEffect(() => {
    // Fetch real stats
    const fetchStats = async () => {
      try {
        // Fetch total users
        const { count: usersCount } = await supabase
          .from('user_profiles')
          .select('*', { count: 'exact', head: true })

        // Fetch total releases
        const { count: releasesCount } = await supabase
          .from('releases')
          .select('*', { count: 'exact', head: true })

        setStats({
          totalUsers: usersCount || 0,
          totalReleases: releasesCount || 0,
          platformRevenue: 0, // This would come from a revenue table
          systemHealth: 100
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
      }
    }

    fetchStats()
  }, [])

  const navigationItems = [
    {
      label: 'Users & Access',
      items: [
        { label: 'User Management', href: '/superadmin/usermanagement' },
        { label: 'Permissions & Roles', href: '/superadmin/permissionsroles' },
        { label: 'Ghost Mode', href: '/superadmin/ghostlogin' }
      ]
    },
    {
      label: 'Analytics',
      items: [
        { label: 'Platform Analytics', href: '/admin/platformanalytics' },
        { label: 'System Analytics', href: '/superadmin/analytics' },
        { label: 'Reports', href: '/superadmin/reports' }
      ]
    },
    {
      label: 'Finance',
      items: [
        { label: 'Earnings Management', href: '/admin/earningsmanagement' },
        { label: 'Wallet Management', href: '/admin/walletmanagement' },
        { label: 'Platform Revenue', href: '/superadmin/revenue' }
      ]
    },
    {
      label: 'Content',
      items: [
        { label: 'Master Roster', href: '/admin/masterroster' },
        { label: 'Asset Library', href: '/admin/assetlibrary' },
        { label: 'Content Review', href: '/admin/requests' }
      ]
    },
    {
      label: 'Distribution',
      items: [
        { label: 'Distribution Queue', href: '/distribution/queue' },
        { label: 'Workflow Manager', href: '/distribution/workflow' },
        { label: 'Partner Settings', href: '/distributionpartner/settings' }
      ]
    }
  ]

  const statsCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      trend: '+12%',
      trendUp: true,
      color: 'blue'
    },
    {
      title: 'Total Releases',
      value: stats.totalReleases.toLocaleString(),
      icon: Music,
      trend: '+8%',
      trendUp: true,
      color: 'purple'
    },
    {
      title: 'Platform Revenue',
      value: `${currency === 'USD' ? '$' : '£'}${stats.platformRevenue.toLocaleString()}`,
      icon: DollarSign,
      trend: '+23%',
      trendUp: true,
      color: 'green'
    },
    {
      title: 'System Health',
      value: `${stats.systemHealth}%`,
      icon: Activity,
      trend: 'Optimal',
      trendUp: true,
      color: 'emerald'
    }
  ]

  const quickActions = [
    {
      title: 'Permissions & Roles',
      description: 'Manage user permissions and role assignments',
      icon: Shield,
      href: '/superadmin/permissionsroles',
      color: 'blue'
    },
    {
      title: 'User Management',
      description: 'View and manage all platform users',
      icon: Users,
      href: '/superadmin/usermanagement',
      color: 'purple'
    },
    {
      title: 'System Analytics',
      description: 'View detailed system metrics and insights',
      icon: BarChart3,
      href: '/superadmin/analytics',
      color: 'green'
    },
    {
      title: 'Platform Settings',
      description: 'Configure platform-wide settings',
      icon: Cog,
      href: '/superadmin/settings',
      color: 'orange'
    }
  ]

  const currencies = ['USD', 'GBP', 'EUR']

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Currency Selector Row */}
      <div className="bg-white border-b border-gray-200 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-end">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-700 font-medium">Currency:</span>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="bg-white border border-gray-300 rounded-md px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="USD">$ USD - US Dollar</option>
              <option value="GBP">£ GBP - British Pound</option>
              <option value="EUR">€ EUR - Euro</option>
            </select>
          </div>
        </div>
      </div>

      {/* Hero Section with Gradient */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-2">Super Admin Dashboard</h1>
          <p className="text-xl mb-1">Ultimate System Control</p>
          <p className="text-blue-100">Complete platform oversight with full administrative access</p>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((stat, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg bg-${stat.color}-100`}>
                  <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
                </div>
                <div className={`flex items-center text-sm font-medium ${stat.trendUp ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.trendUp ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                  {stat.trend}
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
              <p className="text-sm text-gray-600">{stat.title}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, idx) => (
              <Link
                key={idx}
                href={action.href}
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow duration-200"
              >
                <div className={`p-3 rounded-lg bg-${action.color}-100 inline-block mb-4`}>
                  <action.icon className={`h-6 w-6 text-${action.color}-600`} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{action.title}</h3>
                <p className="text-sm text-gray-600">{action.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

// Navigation Dropdown Component
function NavDropdown({ label, items }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
      >
        <span>{label}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          {items.map((item, idx) => (
            <Link
              key={idx}
              href={item.href}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
