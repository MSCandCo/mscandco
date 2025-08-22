import { useState, useEffect, useRef } from 'react';
import { useUser } from '@/components/providers/SupabaseProvider';
import { supabase } from '@/lib/supabase';
import { 
  Music, Upload, Calendar, Sparkles, TrendingUp, 
  DollarSign, Target, Lightbulb, Save, Send,
  Clock, CheckCircle, AlertCircle, Loader
} from 'lucide-react';

const AIEnhancedReleaseForm = ({ onReleaseCreated, onClose }) => {
  const { user } = useUser();
  const autoSaveInterval = useRef(null);
  
  // Form state
  const [formData, setFormData] = useState({
    releaseTitle: '',
    assetType: 'single',
    genre: '',
    subgenre: '',
    plannedReleaseDate: '',
    artworkUrl: '',
    tracks: [
      {
        title: '',
        duration: '',
        explicit: false,
        audio_url: '',
        artist: '',
        featured_artists: [],
        producers: [],
        songwriters: []
      }
    ]
  });

  // AI and analytics state
  const [aiInsights, setAiInsights] = useState(null);
  const [chartmetricData, setChartmetricData] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState('saved'); // 'saving', 'saved', 'error'
  const [releaseId, setReleaseId] = useState(null);

  // Load user subscription and capabilities
  useEffect(() => {
    loadSubscription();
  }, [user]);

  // Auto-save every 3 seconds when form changes
  useEffect(() => {
    if (releaseId && formData.releaseTitle) {
      // Clear existing interval
      if (autoSaveInterval.current) {
        clearInterval(autoSaveInterval.current);
      }

      // Set new interval
      autoSaveInterval.current = setInterval(() => {
        autoSaveRelease();
      }, 3000);

      return () => {
        if (autoSaveInterval.current) {
          clearInterval(autoSaveInterval.current);
        }
      };
    }
  }, [formData, releaseId]);

  const loadSubscription = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const response = await fetch('/api/subscriptions/manage', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setSubscription(data.subscription);
      }
    } catch (error) {
      console.error('Error loading subscription:', error);
    }
  };

  const autoSaveRelease = async () => {
    if (!releaseId || !formData.releaseTitle) return;

    try {
      setAutoSaveStatus('saving');
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const response = await fetch('/api/releases/auto-save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          releaseId,
          releaseData: formData
        })
      });

      if (response.ok) {
        setAutoSaveStatus('saved');
      } else {
        setAutoSaveStatus('error');
      }
    } catch (error) {
      console.error('Auto-save error:', error);
      setAutoSaveStatus('error');
    }
  };

  const getAIInsights = async () => {
    if (!formData.releaseTitle || !formData.genre) {
      alert('Please enter release title and genre first');
      return;
    }

    setIsLoadingAI(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      // Get AI insights for release timing and revenue potential
      const response = await fetch('/api/ai/release-insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          release_data: formData,
          analysis_type: 'comprehensive' // timing + revenue + bio
        })
      });

      if (response.ok) {
        const insights = await response.json();
        setAiInsights(insights);
      } else {
        const error = await response.json();
        alert(`AI Analysis failed: ${error.error}`);
      }
    } catch (error) {
      console.error('AI insights error:', error);
      alert('Failed to get AI insights');
    } finally {
      setIsLoadingAI(false);
    }
  };

  const createRelease = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const response = await fetch('/api/releases/manage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          releaseTitle: formData.releaseTitle,
          assetType: formData.assetType,
          genre: formData.genre,
          tracks: formData.tracks
        })
      });

      if (response.ok) {
        const result = await response.json();
        setReleaseId(result.release.id);
        
        if (result.ai_insights) {
          setAiInsights(result.ai_insights);
        }

        if (onReleaseCreated) {
          onReleaseCreated(result.release);
        }
      } else {
        const error = await response.json();
        alert(`Failed to create release: ${error.error}`);
      }
    } catch (error) {
      console.error('Create release error:', error);
      alert('Failed to create release');
    }
  };

  const submitForDistribution = async () => {
    if (!releaseId) {
      alert('Please create the release first');
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const response = await fetch('/api/releases/manage', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          releaseId,
          action: 'submit_for_distribution'
        })
      });

      if (response.ok) {
        alert('Release submitted for distribution successfully!');
        if (onClose) onClose();
      } else {
        const error = await response.json();
        alert(`Submission failed: ${error.error}`);
      }
    } catch (error) {
      console.error('Submit release error:', error);
      alert('Failed to submit release');
    }
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addTrack = () => {
    setFormData(prev => ({
      ...prev,
      tracks: [
        ...prev.tracks,
        {
          title: '',
          duration: '',
          explicit: false,
          audio_url: '',
          artist: prev.tracks[0]?.artist || '',
          featured_artists: [],
          producers: [],
          songwriters: []
        }
      ]
    }));
  };

  const updateTrack = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      tracks: prev.tracks.map((track, i) => 
        i === index ? { ...track, [field]: value } : track
      )
    }));
  };

  const getAutoSaveIcon = () => {
    switch (autoSaveStatus) {
      case 'saving': return <Loader className="w-4 h-4 animate-spin text-blue-500" />;
      case 'saved': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      {/* Header with Auto-save Status */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Create New Release</h2>
          <p className="text-gray-600">AI-enhanced release creation with real-time insights</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            {getAutoSaveIcon()}
            <span>
              {autoSaveStatus === 'saving' && 'Auto-saving...'}
              {autoSaveStatus === 'saved' && 'Auto-saved'}
              {autoSaveStatus === 'error' && 'Save failed'}
            </span>
          </div>
          {subscription && (
            <div className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
              {subscription.plan === 'artist_pro' ? 'Pro' : 'Starter'} Plan
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Release Info */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Release Information</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Release Title *
                </label>
                <input
                  type="text"
                  value={formData.releaseTitle}
                  onChange={(e) => updateFormData('releaseTitle', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your release title..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Asset Type *
                  </label>
                  <select
                    value={formData.assetType}
                    onChange={(e) => updateFormData('assetType', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="single">Single</option>
                    <option value="ep">EP</option>
                    <option value="album">Album</option>
                    <option value="compilation">Compilation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Genre *
                  </label>
                  <select
                    value={formData.genre}
                    onChange={(e) => updateFormData('genre', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select genre...</option>
                    <option value="Pop">Pop</option>
                    <option value="Hip-Hop">Hip-Hop</option>
                    <option value="R&B">R&B</option>
                    <option value="Rock">Rock</option>
                    <option value="Electronic">Electronic</option>
                    <option value="Country">Country</option>
                    <option value="Gospel">Gospel</option>
                    <option value="Jazz">Jazz</option>
                    <option value="Classical">Classical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Planned Release Date
                </label>
                <input
                  type="date"
                  value={formData.plannedReleaseDate}
                  onChange={(e) => updateFormData('plannedReleaseDate', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Tracks Section */}
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Tracks</h3>
              <button
                onClick={addTrack}
                className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Music className="w-4 h-4 mr-2" />
                Add Track
              </button>
            </div>

            <div className="space-y-4">
              {formData.tracks.map((track, index) => (
                <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Track Title *
                      </label>
                      <input
                        type="text"
                        value={track.title}
                        onChange={(e) => updateTrack(index, 'title', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter track title..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Duration (mm:ss)
                      </label>
                      <input
                        type="text"
                        value={track.duration}
                        onChange={(e) => updateTrack(index, 'duration', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        placeholder="3:45"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-3 flex items-center">
                    <input
                      type="checkbox"
                      checked={track.explicit}
                      onChange={(e) => updateTrack(index, 'explicit', e.target.checked)}
                      className="mr-2"
                    />
                    <label className="text-sm text-gray-700">Explicit Content</label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center">
            <div className="flex space-x-3">
              <button
                onClick={createRelease}
                className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Save className="w-4 h-4 mr-2" />
                Create Release
              </button>
              
              {releaseId && (
                <button
                  onClick={submitForDistribution}
                  className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Submit for Distribution
                </button>
              )}
            </div>

            <button
              onClick={getAIInsights}
              disabled={isLoadingAI || !formData.releaseTitle || !formData.genre}
              className="flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 transition-colors"
            >
              {isLoadingAI ? (
                <Loader className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              {isLoadingAI ? 'Analyzing...' : 'Get AI Insights'}
            </button>
          </div>
        </div>

        {/* AI Insights Sidebar */}
        <div className="space-y-6">
          {/* Subscription Info */}
          {subscription && (
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Target className="w-5 h-5 text-purple-600" />
                <h4 className="font-semibold text-gray-900">Your Plan</h4>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Plan:</span>
                  <span className="font-medium">{subscription.plan === 'artist_pro' ? 'Artist Pro' : 'Artist Starter'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Releases Used:</span>
                  <span className="font-medium">
                    {subscription.releases_used}/{subscription.max_releases === -1 ? '∞' : subscription.max_releases}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Chartmetric Access:</span>
                  <span className={`font-medium ${subscription.plan === 'artist_pro' ? 'text-green-600' : 'text-gray-500'}`}>
                    {subscription.plan === 'artist_pro' ? 'Yes' : 'Upgrade to Pro'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>AI Insights:</span>
                  <span className="font-medium text-green-600">
                    {subscription.plan === 'artist_pro' ? 'Premium' : 'Basic'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* AI Insights */}
          {aiInsights && (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-4">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <h4 className="font-semibold text-gray-900">Acceber AI Insights</h4>
              </div>

              {aiInsights.timing_insights && (
                <div className="mb-4">
                  <h5 className="font-medium text-gray-900 mb-2">Optimal Release Timing</h5>
                  <div className="bg-white rounded p-3 text-sm">
                    <div className="flex items-center space-x-2 mb-2">
                      <Calendar className="w-4 h-4 text-blue-500" />
                      <span className="font-medium">
                        {new Date(aiInsights.timing_insights.optimal_release_date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-600 text-xs">
                      {aiInsights.timing_insights.reasoning?.[0] || 'Optimal timing based on market analysis'}
                    </p>
                  </div>
                </div>
              )}

              {aiInsights.revenue_insights && (
                <div className="mb-4">
                  <h5 className="font-medium text-gray-900 mb-2">Revenue Prediction</h5>
                  <div className="bg-white rounded p-3 text-sm">
                    <div className="flex items-center space-x-2 mb-2">
                      <DollarSign className="w-4 h-4 text-green-500" />
                      <span className="font-medium">
                        £{aiInsights.revenue_insights.revenue_prediction?.most_likely || 0}
                      </span>
                      <span className="text-gray-500">(estimated)</span>
                    </div>
                    <div className="text-xs text-gray-600">
                      Range: £{aiInsights.revenue_insights.revenue_prediction?.low_estimate || 0} - 
                      £{aiInsights.revenue_insights.revenue_prediction?.high_estimate || 0}
                    </div>
                  </div>
                </div>
              )}

              {aiInsights.strategic_recommendations && (
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">AI Recommendations</h5>
                  <div className="bg-white rounded p-3 text-sm space-y-2">
                    {aiInsights.strategic_recommendations.marketing_strategy && (
                      <div className="flex items-start space-x-2">
                        <Lightbulb className="w-4 h-4 text-yellow-500 mt-0.5" />
                        <span className="text-gray-700">
                          Focus on {aiInsights.strategic_recommendations.optimal_genre || formData.genre} market
                        </span>
                      </div>
                    )}
                    <div className="flex items-start space-x-2">
                      <TrendingUp className="w-4 h-4 text-green-500 mt-0.5" />
                      <span className="text-gray-700">
                        Market conditions favorable for {formData.assetType} releases
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Chartmetric Data */}
          {chartmetricData && subscription?.plan === 'artist_pro' && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-4">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <h4 className="font-semibold text-gray-900">Chartmetric Analytics</h4>
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="bg-white rounded p-3">
                  <div className="font-medium text-gray-900 mb-1">Social Footprint</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>Instagram: {chartmetricData.social_footprint?.instagram?.toLocaleString() || 0}</div>
                    <div>TikTok: {chartmetricData.social_footprint?.tiktok?.toLocaleString() || 0}</div>
                    <div>YouTube: {chartmetricData.social_footprint?.youtube?.toLocaleString() || 0}</div>
                    <div>Twitter: {chartmetricData.social_footprint?.twitter?.toLocaleString() || 0}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Plan Upgrade Prompt */}
          {subscription?.plan === 'artist_starter' && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-4 border border-amber-200">
              <div className="flex items-center space-x-2 mb-2">
                <Sparkles className="w-5 h-5 text-amber-600" />
                <h4 className="font-semibold text-gray-900">Unlock Premium Features</h4>
              </div>
              <p className="text-sm text-gray-700 mb-3">
                Upgrade to Artist Pro for Chartmetric analytics, premium AI insights, and unlimited releases.
              </p>
              <button className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm">
                Upgrade to Pro
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIEnhancedReleaseForm;
