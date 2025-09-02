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
  Edit3
} from 'lucide-react';

export default function AdminAnalyticsInterface({ selectedArtistId, onDataUpdated }) {
  const { user } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
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
  const addMilestone = () => {
    setMilestones(prev => [...prev, {
      title: '',
      highlight: '',
      description: '',
      milestoneDate: new Date().toISOString().split('T')[0],
      category: 'advanced'
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
          <h2 className="text-xl font-semibold text-gray-900">Analytics Management</h2>
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

      <div className="space-y-8">
        {/* Latest Release Performance Management */}
        <div className="border border-slate-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
            <Music className="w-5 h-5 text-green-600 mr-2" />
            Latest Release Performance
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
            <select
              value={releaseForm.releaseType}
              onChange={(e) => setReleaseForm(prev => ({ ...prev, releaseType: e.target.value }))}
              className="border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Single">Single</option>
              <option value="EP">EP</option>
              <option value="Album">Album</option>
              <option value="Compilation">Compilation</option>
            </select>
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

        {/* Success Message */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
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
    </div>
  );
}
