'use client'

import { useState, useEffect } from 'react'
import { Activity, Cpu, HardDrive, Zap, TrendingUp, Clock, Database, Globe, RefreshCw } from 'lucide-react'

export default function PerformanceClient() {
  const [metrics, setMetrics] = useState({
    cpu: { current: 0, avg: 0, peak: 0 },
    memory: { current: 0, avg: 0, peak: 0, total: 0 },
    disk: { used: 0, total: 0, percentage: 0 },
    network: { inbound: 0, outbound: 0 }
  })
  const [apiMetrics, setApiMetrics] = useState([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('1h')

  useEffect(() => {
    fetchMetrics()
    fetchApiMetrics()
    
    // Refresh every 10 seconds
    const interval = setInterval(() => {
      fetchMetrics()
      fetchApiMetrics()
    }, 10000)

    return () => clearInterval(interval)
  }, [timeRange])

  const fetchMetrics = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/systems/performance?range=${timeRange}`)
      if (response.ok) {
        const data = await response.json()
        setMetrics(data.metrics)
      }
    } catch (error) {
      console.error('Failed to fetch metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchApiMetrics = async () => {
    try {
      const response = await fetch(`/api/admin/systems/performance/api?range=${timeRange}`)
      if (response.ok) {
        const data = await response.json()
        setApiMetrics(data.endpoints || [])
      }
    } catch (error) {
      console.error('Failed to fetch API metrics:', error)
    }
  }

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const getPerformanceColor = (value, thresholds = { warning: 70, critical: 90 }) => {
    if (value >= thresholds.critical) return 'text-red-600'
    if (value >= thresholds.warning) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getPerformanceBgColor = (value, thresholds = { warning: 70, critical: 90 }) => {
    if (value >= thresholds.critical) return 'bg-red-500'
    if (value >= thresholds.warning) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Performance Monitoring</h1>
            <p className="text-gray-600 mt-1">Monitor application performance and resource usage</p>
          </div>
          <div className="flex gap-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2D2D2D] focus:border-transparent"
            >
              <option value="1h">Last Hour</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
            <button
              onClick={() => {
                fetchMetrics()
                fetchApiMetrics()
              }}
              className="flex items-center gap-2 px-4 py-2 bg-[#2D2D2D] text-white rounded-lg hover:bg-[#1a1a1a] transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* System Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* CPU Usage */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Cpu className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">CPU Usage</p>
                  <p className={`text-2xl font-bold ${getPerformanceColor(metrics.cpu.current)}`}>
                    {metrics.cpu.current}%
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Average:</span>
                <span className="font-medium">{metrics.cpu.avg}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Peak:</span>
                <span className="font-medium">{metrics.cpu.peak}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                <div
                  className={`h-2 rounded-full transition-all ${getPerformanceBgColor(metrics.cpu.current)}`}
                  style={{ width: `${metrics.cpu.current}%` }}
                />
              </div>
            </div>
          </div>

          {/* Memory Usage */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Database className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Memory Usage</p>
                  <p className={`text-2xl font-bold ${getPerformanceColor(metrics.memory.current)}`}>
                    {metrics.memory.current}%
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Used:</span>
                <span className="font-medium">{formatBytes(metrics.memory.total * metrics.memory.current / 100)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total:</span>
                <span className="font-medium">{formatBytes(metrics.memory.total)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                <div
                  className={`h-2 rounded-full transition-all ${getPerformanceBgColor(metrics.memory.current)}`}
                  style={{ width: `${metrics.memory.current}%` }}
                />
              </div>
            </div>
          </div>

          {/* Disk Usage */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <HardDrive className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Disk Usage</p>
                  <p className={`text-2xl font-bold ${getPerformanceColor(metrics.disk.percentage)}`}>
                    {metrics.disk.percentage}%
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Used:</span>
                <span className="font-medium">{formatBytes(metrics.disk.used)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total:</span>
                <span className="font-medium">{formatBytes(metrics.disk.total)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                <div
                  className={`h-2 rounded-full transition-all ${getPerformanceBgColor(metrics.disk.percentage)}`}
                  style={{ width: `${metrics.disk.percentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Network */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Globe className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Network</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatBytes(metrics.network.inbound + metrics.network.outbound)}
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Inbound:</span>
                <span className="font-medium">{formatBytes(metrics.network.inbound)}/s</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Outbound:</span>
                <span className="font-medium">{formatBytes(metrics.network.outbound)}/s</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* API Performance */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">API Endpoint Performance</h2>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-6 h-6 text-gray-400 animate-spin" />
          </div>
        ) : apiMetrics.length === 0 ? (
          <div className="text-center py-12">
            <Activity className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No API metrics available</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Endpoint
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Requests
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg Response Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Success Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Errors
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {apiMetrics.map((endpoint, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">{endpoint.path}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{endpoint.requests.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className={`text-sm font-medium ${getPerformanceColor(endpoint.avgResponseTime, { warning: 500, critical: 1000 })}`}>
                          {endpoint.avgResponseTime}ms
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${getPerformanceColor(100 - endpoint.successRate, { warning: 5, critical: 10 })}`}>
                        {endpoint.successRate}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-red-600 font-medium">{endpoint.errors}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

