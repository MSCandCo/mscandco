'use client'

import { useState, useEffect } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { AlertTriangle, TrendingDown, TrendingUp, Filter, Download, RefreshCw, Eye, Trash2, CheckCircle } from 'lucide-react';
import { PageLoading } from '@/components/ui/LoadingSpinner';

export default function ErrorTrackingClient() {
  const { hasPermission } = usePermissions();
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, critical, warning, info
  const [timeRange, setTimeRange] = useState('24h'); // 24h, 7d, 30d
  const [stats, setStats] = useState({
    total: 0,
    critical: 0,
    resolved: 0,
    trend: 0
  });

  useEffect(() => {
    fetchErrors();
  }, [filter, timeRange]);

  const fetchErrors = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/systems/errors?filter=${filter}&timeRange=${timeRange}`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setErrors(data.errors || []);
        setStats(data.stats || stats);
      }
    } catch (error) {
      console.error('Error fetching errors:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsResolved = async (errorId) => {
    if (!hasPermission('systems:errors:manage')) return;
    
    try {
      const response = await fetch(`/api/admin/systems/errors/${errorId}/resolve`, {
        method: 'POST',
        credentials: 'include'
      });
      
      if (response.ok) {
        fetchErrors();
      }
    } catch (error) {
      console.error('Error marking as resolved:', error);
    }
  };

  const deleteError = async (errorId) => {
    if (!hasPermission('systems:errors:manage')) return;
    
    if (!confirm('Are you sure you want to delete this error log?')) return;
    
    try {
      const response = await fetch(`/api/admin/systems/errors/${errorId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (response.ok) {
        fetchErrors();
      }
    } catch (error) {
      console.error('Error deleting error:', error);
    }
  };

  const exportErrors = () => {
    const csv = [
      ['Timestamp', 'Type', 'Message', 'User', 'Resource', 'Status'],
      ...errors.map(e => [
        new Date(e.created_at).toISOString(),
        e.action || 'N/A',
        e.error_message || 'N/A',
        e.email || 'Anonymous',
        e.resource_type || 'N/A',
        e.status || 'error'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `errors-${new Date().toISOString()}.csv`;
    a.click();
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'info': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
              <AlertTriangle className="w-8 h-8 mr-3 text-red-600" />
              Error Tracking
            </h1>
            <p className="text-gray-600">Monitor and resolve application errors</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={fetchErrors}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button
              onClick={exportErrors}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Total Errors</p>
              <AlertTriangle className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            <div className="flex items-center mt-2">
              {stats.trend >= 0 ? (
                <TrendingUp className="w-4 h-4 text-red-500 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 text-green-500 mr-1" />
              )}
              <span className={`text-sm ${stats.trend >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                {Math.abs(stats.trend)}% from last period
              </span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Critical</p>
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            </div>
            <p className="text-3xl font-bold text-red-600">{stats.critical}</p>
            <p className="text-sm text-gray-500 mt-2">Requires immediate attention</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Resolved</p>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-green-600">{stats.resolved}</p>
            <p className="text-sm text-gray-500 mt-2">Successfully fixed</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Resolution Rate</p>
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            </div>
            <p className="text-3xl font-bold text-blue-600">
              {stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0}%
            </p>
            <p className="text-sm text-gray-500 mt-2">Of all errors</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center gap-4">
            <Filter className="w-5 h-5 text-gray-400" />
            <div className="flex gap-2">
              {['all', 'critical', 'warning', 'info'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-lg capitalize transition-colors ${
                    filter === f
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
            <div className="ml-auto flex gap-2">
              {['24h', '7d', '30d'].map(t => (
                <button
                  key={t}
                  onClick={() => setTimeRange(t)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    timeRange === t
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Error List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : errors.length === 0 ? (
            <div className="text-center py-12">
              <AlertTriangle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Errors Found</h3>
              <p className="text-gray-500">No errors match your current filters</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {errors.map(error => (
                <div key={error.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-2 py-1 rounded text-xs font-semibold border ${getSeverityColor(error.severity || 'error')}`}>
                          {error.action || 'ERROR'}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(error.created_at).toLocaleString()}
                        </span>
                        {error.user_agent && (
                          <span className="text-xs text-gray-400">
                            {error.user_agent.substring(0, 50)}...
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {error.error_message || 'Unknown error'}
                      </h3>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">User:</span>
                          <span className="ml-2 text-gray-900">{error.email || 'Anonymous'}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Resource:</span>
                          <span className="ml-2 text-gray-900">{error.resource_type || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">IP:</span>
                          <span className="ml-2 text-gray-900">{error.ip_address || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                    {hasPermission('systems:errors:manage') && (
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => markAsResolved(error.id)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Mark as resolved"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => deleteError(error.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </div>
                  {error.metadata && Object.keys(error.metadata).length > 0 && (
                    <details className="mt-3">
                      <summary className="cursor-pointer text-sm text-blue-600 hover:text-blue-700">
                        View metadata
                      </summary>
                      <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-x-auto">
                        {JSON.stringify(error.metadata, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

