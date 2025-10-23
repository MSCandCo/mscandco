/**
 * Permission Performance Dashboard
 *
 * View real-time performance metrics for the permission system
 */

import { useState, useEffect } from 'react';
import { requirePermission } from '@/lib/serverSidePermissions';
import MainLayout from '@/components/layouts/mainLayout';
import { BarChart3, TrendingUp, Clock, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';


// Server-side permission check
export async function getServerSideProps(context) {
  const auth = await requirePermission(context, ['*:*:*', 'analytics:platform_analytics:read']);

  if (auth.redirect) {
    return { redirect: auth.redirect };
  }

  return { props: { user: auth.user } };
}

export default function PermissionPerformance() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/permission-metrics?format=summary');

      if (!response.ok) {
        throw new Error('Failed to fetch metrics');
      }

      const data = await response.json();
      setMetrics(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching metrics:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(fetchMetrics, 5000); // Refresh every 5 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  if (loading && !metrics) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading performance metrics...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                  <BarChart3 className="w-8 h-8 mr-3 text-blue-600" />
                  Permission Performance Dashboard
                </h1>
                <p className="text-gray-600 mt-2">
                  Monitor server-side permission check performance in real-time
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={fetchMetrics}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>

                <label className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">Auto-refresh (5s)</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Metrics */}
        {metrics && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <MetricCard
                title="Total Checks"
                value={metrics.totalChecks}
                icon={<CheckCircle className="w-6 h-6" />}
                color="blue"
              />

              <MetricCard
                title="Avg Duration"
                value={metrics.avgDuration}
                icon={<Clock className="w-6 h-6" />}
                color="green"
              />

              <MetricCard
                title="Cache Hit Rate"
                value={metrics.cacheHitRate}
                icon={<TrendingUp className="w-6 h-6" />}
                color="purple"
              />

              <MetricCard
                title="Error Rate"
                value={metrics.errorRate}
                icon={<AlertTriangle className="w-6 h-6" />}
                color="red"
              />
            </div>

            {/* Performance Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Performance Details</h2>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Max Duration:</span>
                    <span className="font-semibold text-gray-900">{metrics.maxDuration}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Min Duration:</span>
                    <span className="font-semibold text-gray-900">{metrics.minDuration}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Checks:</span>
                    <span className="font-semibold text-gray-900">{metrics.totalChecks}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Monitoring Status</h2>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-green-700 bg-green-50 px-4 py-2 rounded-lg">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Performance monitoring is active</span>
                  </div>
                  <div className="text-sm text-gray-600 mt-4">
                    <p className="mb-2">Monitoring includes:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Server-side permission check duration</li>
                      <li>Cache hit/miss rates</li>
                      <li>Error tracking</li>
                      <li>Recent check history (last 100)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Checks */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Checks (Last 10)</h2>
              {metrics.recentChecks && metrics.recentChecks.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Permission</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User ID</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {metrics.recentChecks.map((check, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap">
                            {check.success ? (
                              <span className="text-green-600 flex items-center gap-1">
                                <CheckCircle className="w-4 h-4" />
                                Success
                              </span>
                            ) : (
                              <span className="text-red-600 flex items-center gap-1">
                                <AlertTriangle className="w-4 h-4" />
                                Failed
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 font-mono">
                            {check.permission}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            <span className={check.duration > 500 ? 'text-red-600 font-semibold' : ''}>
                              {check.duration}ms
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 font-mono">
                            {check.userId ? check.userId.substring(0, 8) + '...' : 'unknown'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {new Date(check.timestamp).toLocaleTimeString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No recent checks recorded</p>
              )}
            </div>

            {/* Configuration Note */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
              <div className="flex items-start gap-3">
                <BarChart3 className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">
                    Configuration
                  </h3>
                  <p className="text-blue-800 text-sm mb-3">
                    To enable performance monitoring in production, set the following environment variable:
                  </p>
                  <code className="block bg-blue-100 text-blue-900 px-4 py-2 rounded font-mono text-sm">
                    NEXT_PUBLIC_ENABLE_PERMISSION_MONITORING=true
                  </code>
                  <p className="text-blue-700 text-sm mt-3">
                    Note: Monitoring has minimal performance impact but stores the last 100 checks in memory.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

function MetricCard({ title, value, icon, color }) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    red: 'bg-red-50 text-red-600',
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-600">{title}</span>
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
    </div>
  );
}
