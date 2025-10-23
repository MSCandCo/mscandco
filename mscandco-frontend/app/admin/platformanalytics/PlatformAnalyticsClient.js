'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { BarChart3, TrendingUp, Users, Music, DollarSign, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function PlatformAnalyticsClient({ user }) {
  const supabase = createClient()

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalArtists: 0,
    totalReleases: 0,
    totalEarnings: 0,
    activeUsers: 0,
    monthlyGrowth: 0
  })
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('30d')

  useEffect(() => {
    loadStats()
  }, [period])

  const loadStats = async () => {
    setLoading(true)
    try {
      const [usersRes, earningsRes] = await Promise.all([
        supabase.from('user_profiles').select('id, role_id, created_at'),
        supabase.from('earnings').select('amount')
      ])

      if (usersRes.error) throw usersRes.error
      if (earningsRes.error) throw earningsRes.error

      const users = usersRes.data || []
      const earnings = earningsRes.data || []

      setStats({
        totalUsers: users.length,
        totalArtists: users.filter(u => u.role_id === 'artist').length,
        totalReleases: 0, // Would need releases table
        totalEarnings: earnings.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0),
        activeUsers: users.filter(u => {
          const created = new Date(u.created_at)
          const thirtyDaysAgo = new Date()
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
          return created > thirtyDaysAgo
        }).length,
        monthlyGrowth: 12.5 // Placeholder
      })
    } catch (err) {
      console.error('Error loading stats:', err)
    } finally {
      setLoading(false)
    }
  }

  const StatCard = ({ icon: Icon, label, value, change, color }) => (
    <div className="bg-white rounded-lg shadow border p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {change && (
            <div className="flex items-center mt-2">
              <TrendingUp className={`w-4 h-4 mr-1 ${change > 0 ? 'text-green-600' : 'text-red-600'}`} />
              <span className={`text-sm ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {change > 0 ? '+' : ''}{change}%
              </span>
            </div>
          )}
        </div>
        <Icon className={`w-12 h-12 ${color}`} />
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <BarChart3 className="h-8 w-8 mr-3 text-gray-700" />
            Platform Analytics
          </h1>
          <p className="mt-2 text-gray-600">Platform-wide metrics and insights</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Calendar className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          icon={Users}
          label="Total Users"
          value={stats.totalUsers}
          change={stats.monthlyGrowth}
          color="text-blue-600"
        />
        <StatCard
          icon={Music}
          label="Total Artists"
          value={stats.totalArtists}
          change={8.2}
          color="text-purple-600"
        />
        <StatCard
          icon={DollarSign}
          label="Total Earnings"
          value={`£${stats.totalEarnings.toFixed(2)}`}
          change={15.3}
          color="text-green-600"
        />
        <StatCard
          icon={Music}
          label="Total Releases"
          value={stats.totalReleases}
          change={5.7}
          color="text-orange-600"
        />
        <StatCard
          icon={TrendingUp}
          label="Active Users"
          value={stats.activeUsers}
          change={stats.monthlyGrowth}
          color="text-teal-600"
        />
        <StatCard
          icon={BarChart3}
          label="Monthly Growth"
          value={`${stats.monthlyGrowth}%`}
          color="text-indigo-600"
        />
      </div>

      {/* Charts Placeholder */}
      <div className="bg-white rounded-lg shadow border p-6">
        <h3 className="text-lg font-semibold mb-4">Platform Growth</h3>
        <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-gray-500">Chart visualization will be added here</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow border p-6">
          <h3 className="text-lg font-semibold mb-4">Revenue by Platform</h3>
          <div className="h-48 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-gray-500">Platform breakdown chart</p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow border p-6">
          <h3 className="text-lg font-semibold mb-4">User Activity</h3>
          <div className="h-48 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-gray-500">Activity timeline</p>
          </div>
        </div>
      </div>
    </div>
  )
}







