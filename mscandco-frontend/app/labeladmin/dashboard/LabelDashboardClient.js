'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { PageLoading } from '@/components/ui/LoadingSpinner'
import LabelTierUsageWidget from '@/components/label/LabelTierUsageWidget'
import {
  Users,
  Music,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  ArrowRight,
  FileText,
  BarChart3,
  AlertCircle
} from 'lucide-react'

export default function LabelDashboardClient({ user }) {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalArtists: 0,
    totalReleases: 0,
    liveReleases: 0,
    totalEarnings: 0,
    pendingEarnings: 0,
    pendingRequests: 0
  })
  const [recentReleases, setRecentReleases] = useState([])
  const [recentEarnings, setRecentEarnings] = useState([])

  useEffect(() => {
    loadDashboardData()
  }, [user])

  const loadDashboardData = async () => {
    try {
      setLoading(true)

      if (!user) {
        window.location.href = '/login'
        return
      }

      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        window.location.href = '/login'
        return
      }

      const response = await fetch('/api/labeladmin/dashboard', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Failed to load dashboard data')
      }

      const data = await response.json()

      if (data.success) {
        setStats(data.stats)
        setRecentReleases(data.recentReleases || [])
        setRecentEarnings(data.recentEarnings || [])
      }
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount || 0)
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <PageLoading message="Loading your dashboard..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FileText className="w-8 h-8 text-gray-700" />
            Label Dashboard
          </h1>
          <p className="mt-2 text-gray-600">Overview of your label's performance and activity</p>
        </div>

        {/* Tier Usage Widget */}
        <div className="mb-8">
          <LabelTierUsageWidget userId={user.id} />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Total Artists */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Artists</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalArtists}</p>
              </div>
              <div className="bg-blue-100 rounded-full p-3">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <Link
              href="/labeladmin/artists"
              className="mt-4 inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
            >
              View all artists <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          {/* Total Releases */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Releases</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalReleases}</p>
                <p className="text-sm text-green-600 mt-1">{stats.liveReleases} live</p>
              </div>
              <div className="bg-purple-100 rounded-full p-3">
                <Music className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <Link
              href="/labeladmin/releases"
              className="mt-4 inline-flex items-center text-sm text-purple-600 hover:text-purple-700"
            >
              View all releases <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          {/* Total Earnings */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{formatCurrency(stats.totalEarnings)}</p>
                {stats.pendingEarnings > 0 && (
                  <p className="text-sm text-orange-600 mt-1">{formatCurrency(stats.pendingEarnings)} pending</p>
                )}
              </div>
              <div className="bg-green-100 rounded-full p-3">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <Link
              href="/labeladmin/earnings"
              className="mt-4 inline-flex items-center text-sm text-green-600 hover:text-green-700"
            >
              View earnings <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          {/* Pending Requests */}
          {stats.pendingRequests > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-orange-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Requests</p>
                  <p className="text-3xl font-bold text-orange-600 mt-2">{stats.pendingRequests}</p>
                </div>
                <div className="bg-orange-100 rounded-full p-3">
                  <AlertCircle className="w-6 h-6 text-orange-600" />
                </div>
              </div>
              <Link
                href="/labeladmin/artists"
                className="mt-4 inline-flex items-center text-sm text-orange-600 hover:text-orange-700"
              >
                Review requests <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Releases */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Music className="w-5 h-5 text-purple-600" />
                Recent Releases
              </h2>
              <Link href="/labeladmin/releases" className="text-sm text-purple-600 hover:text-purple-700">
                View all
              </Link>
            </div>
            {recentReleases.length > 0 ? (
              <div className="space-y-3">
                {recentReleases.map((release) => (
                  <div key={release.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        release.status === 'live' ? 'bg-green-500' :
                        release.status === 'completed' ? 'bg-blue-500' :
                        'bg-gray-400'
                      }`} />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Release #{release.id.slice(0, 8)}</p>
                        <p className="text-xs text-gray-500">{formatTimeAgo(release.created_at)}</p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${
                      release.status === 'live' ? 'bg-green-100 text-green-700' :
                      release.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {release.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Music className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">No releases yet</p>
              </div>
            )}
          </div>

          {/* Recent Earnings */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                Recent Earnings
              </h2>
              <Link href="/labeladmin/earnings" className="text-sm text-green-600 hover:text-green-700">
                View all
              </Link>
            </div>
            {recentEarnings.length > 0 ? (
              <div className="space-y-3">
                {recentEarnings.map((earning, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        earning.status === 'paid' ? 'bg-green-500' :
                        earning.status === 'pending' ? 'bg-orange-500' :
                        'bg-gray-400'
                      }`} />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{formatCurrency(earning.amount)}</p>
                        <p className="text-xs text-gray-500">{formatTimeAgo(earning.created_at)}</p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${
                      earning.status === 'paid' ? 'bg-green-100 text-green-700' :
                      earning.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {earning.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <DollarSign className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">No earnings yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/labeladmin/artists"
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Users className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-gray-900">Manage Artists</span>
            </Link>
            <Link
              href="/labeladmin/releases"
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Music className="w-5 h-5 text-purple-600" />
              <span className="font-medium text-gray-900">View Releases</span>
            </Link>
            <Link
              href="/labeladmin/analytics"
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <BarChart3 className="w-5 h-5 text-indigo-600" />
              <span className="font-medium text-gray-900">Analytics</span>
            </Link>
            <Link
              href="/labeladmin/earnings"
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <DollarSign className="w-5 h-5 text-green-600" />
              <span className="font-medium text-gray-900">Earnings</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}