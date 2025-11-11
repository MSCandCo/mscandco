'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Line, Bar, Funnel } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function PlaylistPitching() {
  const supabase = createClientComponentClient();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // State management
  const [activeTab, setActiveTab] = useState('search'); // search, campaigns, analytics
  const [releases, setReleases] = useState([]);
  const [selectedRelease, setSelectedRelease] = useState(null);

  // Search state
  const [searchParams, setSearchParams] = useState({
    genre: '',
    min_followers: 1000,
    max_followers: 100000,
    target_platforms: ['spotify'],
  });
  const [searchResults, setSearchResults] = useState(null);
  const [searching, setSearching] = useState(false);

  // Campaign state
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [creatingCampaign, setCreatingCampaign] = useState(false);

  // Analytics state
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        await loadReleases();
        await loadCampaigns();
      }
      setLoading(false);
    }
    loadUser();
  }, []);

  async function loadReleases() {
    const { data } = await supabase
      .from('releases')
      .select('*')
      .order('release_date', { ascending: false })
      .limit(20);

    setReleases(data || []);
  }

  async function loadCampaigns() {
    const { data } = await fetch('/api/features/playlists/campaigns-auto').then(r => r.json());
    setCampaigns(data?.campaigns || []);
  }

  async function searchPlaylists() {
    if (!selectedRelease) {
      alert('Please select a release first');
      return;
    }

    setSearching(true);
    try {
      const response = await fetch('/api/features/playlists/search-ml', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          release_id: selectedRelease.id,
          genre: searchParams.genre || selectedRelease.genre,
          min_followers: searchParams.min_followers,
          max_followers: searchParams.max_followers,
          target_platforms: searchParams.target_platforms,
        }),
      });

      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Search error:', error);
      alert('Search failed: ' + error.message);
    } finally {
      setSearching(false);
    }
  }

  async function createCampaign(playlistIds) {
    if (!selectedRelease) {
      alert('Please select a release');
      return;
    }

    setCreatingCampaign(true);
    try {
      const response = await fetch('/api/features/playlists/campaigns-auto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${selectedRelease.title} - Campaign ${Date.now()}`,
          release_id: selectedRelease.id,
          playlist_ids: playlistIds,
          enable_auto_followup: true,
          send_immediately: true,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert(`Campaign created! ${data.summary.sent} emails sent successfully.`);
        await loadCampaigns();
        setActiveTab('campaigns');
      } else {
        alert('Campaign creation failed: ' + data.error);
      }
    } catch (error) {
      console.error('Campaign creation error:', error);
      alert('Failed to create campaign: ' + error.message);
    } finally {
      setCreatingCampaign(false);
    }
  }

  async function loadAnalytics(campaignId) {
    try {
      const url = campaignId
        ? `/api/features/playlists/analytics?campaign_id=${campaignId}`
        : '/api/features/playlists/analytics';

      const response = await fetch(url);
      const data = await response.json();
      setAnalytics(data.analytics);
    } catch (error) {
      console.error('Analytics error:', error);
    }
  }

  useEffect(() => {
    if (activeTab === 'analytics' && user) {
      loadAnalytics();
    }
  }, [activeTab, user]);

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Playlist Pitching (ENTERPRISE)</h1>
          <p className="text-gray-600">
            AI-powered playlist matching with automated pitching and ROI tracking
          </p>
        </div>

        {/* Release Selector */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <label className="block text-sm font-medium mb-2">Select Release:</label>
          <select
            className="w-full p-3 border rounded-lg"
            value={selectedRelease?.id || ''}
            onChange={(e) => {
              const release = releases.find(r => r.id === e.target.value);
              setSelectedRelease(release);
            }}
          >
            <option value="">-- Choose a release --</option>
            {releases.map(release => (
              <option key={release.id} value={release.id}>
                {release.title} - {release.artist_name}
              </option>
            ))}
          </select>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b">
          <button
            className={`pb-3 px-4 font-medium ${
              activeTab === 'search'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('search')}
          >
            🔍 Smart Search
          </button>
          <button
            className={`pb-3 px-4 font-medium ${
              activeTab === 'campaigns'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('campaigns')}
          >
            📧 My Campaigns ({campaigns.length})
          </button>
          <button
            className={`pb-3 px-4 font-medium ${
              activeTab === 'analytics'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('analytics')}
          >
            📊 Analytics & ROI
          </button>
        </div>

        {/* TAB: Smart Search */}
        {activeTab === 'search' && (
          <div className="space-y-6">
            {/* Search Parameters */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-4">🎯 ML-Powered Playlist Search</h2>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Genre Override:</label>
                  <input
                    type="text"
                    className="w-full p-3 border rounded-lg"
                    placeholder={selectedRelease?.genre || 'Auto-detect from release'}
                    value={searchParams.genre}
                    onChange={(e) => setSearchParams({ ...searchParams, genre: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Platforms:</label>
                  <select
                    multiple
                    className="w-full p-3 border rounded-lg"
                    value={searchParams.target_platforms}
                    onChange={(e) => {
                      const selected = Array.from(e.target.selectedOptions, option => option.value);
                      setSearchParams({ ...searchParams, target_platforms: selected });
                    }}
                  >
                    <option value="spotify">Spotify</option>
                    <option value="apple_music">Apple Music</option>
                    <option value="youtube">YouTube Music</option>
                    <option value="tidal">Tidal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Min Followers: {searchParams.min_followers.toLocaleString()}
                  </label>
                  <input
                    type="range"
                    min="100"
                    max="50000"
                    step="100"
                    value={searchParams.min_followers}
                    onChange={(e) => setSearchParams({ ...searchParams, min_followers: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Max Followers: {searchParams.max_followers.toLocaleString()}
                  </label>
                  <input
                    type="range"
                    min="1000"
                    max="1000000"
                    step="1000"
                    value={searchParams.max_followers}
                    onChange={(e) => setSearchParams({ ...searchParams, max_followers: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>
              </div>

              <button
                onClick={searchPlaylists}
                disabled={!selectedRelease || searching}
                className="w-full bg-blue-600 text-white p-4 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300"
              >
                {searching ? 'Searching...' : '🚀 Search Playlists with ML'}
              </button>
            </div>

            {/* Search Results */}
            {searchResults && (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold">
                    Found {searchResults.playlists?.length || 0} Matches
                  </h3>
                  <button
                    onClick={() => {
                      const topPlaylistIds = searchResults.playlists
                        .filter(p => p.match_score >= 70)
                        .slice(0, 20)
                        .map(p => p.id);
                      createCampaign(topPlaylistIds);
                    }}
                    disabled={creatingCampaign}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
                  >
                    📧 Create Campaign with Top Matches
                  </button>
                </div>

                {searchResults.search_summary && (
                  <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-blue-50 rounded-lg">
                    <div>
                      <div className="text-sm text-gray-600">High Probability (80+)</div>
                      <div className="text-2xl font-bold text-green-600">
                        {searchResults.search_summary.high_probability_matches}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Medium Probability (60-79)</div>
                      <div className="text-2xl font-bold text-yellow-600">
                        {searchResults.search_summary.medium_probability_matches}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Avg Match Score</div>
                      <div className="text-2xl font-bold">
                        {Math.round(searchResults.search_summary.avg_match_score)}%
                      </div>
                    </div>
                  </div>
                )}

                {/* Playlist Results Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="p-3 text-left">Playlist</th>
                        <th className="p-3 text-left">Platform</th>
                        <th className="p-3 text-right">Followers</th>
                        <th className="p-3 text-center">Match Score</th>
                        <th className="p-3 text-right">Est. Streams</th>
                        <th className="p-3 text-center">Acceptance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {searchResults.playlists?.map((playlist, idx) => (
                        <tr key={idx} className="border-b hover:bg-gray-50">
                          <td className="p-3">
                            <div className="font-medium">{playlist.name}</div>
                            <div className="text-sm text-gray-500">{playlist.curator_name}</div>
                          </td>
                          <td className="p-3 capitalize">{playlist.platform}</td>
                          <td className="p-3 text-right">{playlist.followers?.toLocaleString()}</td>
                          <td className="p-3 text-center">
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                playlist.match_score >= 80
                                  ? 'bg-green-100 text-green-800'
                                  : playlist.match_score >= 60
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {playlist.match_score}%
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            {playlist.estimated_stream_impact?.estimated_streams?.toLocaleString() || 'N/A'}
                          </td>
                          <td className="p-3 text-center">
                            {playlist.estimated_acceptance_rate}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB: Campaigns */}
        {activeTab === 'campaigns' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-4">📧 My Pitch Campaigns</h2>

              {campaigns.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No campaigns yet. Create one from the Smart Search tab.
                </div>
              ) : (
                <div className="space-y-4">
                  {campaigns.map(campaign => (
                    <div
                      key={campaign.id}
                      className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                      onClick={() => {
                        setSelectedCampaign(campaign);
                        loadAnalytics(campaign.id);
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-lg">{campaign.name}</h3>
                          <p className="text-sm text-gray-600">
                            {campaign.releases?.title} by {campaign.releases?.artists?.name}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            campaign.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {campaign.status}
                        </span>
                      </div>

                      {campaign.stats && (
                        <div className="grid grid-cols-5 gap-4 mt-4 pt-4 border-t">
                          <div>
                            <div className="text-xs text-gray-500">Total</div>
                            <div className="text-xl font-bold">{campaign.stats.total}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">Sent</div>
                            <div className="text-xl font-bold">{campaign.stats.sent}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">Opened</div>
                            <div className="text-xl font-bold text-blue-600">
                              {campaign.stats.opened}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">Replied</div>
                            <div className="text-xl font-bold text-purple-600">
                              {campaign.stats.replied}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">Accepted</div>
                            <div className="text-xl font-bold text-green-600">
                              {campaign.stats.accepted}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: Analytics */}
        {activeTab === 'analytics' && analytics && (
          <div className="space-y-6">
            {/* Overview Cards */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-sm text-gray-600 mb-1">Total Pitches</div>
                <div className="text-3xl font-bold">{analytics.overview.total_pitches}</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-sm text-gray-600 mb-1">Open Rate</div>
                <div className="text-3xl font-bold text-blue-600">
                  {analytics.overview.open_rate}%
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-sm text-gray-600 mb-1">Reply Rate</div>
                <div className="text-3xl font-bold text-purple-600">
                  {analytics.overview.reply_rate}%
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-sm text-gray-600 mb-1">Acceptance Rate</div>
                <div className="text-3xl font-bold text-green-600">
                  {analytics.overview.acceptance_rate}%
                </div>
              </div>
            </div>

            {/* ROI Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-bold mb-4">💰 ROI Analysis</h3>
              <div className="grid grid-cols-3 gap-6">
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Estimated Streams</div>
                  <div className="text-2xl font-bold">
                    {analytics.roi.estimated_streams.toLocaleString()}
                  </div>
                  <div className="text-sm text-green-600 mt-1">
                    £{analytics.roi.estimated_revenue_gbp} revenue
                  </div>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Total Reach</div>
                  <div className="text-2xl font-bold">
                    {analytics.roi.total_playlist_reach.toLocaleString()}
                  </div>
                  <div className="text-sm text-blue-600 mt-1">
                    {analytics.roi.accepted_playlists} playlists
                  </div>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">ROI</div>
                  <div className="text-2xl font-bold">
                    {analytics.roi.roi_percentage}%
                  </div>
                  <div className="text-sm text-purple-600 mt-1">
                    Cost: £{analytics.roi.estimated_cost_gbp}
                  </div>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            {analytics.recommendations && analytics.recommendations.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-bold mb-4">💡 Recommendations</h3>
                <div className="space-y-3">
                  {analytics.recommendations.map((rec, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-lg border-l-4 ${
                        rec.type === 'success'
                          ? 'bg-green-50 border-green-500'
                          : rec.type === 'warning'
                          ? 'bg-yellow-50 border-yellow-500'
                          : 'bg-blue-50 border-blue-500'
                      }`}
                    >
                      <div className="font-bold mb-1">{rec.title}</div>
                      <div className="text-sm text-gray-700 mb-2">{rec.message}</div>
                      <div className="text-xs text-gray-600">
                        💡 Action: {rec.action}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
