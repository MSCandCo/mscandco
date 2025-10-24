'use client'

import { useState, useEffect } from 'react'
import { Activity, CheckCircle, XCircle, Clock, TrendingUp, AlertTriangle, RefreshCw, Globe } from 'lucide-react'

export default function UptimeClient() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    overallUptime: 99.9,
    avgResponseTime: 150,
    totalIncidents: 3,
    activeIncidents: 0
  })
  const [timeRange, setTimeRange] = useState('24h')
  const [incidents, setIncidents] = useState([])

  useEffect(() => {
    fetchServices()
    fetchStats()
    fetchIncidents()
    
    // Refresh every 30 seconds
    const interval = setInterval(() => {
      fetchServices()
      fetchStats()
    }, 30000)

    return () => clearInterval(interval)
  }, [timeRange])

  const fetchServices = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/systems/uptime?range=${timeRange}`)
      if (response.ok) {
        const data = await response.json()
        setServices(data.services || [])
      }
    } catch (error) {
      console.error('Failed to fetch services:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch(`/api/admin/systems/uptime/stats?range=${timeRange}`)
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  const fetchIncidents = async () => {
    try {
      const response = await fetch('/api/admin/systems/uptime/incidents')
      if (response.ok) {
        const data = await response.json()
        setIncidents(data.incidents || [])
      }
    } catch (error) {
      console.error('Failed to fetch incidents:', error)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'operational':
        return 'text-green-600 bg-green-100'
      case 'degraded':
        return 'text-yellow-600 bg-yellow-100'
      case 'down':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'operational':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'degraded':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />
      case 'down':
        return <XCircle className="w-5 h-5 text-red-600" />
      default:
        return <Activity className="w-5 h-5 text-gray-600" />
    }
  }

  const getUptimeColor = (uptime) => {
    if (uptime >= 99.9) return 'text-green-600'
    if (uptime >= 99) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Uptime Monitoring</h1>
            <p className="text-gray-600 mt-1">Monitor system uptime and service availability</p>
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
                fetchServices()
                fetchStats()
                fetchIncidents()
              }}
              className="flex items-center gap-2 px-4 py-2 bg-[#2D2D2D] text-white rounded-lg hover:bg-[#1a1a1a] transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Overall Uptime</p>
                <p className={`text-2xl font-bold ${getUptimeColor(stats.overallUptime)}`}>
                  {stats.overallUptime}%
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Response Time</p>
                <p className="text-2xl font-bold text-gray-900">{stats.avgResponseTime}ms</p>
              </div>
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Incidents</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalIncidents}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Incidents</p>
                <p className={`text-2xl font-bold ${stats.activeIncidents > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {stats.activeIncidents}
                </p>
              </div>
              <Activity className="w-8 h-8 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Services Status */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Service Status</h2>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-6 h-6 text-gray-400 animate-spin" />
              </div>
            ) : services.length === 0 ? (
              <div className="text-center py-12">
                <Globe className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No services configured</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {services.map((service) => (
                  <div key={service.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        {getStatusIcon(service.status)}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-medium text-gray-900">{service.name}</h3>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(service.status)}`}>
                              {service.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{service.url}</p>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Uptime:</span>
                              <span className={`ml-2 font-medium ${getUptimeColor(service.uptime)}`}>
                                {service.uptime}%
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">Response:</span>
                              <span className="ml-2 font-medium text-gray-900">{service.responseTime}ms</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Last Check:</span>
                              <span className="ml-2 font-medium text-gray-900">
                                {new Date(service.lastCheck).toLocaleTimeString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Uptime Bar */}
                    <div className="mt-4">
                      <div className="flex items-center gap-1 h-8">
                        {service.history?.map((status, index) => (
                          <div
                            key={index}
                            className={`flex-1 h-full rounded-sm ${
                              status === 'up' ? 'bg-green-500' : 
                              status === 'degraded' ? 'bg-yellow-500' : 
                              'bg-red-500'
                            }`}
                            title={`${status} - ${new Date(Date.now() - (service.history.length - index) * 3600000).toLocaleString()}`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Last {service.history?.length || 0} checks</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Incidents */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Recent Incidents</h2>
            </div>
            {incidents.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <p className="text-gray-600">No recent incidents</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {incidents.map((incident) => (
                  <div key={incident.id} className="p-4">
                    <div className="flex items-start gap-3">
                      {incident.status === 'resolved' ? (
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 mb-1">{incident.title}</p>
                        <p className="text-xs text-gray-600 mb-2">{incident.service}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(incident.created_at).toLocaleString()}</span>
                        </div>
                        {incident.status === 'resolved' && incident.resolved_at && (
                          <p className="text-xs text-green-600 mt-1">
                            Resolved {new Date(incident.resolved_at).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Status Legend */}
          <div className="mt-6 bg-gray-50 rounded-lg border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Status Legend</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-gray-700">Operational - All systems running normally</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
                <span className="text-gray-700">Degraded - Experiencing issues</span>
              </div>
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-600" />
                <span className="text-gray-700">Down - Service unavailable</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

