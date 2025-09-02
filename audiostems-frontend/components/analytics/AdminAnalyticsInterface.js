// Admin Analytics Interface - Exact match to frontend sections
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/components/providers/SupabaseProvider';
import { 
  Music, 
  Settings, 
  Save, 
  Plus, 
  Trash2,
  CheckCircle,
  Users,
  TrendingUp,
  BarChart3,
  Award
} from 'lucide-react';

export default function AdminAnalyticsInterface({ selectedArtistId, selectedArtistData, onDataUpdated }) {
  const { user } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  // Latest Release Form State
  const [latestRelease, setLatestRelease] = useState({
    title: '',
    artist: '',
    releaseDate: '',
    releaseType: '',
    artwork: null,
    audioFile: null,
    platforms: [
      { name: 'Spotify', streams: '', change: '' },
      { name: 'Apple Music', streams: '', change: '' },
      { name: 'YouTube Music', streams: '', change: '' },
      { name: 'Total', streams: '', change: '' }
    ]
  });

  // Recent Milestones State
  const [milestones, setMilestones] = useState([
    {
      title: '',
      tag: '',
      milestone: '',
      date: ''
    }
  ]);

  // Advanced Analytics State
  const [artistRanking, setArtistRanking] = useState([
    { title: 'Country Ranking', value: '' },
    { title: 'Global Ranking', value: '' },
    { title: 'Primary Genre Ranking', value: '' },
    { title: 'Momentum Score', value: '' }
  ]);

  const [careerSnapshot, setCareerSnapshot] = useState([
    { title: 'Career Stage', value: '', options: ['Developing', 'Mid-Level', 'Mainstream', 'Superstar', 'Legendary'] },
    { title: 'Recent Momentum', value: '', options: ['Decline', 'Gradual Decline', 'Steady', 'Gradual Growth', 'Explosive Growth'] },
    { title: 'Network Strength', value: '', options: ['Inactive', 'Limited', 'Moderate', 'Active', 'Established'] },
    { title: 'Social Engagement', value: '', options: ['Inactive', 'Limited', 'Moderate', 'Active', 'Influential'] }
  ]);

  const [audienceSummary, setAudienceSummary] = useState([
    { title: 'Social Footprint', value: '' },
    { title: 'Primary Market', value: '' },
    { title: 'Secondary Market', value: '' },
    { title: 'Primary Gender %', value: '' },
    { title: 'Primary Age Group', value: '' }
  ]);

  const [topMarkets, setTopMarkets] = useState([
    { title: 'Top Country 1', value: '' },
    { title: 'Top Country 2', value: '' },
    { title: 'Top Country 3', value: '' }
  ]);

  const [topStatistics, setTopStatistics] = useState([
    { title: 'Total Streams', value: '' },
    { title: 'Monthly Listeners', value: '' },
    { title: 'Followers', value: '' },
    { title: 'Countries', value: '' }
  ]);

  const [topTracks, setTopTracks] = useState([
    {
      artwork: null,
      audioFile: null,
      title: '',
      artist: '',
      platform: '',
      metrics: ''
    }
  ]);

  const [allReleases, setAllReleases] = useState([
    {
      title: '',
      releaseDate: '',
      releaseType: '',
      artwork: null
    }
  ]);

  const [platformPerformance, setPlatformPerformance] = useState([
    { platformTitle: 'Spotify', metadataTitle: 'Monthly Listeners', metadataStat: '', tag: '' },
    { platformTitle: 'Apple Music', metadataTitle: 'Subscribers', metadataStat: '', tag: '' },
    { platformTitle: 'YouTube Music', metadataTitle: 'Views', metadataStat: '', tag: '' }
  ]);

  // Helper functions for managing platforms
  const addPlatform = () => {
    setLatestRelease(prev => ({
      ...prev,
      platforms: [...prev.platforms, { name: '', streams: '', change: '' }]
    }));
  };

  const removePlatform = (index) => {
    setLatestRelease(prev => ({
      ...prev,
      platforms: prev.platforms.filter((_, i) => i !== index)
    }));
  };

  const updatePlatform = (index, field, value) => {
    setLatestRelease(prev => ({
      ...prev,
      platforms: prev.platforms.map((platform, i) => 
        i === index ? { ...platform, [field]: value } : platform
      )
    }));
  };

  // Helper functions for managing milestones
  const addMilestone = () => {
    setMilestones(prev => [...prev, {
      title: '',
      tag: '',
      milestone: '',
      date: ''
    }]);
  };

  const removeMilestone = (index) => {
    setMilestones(prev => prev.filter((_, i) => i !== index));
  };

  const updateMilestone = (index, field, value) => {
    setMilestones(prev => prev.map((milestone, i) => 
      i === index ? { ...milestone, [field]: value } : milestone
    ));
  };

  // Advanced Analytics Helper Functions
  const addArtistRanking = () => setArtistRanking(prev => [...prev, { title: '', value: '' }]);
  const removeArtistRanking = (index) => setArtistRanking(prev => prev.filter((_, i) => i !== index));
  const updateArtistRanking = (index, field, value) => {
    setArtistRanking(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
  };

  const addCareerSnapshot = () => setCareerSnapshot(prev => [...prev, { title: '', value: '', options: [] }]);
  const removeCareerSnapshot = (index) => setCareerSnapshot(prev => prev.filter((_, i) => i !== index));
  const updateCareerSnapshot = (index, field, value) => {
    setCareerSnapshot(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
  };

  const addAudienceSummary = () => setAudienceSummary(prev => [...prev, { title: '', value: '' }]);
  const removeAudienceSummary = (index) => setAudienceSummary(prev => prev.filter((_, i) => i !== index));
  const updateAudienceSummary = (index, field, value) => {
    setAudienceSummary(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
  };

  const addTopMarket = () => setTopMarkets(prev => [...prev, { title: '', value: '' }]);
  const removeTopMarket = (index) => setTopMarkets(prev => prev.filter((_, i) => i !== index));
  const updateTopMarket = (index, field, value) => {
    setTopMarkets(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
  };

  const addTopStatistic = () => setTopStatistics(prev => [...prev, { title: '', value: '' }]);
  const removeTopStatistic = (index) => setTopStatistics(prev => prev.filter((_, i) => i !== index));
  const updateTopStatistic = (index, field, value) => {
    setTopStatistics(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
  };

  const addTopTrack = () => setTopTracks(prev => [...prev, { artwork: null, audioFile: null, title: '', artist: '', platform: '', metrics: '' }]);
  const removeTopTrack = (index) => setTopTracks(prev => prev.filter((_, i) => i !== index));
  const updateTopTrack = (index, field, value) => {
    setTopTracks(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
  };

  const addRelease = () => setAllReleases(prev => [...prev, { title: '', releaseDate: '', releaseType: '', artwork: null }]);
  const removeRelease = (index) => setAllReleases(prev => prev.filter((_, i) => i !== index));
  const updateRelease = (index, field, value) => {
    setAllReleases(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
  };

  const addPlatformPerformance = () => setPlatformPerformance(prev => [...prev, { platformTitle: '', metadataTitle: '', metadataStat: '', tag: '' }]);
  const removePlatformPerformance = (index) => setPlatformPerformance(prev => prev.filter((_, i) => i !== index));
  const updatePlatformPerformance = (index, field, value) => {
    setPlatformPerformance(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
  };

  // Save Functions
  const saveBasicAnalytics = async () => {
    if (!selectedArtistId) {
      alert('Please select an artist first');
      return;
    }
    
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        alert('Authentication error. Please refresh and try again.');
        setSaving(false);
        return;
      }

      console.log('🚀 Starting save process for artist:', selectedArtistId);
      console.log('📊 Release data:', latestRelease);
      console.log('🏆 Milestones data:', milestones);

      // Use simple save method to bypass table permission issues
      const response = await fetch('/api/admin/analytics/simple-save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          artistId: selectedArtistId,
          releaseData: latestRelease,
          milestonesData: milestones,
          type: 'basic'
        })
      });

      const result = await response.json();
      console.log('💾 Save result:', result);

      if (result.success) {
        console.log('✅ Basic analytics saved successfully');
        // Show success message in platform brand colors
        const successDiv = document.createElement('div');
        successDiv.innerHTML = `
          <div class="fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center">
            <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
            </svg>
            Basic Analytics Saved Successfully!
          </div>
        `;
        document.body.appendChild(successDiv);
        setTimeout(() => document.body.removeChild(successDiv), 3000);
        
        if (onDataUpdated) onDataUpdated();
      } else {
        console.error('❌ Failed to save analytics:', result);
        // Show error message in platform brand colors
        const errorDiv = document.createElement('div');
        errorDiv.innerHTML = `
          <div class="fixed top-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center">
            <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
            </svg>
            Failed to Save: ${result.error || 'Unknown error'}
          </div>
        `;
        document.body.appendChild(errorDiv);
        setTimeout(() => document.body.removeChild(errorDiv), 5000);
      }
    } catch (error) {
      console.error('Error saving basic analytics:', error);
      // Show error with platform brand styling
      const errorDiv = document.createElement('div');
      errorDiv.innerHTML = `
        <div class="fixed top-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center">
          <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
          </svg>
          Error: ${error.message}
        </div>
      `;
      document.body.appendChild(errorDiv);
      setTimeout(() => document.body.removeChild(errorDiv), 5000);
    } finally {
      setSaving(false);
    }
  };

  const saveAdvancedAnalytics = async () => {
    if (!selectedArtistId) return;
    
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      // Save all advanced sections to database
      const advancedData = {
        artistId: selectedArtistId,
        artistRanking,
        careerSnapshot,
        audienceSummary,
        topMarkets,
        topStatistics,
        topTracks,
        allReleases,
        platformPerformance
      };

      const response = await fetch('/api/admin/analytics/advanced', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(advancedData)
      });

      const result = await response.json();

      if (result.success) {
        console.log('✅ Advanced analytics saved successfully');
        if (onDataUpdated) onDataUpdated();
      } else {
        console.error('❌ Failed to save advanced analytics');
      }
    } catch (error) {
      console.error('Error saving advanced analytics:', error);
    } finally {
      setSaving(false);
    }
  };

  // Load existing data when artist is selected
  useEffect(() => {
    const loadExistingData = async () => {
      if (!selectedArtistId) return;

      try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;

        if (!token) return;

        console.log('📥 Loading existing data for artist:', selectedArtistId);

        // Load existing data from user_profiles (simple method)
        const { data: profile, error } = await supabase
          .from('user_profiles')
          .select('analytics_data')
          .eq('id', selectedArtistId)
          .single();

        if (error) {
          console.log('⚠️ Error loading profile:', error);
          return;
        }

        if (profile?.analytics_data) {
          console.log('📦 Loaded existing analytics data:', profile.analytics_data);
          
          const { latestRelease: existingRelease, milestones: existingMilestones } = profile.analytics_data;
          
          if (existingRelease) {
            setLatestRelease({
              title: existingRelease.title || '',
              artist: existingRelease.artist || '',
              featuring: existingRelease.featuring || '',
              releaseDate: existingRelease.releaseDate || '',
              releaseType: existingRelease.releaseType || '',
              artwork: null,
              audioFile: null,
              platforms: existingRelease.platforms || [
                { name: 'Spotify', streams: '', change: '' },
                { name: 'Apple Music', streams: '', change: '' },
                { name: 'YouTube Music', streams: '', change: '' },
                { name: 'Total', streams: '', change: '' }
              ]
            });
          }

          if (existingMilestones && existingMilestones.length > 0) {
            setMilestones(existingMilestones);
          }
        } else {
          console.log('📭 No existing analytics data found for artist');
        }

      } catch (error) {
        console.error('Error loading existing data:', error);
      }
    };

    loadExistingData();
  }, [selectedArtistId]);

  // Check admin permissions from user metadata
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const userRole = user.user_metadata?.role;
    const adminRoles = ['super_admin', 'company_admin'];
    
    console.log('🔐 Checking admin permissions:', { userRole, isAdmin: adminRoles.includes(userRole) });
    setIsAdmin(adminRoles.includes(userRole));
    setLoading(false);
  }, [user]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-slate-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-slate-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Settings className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-600">Analytics data is managed by your admin team</p>
          <p className="text-gray-500 text-sm mt-2">Contact your admin to update your analytics information</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Settings className="w-6 h-6 text-blue-600 mr-3" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Analytics Management</h2>
            {selectedArtistData && (
              <div className="flex items-center space-x-2 mt-1">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  selectedArtistData.role === 'artist' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {selectedArtistData.role === 'artist' ? 'Artist' : 'Label Admin'}
                </span>
                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                  Pro Subscription
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Basic/Advanced Tabs */}
      <div className="border-b border-slate-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('basic')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'basic'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            Basic Analytics (2 sections)
          </button>
          <button
            onClick={() => setActiveTab('advanced')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'advanced'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            Advanced Analytics (10 sections)
          </button>
        </nav>
      </div>

      {/* BASIC ANALYTICS - 2 sections */}
      {activeTab === 'basic' && (
        <div className="space-y-8">
          
          {/* 1. Latest Release Performance */}
          <div className="border border-slate-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 text-green-600 mr-2" />
              Latest Release Performance
            </h3>
            
            {/* Basic Release Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <input 
                type="text" 
                placeholder="Track Title" 
                value={latestRelease.title}
                onChange={(e) => setLatestRelease(prev => ({ ...prev, title: e.target.value }))}
                className="border border-slate-300 rounded-lg px-3 py-2" 
              />
              <input 
                type="text" 
                placeholder="Artist Name" 
                value={latestRelease.artist}
                onChange={(e) => setLatestRelease(prev => ({ ...prev, artist: e.target.value }))}
                className="border border-slate-300 rounded-lg px-3 py-2" 
              />
              <input 
                type="date" 
                placeholder="Release Date" 
                value={latestRelease.releaseDate}
                onChange={(e) => setLatestRelease(prev => ({ ...prev, releaseDate: e.target.value }))}
                className="border border-slate-300 rounded-lg px-3 py-2" 
              />
              <div className="relative">
                <select 
                  value={latestRelease.releaseType}
                  onChange={(e) => setLatestRelease(prev => ({ ...prev, releaseType: e.target.value }))}
                  className="w-full appearance-none border border-slate-300 rounded-lg px-3 py-2 pr-8 bg-white"
                >
                  <option value="">Select Release Type</option>
                  <option value="Single">Single</option>
                  <option value="EP">EP</option>
                  <option value="Album">Album</option>
                  <option value="LP">LP</option>
                  <option value="Compilation">Compilation</option>
                  <option value="Remix">Remix</option>
                  <option value="Live">Live</option>
                  <option value="Soundtrack">Soundtrack</option>
                  <option value="Mixtape">Mixtape</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* File Uploads */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Artwork Upload</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => setLatestRelease(prev => ({ ...prev, artwork: e.target.files[0] }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" 
                />
                <p className="text-xs text-slate-500 mt-1">Upload album/single artwork</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Audio File (MP3)</label>
                <input 
                  type="file" 
                  accept="audio/*"
                  onChange={(e) => setLatestRelease(prev => ({ ...prev, audioFile: e.target.files[0] }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" 
                />
                <p className="text-xs text-slate-500 mt-1">Upload MP3 for play button functionality</p>
              </div>
            </div>
            
            {/* Dynamic Platform Boxes */}
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-slate-900">Streaming Platforms</h4>
              <button
                type="button"
                onClick={addPlatform}
                className="bg-blue-100 hover:bg-blue-200 text-blue-600 px-3 py-1 rounded-lg flex items-center text-sm"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Platform
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {latestRelease.platforms.map((platform, index) => (
                <div key={index} className="relative p-4 bg-slate-50 rounded-xl border border-slate-200">
                  {latestRelease.platforms.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePlatform(index)}
                      className="absolute top-2 right-2 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full p-1 z-10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <div className="pr-8 mb-3">
                    <input 
                      type="text" 
                      placeholder="Platform Name" 
                      value={platform.name}
                      onChange={(e) => updatePlatform(index, 'name', e.target.value)}
                      className="w-full font-semibold text-slate-900 bg-transparent border-none p-0 text-sm" 
                    />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Streams (e.g. 2.4M)" 
                    value={platform.streams}
                    onChange={(e) => updatePlatform(index, 'streams', e.target.value)}
                    className="w-full border border-slate-300 rounded px-2 py-1 text-sm mb-2" 
                  />
                  <input 
                    type="text" 
                    placeholder="Change (e.g. +12.5%)" 
                    value={platform.change}
                    onChange={(e) => updatePlatform(index, 'change', e.target.value)}
                    className="w-full border border-slate-300 rounded px-2 py-1 text-sm" 
                  />
                </div>
              ))}
            </div>
          </div>

          {/* 2. Recent Milestones */}
          <div className="border border-slate-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                <Award className="w-5 h-5 text-yellow-600 mr-2" />
                Recent Milestones
              </h3>
              <button
                type="button"
                onClick={addMilestone}
                className="bg-green-100 hover:bg-green-200 text-green-600 px-3 py-1 rounded-lg flex items-center text-sm"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Milestone
              </button>
            </div>
            
            <div className="space-y-4">
              {milestones.map((milestone, index) => (
                <div key={index} className="relative p-4 bg-slate-50 rounded-lg border border-slate-200">
                  {milestones.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMilestone(index)}
                      className="absolute top-2 right-2 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full p-1 z-10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <div className="pr-8">
                    <div className="grid grid-cols-1 gap-4">
                      {/* Milestone Title */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Milestone Title
                        </label>
                        <input 
                          type="text" 
                          placeholder="e.g. 1M Streams Milestone" 
                          value={milestone.title}
                          onChange={(e) => updateMilestone(index, 'title', e.target.value)}
                          className="w-full border border-slate-300 rounded px-3 py-2 text-sm" 
                        />
                      </div>
                      
                      {/* Tag and Date Row */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            Tag
                          </label>
                          <input 
                            type="text" 
                            placeholder="e.g. +25% growth" 
                            value={milestone.tag}
                            onChange={(e) => updateMilestone(index, 'tag', e.target.value)}
                            className="w-full border border-slate-300 rounded px-3 py-2 text-sm" 
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            Date
                          </label>
                          <input 
                            type="date" 
                            value={milestone.date}
                            onChange={(e) => updateMilestone(index, 'date', e.target.value)}
                            className="w-full border border-slate-300 rounded px-3 py-2 text-sm" 
                          />
                        </div>
                      </div>
                      
                      {/* Milestone Description */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Milestone Description
                        </label>
                        <textarea 
                          placeholder="e.g. Your latest single reached 1 million streams across all platforms" 
                          value={milestone.milestone}
                          onChange={(e) => updateMilestone(index, 'milestone', e.target.value)}
                          className="w-full border border-slate-300 rounded px-3 py-2 text-sm resize-none" 
                          rows="3"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ADVANCED ANALYTICS - 10 sections */}
      {activeTab === 'advanced' && (
        <div className="space-y-8">

          {/* 1. Latest Release Performance (same as basic) */}
          <div className="border border-slate-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 text-green-600 mr-2" />
              Latest Release Performance
            </h3>
            <div className="text-sm text-slate-600 mb-4">Same as Basic Analytics - managed from Basic tab</div>
          </div>

          {/* 2. Artist Ranking */}
          <div className="border border-slate-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                <CheckCircle className="w-5 h-5 text-blue-600 mr-2" />
                Artist Ranking
              </h3>
              <button
                type="button"
                onClick={addArtistRanking}
                className="bg-blue-100 hover:bg-blue-200 text-blue-600 px-3 py-1 rounded-lg flex items-center text-sm"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Ranking
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {artistRanking.map((ranking, index) => (
                <div key={index} className="relative p-4 bg-slate-50 rounded-xl border border-slate-200">
                  {artistRanking.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArtistRanking(index)}
                      className="absolute top-2 right-2 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full p-1 z-10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <div className="pr-8">
                    <input 
                      type="text" 
                      placeholder="Ranking Title" 
                      value={ranking.title}
                      onChange={(e) => updateArtistRanking(index, 'title', e.target.value)}
                      className="w-full font-medium text-slate-900 bg-transparent border-none p-0 text-sm mb-2" 
                    />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Ranking Value" 
                    value={ranking.value}
                    onChange={(e) => updateArtistRanking(index, 'value', e.target.value)}
                    className="w-full border border-slate-300 rounded px-3 py-2 text-sm" 
                  />
                </div>
              ))}
            </div>
          </div>

          {/* 3. Career Snapshot */}
          <div className="border border-slate-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                <Settings className="w-5 h-5 text-purple-600 mr-2" />
                Career Snapshot
              </h3>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={addCareerSnapshot}
                  className="bg-purple-100 hover:bg-purple-200 text-purple-600 px-3 py-1 rounded-lg flex items-center text-sm"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Stage
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {careerSnapshot.map((stage, index) => (
                <div key={index} className="relative p-4 bg-slate-50 rounded-xl border border-slate-200">
                  {careerSnapshot.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeCareerSnapshot(index)}
                      className="absolute top-2 right-2 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full p-1 z-10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <div className="pr-8 mb-2">
                    <input 
                      type="text" 
                      placeholder="Stage Title" 
                      value={stage.title}
                      onChange={(e) => updateCareerSnapshot(index, 'title', e.target.value)}
                      className="w-full font-medium text-slate-900 bg-transparent border-none p-0 text-sm" 
                    />
                  </div>
                  <select 
                    value={stage.value}
                    onChange={(e) => updateCareerSnapshot(index, 'value', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="">Select Value</option>
                    {stage.options.map((option, optIndex) => (
                      <option key={optIndex} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Audience Summary */}
          <div className="border border-slate-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                <Users className="w-5 h-5 text-orange-600 mr-2" />
                Audience Summary
              </h3>
              <button
                type="button"
                onClick={addAudienceSummary}
                className="bg-orange-100 hover:bg-orange-200 text-orange-600 px-3 py-1 rounded-lg flex items-center text-sm"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Field
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {audienceSummary.map((field, index) => (
                <div key={index} className="relative p-4 bg-slate-50 rounded-xl border border-slate-200">
                  {audienceSummary.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeAudienceSummary(index)}
                      className="absolute top-2 right-2 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full p-1 z-10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <div className="pr-8 mb-2">
                    <input 
                      type="text" 
                      placeholder="Field Title" 
                      value={field.title}
                      onChange={(e) => updateAudienceSummary(index, 'title', e.target.value)}
                      className="w-full font-medium text-slate-900 bg-transparent border-none p-0 text-sm" 
                    />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Field Value" 
                    value={field.value}
                    onChange={(e) => updateAudienceSummary(index, 'value', e.target.value)}
                    className="w-full border border-slate-300 rounded px-3 py-2 text-sm" 
                  />
                </div>
              ))}
            </div>
          </div>

          {/* 5. Top Markets & Demographics */}
          <div className="border border-slate-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Top Markets & Demographics</h3>
              <button
                type="button"
                onClick={addTopMarket}
                className="bg-green-100 hover:bg-green-200 text-green-600 px-3 py-1 rounded-lg flex items-center text-sm"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Market
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {topMarkets.map((market, index) => (
                <div key={index} className="relative p-4 bg-slate-50 rounded-xl border border-slate-200">
                  {topMarkets.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTopMarket(index)}
                      className="absolute top-2 right-2 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full p-1 z-10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <div className="pr-8 mb-2">
                    <input 
                      type="text" 
                      placeholder="Market Title" 
                      value={market.title}
                      onChange={(e) => updateTopMarket(index, 'title', e.target.value)}
                      className="w-full font-medium text-slate-900 bg-transparent border-none p-0 text-sm" 
                    />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Market Value" 
                    value={market.value}
                    onChange={(e) => updateTopMarket(index, 'value', e.target.value)}
                    className="w-full border border-slate-300 rounded px-3 py-2 text-sm" 
                  />
                </div>
              ))}
            </div>
          </div>

          {/* 6. Top Statistics */}
          <div className="border border-slate-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Top Statistics</h3>
              <button
                type="button"
                onClick={addTopStatistic}
                className="bg-indigo-100 hover:bg-indigo-200 text-indigo-600 px-3 py-1 rounded-lg flex items-center text-sm"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Statistic
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {topStatistics.map((stat, index) => (
                <div key={index} className="relative p-4 bg-slate-50 rounded-xl border border-slate-200">
                  {topStatistics.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTopStatistic(index)}
                      className="absolute top-2 right-2 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full p-1 z-10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <div className="pr-8 mb-2">
                    <input 
                      type="text" 
                      placeholder="Statistic Title" 
                      value={stat.title}
                      onChange={(e) => updateTopStatistic(index, 'title', e.target.value)}
                      className="w-full font-medium text-slate-900 bg-transparent border-none p-0 text-sm" 
                    />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Statistic Value" 
                    value={stat.value}
                    onChange={(e) => updateTopStatistic(index, 'value', e.target.value)}
                    className="w-full border border-slate-300 rounded px-3 py-2 text-sm" 
                  />
                </div>
              ))}
            </div>
          </div>

          {/* 7. Top Tracks */}
          <div className="border border-slate-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Top Tracks</h3>
              <button
                type="button"
                onClick={addTopTrack}
                className="bg-pink-100 hover:bg-pink-200 text-pink-600 px-3 py-1 rounded-lg flex items-center text-sm"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Track
              </button>
            </div>
            <div className="space-y-4">
              {topTracks.map((track, index) => (
                <div key={index} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-slate-900">Track #{index + 1}</h4>
                    {topTracks.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTopTrack(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  {/* File Uploads Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Artwork Upload</label>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => updateTopTrack(index, 'artwork', e.target.files[0])}
                        className="w-full border border-slate-300 rounded px-3 py-2 text-sm" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">MP3 Upload (Play Functionality)</label>
                      <input 
                        type="file" 
                        accept="audio/*"
                        onChange={(e) => updateTopTrack(index, 'audioFile', e.target.files[0])}
                        className="w-full border border-slate-300 rounded px-3 py-2 text-sm" 
                      />
                    </div>
                  </div>
                  
                  {/* Track Details Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Asset Title</label>
                      <input 
                        type="text" 
                        placeholder="Track Title" 
                        value={track.title}
                        onChange={(e) => updateTopTrack(index, 'title', e.target.value)}
                        className="w-full border border-slate-300 rounded px-3 py-2 text-sm" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Artist</label>
                      <input 
                        type="text" 
                        placeholder="Artist Name" 
                        value={track.artist}
                        onChange={(e) => updateTopTrack(index, 'artist', e.target.value)}
                        className="w-full border border-slate-300 rounded px-3 py-2 text-sm" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Platform</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Spotify" 
                        value={track.platform}
                        onChange={(e) => updateTopTrack(index, 'platform', e.target.value)}
                        className="w-full border border-slate-300 rounded px-3 py-2 text-sm" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Metrics</label>
                      <textarea 
                        placeholder="e.g. 2.4M streams, #1 trending" 
                        value={track.metrics}
                        onChange={(e) => updateTopTrack(index, 'metrics', e.target.value)}
                        className="w-full border border-slate-300 rounded px-3 py-2 text-sm resize-none" 
                        rows="2"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 8. All Releases */}
          <div className="border border-slate-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">All Releases</h3>
              <button
                type="button"
                onClick={addRelease}
                className="bg-teal-100 hover:bg-teal-200 text-teal-600 px-3 py-1 rounded-lg flex items-center text-sm"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Release
              </button>
            </div>
            <div className="space-y-4">
              {allReleases.map((release, index) => (
                <div key={index} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-slate-900">Release #{index + 1}</h4>
                    {allReleases.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeRelease(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Release Title</label>
                      <input 
                        type="text" 
                        placeholder="Release Title" 
                        value={release.title}
                        onChange={(e) => updateRelease(index, 'title', e.target.value)}
                        className="w-full border border-slate-300 rounded px-3 py-2 text-sm" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Release Date</label>
                      <input 
                        type="date" 
                        value={release.releaseDate}
                        onChange={(e) => updateRelease(index, 'releaseDate', e.target.value)}
                        className="w-full border border-slate-300 rounded px-3 py-2 text-sm" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Release Type</label>
                      <div className="relative">
                        <select 
                          value={release.releaseType}
                          onChange={(e) => updateRelease(index, 'releaseType', e.target.value)}
                          className="w-full appearance-none border border-slate-300 rounded px-3 py-2 pr-8 bg-white text-sm"
                        >
                          <option value="">Select Type</option>
                          <option value="Single">Single</option>
                          <option value="EP">EP</option>
                          <option value="Album">Album</option>
                          <option value="LP">LP</option>
                          <option value="Compilation">Compilation</option>
                          <option value="Remix">Remix</option>
                          <option value="Live">Live</option>
                          <option value="Soundtrack">Soundtrack</option>
                          <option value="Mixtape">Mixtape</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Artwork</label>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => updateRelease(index, 'artwork', e.target.files[0])}
                        className="w-full border border-slate-300 rounded px-3 py-2 text-sm" 
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 9. Platform Performance */}
          <div className="border border-slate-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                <BarChart3 className="w-5 h-5 text-blue-600 mr-2" />
                Platform Performance
              </h3>
              <button
                type="button"
                onClick={addPlatformPerformance}
                className="bg-blue-100 hover:bg-blue-200 text-blue-600 px-3 py-1 rounded-lg flex items-center text-sm"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Platform
              </button>
            </div>
            <div className="space-y-4">
              {platformPerformance.map((platform, index) => (
                <div key={index} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-slate-900">Platform #{index + 1}</h4>
                    {platformPerformance.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePlatformPerformance(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Platform Title</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Spotify" 
                        value={platform.platformTitle}
                        onChange={(e) => updatePlatformPerformance(index, 'platformTitle', e.target.value)}
                        className="w-full border border-slate-300 rounded px-3 py-2 text-sm" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Metadata Title</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Monthly Listeners" 
                        value={platform.metadataTitle}
                        onChange={(e) => updatePlatformPerformance(index, 'metadataTitle', e.target.value)}
                        className="w-full border border-slate-300 rounded px-3 py-2 text-sm" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Metadata Stat</label>
                      <input 
                        type="text" 
                        placeholder="e.g. 2.4M" 
                        value={platform.metadataStat}
                        onChange={(e) => updatePlatformPerformance(index, 'metadataStat', e.target.value)}
                        className="w-full border border-slate-300 rounded px-3 py-2 text-sm" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Tag</label>
                      <input 
                        type="text" 
                        placeholder="e.g. +12.5%" 
                        value={platform.tag}
                        onChange={(e) => updatePlatformPerformance(index, 'tag', e.target.value)}
                        className="w-full border border-slate-300 rounded px-3 py-2 text-sm" 
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 10. Recent Milestones (Advanced) */}
          <div className="border border-slate-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <Award className="w-5 h-5 text-yellow-600 mr-2" />
              Recent Milestones (Advanced)
            </h3>
            <div className="text-sm text-slate-600 mb-4">Same as Basic Analytics - managed from Basic tab</div>
          </div>

        </div>
      )}

      {/* Save Button */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={activeTab === 'basic' ? saveBasicAnalytics : saveAdvancedAnalytics}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center disabled:opacity-50"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : `Save ${activeTab === 'basic' ? 'Basic' : 'Advanced'} Analytics`}
        </button>
      </div>

      {/* Success Message */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-8">
        <div className="flex items-center">
          <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
          <div>
            <p className="text-green-800 font-medium">Manual Analytics System Active</p>
            <p className="text-green-700 text-sm">Data feeds directly to the artist analytics frontend</p>
            <p className="text-green-600 text-sm">Changes appear immediately in both Basic and Advanced views</p>
          </div>
        </div>
      </div>
    </div>
  );
}