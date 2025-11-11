'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { usePermissions } from '@/hooks/usePermissions';
import { Accessibility, Globe, Users, FileText, CheckCircle, AlertCircle } from 'lucide-react';

export default function AccessibilityAdminPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const { hasPermission, loading: permissionsLoading } = usePermissions();

  const [stats, setStats] = useState({
    totalContent: 0,
    languages: 0,
    compliance: 0,
    requests: 0
  });
  const [loading, setLoading] = useState(true);

  // Permission check
  useEffect(() => {
    if (!permissionsLoading) {
      if (!hasPermission('accessibility:manage') && !hasPermission('*:*:*')) {
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

        // Fetch accessibility content stats
        const { count: contentCount } = await supabase
          .from('accessibility_content')
          .select('*', { count: 'exact', head: true });

        // Fetch unique languages
        const { data: languages } = await supabase
          .from('accessibility_content')
          .select('language_code', { distinct: true });

        // Fetch compliance stats
        const { data: compliance } = await supabase
          .from('accessibility_compliance')
          .select('overall_score');

        // Fetch pending requests
        const { count: requestsCount } = await supabase
          .from('accessibility_requests')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');

        const avgCompliance = compliance && compliance.length > 0
          ? compliance.reduce((acc, c) => acc + (c.overall_score || 0), 0) / compliance.length
          : 0;

        setStats({
          totalContent: contentCount || 0,
          languages: languages?.length || 0,
          compliance: Math.round(avgCompliance),
          requests: requestsCount || 0
        });
      } catch (error) {
        console.error('Error fetching accessibility stats:', error);
      } finally {
        setLoading(false);
      }
    };

    if (!permissionsLoading && hasPermission('accessibility:manage')) {
      fetchStats();
    }
  }, [supabase, router, permissionsLoading, hasPermission]);

  if (permissionsLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading accessibility management...</p>
        </div>
      </div>
    );
  }

  const statsCards = [
    {
      title: 'Content Items',
      value: stats.totalContent,
      icon: FileText,
      color: 'bg-blue-500'
    },
    {
      title: 'Languages Supported',
      value: stats.languages,
      icon: Globe,
      color: 'bg-purple-500'
    },
    {
      title: 'Avg. WCAG Compliance',
      value: `${stats.compliance}%`,
      icon: CheckCircle,
      color: 'bg-green-500'
    },
    {
      title: 'Pending Requests',
      value: stats.requests,
      icon: AlertCircle,
      color: 'bg-yellow-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Accessibility className="w-8 h-8" />
            Accessibility Administration
          </h1>
          <p className="mt-2 text-gray-600">
            Monitor and manage accessibility content across the platform
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
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
              <FileText className="w-6 h-6 text-blue-600 mb-2" />
              <h3 className="font-semibold text-gray-900">View All Content</h3>
              <p className="text-sm text-gray-600 mt-1">Browse generated accessibility content</p>
            </button>
            <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors text-left">
              <Users className="w-6 h-6 text-purple-600 mb-2" />
              <h3 className="font-semibold text-gray-900">Manage Interpreters</h3>
              <p className="text-sm text-gray-600 mt-1">View and manage sign language interpreters</p>
            </button>
            <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-left">
              <CheckCircle className="w-6 h-6 text-green-600 mb-2" />
              <h3 className="font-semibold text-gray-900">Compliance Reports</h3>
              <p className="text-sm text-gray-600 mt-1">View WCAG compliance analytics</p>
            </button>
          </div>
        </div>

        {/* Info Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-2">Accessibility Features</h2>
          <ul className="text-blue-800 space-y-2">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <span>AI-powered transcription and audio description generation</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <span>Support for 94 languages with professional translation</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <span>WCAG 2.1 Level AAA compliance tracking</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <span>Professional sign language interpreter marketplace</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
