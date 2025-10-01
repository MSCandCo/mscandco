import { useState, useEffect } from 'react';
import { useUser } from '@/components/providers/SupabaseProvider';
import { supabase } from '@/lib/supabase';
import Layout from '../../components/layouts/mainLayout';
import { BarChart3, TrendingUp, Users, DollarSign, Play, Eye } from 'lucide-react';

export default function LabelAdminAnalytics() {
  const { user } = useUser();
  const [artists, setArtists] = useState([]);
  const [selectedArtist, setSelectedArtist] = useState('all');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchArtists();
  }, []);

  useEffect(() => {
    if (selectedArtist) {
      fetchAnalytics(selectedArtist);
    }
  }, [selectedArtist]);

  const fetchArtists = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch('/api/labeladmin/accepted-artists', {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      });
      
      const data = await response.json();
      setArtists(data.artists || []);
    } catch (error) {
      console.error('Error loading artists:', error);
    }
  };

  const fetchAnalytics = async (artistId) => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      const endpoint = artistId === 'all' 
        ? '/api/labeladmin/analytics-combined'
        : `/api/labeladmin/analytics-individual?artist_id=${artistId}`;
      
      const response = await fetch(endpoint, {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      });
      
      const data = await response.json();
      setAnalyticsData(data.analytics || {});
    } catch (error) {
      console.error('Error loading analytics:', error);
      setAnalyticsData({});
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="p-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <BarChart3 className="w-8 h-8 mr-3" />
            Label Analytics
          </h1>
          <p className="text-gray-600 mt-2">
            Track performance across your artist roster
          </p>
        </div>

        {/* Artist Selector */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Artist or View Combined
          </label>
          <select 
            value={selectedArtist}
            onChange={(e) => setSelectedArtist(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">📊 All Artists Combined</option>
            {artists.map(artist => (
              <option key={artist.artistId} value={artist.artistId}>
                🎤 {artist.artistName}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : analyticsData ? (
          <div className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="flex items-center">
                  <Play className="w-8 h-8 text-blue-600 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Total Streams</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {analyticsData.total_streams?.toLocaleString() || '0'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="flex items-center">
                  <Users className="w-8 h-8 text-green-600 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Monthly Listeners</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {analyticsData.monthly_listeners?.toLocaleString() || '0'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="flex items-center">
                  <DollarSign className="w-8 h-8 text-purple-600 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">
                      £{analyticsData.total_revenue?.toLocaleString() || '0'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="flex items-center">
                  <TrendingUp className="w-8 h-8 text-orange-600 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Growth Rate</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {analyticsData.growth_rate || '0'}%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Platform Breakdown */}
            {analyticsData.platform_stats && (
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Platform Performance</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(analyticsData.platform_stats).map(([platform, stats]) => (
                    <div key={platform} className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="font-medium text-gray-900">{platform}</p>
                      <p className="text-sm text-gray-600">{stats.streams?.toLocaleString()} streams</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Analytics Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Top Countries</h3>
                <div className="space-y-2">
                  {analyticsData.top_countries?.map((country, index) => (
                    <div key={country.name} className="flex justify-between">
                      <span>{country.name}</span>
                      <span className="font-medium">{country.percentage}%</span>
                    </div>
                  )) || <p className="text-gray-500">No data available</p>}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Milestones</h3>
                <div className="space-y-2">
                  {analyticsData.milestones?.slice(0, 5).map((milestone, index) => (
                    <div key={index} className="text-sm">
                      <span className="font-medium">{milestone.title}</span>
                      <span className="text-gray-500 ml-2">{milestone.date}</span>
                    </div>
                  )) || <p className="text-gray-500">No milestones yet</p>}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border">
            <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Analytics Data</h3>
            <p className="text-gray-500">
              Analytics will appear when your artists have performance data
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
