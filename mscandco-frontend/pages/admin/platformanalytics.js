import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import {
  TrendingUp,
  Users,
  DollarSign,
  FileText,
  Activity,
  RefreshCw,
  Download,
  Calendar
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/components/providers/SupabaseProvider';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { DateRangeSelector } from '@/components/ui/DateRangeSelector';

export default function PlatformAnalytics() {
  const router = useRouter();
  const { user, isLoading: userLoading } = useUser();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState('30');
  const [customStartDate, setCustomStartDate] = useState(null);
  const [customEndDate, setCustomEndDate] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user, timeRange]);

  const fetchAnalytics = async (isRefresh = false) => {
    if (!user) return;

    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        console.error('No auth token available');
        setLoading(false);
        setRefreshing(false);
        return;
      }

      let queryParams = `timeRange=${timeRange}`;
      if (timeRange === 'custom' && customStartDate && customEndDate) {
        queryParams += `&startDate=${customStartDate}&endDate=${customEndDate}`;
      }

      const response = await fetch(`/api/admin/platform-analytics?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const data = await response.json();
      setAnalyticsData(data);

      setLoading(false);
      setRefreshing(false);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      showNotification('Failed to load analytics', 'error');
      setLoading(false);
      setRefreshing(false);
    }
  };

  const showNotification = (message, type = 'success') => {
    const bgColor = type === 'success' ? '#f0fdf4' : '#fef2f2';
    const borderColor = type === 'success' ? '#065f46' : '#991b1b';
    const textColor = type === 'success' ? '#065f46' : '#991b1b';

    const notificationDiv = document.createElement('div');
    notificationDiv.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${bgColor};
        border-left: 4px solid ${borderColor};
        padding: 16px 24px;
        color: ${textColor};
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        z-index: 1000;
      ">
        ${message}
      </div>
    `;
    document.body.appendChild(notificationDiv);
    setTimeout(() => document.body.removeChild(notificationDiv), 3000);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount || 0);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-GB').format(num || 0);
  };

  const COLORS = ['#1f2937', '#374151', '#4b5563', '#6b7280', '#9ca3af', '#d1d5db'];

  if (userLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium">Loading platform analytics...</p>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
        <div className="text-center">
          <p className="text-gray-700 font-medium">No analytics data available</p>
        </div>
      </div>
    );
  }

  const { summary, revenue, users, releases, topArtists } = analyticsData;

  return (
    <>
      <Head>
        <title>Platform Analytics - Admin Portal</title>
      </Head>

      <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <button
                onClick={() => router.back()}
                className="text-gray-600 hover:text-gray-900 mb-4 flex items-center transition-colors"
              >
                ← Back
              </button>
              <h1 className="text-4xl font-bold" style={{ color: '#1f2937' }}>Platform Analytics</h1>
              <p className="text-gray-600 mt-2">Comprehensive system-wide insights and metrics</p>
            </div>

            <div className="flex items-center space-x-3">
              {/* Date Range Selector */}
              <DateRangeSelector
                value={timeRange}
                onChange={(range, start, end) => {
                  setTimeRange(range);
                  setCustomStartDate(start);
                  setCustomEndDate(end);
                }}
                showCustom={true}
              />

              {/* Refresh Button */}
              <button
                onClick={() => fetchAnalytics(true)}
                disabled={refreshing}
                className="flex items-center space-x-2 bg-white text-gray-700 font-medium py-2 px-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-all disabled:opacity-50"
              >
                <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
                <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
              </button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="rounded-2xl shadow-lg p-6" style={{
              background: 'linear-gradient(145deg, #ffffff 0%, #f9fafb 100%)',
              border: '1px solid rgba(31, 41, 55, 0.08)'
            }}>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg" style={{ backgroundColor: '#f0fdf4' }}>
                  <DollarSign size={24} style={{ color: '#065f46' }} />
                </div>
              </div>
              <h3 className="text-gray-600 text-sm font-medium mb-1">Total Revenue</h3>
              <p className="text-3xl font-bold" style={{ color: '#1f2937' }}>{formatCurrency(summary.totalRevenue)}</p>
              <p className="text-xs text-gray-500 mt-2">
                Avg per user: {formatCurrency(summary.averageRevenuePerUser)}
              </p>
            </div>

            <div className="rounded-2xl shadow-lg p-6" style={{
              background: 'linear-gradient(145deg, #ffffff 0%, #f9fafb 100%)',
              border: '1px solid rgba(31, 41, 55, 0.08)'
            }}>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg" style={{ backgroundColor: '#eff6ff' }}>
                  <Users size={24} style={{ color: '#1e40af' }} />
                </div>
              </div>
              <h3 className="text-gray-600 text-sm font-medium mb-1">Total Users</h3>
              <p className="text-3xl font-bold" style={{ color: '#1f2937' }}>{formatNumber(summary.totalUsers)}</p>
              <p className="text-xs text-gray-500 mt-2">
                Active: {formatNumber(summary.activeUsers)} ({Math.round((summary.activeUsers / summary.totalUsers) * 100)}%)
              </p>
            </div>

            <div className="rounded-2xl shadow-lg p-6" style={{
              background: 'linear-gradient(145deg, #ffffff 0%, #f9fafb 100%)',
              border: '1px solid rgba(31, 41, 55, 0.08)'
            }}>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg" style={{ backgroundColor: '#fef3c7' }}>
                  <FileText size={24} style={{ color: '#92400e' }} />
                </div>
              </div>
              <h3 className="text-gray-600 text-sm font-medium mb-1">Total Releases</h3>
              <p className="text-3xl font-bold" style={{ color: '#1f2937' }}>{formatNumber(summary.totalReleases)}</p>
              <p className="text-xs text-gray-500 mt-2">
                Avg revenue: {formatCurrency(summary.averageRevenuePerRelease)}
              </p>
            </div>

            <div className="rounded-2xl shadow-lg p-6" style={{
              background: 'linear-gradient(145deg, #ffffff 0%, #f9fafb 100%)',
              border: '1px solid rgba(31, 41, 55, 0.08)'
            }}>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg" style={{ backgroundColor: '#f3e8ff' }}>
                  <Activity size={24} style={{ color: '#6b21a8' }} />
                </div>
              </div>
              <h3 className="text-gray-600 text-sm font-medium mb-1">Activity Rate</h3>
              <p className="text-3xl font-bold" style={{ color: '#1f2937' }}>
                {Math.round((summary.activeUsers / summary.totalUsers) * 100)}%
              </p>
              <p className="text-xs text-gray-500 mt-2">
                {formatNumber(summary.activeUsers)} of {formatNumber(summary.totalUsers)} users
              </p>
            </div>
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Revenue Trend */}
            <div className="rounded-2xl shadow-lg p-6" style={{
              background: 'linear-gradient(145deg, #ffffff 0%, #f9fafb 100%)',
              border: '1px solid rgba(31, 41, 55, 0.08)'
            }}>
              <h3 className="text-xl font-bold mb-4" style={{ color: '#1f2937' }}>Revenue Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenue.trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                    formatter={(value) => formatCurrency(value)}
                  />
                  <Line type="monotone" dataKey="amount" stroke="#1f2937" strokeWidth={2} dot={{ fill: '#1f2937' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* User Growth */}
            <div className="rounded-2xl shadow-lg p-6" style={{
              background: 'linear-gradient(145deg, #ffffff 0%, #f9fafb 100%)',
              border: '1px solid rgba(31, 41, 55, 0.08)'
            }}>
              <h3 className="text-xl font-bold mb-4" style={{ color: '#1f2937' }}>User Growth</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={users.growth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                  />
                  <Line type="monotone" dataKey="count" stroke="#1e40af" strokeWidth={2} dot={{ fill: '#1e40af' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Revenue by Type */}
            <div className="rounded-2xl shadow-lg p-6" style={{
              background: 'linear-gradient(145deg, #ffffff 0%, #f9fafb 100%)',
              border: '1px solid rgba(31, 41, 55, 0.08)'
            }}>
              <h3 className="text-xl font-bold mb-4" style={{ color: '#1f2937' }}>Revenue by Type</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={revenue.byType}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ type, percent }) => `${type}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="amount"
                  >
                    {revenue.byType.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Users by Role */}
            <div className="rounded-2xl shadow-lg p-6" style={{
              background: 'linear-gradient(145deg, #ffffff 0%, #f9fafb 100%)',
              border: '1px solid rgba(31, 41, 55, 0.08)'
            }}>
              <h3 className="text-xl font-bold mb-4" style={{ color: '#1f2937' }}>Users by Role</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={users.byRole}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="role" stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                  />
                  <Bar dataKey="count" fill="#1f2937" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Charts Row 3 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Top Artists */}
            <div className="rounded-2xl shadow-lg p-6" style={{
              background: 'linear-gradient(145deg, #ffffff 0%, #f9fafb 100%)',
              border: '1px solid rgba(31, 41, 55, 0.08)'
            }}>
              <h3 className="text-xl font-bold mb-4" style={{ color: '#1f2937' }}>Top 10 Artists by Earnings</h3>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {topArtists.map((artist, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold"
                           style={{
                             backgroundColor: index < 3 ? '#fef3c7' : '#f3f4f6',
                             color: index < 3 ? '#92400e' : '#6b7280'
                           }}>
                        {index + 1}
                      </div>
                      <span className="font-medium text-gray-800">{artist.name}</span>
                    </div>
                    <span className="font-bold" style={{ color: '#065f46' }}>
                      {formatCurrency(artist.earnings)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Platforms */}
            <div className="rounded-2xl shadow-lg p-6" style={{
              background: 'linear-gradient(145deg, #ffffff 0%, #f9fafb 100%)',
              border: '1px solid rgba(31, 41, 55, 0.08)'
            }}>
              <h3 className="text-xl font-bold mb-4" style={{ color: '#1f2937' }}>Revenue by Platform</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenue.byPlatform} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <YAxis dataKey="platform" type="category" stroke="#6b7280" style={{ fontSize: '12px' }} width={100} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                    formatter={(value) => formatCurrency(value)}
                  />
                  <Bar dataKey="amount" fill="#1f2937" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Releases Section */}
          <div className="rounded-2xl shadow-lg p-6 mb-8" style={{
            background: 'linear-gradient(145deg, #ffffff 0%, #f9fafb 100%)',
            border: '1px solid rgba(31, 41, 55, 0.08)'
          }}>
            <h3 className="text-xl font-bold mb-4" style={{ color: '#1f2937' }}>Release Statistics</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-700 mb-3">Releases by Status</h4>
                <div className="space-y-2">
                  {releases.byStatus.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-700 capitalize">{item.status}</span>
                      <span className="font-bold text-gray-900">{formatNumber(item.count)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-700 mb-3">Release Growth</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={releases.trend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                    />
                    <Line type="monotone" dataKey="count" stroke="#92400e" strokeWidth={2} dot={{ fill: '#92400e' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
