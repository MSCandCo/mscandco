import { useState, useEffect } from 'react';
import { useUser } from '@/components/providers/SupabaseProvider';
import { supabase } from '@/lib/supabase';
import Layout from '@/components/layouts/mainLayout';
import Header from '@/components/header';
import {
  Inbox,
  RefreshCw,
  Clock,
  CheckCircle,
  TrendingUp,
  AlertCircle,
  ArrowRight,
  Music
} from 'lucide-react';
import Link from 'next/link';

export default function DistributionDashboard() {
  const { user } = useUser();
  const [stats, setStats] = useState({
    pending: 0,
    inReview: 0,
    completed: 0,
    revisions: 0,
    todaySubmissions: 0,
    weekSubmissions: 0
  });
  const [recentReleases, setRecentReleases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Get all releases in distribution queues
      const { data: releases, error } = await supabase
        .from('releases')
        .select('*')
        .in('status', ['submitted', 'in_review', 'completed', 'revision'])
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // Calculate stats
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

      const stats = {
        pending: releases.filter(r => r.status === 'submitted').length,
        inReview: releases.filter(r => r.status === 'in_review').length,
        completed: releases.filter(r => r.status === 'completed').length,
        revisions: releases.filter(r => r.status === 'revision').length,
        todaySubmissions: releases.filter(r => {
          const submittedDate = new Date(r.updated_at);
          return submittedDate >= today && r.status === 'submitted';
        }).length,
        weekSubmissions: releases.filter(r => {
          const submittedDate = new Date(r.updated_at);
          return submittedDate >= weekAgo && r.status === 'submitted';
        }).length
      };

      setStats(stats);
      setRecentReleases(releases.slice(0, 5));
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Header />
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-900">Distribution Dashboard</h1>
            <p className="mt-2 text-gray-600">Manage release submissions and distribution workflow</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Link href="/distribution/queue?status=submitted">
              <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Pending Review</p>
                    <p className="text-3xl font-bold text-blue-600">{stats.pending}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Inbox className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm text-gray-500">
                  <Clock className="w-4 h-4 mr-1" />
                  {stats.todaySubmissions} today
                </div>
              </div>
            </Link>

            <Link href="/distribution/queue?status=in_review">
              <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">In Review</p>
                    <p className="text-3xl font-bold text-orange-600">{stats.inReview}</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm text-gray-500">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  In progress
                </div>
              </div>
            </Link>

            <Link href="/distribution/revisions">
              <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Revisions</p>
                    <p className="text-3xl font-bold text-purple-600">{stats.revisions}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <RefreshCw className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm text-gray-500">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  Needs attention
                </div>
              </div>
            </Link>

            <Link href="/distribution/queue?status=completed">
              <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Completed</p>
                    <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm text-gray-500">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Ready for DSPs
                </div>
              </div>
            </Link>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link href="/distribution/queue">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Inbox className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Review Submissions</p>
                      <p className="text-sm text-gray-500">{stats.pending} releases waiting</p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </div>
              </Link>

              <Link href="/distribution/revisions">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <RefreshCw className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Handle Revisions</p>
                      <p className="text-sm text-gray-500">{stats.revisions} revision requests</p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </div>
              </Link>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {recentReleases.length > 0 ? (
                recentReleases.map((release) => (
                  <div key={release.id} className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {release.artwork_url ? (
                          <img
                            src={release.artwork_url}
                            alt={release.title}
                            className="w-12 h-12 rounded object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                            <Music className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{release.title}</p>
                          <p className="text-sm text-gray-500">{release.artist_name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                          release.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                          release.status === 'in_review' ? 'bg-orange-100 text-orange-800' :
                          release.status === 'revision' ? 'bg-purple-100 text-purple-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {release.status === 'in_review' ? 'In Review' :
                           release.status === 'submitted' ? 'Submitted' :
                           release.status === 'revision' ? 'Revision' : 'Completed'}
                        </span>
                        <Link
                          href={`/distribution/${release.status === 'revision' ? 'revisions' : 'queue'}`}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          Review →
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-6 py-12 text-center text-gray-500">
                  <Music className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p>No recent activity</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
