import { useState, useEffect } from 'react';
import { useUser } from '@/components/providers/SupabaseProvider';
import { supabase } from '@/lib/supabase';
import {
  TrendingUp, Users, Music, Globe, Instagram, 
  Youtube, Twitter, Play, Heart, Share, SkipForward,
  MapPin, Trophy, Calendar, Sparkles, ExternalLink,
  RefreshCw, AlertCircle, CheckCircle, Link as LinkIcon
} from 'lucide-react';

const ChartmetricDashboard = ({ userId = null, showLinkingOption = true }) => {
  const { user } = useUser();
  const [analyticsData, setAnalyticsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkingData, setLinkingData] = useState({
    artistName: '',
    spotifyUrl: '',
    searchResults: []
  });

  useEffect(() => {
    loadAnalytics();
  }, [userId]);

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const url = userId 
        ? `/api/chartmetric/artist-analytics?user_id=${userId}`
        : '/api/chartmetric/artist-analytics';

      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();

      if (data.success) {
        setAnalyticsData(data.analytics);
      } else {
        setError(data);
      }
    } catch (error) {
      console.error('Error loading Chartmetric analytics:', error);
      setError({ error: 'Failed to load analytics data' });
    } finally {
      setIsLoading(false);
    }
  };

  const linkArtistProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const response = await fetch('/api/chartmetric/link-artist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          artist_name: linkingData.artistName,
          spotify_url: linkingData.spotifyUrl
        })
      });

      const result = await response.json();

      if (result.success) {
        if (result.multiple_matches) {
          setLinkingData(prev => ({ ...prev, searchResults: result.matches }));
        } else {
          alert('Artist profile linked successfully!');
          setShowLinkModal(false);
          loadAnalytics(); // Reload with new data
        }
      } else {
        alert(`Failed to link artist: ${result.error}`);
      }
    } catch (error) {
      console.error('Error linking artist:', error);
      alert('Error linking artist profile');
    }
  };

  const selectArtistMatch = async (chartmetricId) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const response = await fetch('/api/chartmetric/link-artist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          chartmetric_id: chartmetricId,
          artist_name: linkingData.artistName
        })
      });

      const result = await response.json();

      if (result.success) {
        alert('Artist profile linked successfully!');
        setShowLinkModal(false);
        setLinkingData({ artistName: '', spotifyUrl: '', searchResults: [] });
        loadAnalytics();
      } else {
        alert(`Failed to link artist: ${result.error}`);
      }
    } catch (error) {
      console.error('Error selecting artist match:', error);
      alert('Error linking artist profile');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading Chartmetric analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        {error.link_required ? (
          <div>
            <LinkIcon className="w-16 h-16 text-blue-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Link Your Artist Profile</h3>
            <p className="text-gray-600 mb-6">
              Connect your Spotify or Apple Music profile to unlock real-time analytics powered by Chartmetric
            </p>
            {showLinkingOption && (
              <button
                onClick={() => setShowLinkModal(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Link Artist Profile
              </button>
            )}
          </div>
        ) : error.upgrade_required ? (
          <div>
            <Sparkles className="w-16 h-16 text-purple-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Upgrade to Artist Pro</h3>
            <p className="text-gray-600 mb-6">
              Unlock Chartmetric analytics, social footprint tracking, and advanced insights
            </p>
            <button className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              Upgrade to Pro (£99.99/month)
            </button>
          </div>
        ) : (
          <div>
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Analytics Unavailable</h3>
            <p className="text-gray-600 mb-6">{error.error || 'Failed to load analytics'}</p>
            <button
              onClick={loadAnalytics}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Retry
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with Chartmetric Branding */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Real-Time Analytics</h2>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                Powered by Chartmetric
              </span>
            </div>
            <p className="text-gray-600">
              Comprehensive streaming and social media analytics for {analyticsData?.user_context?.artist_name || 'your music'}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Last updated</div>
            <div className="font-semibold text-gray-900">
              {new Date(analyticsData?.last_updated).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Social Footprint Overview */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Social Media Footprint</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <Instagram className="w-6 h-6 text-pink-600" />
              <span className="font-semibold text-gray-900">Instagram</span>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-pink-600">
                {analyticsData?.social_footprint?.instagram?.followers?.toLocaleString() || '0'}
              </div>
              <div className="text-sm text-gray-600">
                {analyticsData?.social_footprint?.instagram?.engagement_rate || 0}% engagement
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <Music className="w-6 h-6 text-red-600" />
              <span className="font-semibold text-gray-900">TikTok</span>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-red-600">
                {analyticsData?.social_footprint?.tiktok?.followers?.toLocaleString() || '0'}
              </div>
              <div className="text-sm text-gray-600">
                {analyticsData?.social_footprint?.tiktok?.likes?.toLocaleString() || '0'} total likes
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <Youtube className="w-6 h-6 text-red-600" />
              <span className="font-semibold text-gray-900">YouTube</span>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-red-600">
                {analyticsData?.social_footprint?.youtube?.subscribers?.toLocaleString() || '0'}
              </div>
              <div className="text-sm text-gray-600">
                {analyticsData?.social_footprint?.youtube?.views?.toLocaleString() || '0'} total views
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <Twitter className="w-6 h-6 text-blue-600" />
              <span className="font-semibold text-gray-900">Twitter</span>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-blue-600">
                {analyticsData?.social_footprint?.twitter?.followers?.toLocaleString() || '0'}
              </div>
              <div className="text-sm text-gray-600">
                {analyticsData?.social_footprint?.twitter?.engagement || 0}% engagement
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Streaming Platforms */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Streaming Platform Performance</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                <Play className="w-3 h-3 text-white" />
              </div>
              <span className="font-semibold text-gray-900">Spotify</span>
            </div>
            <div className="space-y-2">
              <div>
                <div className="text-xl font-bold text-green-600">
                  {analyticsData?.streaming_stats?.spotify?.followers?.toLocaleString() || '0'}
                </div>
                <div className="text-xs text-gray-600">Followers</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-gray-900">
                  {analyticsData?.streaming_stats?.spotify?.monthly_listeners?.toLocaleString() || '0'}
                </div>
                <div className="text-xs text-gray-600">Monthly Listeners</div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-6 h-6 bg-gray-900 rounded-full flex items-center justify-center">
                <Music className="w-3 h-3 text-white" />
              </div>
              <span className="font-semibold text-gray-900">Apple Music</span>
            </div>
            <div className="space-y-2">
              <div>
                <div className="text-xl font-bold text-gray-800">
                  {analyticsData?.streaming_stats?.apple_music?.followers?.toLocaleString() || '0'}
                </div>
                <div className="text-xs text-gray-600">Followers</div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <Youtube className="w-6 h-6 text-red-600" />
              <span className="font-semibold text-gray-900">YouTube Music</span>
            </div>
            <div className="space-y-2">
              <div>
                <div className="text-xl font-bold text-red-600">
                  {analyticsData?.streaming_stats?.youtube_music?.subscribers?.toLocaleString() || '0'}
                </div>
                <div className="text-xs text-gray-600">Subscribers</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Performance */}
      {analyticsData?.chart_data?.current_positions?.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Chart Positions</h3>
          
          <div className="space-y-4">
            {analyticsData.chart_data.current_positions.slice(0, 5).map((chart, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{chart.chart_name || 'Chart'}</div>
                    <div className="text-sm text-gray-600">{chart.platform || 'Platform'}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-yellow-600">#{chart.position || 'N/A'}</div>
                  <div className="text-xs text-gray-500">Current Position</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Geographic Insights */}
      {analyticsData?.geographic && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Geographic Performance</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-4">Top Countries</h4>
              <div className="space-y-3">
                {analyticsData.geographic.top_countries?.slice(0, 5).map((country, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900">{country.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{country.streams?.toLocaleString() || '0'}</div>
                      <div className="text-xs text-gray-500">streams</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-4">Diversity Score</h4>
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {analyticsData.geographic.geographic_diversity_score || 0}%
                </div>
                <div className="text-sm text-gray-600">
                  Geographic reach diversity across {analyticsData.geographic.top_countries?.length || 0} countries
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Link Artist Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Link Artist Profile</h3>
                <button
                  onClick={() => setShowLinkModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {linkingData.searchResults.length === 0 ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Artist Name</label>
                    <input
                      type="text"
                      value={linkingData.artistName}
                      onChange={(e) => setLinkingData(prev => ({ ...prev, artistName: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your artist name..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Spotify URL (optional)</label>
                    <input
                      type="url"
                      value={linkingData.spotifyUrl}
                      onChange={(e) => setLinkingData(prev => ({ ...prev, spotifyUrl: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="https://open.spotify.com/artist/..."
                    />
                  </div>

                  <button
                    onClick={linkArtistProfile}
                    disabled={!linkingData.artistName}
                    className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                  >
                    Search & Link Artist
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Select Your Artist Profile:</h4>
                  {linkingData.searchResults.map((artist, index) => (
                    <div
                      key={index}
                      onClick={() => selectArtistMatch(artist.chartmetric_id)}
                      className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-gray-900">{artist.name}</div>
                          <div className="text-sm text-gray-600">
                            {artist.followers?.toLocaleString() || '0'} followers
                          </div>
                        </div>
                        {artist.verified && (
                          <CheckCircle className="w-5 h-5 text-blue-500" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChartmetricDashboard;
