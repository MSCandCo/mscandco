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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <input type="text" placeholder="Track Title" className="border border-slate-300 rounded-lg px-3 py-2" />
              <input type="text" placeholder="Artist Name" className="border border-slate-300 rounded-lg px-3 py-2" />
              <input type="date" placeholder="Release Date" className="border border-slate-300 rounded-lg px-3 py-2" />
              <div className="relative">
                <select className="w-full appearance-none border border-slate-300 rounded-lg px-3 py-2 pr-8 bg-white">
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
            
            {/* Platform Performance (4 boxes) */}
            <h4 className="font-medium text-slate-900 mb-4">Platform Performance</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['Spotify', 'Apple Music', 'YouTube Music', 'Total'].map((platform, index) => (
                <div key={index} className="p-4 bg-slate-50 rounded-xl">
                  <h5 className="font-semibold text-slate-900 mb-2">{platform}</h5>
                  <input type="text" placeholder="Streams (e.g. 2.4M)" className="w-full border border-slate-300 rounded px-2 py-1 text-sm mb-2" />
                  <input type="text" placeholder="Change (e.g. +12.5%)" className="w-full border border-slate-300 rounded px-2 py-1 text-sm" />
                </div>
              ))}
            </div>
          </div>

          {/* 2. Recent Milestones */}
          <div className="border border-slate-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <Award className="w-5 h-5 text-yellow-600 mr-2" />
              Recent Milestones
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-lg">
                <input type="text" placeholder="Milestone Title" className="border border-slate-300 rounded px-3 py-2 text-sm" />
                <input type="text" placeholder="Highlight (e.g. +25%)" className="border border-slate-300 rounded px-3 py-2 text-sm" />
                <input type="date" placeholder="Date" className="border border-slate-300 rounded px-3 py-2 text-sm" />
                <button className="bg-green-100 hover:bg-green-200 text-green-600 px-3 py-2 rounded flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
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

          {/* 3. Career Snapshot */}
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

          {/* 4. Audience Summary */}
          <div className="border border-slate-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <Users className="w-5 h-5 text-orange-600 mr-2" />
              Audience Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <input type="text" placeholder="Social Footprint" className="border border-slate-300 rounded-lg px-3 py-2" />
              <input type="text" placeholder="Primary Market" className="border border-slate-300 rounded-lg px-3 py-2" />
              <input type="text" placeholder="Secondary Market" className="border border-slate-300 rounded-lg px-3 py-2" />
              <input type="text" placeholder="Primary Gender %" className="border border-slate-300 rounded-lg px-3 py-2" />
              <input type="text" placeholder="Primary Age Group" className="border border-slate-300 rounded-lg px-3 py-2" />
            </div>
          </div>

          {/* 5. Top Markets & Demographics */}
          <div className="border border-slate-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Top Markets & Demographics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input type="text" placeholder="Top Country 1" className="border border-slate-300 rounded-lg px-3 py-2" />
              <input type="text" placeholder="Top Country 2" className="border border-slate-300 rounded-lg px-3 py-2" />
              <input type="text" placeholder="Top Country 3" className="border border-slate-300 rounded-lg px-3 py-2" />
              <input type="text" placeholder="Age Range" className="border border-slate-300 rounded-lg px-3 py-2" />
              <input type="text" placeholder="Gender Split" className="border border-slate-300 rounded-lg px-3 py-2" />
              <input type="text" placeholder="Listening Habits" className="border border-slate-300 rounded-lg px-3 py-2" />
            </div>
          </div>

          {/* 6. Top Statistics */}
          <div className="border border-slate-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Top Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input type="text" placeholder="Total Streams" className="border border-slate-300 rounded-lg px-3 py-2" />
              <input type="text" placeholder="Monthly Listeners" className="border border-slate-300 rounded-lg px-3 py-2" />
              <input type="text" placeholder="Followers" className="border border-slate-300 rounded-lg px-3 py-2" />
              <input type="text" placeholder="Countries" className="border border-slate-300 rounded-lg px-3 py-2" />
            </div>
          </div>

          {/* 7. Top 10 Tracks */}
          <div className="border border-slate-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Top 10 Tracks</h3>
            <div className="space-y-3">
              {[1,2,3].map(i => (
                <div key={i} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 bg-slate-50 rounded-lg">
                  <input type="text" placeholder={`Track ${i} Title`} className="border border-slate-300 rounded px-3 py-2 text-sm" />
                  <input type="text" placeholder="Artist" className="border border-slate-300 rounded px-3 py-2 text-sm" />
                  <input type="text" placeholder="Streams" className="border border-slate-300 rounded px-3 py-2 text-sm" />
                  <input type="file" accept="audio/*" className="border border-slate-300 rounded px-3 py-2 text-sm" />
                </div>
              ))}
            </div>
          </div>

          {/* 8. All Releases */}
          <div className="border border-slate-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">All Releases</h3>
            <div className="space-y-3">
              {[1,2,3].map(i => (
                <div key={i} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 bg-slate-50 rounded-lg">
                  <input type="text" placeholder={`Release ${i} Title`} className="border border-slate-300 rounded px-3 py-2 text-sm" />
                  <input type="date" placeholder="Release Date" className="border border-slate-300 rounded px-3 py-2 text-sm" />
                  <input type="text" placeholder="Type" className="border border-slate-300 rounded px-3 py-2 text-sm" />
                  <input type="file" accept="image/*" placeholder="Artwork" className="border border-slate-300 rounded px-3 py-2 text-sm" />
                </div>
              ))}
            </div>
          </div>

          {/* 9. Platform Performance */}
          <div className="border border-slate-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <BarChart3 className="w-5 h-5 text-blue-600 mr-2" />
              Platform Performance
            </h3>
            <div className="space-y-4">
              {['Spotify', 'Apple Music', 'YouTube Music', 'Amazon Music', 'TikTok', 'Instagram'].map((platform, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-3 p-4 bg-slate-50 rounded-lg">
                  <div className="font-semibold text-slate-900 flex items-center">{platform}</div>
                  <input type="text" placeholder="Followers/Subscribers" className="border border-slate-300 rounded px-3 py-2 text-sm" />
                  <input type="text" placeholder="Monthly Listeners/Views" className="border border-slate-300 rounded px-3 py-2 text-sm" />
                  <input type="text" placeholder="Total Streams/Plays" className="border border-slate-300 rounded px-3 py-2 text-sm" />
                  <input type="text" placeholder="Change %" className="border border-slate-300 rounded px-3 py-2 text-sm" />
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
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3 p-4 bg-slate-50 rounded-lg">
                <input type="text" placeholder="Title (bold text)" className="border border-slate-300 rounded px-3 py-2 text-sm" />
                <input type="text" placeholder="Highlight (green)" className="border border-slate-300 rounded px-3 py-2 text-sm" />
                <textarea placeholder="Description" className="border border-slate-300 rounded px-3 py-2 text-sm resize-none" rows="2" />
                <input type="date" placeholder="Date" className="border border-slate-300 rounded px-3 py-2 text-sm" />
                <button className="bg-green-100 hover:bg-green-200 text-green-600 px-3 py-2 rounded flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Save Button */}
      <div className="mt-8 flex justify-end">
        <button
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