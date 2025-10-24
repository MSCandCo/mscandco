'use client'

import { useState, useEffect } from 'react';
import { useUser } from '@/components/providers/SupabaseProvider';
import { usePermissions } from '@/hooks/usePermissions';
import Link from 'next/link';
import { 
  AlertTriangle, 
  Activity, 
  Shield, 
  Database, 
  TrendingUp, 
  Mail, 
  FileText, 
  Clock, 
  Zap,
  BarChart3,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

export default function SystemsClient() {
  const { user } = useUser();
  const { hasPermission } = usePermissions();
  const [systemStatus, setSystemStatus] = useState({
    errors: { status: 'loading', count: 0 },
    rateLimit: { status: 'loading', blocked: 0 },
    logs: { status: 'loading', size: '0 MB' },
    backups: { status: 'loading', lastBackup: null },
    uptime: { status: 'loading', percentage: 0 },
    security: { status: 'loading', alerts: 0 },
    performance: { status: 'loading', avgResponseTime: 0 },
    analytics: { status: 'loading', activeUsers: 0 },
    email: { status: 'loading', sent: 0 },
    docs: { status: 'loading', pages: 0 }
  });

  useEffect(() => {
    fetchSystemStatus();
    const interval = setInterval(fetchSystemStatus, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchSystemStatus = async () => {
    try {
      const response = await fetch('/api/admin/systems/status', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setSystemStatus(data);
      }
    } catch (error) {
      console.error('Error fetching system status:', error);
    }
  };

  const systemModules = [
    {
      id: 'errors',
      title: 'Error Tracking',
      description: 'Monitor and track application errors in real-time',
      icon: AlertTriangle,
      color: 'red',
      href: '/admin/systems/errors',
      permission: 'systems:errors:view',
      stats: [
        { label: 'Last 24h', value: systemStatus.errors.count },
        { label: 'Status', value: systemStatus.errors.status }
      ]
    },
    {
      id: 'ratelimit',
      title: 'Rate Limiting',
      description: 'Configure and monitor API rate limits',
      icon: Clock,
      color: 'orange',
      href: '/admin/systems/ratelimit',
      permission: 'systems:ratelimit:view',
      stats: [
        { label: 'Blocked Today', value: systemStatus.rateLimit.blocked },
        { label: 'Status', value: systemStatus.rateLimit.status }
      ]
    },
    {
      id: 'logs',
      title: 'Logging & Observability',
      description: 'View system logs and application metrics',
      icon: Activity,
      color: 'blue',
      href: '/admin/systems/logs',
      permission: 'systems:logs:view',
      stats: [
        { label: 'Log Size', value: systemStatus.logs.size },
        { label: 'Status', value: systemStatus.logs.status }
      ]
    },
    {
      id: 'backups',
      title: 'Backup & Recovery',
      description: 'Manage database backups and disaster recovery',
      icon: Database,
      color: 'purple',
      href: '/admin/systems/backups',
      permission: 'systems:backups:view',
      stats: [
        { label: 'Last Backup', value: systemStatus.backups.lastBackup || 'N/A' },
        { label: 'Status', value: systemStatus.backups.status }
      ]
    },
    {
      id: 'uptime',
      title: 'Uptime Monitoring',
      description: 'Monitor platform uptime and availability',
      icon: TrendingUp,
      color: 'green',
      href: '/admin/systems/uptime',
      permission: 'systems:uptime:view',
      stats: [
        { label: 'Uptime', value: `${systemStatus.uptime.percentage}%` },
        { label: 'Status', value: systemStatus.uptime.status }
      ]
    },
    {
      id: 'security',
      title: 'Security Management',
      description: 'Security policies, audit logs, and threat detection',
      icon: Shield,
      color: 'red',
      href: '/admin/systems/security',
      permission: 'systems:security:view',
      stats: [
        { label: 'Alerts', value: systemStatus.security.alerts },
        { label: 'Status', value: systemStatus.security.status }
      ]
    },
    {
      id: 'performance',
      title: 'Performance Monitoring',
      description: 'Track application performance and optimize speed',
      icon: Zap,
      color: 'yellow',
      href: '/admin/systems/performance',
      permission: 'systems:performance:view',
      stats: [
        { label: 'Avg Response', value: `${systemStatus.performance.avgResponseTime}ms` },
        { label: 'Status', value: systemStatus.performance.status }
      ]
    },
    {
      id: 'analytics',
      title: 'User Analytics',
      description: 'User behavior, conversion metrics, and insights',
      icon: BarChart3,
      color: 'indigo',
      href: '/admin/systems/analytics',
      permission: 'systems:analytics:view',
      stats: [
        { label: 'Active Users', value: systemStatus.analytics.activeUsers },
        { label: 'Status', value: systemStatus.analytics.status }
      ]
    },
    {
      id: 'email',
      title: 'Email System',
      description: 'Manage email templates, delivery, and monitoring',
      icon: Mail,
      color: 'pink',
      href: '/admin/systems/email',
      permission: 'systems:email:view',
      stats: [
        { label: 'Sent Today', value: systemStatus.email.sent },
        { label: 'Status', value: systemStatus.email.status }
      ]
    },
    {
      id: 'docs',
      title: 'Documentation Hub',
      description: 'System documentation, guides, and API references',
      icon: FileText,
      color: 'gray',
      href: '/admin/systems/docs',
      permission: 'systems:docs:view',
      stats: [
        { label: 'Pages', value: systemStatus.docs.pages },
        { label: 'Status', value: systemStatus.docs.status }
      ]
    }
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy':
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
      case 'degraded':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'error':
      case 'down':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-400 animate-pulse" />;
    }
  };

  const getColorClasses = (color) => {
    const colors = {
      red: 'bg-red-50 border-red-200 hover:border-red-300',
      orange: 'bg-orange-50 border-orange-200 hover:border-orange-300',
      blue: 'bg-blue-50 border-blue-200 hover:border-blue-300',
      purple: 'bg-purple-50 border-purple-200 hover:border-purple-300',
      green: 'bg-green-50 border-green-200 hover:border-green-300',
      yellow: 'bg-yellow-50 border-yellow-200 hover:border-yellow-300',
      indigo: 'bg-indigo-50 border-indigo-200 hover:border-indigo-300',
      pink: 'bg-pink-50 border-pink-200 hover:border-pink-300',
      gray: 'bg-gray-50 border-gray-200 hover:border-gray-300'
    };
    return colors[color] || colors.gray;
  };

  const getIconColorClasses = (color) => {
    const colors = {
      red: 'text-red-600',
      orange: 'text-orange-600',
      blue: 'text-blue-600',
      purple: 'text-purple-600',
      green: 'text-green-600',
      yellow: 'text-yellow-600',
      indigo: 'text-indigo-600',
      pink: 'text-pink-600',
      gray: 'text-gray-600'
    };
    return colors[color] || colors.gray;
  };

  // Filter modules based on permissions
  const visibleModules = systemModules.filter(module => 
    hasPermission(module.permission)
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Systems Management</h1>
          <p className="text-gray-600">
            Monitor and manage platform infrastructure, security, and performance
          </p>
        </div>

        {/* System Status Overview */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Overall System Status</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {visibleModules.slice(0, 5).map(module => (
              <div key={module.id} className="text-center">
                <div className="flex items-center justify-center mb-2">
                  {getStatusIcon(module.stats[1].value)}
                </div>
                <p className="text-sm font-medium text-gray-900">{module.title}</p>
                <p className="text-xs text-gray-500">{module.stats[1].value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Systems Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleModules.map(module => {
            const Icon = module.icon;
            return (
              <Link
                key={module.id}
                href={module.href}
                className={`block p-6 rounded-lg border-2 transition-all hover:shadow-md ${getColorClasses(module.color)}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg bg-white ${getIconColorClasses(module.color)}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  {getStatusIcon(module.stats[1].value)}
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {module.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {module.description}
                </p>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                  {module.stats.map((stat, idx) => (
                    <div key={idx}>
                      <p className="text-xs text-gray-500">{stat.label}</p>
                      <p className="text-sm font-semibold text-gray-900">{stat.value}</p>
                    </div>
                  ))}
                </div>
              </Link>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Run Health Check
            </button>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              View Audit Logs
            </button>
            <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              Generate Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

