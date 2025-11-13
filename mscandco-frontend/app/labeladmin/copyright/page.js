'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { usePermissions } from '@/hooks/usePermissions';
import { Copyright, Shield, AlertTriangle, FileCheck, Users, TrendingUp } from 'lucide-react';

export default function LabelAdminCopyrightPage() {
  const router = useRouter();
  const supabase = createClient();
  const { hasPermission, loading: permissionsLoading } = usePermissions();

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [rosterArtists, setRosterArtists] = useState([]);
  const [copyrightStats, setCopyrightStats] = useState({
    total_registrations: 0,
    active_takedowns: 0,
    monitored_works: 0,
    resolved_cases: 0,
  });

  // Permission check
  useEffect(() => {
    if (!permissionsLoading) {
      if (!hasPermission('features:copyright:use') && !hasPermission('*:*:*')) {
        router.push('/');
        return;
      }
    }
  }, [permissionsLoading, hasPermission, router]);

  useEffect(() => {
    fetchLabelData();
  }, []);

  const fetchLabelData = async () => {
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

      // Fetch aggregated copyright stats for all roster artists
      const artistIds = roster?.map((r) => r.artist_id) || [];

      if (artistIds.length > 0) {
        const { data: registrations } = await supabase
          .from('copyright_registrations')
          .select('*')
          .in('user_id', artistIds);

        const { data: takedowns } = await supabase
          .from('dmca_takedowns')
          .select('*')
          .in('user_id', artistIds)
          .eq('status', 'submitted');

        const { data: monitoring } = await supabase
          .from('copyright_monitoring')
          .select('*')
          .in('user_id', artistIds);

        setCopyrightStats({
          total_registrations: registrations?.length || 0,
          active_takedowns: takedowns?.length || 0,
          monitored_works: monitoring?.length || 0,
          resolved_cases:
            takedowns?.filter((t) => t.status === 'resolved').length || 0,
        });
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching label copyright data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading copyright management...</p>
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
            Copyright Protection & Rights Management
          </h1>
          <p className="mt-2 text-gray-600">
            Manage copyright protection for your entire roster of artists
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-indigo-100 rounded-lg">
                <FileCheck className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Registrations</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {copyrightStats.total_registrations}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Takedowns</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {copyrightStats.active_takedowns}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Monitored Works</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {copyrightStats.monitored_works}
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
                <p className="text-sm font-medium text-gray-600">Resolved Cases</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {copyrightStats.resolved_cases}
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
                { id: 'roster', label: 'Roster Artists', icon: '👥' },
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
                    <Copyright className="h-6 w-6 text-blue-600 mt-1" />
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Label-Wide Copyright Protection
                      </h3>
                      <p className="text-gray-700 mb-4">
                        As a label administrator, you oversee copyright protection for all artists
                        in your roster. Monitor their registrations, assist with DMCA takedowns,
                        and track infringement cases across your entire catalog.
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <Shield className="h-4 w-4 mr-2 text-blue-600" />
                          <span>
                            Centralized dashboard for all artists' copyright activities
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <FileCheck className="h-4 w-4 mr-2 text-blue-600" />
                          <span>Support artists with registration and protection processes</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <AlertTriangle className="h-4 w-4 mr-2 text-blue-600" />
                          <span>Assist with DMCA takedowns and legal documentation</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Recent Activity</h4>
                    <p className="text-sm text-gray-600">
                      View recent copyright registrations, takedown requests, and monitoring
                      alerts across your roster.
                    </p>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Quick Actions</h4>
                    <div className="space-y-2">
                      <button className="w-full text-left px-4 py-2 bg-indigo-50 hover:bg-indigo-100 rounded-lg text-indigo-700 text-sm font-medium">
                        View All Registrations
                      </button>
                      <button className="w-full text-left px-4 py-2 bg-orange-50 hover:bg-orange-100 rounded-lg text-orange-700 text-sm font-medium">
                        Review Pending Takedowns
                      </button>
                      <button className="w-full text-left px-4 py-2 bg-purple-50 hover:bg-purple-100 rounded-lg text-purple-700 text-sm font-medium">
                        Check Monitoring Alerts
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'roster' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Copyright Status by Artist
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
                              {artist.user_profiles?.email}
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
