// Admin Analytics Interface - Replace Chartmetric linking with manual data management
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/components/providers/SupabaseProvider';
import { 
  Music, 
  Settings, 
  Save, 
  Plus, 
  Trash2, 
  Upload,
  CheckCircle,
  AlertCircle,
  Edit3,
  Users
} from 'lucide-react';

export default function AdminAnalyticsInterface({ selectedArtistId, selectedArtistData, onDataUpdated }) {
  const { user } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  
  // Latest Release Management - Clean form with no placeholder data
  const [releaseForm, setReleaseForm] = useState({
    title: '',
    artist: '',
    featuring: '',
    releaseDate: '',
    releaseType: 'Single',
    audioFileUrl: '',
    coverImageUrl: '',
    platforms: [
      { name: '', value: '', percentage: '' },
      { name: '', value: '', percentage: '' },
      { name: '', value: '', percentage: '' },
      { name: '', value: '', percentage: '' }
    ],
    isLive: false
  });

  // Milestones Management - Clean form with no placeholder data
  const [milestones, setMilestones] = useState([
    {
      title: '',
      highlight: '',
      description: '',
      milestoneDate: '',
      category: 'basic'
    },
    {
      title: '',
      highlight: '',
      description: '',
      milestoneDate: '',
      category: 'advanced'
    }
  ]);

  // Check admin permissions from user metadata (not database)
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    // Get role from user metadata (where roles are actually stored)
    const userRole = user.user_metadata?.role;
    const adminRoles = ['super_admin', 'company_admin'];
    
    console.log('🔐 Checking admin permissions:', { userRole, isAdmin: adminRoles.includes(userRole) });
    setIsAdmin(adminRoles.includes(userRole));
    setLoading(false);
  }, [user]);

  // Save latest release
  const saveLatestRelease = async () => {
    if (!isAdmin) return;

    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const response = await fetch('/api/admin/analytics/releases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          artistId: selectedArtistId || user.id,
          ...releaseForm
        })
      });

      const result = await response.json();

      if (result.success) {
        console.log('✅ Release saved successfully');
        if (onDataUpdated) onDataUpdated();
      } else {
        console.error('❌ Failed to save release:', result.error);
      }
    } catch (error) {
      console.error('Error saving release:', error);
    } finally {
      setSaving(false);
    }
  };

  // Save milestones
  const saveMilestones = async () => {
    if (!isAdmin) return;

    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      // Save each milestone
      for (const milestone of milestones) {
        await fetch('/api/admin/analytics/milestones', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            artistId: selectedArtistId || user.id,
            ...milestone
          })
        });
      }

      console.log('✅ Milestones saved successfully');
      if (onDataUpdated) onDataUpdated();
    } catch (error) {
      console.error('Error saving milestones:', error);
    } finally {
      setSaving(false);
    }
  };

  // Add new platform
  const addPlatform = () => {
    setReleaseForm(prev => ({
      ...prev,
      platforms: [...prev.platforms, { name: '', value: '', percentage: '' }]
    }));
  };

  // Remove platform
  const removePlatform = (index) => {
    setReleaseForm(prev => ({
      ...prev,
      platforms: prev.platforms.filter((_, i) => i !== index)
    }));
  };

  // Add new milestone
  const addMilestone = (category = 'advanced') => {
    setMilestones(prev => [...prev, {
      title: '',
      highlight: '',
      description: '',
      milestoneDate: '',
      category: category
    }]);
  };

  // Remove milestone
  const removeMilestone = (index) => {
    setMilestones(prev => prev.filter((_, i) => i !== index));
  };

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
        <div className="flex items-center mb-6">
          <Music className="w-6 h-6 text-blue-600 mr-3" />
          <h2 className="text-xl font-semibold text-gray-900">Analytics Management</h2>
        </div>
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
        <div className="flex space-x-2">
          <button
            onClick={saveLatestRelease}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center disabled:opacity-50"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Release'}
          </button>
          <button
            onClick={saveMilestones}
            disabled={saving}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center disabled:opacity-50"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Milestones'}
          </button>
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
            Basic Analytics
          </button>
          <button
            onClick={() => setActiveTab('advanced')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'advanced'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            Advanced Analytics
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'basic' && (
        <div className="space-y-8">
          {/* Basic Analytics - Latest Release Performance */}
          <div className="border border-slate-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <Music className="w-5 h-5 text-green-600 mr-2" />
              Latest Release Performance (Basic)
            </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <input
              type="text"
              placeholder="Track Title"
              value={releaseForm.title}
              onChange={(e) => setReleaseForm(prev => ({ ...prev, title: e.target.value }))}
              className="border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="text"
              placeholder="Artist Name"
              value={releaseForm.artist}
              onChange={(e) => setReleaseForm(prev => ({ ...prev, artist: e.target.value }))}
              className="border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="text"
              placeholder="Featuring (optional)"
              value={releaseForm.featuring}
              onChange={(e) => setReleaseForm(prev => ({ ...prev, featuring: e.target.value }))}
              className="border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="date"
              placeholder="Release Date"
              value={releaseForm.releaseDate}
              onChange={(e) => setReleaseForm(prev => ({ ...prev, releaseDate: e.target.value }))}
              className="border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="relative">
              <select
                value={releaseForm.releaseType}
                onChange={(e) => setReleaseForm(prev => ({ ...prev, releaseType: e.target.value }))}
                className="w-full appearance-none border border-slate-300 rounded-lg px-3 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
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
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={releaseForm.isLive}
                onChange={(e) => setReleaseForm(prev => ({ ...prev, isLive: e.target.checked }))}
                className="mr-2"
              />
              <span className="text-sm text-slate-600">Set as Live Release</span>
            </label>
          </div>

          {/* Platform Performance Boxes */}
          <div className="space-y-4">
            <h4 className="font-medium text-slate-900">Platform Performance</h4>
            {releaseForm.platforms.map((platform, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-lg">
                <input
                  type="text"
                  placeholder="Platform Name"
                  value={platform.name}
                  onChange={(e) => {
                    const newPlatforms = [...releaseForm.platforms];
                    newPlatforms[index].name = e.target.value;
                    setReleaseForm(prev => ({ ...prev, platforms: newPlatforms }));
                  }}
                  className="border border-slate-300 rounded px-3 py-2 text-sm"
                />
                <input
                  type="text"
                  placeholder="Value (e.g. 2.4M)"
                  value={platform.value}
                  onChange={(e) => {
                    const newPlatforms = [...releaseForm.platforms];
                    newPlatforms[index].value = e.target.value;
                    setReleaseForm(prev => ({ ...prev, platforms: newPlatforms }));
                  }}
                  className="border border-slate-300 rounded px-3 py-2 text-sm"
                />
                <input
                  type="text"
                  placeholder="Percentage (e.g. +12.5%)"
                  value={platform.percentage}
                  onChange={(e) => {
                    const newPlatforms = [...releaseForm.platforms];
                    newPlatforms[index].percentage = e.target.value;
                    setReleaseForm(prev => ({ ...prev, platforms: newPlatforms }));
                  }}
                  className="border border-slate-300 rounded px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  onClick={() => removePlatform(index)}
                  className="bg-red-100 hover:bg-red-200 text-red-600 px-3 py-2 rounded flex items-center justify-center"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addPlatform}
              className="bg-blue-100 hover:bg-blue-200 text-blue-600 px-4 py-2 rounded-lg flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Platform
            </button>
          </div>
        </div>

        {/* Recent Milestones Management */}
        <div className="border border-slate-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
            <CheckCircle className="w-5 h-5 text-yellow-600 mr-2" />
            Recent Milestones
          </h3>
          
          <div className="space-y-4">
            {milestones.map((milestone, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-3 p-4 bg-slate-50 rounded-lg">
                <input
                  type="text"
                  placeholder="Title (bold text)"
                  value={milestone.title}
                  onChange={(e) => {
                    const newMilestones = [...milestones];
                    newMilestones[index].title = e.target.value;
                    setMilestones(newMilestones);
                  }}
                  className="border border-slate-300 rounded px-3 py-2 text-sm"
                />
                <input
                  type="text"
                  placeholder="Highlight text (green)"
                  value={milestone.highlight}
                  onChange={(e) => {
                    const newMilestones = [...milestones];
                    newMilestones[index].highlight = e.target.value;
                    setMilestones(newMilestones);
                  }}
                  className="border border-slate-300 rounded px-3 py-2 text-sm"
                />
                <textarea
                  placeholder="Description (grey text)"
                  value={milestone.description}
                  onChange={(e) => {
                    const newMilestones = [...milestones];
                    newMilestones[index].description = e.target.value;
                    setMilestones(newMilestones);
                  }}
                  className="border border-slate-300 rounded px-3 py-2 text-sm resize-none"
                  rows="2"
                />
                <input
                  type="date"
                  placeholder="Milestone Date"
                  value={milestone.milestoneDate}
                  onChange={(e) => {
                    const newMilestones = [...milestones];
                    newMilestones[index].milestoneDate = e.target.value;
                    setMilestones(newMilestones);
                  }}
                  className="border border-slate-300 rounded px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  onClick={() => removeMilestone(index)}
                  className="bg-red-100 hover:bg-red-200 text-red-600 px-3 py-2 rounded flex items-center justify-center"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addMilestone}
              className="bg-green-100 hover:bg-green-200 text-green-600 px-4 py-2 rounded-lg flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Milestone
            </button>
          </div>
        </div>

          {/* Basic Milestones */}
          <div className="border border-slate-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <CheckCircle className="w-5 h-5 text-yellow-600 mr-2" />
              Recent Milestones (Basic)
            </h3>
            
            <div className="space-y-4">
              {milestones.filter(m => m.category === 'basic').map((milestone, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-lg">
                  <input
                    type="text"
                    placeholder="Milestone Title"
                    value={milestone.title}
                    onChange={(e) => {
                      const newMilestones = [...milestones];
                      newMilestones[index].title = e.target.value;
                      setMilestones(newMilestones);
                    }}
                    className="border border-slate-300 rounded px-3 py-2 text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Highlight (e.g. +25%)"
                    value={milestone.highlight}
                    onChange={(e) => {
                      const newMilestones = [...milestones];
                      newMilestones[index].highlight = e.target.value;
                      setMilestones(newMilestones);
                    }}
                    className="border border-slate-300 rounded px-3 py-2 text-sm"
                  />
                  <input
                    type="date"
                    placeholder="Date"
                    value={milestone.milestoneDate}
                    onChange={(e) => {
                      const newMilestones = [...milestones];
                      newMilestones[index].milestoneDate = e.target.value;
                      setMilestones(newMilestones);
                    }}
                    className="border border-slate-300 rounded px-3 py-2 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => removeMilestone(index)}
                    className="bg-red-100 hover:bg-red-200 text-red-600 px-3 py-2 rounded flex items-center justify-center"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addMilestone('basic')}
                className="bg-green-100 hover:bg-green-200 text-green-600 px-4 py-2 rounded-lg flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Basic Milestone
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'advanced' && (
        <div className="space-y-8">
          {/* Advanced Analytics - All Sections */}
          
          {/* Artist Ranking */}
          <div className="border border-slate-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <CheckCircle className="w-5 h-5 text-blue-600 mr-2" />
              Artist Ranking
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input type="text" placeholder="Country Ranking" className="border border-slate-300 rounded-lg px-3 py-2" />
              <input type="text" placeholder="Global Ranking" className="border border-slate-300 rounded-lg px-3 py-2" />
              <input type="text" placeholder="Primary Genre Ranking" className="border border-slate-300 rounded-lg px-3 py-2" />
              <input type="text" placeholder="Secondary Genre Ranking" className="border border-slate-300 rounded-lg px-3 py-2" />
              <input type="text" placeholder="Tertiary Genre Ranking" className="border border-slate-300 rounded-lg px-3 py-2" />
              <input type="text" placeholder="Momentum Score" className="border border-slate-300 rounded-lg px-3 py-2" />
              <input type="text" placeholder="Continent Ranking" className="border border-slate-300 rounded-lg px-3 py-2" />
            </div>
          </div>

          {/* Career Snapshot */}
          <div className="border border-slate-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <Settings className="w-5 h-5 text-purple-600 mr-2" />
              Career Snapshot
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Career Stage</label>
                <select className="w-full border border-slate-300 rounded-lg px-3 py-2">
                  <option value="">Select Stage</option>
                  <option value="Developing">Developing</option>
                  <option value="Mid-Level">Mid-Level</option>
                  <option value="Mainstream">Mainstream</option>
                  <option value="Superstar">Superstar</option>
                  <option value="Legendary">Legendary</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Recent Momentum</label>
                <select className="w-full border border-slate-300 rounded-lg px-3 py-2">
                  <option value="">Select Momentum</option>
                  <option value="Decline">Decline</option>
                  <option value="Gradual Decline">Gradual Decline</option>
                  <option value="Steady">Steady</option>
                  <option value="Gradual Growth">Gradual Growth</option>
                  <option value="Explosive Growth">Explosive Growth</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Network Strength</label>
                <select className="w-full border border-slate-300 rounded-lg px-3 py-2">
                  <option value="">Select Strength</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Limited">Limited</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Active">Active</option>
                  <option value="Established">Established</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Social Engagement</label>
                <select className="w-full border border-slate-300 rounded-lg px-3 py-2">
                  <option value="">Select Engagement</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Limited">Limited</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Active">Active</option>
                  <option value="Influential">Influential</option>
                </select>
              </div>
            </div>
          </div>

          {/* Audience Demographics */}
          <div className="border border-slate-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <Users className="w-5 h-5 text-orange-600 mr-2" />
              Audience Demographics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input type="text" placeholder="Primary Market" className="border border-slate-300 rounded-lg px-3 py-2" />
              <input type="text" placeholder="Secondary Market" className="border border-slate-300 rounded-lg px-3 py-2" />
              <input type="text" placeholder="Primary Gender %" className="border border-slate-300 rounded-lg px-3 py-2" />
              <input type="text" placeholder="Primary Age Group" className="border border-slate-300 rounded-lg px-3 py-2" />
              <input type="text" placeholder="Social Footprint" className="border border-slate-300 rounded-lg px-3 py-2" />
              <input type="text" placeholder="Top Statistics" className="border border-slate-300 rounded-lg px-3 py-2" />
            </div>
          </div>

          {/* Advanced Milestones */}
          <div className="border border-slate-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <CheckCircle className="w-5 h-5 text-yellow-600 mr-2" />
              Advanced Milestones
            </h3>
            
            <div className="space-y-4">
              {milestones.filter(m => m.category === 'advanced').map((milestone, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-3 p-4 bg-slate-50 rounded-lg">
                  <input
                    type="text"
                    placeholder="Title (bold text)"
                    value={milestone.title}
                    onChange={(e) => {
                      const newMilestones = [...milestones];
                      newMilestones[index].title = e.target.value;
                      setMilestones(newMilestones);
                    }}
                    className="border border-slate-300 rounded px-3 py-2 text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Highlight text (green)"
                    value={milestone.highlight}
                    onChange={(e) => {
                      const newMilestones = [...milestones];
                      newMilestones[index].highlight = e.target.value;
                      setMilestones(newMilestones);
                    }}
                    className="border border-slate-300 rounded px-3 py-2 text-sm"
                  />
                  <textarea
                    placeholder="Description (grey text)"
                    value={milestone.description}
                    onChange={(e) => {
                      const newMilestones = [...milestones];
                      newMilestones[index].description = e.target.value;
                      setMilestones(newMilestones);
                    }}
                    className="border border-slate-300 rounded px-3 py-2 text-sm resize-none"
                    rows="2"
                  />
                  <input
                    type="date"
                    placeholder="Milestone Date"
                    value={milestone.milestoneDate}
                    onChange={(e) => {
                      const newMilestones = [...milestones];
                      newMilestones[index].milestoneDate = e.target.value;
                      setMilestones(newMilestones);
                    }}
                    className="border border-slate-300 rounded px-3 py-2 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => removeMilestone(index)}
                    className="bg-red-100 hover:bg-red-200 text-red-600 px-3 py-2 rounded flex items-center justify-center"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addMilestone('advanced')}
                className="bg-green-100 hover:bg-green-200 text-green-600 px-4 py-2 rounded-lg flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Advanced Milestone
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-8">
        <div className="flex items-center">
          <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
          <div>
            <p className="text-green-800 font-medium">Manual Analytics System Active</p>
            <p className="text-green-700 text-sm">Analytics data is now managed through this admin interface</p>
            <p className="text-green-600 text-sm">Changes will appear immediately in the analytics dashboard</p>
          </div>
        </div>
      </div>
    </div>
  );
}
