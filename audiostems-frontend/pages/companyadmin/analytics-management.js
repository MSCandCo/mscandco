// Company Admin Analytics Management Page
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/components/providers/SupabaseProvider';
import Layout from '../../components/layouts/mainLayout';
import AdminAnalyticsInterface from '../../components/analytics/AdminAnalyticsInterface';
import { 
  Users, 
  BarChart3, 
  Music, 
  Settings,
  Search,
  Plus,
  Edit3
} from 'lucide-react';

export default function AnalyticsManagement() {
  const { user, isLoading } = useUser();
  const [artists, setArtists] = useState([]);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch all artists for management
  useEffect(() => {
    const fetchArtists = async () => {
      if (!user) return;

      try {
        const { data: profiles, error } = await supabase
          .from('user_profiles')
          .select('id, first_name, last_name, email, role')
          .eq('role', 'artist')
          .order('first_name');

        if (error) {
          console.error('Error fetching artists:', error);
          return;
        }

        setArtists(profiles || []);
      } catch (error) {
        console.error('Error loading artists:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArtists();
  }, [user]);

  const handleDataUpdated = () => {
    console.log('🎯 Analytics data updated for artist:', selectedArtist?.first_name);
    // Could refresh analytics preview here
  };

  const filteredArtists = artists.filter(artist => 
    `${artist.first_name} ${artist.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    artist.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading || loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Analytics Management
              </h1>
              <p className="text-xl text-blue-100 max-w-3xl mx-auto">
                Manage artist analytics data, latest releases, milestones, and performance metrics
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Artist Selection Panel */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
                <div className="flex items-center mb-6">
                  <Users className="w-6 h-6 text-blue-600 mr-3" />
                  <h2 className="text-xl font-semibold text-gray-900">Select Artist</h2>
                </div>

                {/* Search */}
                <div className="relative mb-4">
                  <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search artists..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Artist List */}
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredArtists.map((artist) => (
                    <button
                      key={artist.id}
                      onClick={() => setSelectedArtist(artist)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        selectedArtist?.id === artist.id
                          ? 'bg-blue-100 border-2 border-blue-500'
                          : 'bg-slate-50 hover:bg-slate-100 border-2 border-transparent'
                      }`}
                    >
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <Music className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">
                            {artist.first_name} {artist.last_name}
                          </p>
                          <p className="text-sm text-slate-600">{artist.email}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                {filteredArtists.length === 0 && (
                  <div className="text-center py-8">
                    <Music className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No artists found</p>
                  </div>
                )}
              </div>
            </div>

            {/* Analytics Management Panel */}
            <div className="lg:col-span-2">
              {selectedArtist ? (
                <div className="space-y-6">
                  {/* Selected Artist Header */}
                  <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                          <Music className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-slate-900">
                            {selectedArtist.first_name} {selectedArtist.last_name}
                          </h2>
                          <p className="text-slate-600">{selectedArtist.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                          Artist
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Admin Analytics Interface */}
                  <AdminAnalyticsInterface 
                    selectedArtistId={selectedArtist.id}
                    onDataUpdated={handleDataUpdated} 
                  />
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-16 text-center">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <BarChart3 className="w-10 h-10 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">Select an Artist</h2>
                  <p className="text-slate-600 mb-8">
                    Choose an artist from the left panel to manage their analytics data, 
                    latest releases, milestones, and performance metrics.
                  </p>
                  <div className="flex items-center justify-center space-x-4 text-sm text-slate-500">
                    <div className="flex items-center">
                      <Music className="w-4 h-4 mr-1" />
                      Latest Releases
                    </div>
                    <div className="flex items-center">
                      <BarChart3 className="w-4 h-4 mr-1" />
                      Performance Metrics
                    </div>
                    <div className="flex items-center">
                      <Settings className="w-4 h-4 mr-1" />
                      Milestones
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
