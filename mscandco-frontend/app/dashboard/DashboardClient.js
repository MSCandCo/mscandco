'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import {
  TrendingUp,
  Music,
  DollarSign,
  Users,
  Play,
  Upload,
  MessageSquare,
  Settings,
  BarChart3,
  Calendar,
  Bell,
  CheckCircle,
  Clock,
  ArrowRight,
  Sparkles,
  X,
  AlertCircle,
  FileText,
  Wallet,
  Inbox
} from 'lucide-react'

export default function DashboardClient({ user }) {
  const supabase = createClient()
  const [profileData, setProfileData] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [userPermissions, setUserPermissions] = useState([])
  const [stats, setStats] = useState({
    totalReleases: 0,
    totalEarnings: 0,
    totalStreams: 0,
    pendingTasks: 0
  })
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)
  const [showTasksModal, setShowTasksModal] = useState(false)
  const [pendingTasks, setPendingTasks] = useState([])
  const [quickActions, setQuickActions] = useState([])
  const [performanceMetrics, setPerformanceMetrics] = useState([])


  useEffect(() => {
    loadDashboardData()
  }, [user])

  // Real-time subscription for notifications
  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel('dashboard_notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        async (payload) => {
          // Reload notifications when any change occurs
          const { data: recentNotifs } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(5)

          if (recentNotifs) {
            const activityItems = recentNotifs.map(notif => ({
              id: notif.id,
              type: notif.type || 'message',
              message: notif.message || notif.title,
              time: formatTimeAgo(notif.created_at)
            }))
            setRecentActivity(activityItems)
          }
        }
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [user])

  const loadDashboardData = async () => {
    try {
      setLoading(true)

      // Get user profile
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      setProfileData(profile)
      const role = profile?.role || user?.user_metadata?.role
      setUserRole(role)

      // Fetch user permissions
      const { data: permissions } = await supabase
        .from('user_permissions')
        .select('permission:permissions(name)')
        .eq('user_id', user.id)

      const permissionNames = permissions?.map(p => p.permission?.name).filter(Boolean) || []
      setUserPermissions(permissionNames)

      console.log('Dashboard: User role:', role)
      console.log('Dashboard: User permissions:', permissionNames)

      // Load quick actions - use most visited or fall back to permission-based defaults
      const topVisited = getTopVisitedPages(permissionNames)
      setQuickActions(topVisited || getPermissionBasedQuickActions(permissionNames))

      // Load REAL stats from database based on role and permissions
      await loadRealStats(role, permissionNames)

      // Load recent notifications from database (user_id field exists in notifications table)
      const { data: recentNotifs, error: notifsError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5)

      if (recentNotifs && !notifsError) {
        // Transform notifications to activity format
        const activityItems = recentNotifs.map(notif => ({
          id: notif.id,
          type: notif.type || 'message',
          message: notif.message || notif.title,
          time: formatTimeAgo(notif.created_at)
        }))
        setRecentActivity(activityItems)
      } else {
        // Fallback to empty if no notifications
        setRecentActivity([])
      }

      // Load REAL pending tasks from database
      await loadRealPendingTasks(role, permissionNames)

      // Load REAL performance metrics
      await loadPerformanceMetrics(role, permissionNames)
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 18) return 'Good Afternoon'
    return 'Good Evening'
  }

  const formatTimeAgo = (timestamp) => {
    const now = new Date()
    const date = new Date(timestamp)
    const seconds = Math.floor((now - date) / 1000)

    if (seconds < 60) return 'Just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`
    return date.toLocaleDateString()
  }

  const loadRealStats = async (role, permissions) => {
    try {
      const hasWildcard = permissions.includes('*:*:*')

      // For super_admin or users with wildcard - show platform-wide stats
      if (role === 'super_admin' || hasWildcard) {
        const [releasesRes, earningsRes, usersRes, requestsRes] = await Promise.all([
          supabase.from('releases').select('*', { count: 'exact', head: true }),
          supabase.from('earnings').select('amount'),
          supabase.from('user_profiles').select('*', { count: 'exact', head: true }),
          supabase.from('change_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending')
        ])

        const totalEarnings = earningsRes.data?.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0) || 0

        setStats({
          totalReleases: releasesRes.count || 0,
          totalEarnings: totalEarnings,
          totalStreams: usersRes.count || 0, // Using users as a placeholder for now
          pendingTasks: requestsRes.count || 0
        })
      }
      // For artists - show their own stats
      else if (permissions.includes('releases:access')) {
        const [releasesRes, earningsRes] = await Promise.all([
          supabase.from('releases').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
          supabase.from('earnings').select('amount').eq('user_id', user.id)
        ])

        const totalEarnings = earningsRes.data?.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0) || 0
        const unreadNotifs = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('read', false)

        setStats({
          totalReleases: releasesRes.count || 0,
          totalEarnings: totalEarnings,
          totalStreams: 0, // Would need streams table
          pendingTasks: unreadNotifs.count || 0
        })
      }
      // For label admins - show their artists' stats
      else if (permissions.includes('labeladmin:artists:access')) {
        // Get artists under this label admin
        const { data: artists } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('label_admin_id', user.id)

        const artistIds = artists?.map(a => a.id) || []

        const [releasesRes, earningsRes] = await Promise.all([
          supabase.from('releases').select('*', { count: 'exact', head: true }).in('user_id', artistIds),
          supabase.from('earnings').select('amount').in('user_id', artistIds)
        ])

        const totalEarnings = earningsRes.data?.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0) || 0

        setStats({
          totalReleases: releasesRes.count || 0,
          totalEarnings: totalEarnings,
          totalStreams: artistIds.length, // Number of artists
          pendingTasks: 0
        })
      }
      // For admin roles with specific permissions
      else if (permissions.includes('admin:usermanagement:access')) {
        const [usersRes, requestsRes] = await Promise.all([
          supabase.from('user_profiles').select('*', { count: 'exact', head: true }),
          supabase.from('change_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending')
        ])

        setStats({
          totalReleases: 0,
          totalEarnings: 0,
          totalStreams: usersRes.count || 0,
          pendingTasks: requestsRes.count || 0
        })
      }
      // Default fallback
      else {
        setStats({
          totalReleases: 0,
          totalEarnings: 0,
          totalStreams: 0,
          pendingTasks: 0
        })
      }
    } catch (error) {
      console.error('Error loading stats:', error)
      // Set to 0 on error
      setStats({
        totalReleases: 0,
        totalEarnings: 0,
        totalStreams: 0,
        pendingTasks: 0
      })
    }
  }

  const loadRealPendingTasks = async (role, permissions) => {
    try {
      const tasks = []
      const hasWildcard = permissions.includes('*:*:*')

      // For super_admin - show pending change requests
      if (role === 'super_admin' || hasWildcard || permissions.includes('admin:requests:access')) {
        const { data: pendingRequests } = await supabase
          .from('change_requests')
          .select('*')
          .eq('status', 'pending')
          .order('created_at', { ascending: false })
          .limit(3)

        pendingRequests?.forEach(req => {
          tasks.push({
            id: `request-${req.id}`,
            title: `Review ${req.request_type || 'Profile'} Change Request`,
            description: `User ${req.user_id} requested changes`,
            priority: 'high',
            link: '/admin/requests'
          })
        })
      }

      // Check for incomplete profile
      if (profileData && !profileData.profile_completed) {
        tasks.push({
          id: 'profile',
          title: 'Complete Your Profile',
          description: 'Add your bio, profile picture, and other details',
          priority: 'medium',
          link: role === 'artist' ? '/artist/settings' : '/admin/settings'
        })
      }

      // Check for unread notifications
      const { count: unreadCount } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('read', false)

      if (unreadCount > 0) {
        tasks.push({
          id: 'notifications',
          title: `${unreadCount} Unread Notification${unreadCount !== 1 ? 's' : ''}`,
          description: 'You have unread notifications',
          priority: 'low',
          link: '/notifications'
        })
      }

      setPendingTasks(tasks)
    } catch (error) {
      console.error('Error loading pending tasks:', error)
      setPendingTasks([])
    }
  }

  const loadPerformanceMetrics = async (role, permissions) => {
    try {
      const metrics = []
      const hasWildcard = permissions.includes('*:*:*')

      // For super_admin or admin - show platform metrics
      if (role === 'super_admin' || hasWildcard || permissions.includes('admin:usermanagement:access')) {
        // Get total users count
        const { count: totalUsers } = await supabase
          .from('user_profiles')
          .select('*', { count: 'exact', head: true })

        // Get new users this month
        const thisMonth = new Date()
        thisMonth.setDate(1)
        const { count: newUsers } = await supabase
          .from('user_profiles')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', thisMonth.toISOString())

        const userGrowth = totalUsers > 0 ? Math.round((newUsers / totalUsers) * 100) : 0

        metrics.push({
          icon: Users,
          title: 'User Growth',
          description: `+${userGrowth}% new users this month`,
          color: 'green',
          trend: 'up'
        })

        // Get total releases
        const { count: totalReleases } = await supabase
          .from('releases')
          .select('*', { count: 'exact', head: true })

        metrics.push({
          icon: Music,
          title: 'Total Releases',
          description: `${totalReleases || 0} releases on platform`,
          color: 'purple',
          trend: 'check'
        })

        // Get pending requests
        const { count: pendingRequests } = await supabase
          .from('change_requests')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending')

        if (pendingRequests > 0) {
          metrics.push({
            icon: TrendingUp,
            title: 'Pending Requests',
            description: `${pendingRequests} requests need review`,
            color: 'orange',
            trend: 'up'
          })
        }
      }
      // For artists - show personal metrics
      else if (permissions.includes('releases:access')) {
        const { count: myReleases } = await supabase
          .from('releases')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)

        metrics.push({
          icon: Music,
          title: 'Your Releases',
          description: `${myReleases || 0} active releases`,
          color: 'purple',
          trend: 'check'
        })

        const { data: earnings } = await supabase
          .from('earnings')
          .select('amount')
          .eq('user_id', user.id)

        const totalEarnings = earnings?.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0) || 0

        if (totalEarnings > 0) {
          metrics.push({
            icon: DollarSign,
            title: 'Total Earnings',
            description: `£${totalEarnings.toLocaleString()} lifetime`,
            color: 'green',
            trend: 'up'
          })
        }
      }

      setPerformanceMetrics(metrics)
    } catch (error) {
      console.error('Error loading performance metrics:', error)
      setPerformanceMetrics([])
    }
  }

  const getDisplayName = () => {
    if (profileData?.first_name && profileData?.last_name) {
      return `${profileData.first_name} ${profileData.last_name}`
    }
    if (profileData?.artist_name) {
      return profileData.artist_name
    }
    // Format role name properly (e.g., "super_admin" -> "Super Admin")
    if (userRole) {
      return userRole
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    }
    return user?.email?.split('@')[0] || 'User'
  }

  // All available pages with required permissions
  const getAllAvailablePages = () => {
    return [
      // Artist pages - require specific artist permissions
      { icon: Music, label: 'My Releases', href: '/artist/releases', color: 'bg-purple-500', requiredPermission: 'releases:access' },
      { icon: BarChart3, label: 'Analytics', href: '/artist/analytics', color: 'bg-blue-500', requiredPermission: 'analytics:access' },
      { icon: DollarSign, label: 'Earnings', href: '/artist/earnings', color: 'bg-green-500', requiredPermission: 'earnings:access' },
      { icon: MessageSquare, label: 'Messages', href: '/artist/messages', color: 'bg-orange-500', requiredPermission: 'messages:access' },
      { icon: Users, label: 'Roster', href: '/artist/roster', color: 'bg-indigo-500', requiredPermission: 'roster:access' },
      { icon: Settings, label: 'Settings', href: '/artist/settings', color: 'bg-gray-500', requiredPermission: 'settings:access' },

      // Label Admin pages
      { icon: Users, label: 'My Artists', href: '/labeladmin/artists', color: 'bg-purple-500', requiredPermission: 'labeladmin:artists:access' },
      { icon: Music, label: 'Releases', href: '/labeladmin/releases', color: 'bg-blue-500', requiredPermission: 'labeladmin:releases:access' },
      { icon: BarChart3, label: 'Analytics', href: '/labeladmin/analytics', color: 'bg-green-500', requiredPermission: 'labeladmin:analytics:access' },
      { icon: DollarSign, label: 'Earnings', href: '/labeladmin/earnings', color: 'bg-orange-500', requiredPermission: 'labeladmin:earnings:access' },
      { icon: MessageSquare, label: 'Messages', href: '/labeladmin/messages', color: 'bg-pink-500', requiredPermission: 'labeladmin:messages:access' },
      { icon: Users, label: 'Roster', href: '/labeladmin/roster', color: 'bg-indigo-500', requiredPermission: 'labeladmin:roster:access' },
      { icon: Settings, label: 'Settings', href: '/labeladmin/settings', color: 'bg-gray-500', requiredPermission: 'labeladmin:settings:access' },

      // Admin pages
      { icon: Users, label: 'User Management', href: '/admin/usermanagement', color: 'bg-purple-500', requiredPermission: 'admin:usermanagement:access' },
      { icon: DollarSign, label: 'Earnings Management', href: '/admin/earningsmanagement', color: 'bg-green-500', requiredPermission: 'admin:earningsmanagement:access' },
      { icon: Wallet, label: 'Wallet Management', href: '/admin/walletmanagement', color: 'bg-emerald-500', requiredPermission: 'admin:walletmanagement:access' },
      { icon: BarChart3, label: 'Analytics Management', href: '/admin/analyticsmanagement', color: 'bg-blue-500', requiredPermission: 'admin:analyticsmanagement:access' },
      { icon: Music, label: 'Asset Library', href: '/admin/assetlibrary', color: 'bg-indigo-500', requiredPermission: 'admin:assetlibrary:access' },
      { icon: FileText, label: 'Change Requests', href: '/admin/requests', color: 'bg-yellow-500', requiredPermission: 'admin:requests:access' },
      { icon: MessageSquare, label: 'Messages', href: '/admin/messages', color: 'bg-pink-500', requiredPermission: 'admin:messages:access' },
      { icon: Settings, label: 'Settings', href: '/admin/settings', color: 'bg-orange-500', requiredPermission: 'admin:settings:access' },

      // Super Admin pages
      { icon: BarChart3, label: 'Platform Analytics', href: '/admin/platformanalytics', color: 'bg-blue-500', requiredPermission: 'admin:platformanalytics:access' },
      { icon: MessageSquare, label: 'Platform Messages', href: '/superadmin/messages', color: 'bg-green-500', requiredPermission: 'superadmin:messages:access' },
      { icon: Settings, label: 'Permissions & Roles', href: '/superadmin/permissionsroles', color: 'bg-orange-500', requiredPermission: 'admin:permissionsroles:access' },
      { icon: Users, label: 'Ghost Login', href: '/superadmin/ghost-login', color: 'bg-red-500', requiredPermission: 'superadmin:ghost_login:access' },

      // Distribution pages
      { icon: Music, label: 'Distribution Hub', href: '/distribution/hub', color: 'bg-purple-500', requiredPermission: 'distribution:hub:access' },
      { icon: Inbox, label: 'Distribution Queue', href: '/distribution/queue', color: 'bg-blue-500', requiredPermission: 'distribution:queue:access' },
      { icon: DollarSign, label: 'Revenue Reporting', href: '/distribution/revenue', color: 'bg-green-500', requiredPermission: 'distribution:revenue:access' },
      { icon: Settings, label: 'Settings', href: '/distributionpartner/settings', color: 'bg-orange-500', requiredPermission: 'distribution:settings:access' },
    ]
  }

  const getTopVisitedPages = (permissions) => {
    try {
      const visits = JSON.parse(localStorage.getItem('pageVisits') || '{}')
      const userId = user?.id

      if (!userId || !visits[userId]) {
        return null
      }

      const userVisits = visits[userId]
      const allPages = getAllAvailablePages()

      // Filter pages by user permissions (including wildcard *)
      const hasWildcard = permissions.includes('*:*:*')
      const accessiblePages = allPages.filter(page => {
        // Wildcard permission grants access to everything
        if (hasWildcard) return true

        // Check if user has the required permission
        return permissions.includes(page.requiredPermission)
      })

      // Sort by visit count and get top 4
      const topPages = Object.entries(userVisits)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4)
        .map(([href, count]) => {
          const page = accessiblePages.find(p => p.href === href)
          return page ? { ...page, visitCount: count } : null
        })
        .filter(Boolean)

      return topPages.length >= 4 ? topPages : null
    } catch (error) {
      console.error('Error loading visit history:', error)
      return null
    }
  }

  const getPermissionBasedQuickActions = (permissions) => {
    const allPages = getAllAvailablePages()
    const hasWildcard = permissions.includes('*:*:*')

    // Filter pages by permissions
    const accessiblePages = allPages.filter(page => {
      if (hasWildcard) return true
      return permissions.includes(page.requiredPermission)
    })

    // Priority order for Quick Actions (most important pages first)
    const priorityOrder = [
      // Admin priorities
      'admin:usermanagement:access',
      'admin:earningsmanagement:access',
      'admin:walletmanagement:access',
      'admin:analyticsmanagement:access',
      'admin:platformanalytics:access',

      // Artist priorities
      'releases:access',
      'analytics:access',
      'earnings:access',
      'messages:access',

      // Label Admin priorities
      'labeladmin:artists:access',
      'labeladmin:releases:access',
      'labeladmin:analytics:access',
      'labeladmin:earnings:access',

      // Distribution priorities
      'distribution:hub:access',
      'distribution:queue:access',
      'distribution:revenue:access',

      // Super Admin priorities
      'admin:permissionsroles:access',
      'superadmin:ghost_login:access',
    ]

    // Sort accessible pages by priority
    const sortedPages = accessiblePages.sort((a, b) => {
      const indexA = priorityOrder.indexOf(a.requiredPermission)
      const indexB = priorityOrder.indexOf(b.requiredPermission)

      // If both have priorities, sort by priority
      if (indexA !== -1 && indexB !== -1) return indexA - indexB
      // If only A has priority, A comes first
      if (indexA !== -1) return -1
      // If only B has priority, B comes first
      if (indexB !== -1) return 1
      // Neither has priority, maintain order
      return 0
    })

    // Return top 4 pages
    return sortedPages.slice(0, 4)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {getGreeting()}, {getDisplayName()}!
              </h1>
              <p className="text-lg text-gray-600">
                Welcome back to your dashboard. Here's what's happening today.
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6 hover:shadow-md hover:border-purple-300 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-50 rounded-lg">
                <Music className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-3xl font-bold text-gray-900">{stats.totalReleases}</span>
            </div>
            <p className="text-gray-600 text-sm font-medium">Total Releases</p>
          </div>

          <div className="bg-white rounded-lg shadow border border-gray-200 p-6 hover:shadow-md hover:border-green-300 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-50 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-3xl font-bold text-gray-900">£{stats.totalEarnings.toLocaleString()}</span>
            </div>
            <p className="text-gray-600 text-sm font-medium">Total Earnings</p>
          </div>

          <div className="bg-white rounded-lg shadow border border-gray-200 p-6 hover:shadow-md hover:border-blue-300 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <Play className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-3xl font-bold text-gray-900">{stats.totalStreams.toLocaleString()}</span>
            </div>
            <p className="text-gray-600 text-sm font-medium">Total Streams</p>
          </div>

          <div
            onClick={() => setShowTasksModal(true)}
            className="bg-white rounded-lg shadow border border-gray-200 p-6 hover:shadow-md hover:border-orange-300 transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-50 rounded-lg">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <span className="text-3xl font-bold text-gray-900">{stats.pendingTasks}</span>
            </div>
            <p className="text-gray-600 text-sm font-medium">Pending Tasks (Click to view)</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                Quick Actions
                <span className="ml-3 text-sm font-normal text-gray-500">
                  (Most visited pages)
                </span>
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {quickActions.map((action, index) => {
                  const Icon = action.icon
                  // Map color to tailwind classes
                  const colorMap = {
                    'bg-purple-500': { bg: 'bg-purple-50', icon: 'text-purple-600', border: 'hover:border-purple-300' },
                    'bg-blue-500': { bg: 'bg-blue-50', icon: 'text-blue-600', border: 'hover:border-blue-300' },
                    'bg-green-500': { bg: 'bg-green-50', icon: 'text-green-600', border: 'hover:border-green-300' },
                    'bg-orange-500': { bg: 'bg-orange-50', icon: 'text-orange-600', border: 'hover:border-orange-300' },
                    'bg-pink-500': { bg: 'bg-pink-50', icon: 'text-pink-600', border: 'hover:border-pink-300' },
                    'bg-indigo-500': { bg: 'bg-indigo-50', icon: 'text-indigo-600', border: 'hover:border-indigo-300' },
                    'bg-yellow-500': { bg: 'bg-yellow-50', icon: 'text-yellow-600', border: 'hover:border-yellow-300' },
                    'bg-red-500': { bg: 'bg-red-50', icon: 'text-red-600', border: 'hover:border-red-300' },
                    'bg-emerald-500': { bg: 'bg-emerald-50', icon: 'text-emerald-600', border: 'hover:border-emerald-300' },
                    'bg-gray-500': { bg: 'bg-gray-50', icon: 'text-gray-600', border: 'hover:border-gray-300' },
                  }
                  const colors = colorMap[action.color] || colorMap['bg-gray-500']

                  return (
                    <Link
                      key={index}
                      href={action.href}
                      className={`flex flex-col items-center p-4 rounded-lg border border-gray-200 ${colors.border} hover:shadow-sm transition-all group`}
                    >
                      <div className={`w-12 h-12 ${colors.bg} rounded-lg flex items-center justify-center mb-3 transition-colors`}>
                        <Icon className={`w-6 h-6 ${colors.icon}`} />
                      </div>
                      <span className="text-sm font-medium text-gray-700 text-center">{action.label}</span>
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* Performance Overview */}
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                  Performance Overview
                </h2>
                <Link
                  href={
                    userRole === 'artist' ? '/artist/analytics' :
                    userRole === 'labeladmin' ? '/labeladmin/analytics' :
                    userRole === 'super_admin' ? '/admin/platformanalytics' :
                    '/admin/analyticsmanagement'
                  }
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
                >
                  View Detailed Analytics <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
              <div className="space-y-4">
                {performanceMetrics.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <TrendingUp className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>No performance data available yet</p>
                  </div>
                ) : (
                  performanceMetrics.map((metric, index) => {
                    const Icon = metric.icon
                    const colorClasses = {
                      green: { bg: 'bg-green-50', icon: 'text-green-600', border: 'hover:border-green-300' },
                      blue: { bg: 'bg-blue-50', icon: 'text-blue-600', border: 'hover:border-blue-300' },
                      purple: { bg: 'bg-purple-50', icon: 'text-purple-600', border: 'hover:border-purple-300' },
                      orange: { bg: 'bg-orange-50', icon: 'text-orange-600', border: 'hover:border-orange-300' },
                    }
                    const colors = colorClasses[metric.color] || colorClasses.green

                    return (
                      <div key={index} className={`flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-sm ${colors.border} transition-all`}>
                        <div className="flex items-center">
                          <div className={`w-12 h-12 ${colors.bg} rounded-lg flex items-center justify-center mr-4`}>
                            <Icon className={`w-6 h-6 ${colors.icon}`} />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{metric.title}</p>
                            <p className="text-sm text-gray-600">{metric.description}</p>
                          </div>
                        </div>
                        <span className={`text-2xl font-bold ${colors.icon}`}>
                          {metric.trend === 'up' ? '↑' : metric.trend === 'down' ? '↓' : '✓'}
                        </span>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <Bell className="w-5 h-5 mr-2 text-orange-600" />
                Recent Activity
              </h2>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 flex-shrink-0 ${
                      activity.type === 'release' ? 'bg-purple-50' :
                      activity.type === 'earnings' ? 'bg-green-50' :
                      'bg-blue-50'
                    }`}>
                      {activity.type === 'release' && <Music className="w-5 h-5 text-purple-600" />}
                      {activity.type === 'earnings' && <DollarSign className="w-5 h-5 text-green-600" />}
                      {activity.type === 'message' && <MessageSquare className="w-5 h-5 text-blue-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 mb-1">{activity.message}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}

                <Link
                  href="/notifications"
                  className="block text-center py-3 text-sm font-medium text-orange-600 hover:text-orange-700 border-t border-gray-100 mt-4 pt-4"
                >
                  View All Activity →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Pending Tasks Modal */}
      {showTasksModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Clock className="w-8 h-8 mr-3" />
                  <div>
                    <h2 className="text-2xl font-bold">Pending Tasks</h2>
                    <p className="text-orange-100 text-sm">You have {pendingTasks.length} task{pendingTasks.length !== 1 ? 's' : ''} that need attention</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowTasksModal(false)}
                  className="hover:bg-orange-700 rounded-full p-2 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
              {pendingTasks.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">All caught up!</h3>
                  <p className="text-gray-600">You have no pending tasks at the moment.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingTasks.map((task) => (
                    <div
                      key={task.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-start flex-1">
                          <div className={`mt-1 mr-3 w-2 h-2 rounded-full flex-shrink-0 ${
                            task.priority === 'high' ? 'bg-red-500' :
                            task.priority === 'medium' ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`} />
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">{task.title}</h3>
                            <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                            <Link
                              href={task.link}
                              onClick={() => setShowTasksModal(false)}
                              className="inline-flex items-center text-sm font-medium text-orange-600 hover:text-orange-700"
                            >
                              Take Action <ArrowRight className="w-4 h-4 ml-1" />
                            </Link>
                          </div>
                        </div>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          task.priority === 'high' ? 'bg-red-100 text-red-700' :
                          task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {task.priority.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
