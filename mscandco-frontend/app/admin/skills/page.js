'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { usePermissions } from '@/hooks/usePermissions';
import { GraduationCap, BookOpen, Users, Award, MessageSquare, TrendingUp } from 'lucide-react';

export default function SkillsManagementPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const { hasPermission, loading: permissionsLoading } = usePermissions();

  const [stats, setStats] = useState({
    totalModules: 0,
    totalEnrollments: 0,
    certificatesIssued: 0,
    avgCompletion: 0,
    activeTutorSessions: 0
  });
  const [loading, setLoading] = useState(true);

  // Permission check
  useEffect(() => {
    if (!permissionsLoading) {
      if (!hasPermission('learning:manage') && !hasPermission('*:*:*')) {
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

        // Fetch modules
        const { count: modules } = await supabase
          .from('learning_modules')
          .select('*', { count: 'exact', head: true })
          .eq('is_published', true);

        // Fetch enrollments
        const { count: enrollments } = await supabase
          .from('learning_enrollments')
          .select('*', { count: 'exact', head: true });

        // Fetch certificates
        const { count: certificates } = await supabase
          .from('learning_certificates')
          .select('*', { count: 'exact', head: true });

        // Fetch completion rates
        const { data: progressData } = await supabase
          .from('learning_enrollments')
          .select('progress_percentage');

        const avgCompletion = progressData && progressData.length > 0
          ? Math.round(progressData.reduce((acc, p) => acc + (p.progress_percentage || 0), 0) / progressData.length)
          : 0;

        // Fetch AI tutor sessions
        const { count: sessions } = await supabase
          .from('ai_tutor_sessions')
          .select('*', { count: 'exact', head: true })
          .gte('last_message_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

        setStats({
          totalModules: modules || 0,
          totalEnrollments: enrollments || 0,
          certificatesIssued: certificates || 0,
          avgCompletion,
          activeTutorSessions: sessions || 0
        });
      } catch (error) {
        console.error('Error fetching skills stats:', error);
      } finally {
        setLoading(false);
      }
    };

    if (!permissionsLoading && hasPermission('learning:manage')) {
      fetchStats();
    }
  }, [supabase, router, permissionsLoading, hasPermission]);

  if (permissionsLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading skills management...</p>
        </div>
      </div>
    );
  }

  const statsCards = [
    {
      title: 'Published Modules',
      value: stats.totalModules,
      icon: BookOpen,
      color: 'bg-blue-500'
    },
    {
      title: 'Total Enrollments',
      value: stats.totalEnrollments,
      icon: Users,
      color: 'bg-purple-500'
    },
    {
      title: 'Certificates Issued',
      value: stats.certificatesIssued,
      icon: Award,
      color: 'bg-yellow-500'
    },
    {
      title: 'Avg. Completion',
      value: `${stats.avgCompletion}%`,
      icon: TrendingUp,
      color: 'bg-green-500'
    },
    {
      title: 'Active AI Sessions',
      value: stats.activeTutorSessions,
      icon: MessageSquare,
      color: 'bg-indigo-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <GraduationCap className="w-8 h-8 text-blue-600" />
            Skills Management
          </h1>
          <p className="mt-2 text-gray-600">
            Manage learning modules, track enrollments, and monitor AI tutor performance
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
              <BookOpen className="w-6 h-6 text-blue-600 mb-2" />
              <h3 className="font-semibold text-gray-900">Manage Modules</h3>
              <p className="text-sm text-gray-600 mt-1">Create and edit learning modules</p>
            </button>
            <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors text-left">
              <Users className="w-6 h-6 text-purple-600 mb-2" />
              <h3 className="font-semibold text-gray-900">View Enrollments</h3>
              <p className="text-sm text-gray-600 mt-1">Track student progress and engagement</p>
            </button>
            <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors text-left">
              <MessageSquare className="w-6 h-6 text-indigo-600 mb-2" />
              <h3 className="font-semibold text-gray-900">AI Tutor Analytics</h3>
              <p className="text-sm text-gray-600 mt-1">Monitor AI tutor conversations and effectiveness</p>
            </button>
          </div>
        </div>

        {/* Learning Categories */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Learning Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {['Music Distribution', 'Copyright & Licensing', 'Marketing & Promotion', 'Analytics & Insights', 'Financial Management', 'Platform Tools'].map((category, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900">{category}</h3>
                <p className="text-sm text-gray-600 mt-1">View modules →</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
