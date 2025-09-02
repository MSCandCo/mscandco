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
  const [searchResults, setSearchResults] = useState([]);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  // Fetch all users (artists and label admins) for management
  useEffect(() => {
    const fetchAllUsers = async () => {
      if (!user) return;

      try {
        // Fetch ALL user profiles (artists and label admins)
        const { data: profiles, error } = await supabase
          .from('user_profiles')
          .select('id, first_name, last_name, email, artist_name')
          .order('first_name');

        if (error) {
          console.error('Error fetching users:', error);
          return;
        }

        console.log('📊 Found user profiles:', profiles?.length || 0);
        setArtists(profiles || []);
        setSearchResults(profiles || []); // Initialize search results with all users
      } catch (error) {
        console.error('Error loading users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllUsers();
  }, [user]);

  // Search functionality with debounce
  useEffect(() => {
    const searchUsers = async () => {
      if (!searchTerm.trim()) {
        setSearchResults(artists.slice(0, 10)); // Show first 10 when no search
        setShowDropdown(false);
        return;
      }

      setSearching(true);
      setShowDropdown(true);

      // Client-side search across first_name, last_name, artist_name, and email
      const filtered = artists.filter(user => {
        const searchLower = searchTerm.toLowerCase();
        const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim().toLowerCase();
        const artistName = (user.artist_name || '').toLowerCase();
        const email = (user.email || '').toLowerCase();

        return (
          fullName.includes(searchLower) ||
          artistName.includes(searchLower) ||
          email.includes(searchLower) ||
          (user.first_name || '').toLowerCase().includes(searchLower) ||
          (user.last_name || '').toLowerCase().includes(searchLower)
        );
      });

      // Limit results to 50 for performance
      setSearchResults(filtered.slice(0, 50));
      setSearching(false);
    };

    const debounceTimer = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm, artists]);

  const handleDataUpdated = () => {
    console.log('🎯 Analytics data updated for artist:', selectedArtist?.first_name);
    // Could refresh analytics preview here
  };

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.relative')) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

                {/* Professional Search Dropdown */}
                <div className="relative">
                  <div className="relative">
                    <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2 z-10" />
                    <input
                      type="text"
                      placeholder="Search by name, artist name, or email..."
                      value={selectedArtist ? 
                        `${selectedArtist.artist_name || `${selectedArtist.first_name || ''} ${selectedArtist.last_name || ''}`.trim() || selectedArtist.email}` 
                        : searchTerm
                      }
                      onChange={(e) => {
                        const value = e.target.value;
                        setSearchTerm(value);
                        if (selectedArtist) {
                          setSelectedArtist(null);
                        }
                      }}
                      onFocus={() => {
                        if (!selectedArtist && searchTerm.trim()) {
                          setShowDropdown(true);
                        }
                      }}
                      className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    />
                    {searching && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      </div>
                    )}
                  </div>
                  
                  {/* Dropdown Results */}
                  {showDropdown && searchTerm && !selectedArtist && (
                    <div className="absolute top-full left-0 right-0 bg-white border border-slate-300 rounded-lg shadow-lg mt-1 z-50 max-h-80 overflow-y-auto">
                      {searchResults.length > 0 ? (
                        <>
                          <div className="px-3 py-2 text-xs text-slate-500 bg-slate-50 border-b">
                            {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
                          </div>
                          {searchResults.map((user) => (
                            <button
                              key={user.id}
                              onClick={() => {
                                setSelectedArtist(user);
                                setSearchTerm('');
                                setShowDropdown(false);
                              }}
                              className="w-full text-left p-3 hover:bg-slate-50 border-b border-slate-100 last:border-b-0 transition-colors"
                            >
                              <div className="flex items-center">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                                  <Music className="w-4 h-4 text-blue-600" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="font-medium text-slate-900 truncate">
                                    {user.artist_name || 
                                     (user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : user.email)
                                    }
                                  </p>
                                  <div className="flex items-center text-xs text-slate-600 space-x-2">
                                    <span className="truncate">{user.email}</span>
                                    {user.artist_name && (
                                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full whitespace-nowrap">
                                        Artist
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </button>
                          ))}
                        </>
                      ) : (
                        <div className="p-4 text-center text-slate-500">
                          <Music className="w-6 h-6 mx-auto mb-2 text-slate-400" />
                          <p className="text-sm">No users found</p>
                          <p className="text-xs mt-1">Try searching by name, artist name, or email</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Selected User Display */}
                {selectedArtist && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <Music className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">
                            {selectedArtist.artist_name || 
                             (selectedArtist.first_name && selectedArtist.last_name 
                               ? `${selectedArtist.first_name} ${selectedArtist.last_name}` 
                               : selectedArtist.email)
                            }
                          </p>
                          <p className="text-sm text-slate-600">{selectedArtist.email}</p>
                          {selectedArtist.artist_name && (
                            <span className="inline-block mt-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                              Artist Profile
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedArtist(null);
                          setSearchTerm('');
                          setShowDropdown(false);
                        }}
                        className="text-slate-400 hover:text-slate-600 p-1 text-xl"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                )}

                {/* Recent Users (when no search) */}
                {!searchTerm && !selectedArtist && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-slate-700 mb-3">Recent Users ({Math.min(artists.length, 10)})</h4>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {artists.slice(0, 10).map((user) => (
                        <button
                          key={user.id}
                          onClick={() => setSelectedArtist(user)}
                          className="w-full text-left p-3 rounded-lg transition-colors bg-slate-50 hover:bg-slate-100 border border-transparent hover:border-slate-200"
                        >
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                              <Music className="w-4 h-4 text-blue-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-slate-900 truncate">
                                {user.artist_name || 
                                 (user.first_name && user.last_name 
                                   ? `${user.first_name} ${user.last_name}` 
                                   : user.email)
                                }
                              </p>
                              <p className="text-xs text-slate-600 truncate">{user.email}</p>
                            </div>
                            {user.artist_name && (
                              <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs ml-2">
                                Artist
                              </span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                    {artists.length > 10 && (
                      <p className="text-xs text-slate-500 mt-2 text-center">
                        Type to search {artists.length - 10} more users...
                      </p>
                    )}
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
