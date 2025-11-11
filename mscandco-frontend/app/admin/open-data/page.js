'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { usePermissions } from '@/hooks/usePermissions';
import { Database, Key, TrendingUp, Users, FileText, BarChart3 } from 'lucide-react';

export default function OpenDataAdminPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const { hasPermission, loading: permissionsLoading } = usePermissions();

  const [stats, setStats] = useState({
    totalMetrics: 0,
    datasets: 0,
    apiKeys: 0,
    requests: 0,
    researchers: 0
  });
  const [loading, setLoading] = useState(true);

  // Permission check
  useEffect(() => {
    if (!permissionsLoading) {
      if (!hasPermission('opendata:manage') && !hasPermission('*:*:*')) {
        router.push('/');
        return;
      }
    }
  }, [permissionsLoading, hasPermission, router]);

  // Fetch stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push('/login');
          return;
        }

        // Fetch open data metrics
        const { count: metrics } = await supabase
          .from('open_data_metrics')
          .select('*', { count: 'exact', head: true })
          .eq('is_public', true);

        // Fetch datasets
        const { count: datasets } = await supabase
          .from('research_datasets')
          .select('*', { count: 'exact', head: true })
          .eq('is_published', true);

        // Fetch API keys
        const { count: apiKeys } = await supabase
          .from('open_data_api_keys')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true);

        // Fetch access requests
        const { count: requests } = await supabase
          .from('dataset_access_requests')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');

        // Fetch unique researchers (distinct user_ids from api_keys)
        const { data: keyUsers } = await supabase
          .from('open_data_api_keys')
          .select('user_id', { distinct: true });

        setStats({
          totalMetrics: metrics || 0,
          datasets: datasets || 0,
          apiKeys: apiKeys || 0,
          requests: requests || 0,
          researchers: keyUsers?.length || 0
        });
      } catch (error) {
        console.error('Error fetching open data stats:', error);
      } finally {
        setLoading(false);
      }
    };

    if (!permissionsLoading && hasPermission('opendata:manage')) {
      fetchStats();
    }
  }, [supabase, router, permissionsLoading, hasPermission]);

  if (permissionsLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading open data management...</p>
        </div>
      </div>
    );
  }

  const statsCards = [
    {
      title: 'Public Metrics',
      value: stats.totalMetrics,
      icon: BarChart3,
      color: 'bg-blue-500'
    },
    {
      title: 'Research Datasets',
      value: stats.datasets,
      icon: FileText,
      color: 'bg-purple-500'
    },
    {
      title: 'Active API Keys',
      value: stats.apiKeys,
      icon: Key,
      color: 'bg-green-500'
    },
    {
      title: 'Access Requests',
      value: stats.requests,
      icon: TrendingUp,
      color: 'bg-yellow-500'
    },
    {
      title: 'Active Researchers',
      value: stats.researchers,
      icon: Users,
      color: 'bg-indigo-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Database className="w-8 h-8 text-blue-600" />
            Open Data Administration
          </h1>
          <p className="mt-2 text-gray-600">
            Manage public metrics, research datasets, and API access
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {statsCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-lg shadow p-6">
                <div className="flex flex-col">
                  <div className={`${stat.color} p-3 rounded-lg self-start mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left">
              <BarChart3 className="w-6 h-6 text-blue-600 mb-2" />
              <h3 className="font-semibold text-gray-900">Publish Metrics</h3>
              <p className="text-sm text-gray-600 mt-1">Add new public metrics</p>
            </button>
            <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors text-left">
              <FileText className="w-6 h-6 text-purple-600 mb-2" />
              <h3 className="font-semibold text-gray-900">Manage Datasets</h3>
              <p className="text-sm text-gray-600 mt-1">Create and publish research datasets</p>
            </button>
            <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-left">
              <Key className="w-6 h-6 text-green-600 mb-2" />
              <h3 className="font-semibold text-gray-900">API Key Management</h3>
              <p className="text-sm text-gray-600 mt-1">Monitor and revoke API keys</p>
            </button>
          </div>
        </div>

        {/* API Tiers */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">API Access Tiers</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border-2 border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">Free Tier</h3>
                <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">Public</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">10k</p>
              <p className="text-sm text-gray-600">requests/month</p>
            </div>
            <div className="p-4 border-2 border-blue-200 rounded-lg bg-blue-50">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-blue-900">Research Tier</h3>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Approved</span>
              </div>
              <p className="text-2xl font-bold text-blue-900">100k</p>
              <p className="text-sm text-blue-700">requests/month</p>
            </div>
            <div className="p-4 border-2 border-purple-200 rounded-lg bg-purple-50">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-purple-900">Commercial Tier</h3>
                <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">Partner</span>
              </div>
              <p className="text-2xl font-bold text-purple-900">1M+</p>
              <p className="text-sm text-purple-700">requests/month</p>
            </div>
          </div>
        </div>

        {/* Data Categories */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Data Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['Streaming Trends', 'Genre Analytics', 'Geographic Data', 'Revenue Insights', 'Platform Metrics', 'Artist Demographics', 'Engagement Stats', 'Market Analysis'].map((category, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg text-center">
                <p className="text-sm font-medium text-gray-900">{category}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
