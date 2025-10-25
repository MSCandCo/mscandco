'use client'

import { useState, useEffect } from 'react'
import { 
  Activity, 
  Database, 
  TrendingUp, 
  Zap, 
  Radio,
  ExternalLink,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw
} from 'lucide-react'

export default function SystemsDashboardClient() {
  const [loading, setLoading] = useState(true)
  const [services, setServices] = useState({
    sentry: { loading: true, configured: false },
    redis: { loading: true, configured: false },
    posthog: { loading: true, configured: false },
    inngest: { loading: true, configured: false },
    realtime: { loading: true, configured: false },
  })

  useEffect(() => {
    fetchAllServices()
  }, [])

  const fetchAllServices = async () => {
    setLoading(true)

    // Fetch all service stats in parallel
    const [sentryRes, redisRes, posthogRes, inngestRes, realtimeRes] = await Promise.allSettled([
      fetch('/api/admin/systems/sentry-stats'),
      fetch('/api/admin/systems/redis-stats'),
      fetch('/api/admin/systems/posthog-stats'),
      fetch('/api/admin/systems/inngest-stats'),
      fetch('/api/admin/systems/realtime-stats'),
    ])

    // Process Sentry
    if (sentryRes.status === 'fulfilled' && sentryRes.value.ok) {
      const data = await sentryRes.value.json()
      setServices(prev => ({ ...prev, sentry: { loading: false, ...data } }))
    } else {
      setServices(prev => ({ ...prev, sentry: { loading: false, configured: false, error: true } }))
    }

    // Process Redis
    if (redisRes.status === 'fulfilled' && redisRes.value.ok) {
      const data = await redisRes.value.json()
      setServices(prev => ({ ...prev, redis: { loading: false, ...data } }))
    } else {
      setServices(prev => ({ ...prev, redis: { loading: false, configured: false, error: true } }))
    }

    // Process PostHog
    if (posthogRes.status === 'fulfilled' && posthogRes.value.ok) {
      const data = await posthogRes.value.json()
      setServices(prev => ({ ...prev, posthog: { loading: false, ...data } }))
    } else {
      setServices(prev => ({ ...prev, posthog: { loading: false, configured: false, error: true } }))
    }

    // Process Inngest
    if (inngestRes.status === 'fulfilled' && inngestRes.value.ok) {
      const data = await inngestRes.value.json()
      setServices(prev => ({ ...prev, inngest: { loading: false, ...data } }))
    } else {
      setServices(prev => ({ ...prev, inngest: { loading: false, configured: false, error: true } }))
    }

    // Process Realtime
    if (realtimeRes.status === 'fulfilled' && realtimeRes.value.ok) {
      const data = await realtimeRes.value.json()
      setServices(prev => ({ ...prev, realtime: { loading: false, ...data } }))
    } else {
      setServices(prev => ({ ...prev, realtime: { loading: false, configured: false, error: true } }))
    }

    setLoading(false)
  }

  const getStatusIcon = (service) => {
    if (service.loading) {
      return <RefreshCw className="w-5 h-5 text-gray-400 animate-spin" />
    }
    if (service.configured) {
      return <CheckCircle2 className="w-5 h-5 text-green-500" />
    }
    if (service.error) {
      return <XCircle className="w-5 h-5 text-red-500" />
    }
    return <AlertTriangle className="w-5 h-5 text-yellow-500" />
  }

  const getStatusText = (service) => {
    if (service.loading) return 'Loading...'
    if (service.configured) return 'Active'
    if (service.error) return 'Error'
    return 'Not Configured'
  }

  const getStatusColor = (service) => {
    if (service.loading) return 'bg-gray-100 text-gray-700'
    if (service.configured) return 'bg-green-100 text-green-800'
    if (service.error) return 'bg-red-100 text-red-800'
    return 'bg-yellow-100 text-yellow-800'
  }

  const serviceCards = [
    {
      key: 'sentry',
      name: 'Sentry',
      description: 'Error Tracking & Performance Monitoring',
      icon: Activity,
      color: 'purple',
    },
    {
      key: 'redis',
      name: 'Upstash Redis',
      description: 'Serverless Caching & Rate Limiting',
      icon: Database,
      color: 'green',
    },
    {
      key: 'posthog',
      name: 'PostHog',
      description: 'Product Analytics & Feature Flags',
      icon: TrendingUp,
      color: 'blue',
    },
    {
      key: 'inngest',
      name: 'Inngest',
      description: 'Background Jobs & Workflows',
      icon: Zap,
      color: 'orange',
    },
    {
      key: 'realtime',
      name: 'Supabase Realtime',
      description: 'WebSocket Connections & Live Updates',
      icon: Radio,
      color: 'teal',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Systems Dashboard</h1>
          <p className="text-gray-600 mt-1">Enterprise infrastructure monitoring</p>
        </div>
        <button
          onClick={fetchAllServices}
          disabled={loading}
          className="px-4 py-2 bg-orange-600 text-white rounded-lg flex items-center space-x-2 hover:bg-orange-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Service Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {serviceCards.map((card) => {
          const service = services[card.key]
          const Icon = card.icon

          return (
            <div
              key={card.key}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg bg-${card.color}-100`}>
                  <Icon className={`w-6 h-6 text-${card.color}-600`} />
                </div>
                {getStatusIcon(service)}
              </div>

              {/* Title */}
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{card.name}</h3>
              <p className="text-sm text-gray-600 mb-4">{card.description}</p>

              {/* Status */}
              <div className="flex items-center justify-between mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(service)}`}>
                  {getStatusText(service)}
                </span>
              </div>

              {/* Details */}
              {service.configured && !service.loading && (
                <div className="space-y-2 mb-4">
                  {service.features && (
                    <div className="text-xs text-gray-600">
                      <strong>Features:</strong>
                      <ul className="list-disc list-inside mt-1 space-y-1">
                        {service.features.slice(0, 3).map((feature, idx) => (
                          <li key={idx}>{feature}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {service.functions && (
                    <div className="text-xs text-gray-600">
                      <strong>Functions:</strong>
                      <ul className="list-disc list-inside mt-1 space-y-1">
                        {service.functions.map((fn, idx) => (
                          <li key={idx}>{fn}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {service.channels && (
                    <div className="text-xs text-gray-600">
                      <strong>Channels:</strong> {service.channels.join(', ')}
                    </div>
                  )}
                  {service.database_size !== undefined && (
                    <div className="text-xs text-gray-600">
                      <strong>Database Size:</strong> {service.database_size} keys
                    </div>
                  )}
                </div>
              )}

              {!service.configured && !service.loading && (
                <div className="text-xs text-gray-600 mb-4">
                  {service.message || 'Service not configured'}
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-2">
                {service.dashboard_url && service.configured && (
                  <a
                    href={service.dashboard_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex items-center justify-center space-x-1"
                  >
                    <span>Dashboard</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {service.setup_url && !service.configured && (
                  <a
                    href={service.setup_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-3 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors flex items-center justify-center space-x-1"
                  >
                    <span>Setup</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Documentation Link */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">📚 Setup Documentation</h3>
        <p className="text-blue-800 mb-4">
          Need help setting up these services? Check out our comprehensive setup guide.
        </p>
        <a
          href="/docs/ENTERPRISE_STACK.md"
          target="_blank"
          className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <span>View Setup Guide</span>
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  )
}

