'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { GraduationCap, BookOpen, Users, Award, MessageSquare, TrendingUp, AlertCircle } from 'lucide-react'
import { PageLoading } from '@/components/ui/LoadingSpinner';

export default function SkillsAdminClient({ user }) {
  const supabase = createClient();

  const [stats, setStats] = useState({
    totalModules: 0,
    totalEnrollments: 0,
    certificatesIssued: 0,
    avgCompletion: 0,
    activeTutorSessions: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all data from API route (single source of truth)
        const response = await fetch('/api/admin/skills/data', {
          credentials: 'include'
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || 'Failed to fetch skills data');
        }

        setStats(result.data.stats || {
          totalModules: 0,
          totalEnrollments: 0,
          certificatesIssued: 0,
          avgCompletion: 0,
          activeTutorSessions: 0
        });
      } catch (error) {
        console.error('Error fetching skills stats:', error);
        setError(error.message || 'Failed to load skills data');
        // Set empty stats on error
        setStats({
          totalModules: 0,
          totalEnrollments: 0,
          certificatesIssued: 0,
          avgCompletion: 0,
          activeTutorSessions: 0
        });
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchStats();
    }
  }, [user]);

  if (loading) {
    return <PageLoading message="Loading skills management..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Error: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
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

