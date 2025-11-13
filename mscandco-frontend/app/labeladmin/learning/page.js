'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { usePermissions } from '@/hooks/usePermissions';
import { GraduationCap, Users, TrendingUp, Award, BookOpen, Target } from 'lucide-react';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

export default function LabelAdminLearningPage() {
  const router = useRouter();
  const supabase = createClient();
  const { hasPermission, loading: permissionsLoading } = usePermissions();

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [rosterArtists, setRosterArtists] = useState([]);
  const [learningStats, setLearningStats] = useState({
    total_courses_enrolled: 0,
    total_hours_learned: 0,
    active_learners: 0,
    certificates_earned: 0,
  });

  // Permission check
  useEffect(() => {
    if (!permissionsLoading) {
      if (!hasPermission('learning:access') && !hasPermission('*:*:*')) {
        router.push('/');
        return;
      }
    }
  }, [permissionsLoading, hasPermission, router]);

  useEffect(() => {
    fetchLabelLearningData();
  }, []);

  const fetchLabelLearningData = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      // Fetch roster artists
      const { data: roster } = await supabase
        .from('roster')
        .select('*, user_profiles(first_name, last_name, artist_name, email)')
        .eq('label_admin_id', user.id);

      setRosterArtists(roster || []);

      // Fetch aggregated learning stats for all roster artists
      const artistIds = roster?.map((r) => r.artist_id) || [];

      if (artistIds.length > 0) {
        const { data: courses } = await supabase
          .from('learning_courses')
          .select('*')
          .in('user_id', artistIds);

        const activeLearners = new Set(
          courses?.filter((c) => c.status === 'in_progress').map((c) => c.user_id)
        ).size;

        setLearningStats({
          total_courses_enrolled: courses?.length || 0,
          total_hours_learned:
            courses?.reduce((sum, c) => sum + (c.hours_completed || 0), 0) || 0,
          active_learners: activeLearners,
          certificates_earned: courses?.filter((c) => c.certificate_earned).length || 0,
        });
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching label learning data:', error);
      setLoading(false);
    }
  };

  // Chart data
  const engagementData = {
    labels: rosterArtists.map(
      (a) =>
        a.user_profiles?.artist_name ||
        `${a.user_profiles?.first_name} ${a.user_profiles?.last_name}`
    ),
    datasets: [
      {
        label: 'Courses Enrolled',
        data: Array(rosterArtists.length).fill(Math.floor(Math.random() * 5)),
        backgroundColor: 'rgba(99, 102, 241, 0.8)',
      },
    ],
  };

  const skillDistributionData = {
    labels: ['Technical', 'Business', 'Legal', 'Creative', 'Performance'],
    datasets: [
      {
        data: [30, 25, 15, 20, 10],
        backgroundColor: [
          'rgba(99, 102, 241, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(251, 146, 60, 0.8)',
          'rgba(244, 63, 94, 0.8)',
          'rgba(168, 85, 247, 0.8)',
        ],
      },
    ],
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading learning dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Skills Development & Learning Management
          </h1>
          <p className="mt-2 text-gray-600">
            Track and support learning progress across your entire roster
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-indigo-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Enrollments</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {learningStats.total_courses_enrolled}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Hours Learned</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {learningStats.total_hours_learned}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Learners</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {learningStats.active_learners}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Award className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Certificates</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {learningStats.certificates_earned}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {[
                { id: 'overview', label: 'Overview', icon: '📊' },
                { id: 'roster', label: 'Roster Progress', icon: '👥' },
                { id: 'analytics', label: 'Analytics', icon: '📈' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-4 text-sm font-medium whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-b-2 border-indigo-600 text-indigo-600'
                      : 'text-gray-600 hover:text-gray-900 hover:border-b-2 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <div className="flex items-start">
                    <GraduationCap className="h-6 w-6 text-blue-600 mt-1" />
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Label-Wide Learning Management
                      </h3>
                      <p className="text-gray-700 mb-4">
                        Monitor learning progress, course enrollments, and skill development
                        across all artists in your roster. Identify opportunities for targeted
                        professional development and track certification achievements.
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <Target className="h-4 w-4 mr-2 text-blue-600" />
                          <span>Track learning goals and progress for each artist</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Award className="h-4 w-4 mr-2 text-blue-600" />
                          <span>Monitor certification achievements and skill gaps</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <TrendingUp className="h-4 w-4 mr-2 text-blue-600" />
                          <span>Identify high-performing learners and provide support</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Popular Courses</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-700">Music Production</span>
                        <span className="text-sm font-medium text-indigo-600">
                          8 enrolled
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-700">Music Business</span>
                        <span className="text-sm font-medium text-indigo-600">
                          6 enrolled
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-700">Digital Marketing</span>
                        <span className="text-sm font-medium text-indigo-600">
                          5 enrolled
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Recommendations</h4>
                    <div className="space-y-2">
                      <button className="w-full text-left px-4 py-2 bg-indigo-50 hover:bg-indigo-100 rounded-lg text-indigo-700 text-sm font-medium">
                        Encourage Copyright Law Training
                      </button>
                      <button className="w-full text-left px-4 py-2 bg-green-50 hover:bg-green-100 rounded-lg text-green-700 text-sm font-medium">
                        Promote Social Media Courses
                      </button>
                      <button className="w-full text-left px-4 py-2 bg-purple-50 hover:bg-purple-100 rounded-lg text-purple-700 text-sm font-medium">
                        Share Industry Webinars
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'roster' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Learning Progress by Artist
                </h3>
                {rosterArtists.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No artists in your roster yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {rosterArtists.map((artist) => (
                      <div
                        key={artist.id}
                        className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {artist.user_profiles?.artist_name ||
                                `${artist.user_profiles?.first_name} ${artist.user_profiles?.last_name}`}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {Math.floor(Math.random() * 20)} hours learned •{' '}
                              {Math.floor(Math.random() * 5)} courses
                            </p>
                          </div>
                          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium">
                            View Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Roster Learning Engagement
                  </h3>
                  <div className="bg-gray-50 p-6 rounded-lg h-64">
                    <Bar data={engagementData} options={{ maintainAspectRatio: false }} />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Skill Category Distribution
                  </h3>
                  <div className="bg-gray-50 p-6 rounded-lg h-64">
                    <Doughnut
                      data={skillDistributionData}
                      options={{ maintainAspectRatio: false }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
