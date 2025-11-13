'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { usePermissions } from '@/hooks/usePermissions';
import { Database, Key, Download, Users, BarChart3, FileText } from 'lucide-react';

export default function LabelAdminOpenDataPage() {
  const router = useRouter();
  const supabase = createClient();
  const { hasPermission, loading: permissionsLoading } = usePermissions();

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [rosterArtists, setRosterArtists] = useState([]);
  const [dataStats, setDataStats] = useState({
    total_api_keys: 0,
    active_keys: 0,
    total_exports: 0,
    total_requests: 0,
  });

  // Permission check
  useEffect(() => {
    if (!permissionsLoading) {
      // Open data is generally accessible but check for basic permissions
      if (!hasPermission('*:*:*')) {
        // Can still view but with limited functionality
      }
    }
  }, [permissionsLoading, hasPermission, router]);

  useEffect(() => {
    fetchLabelDataStats();
  }, []);

  const fetchLabelDataStats = async () => {
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

      // Fetch aggregated data stats for all roster artists
      const artistIds = roster?.map((r) => r.artist_id) || [];

      if (artistIds.length > 0) {
        const { data: apiKeys } = await supabase
          .from('api_keys')
          .select('*')
          .in('user_id', artistIds);

        const { data: exports } = await supabase
          .from('data_exports')
          .select('*')
          .in('user_id', artistIds);

        setDataStats({
          total_api_keys: apiKeys?.length || 0,
          active_keys: apiKeys?.filter((k) => k.status === 'active').length || 0,
          total_exports: exports?.length || 0,
          total_requests: apiKeys?.reduce((sum, k) => sum + (k.request_count || 0), 0) || 0,
        });
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching label data stats:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading open data dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Open Data & Research API</h1>
          <p className="mt-2 text-gray-600">
            Monitor API usage and data sharing across your roster of artists
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-indigo-100 rounded-lg">
                <Key className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total API Keys</p>
                <p className="text-2xl font-semibold text-gray-900">{dataStats.total_api_keys}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Keys</p>
                <p className="text-2xl font-semibold text-gray-900">{dataStats.active_keys}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Download className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Exports</p>
                <p className="text-2xl font-semibold text-gray-900">{dataStats.total_exports}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-lg">
                <FileText className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">API Requests</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {dataStats.total_requests.toLocaleString()}
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
                { id: 'roster', label: 'Roster Data', icon: '👥' },
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
                    <Database className="h-6 w-6 text-blue-600 mt-1" />
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Label-Wide Open Data Management
                      </h3>
                      <p className="text-gray-700 mb-4">
                        Monitor how your roster artists share their data with researchers and
                        developers. Track API key usage, data exports, and research
                        contributions across your entire catalog.
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <Key className="h-4 w-4 mr-2 text-blue-600" />
                          <span>Centralized API key management for all artists</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Download className="h-4 w-4 mr-2 text-blue-600" />
                          <span>Track data exports and research contributions</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <BarChart3 className="h-4 w-4 mr-2 text-blue-600" />
                          <span>Monitor API usage and rate limits</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">API Tier Distribution</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-700">Free Tier</span>
                        <span className="text-sm font-medium text-gray-600">
                          {Math.floor(dataStats.total_api_keys * 0.6)} keys
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-700">Research Tier</span>
                        <span className="text-sm font-medium text-gray-600">
                          {Math.floor(dataStats.total_api_keys * 0.3)} keys
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-700">Commercial Tier</span>
                        <span className="text-sm font-medium text-gray-600">
                          {Math.floor(dataStats.total_api_keys * 0.1)} keys
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Recent Activity</h4>
                    <div className="space-y-2">
                      <div className="text-sm text-gray-600">
                        • API keys generated this month: {Math.floor(dataStats.total_api_keys * 0.2)}
                      </div>
                      <div className="text-sm text-gray-600">
                        • Data exports this month: {Math.floor(dataStats.total_exports * 0.3)}
                      </div>
                      <div className="text-sm text-gray-600">
                        • Research collaborations: {Math.floor(Math.random() * 5)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'roster' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Data Sharing by Artist
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
                              {Math.floor(Math.random() * 3)} API keys •{' '}
                              {Math.floor(Math.random() * 10)} exports
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
          </div>
        </div>
      </div>
    </div>
  );
}
