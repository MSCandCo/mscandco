// Company Admin Earnings Management Page
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/components/providers/SupabaseProvider';
import Layout from '../../components/layouts/mainLayout';
import AddEarningsForm from '../../components/admin/AddEarningsForm';
import { 
  Users, 
  DollarSign, 
  Music, 
  Search,
  TrendingUp
} from 'lucide-react';

export default function EarningsManagement() {
  const { user, isLoading } = useUser();
  const [artists, setArtists] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  // Fetch artists and label admins
  useEffect(() => {
    const fetchArtistsAndLabelAdmins = async () => {
      if (!user) return;

      try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;

        if (!token) {
          console.error('No auth token available');
          setLoading(false);
          return;
        }

        const response = await fetch('/api/admin/get-artists', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const result = await response.json();

        if (result.success) {
          console.log('💰 Found artists/label admins for earnings management:', result.breakdown);
          setArtists(result.users || []);
          setSearchResults(result.users?.slice(0, 10) || []);
        } else {
          console.error('Failed to fetch artists:', result.error);
        }
      } catch (error) {
        console.error('Error loading artists:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArtistsAndLabelAdmins();
  }, [user]);

  // Search functionality
  useEffect(() => {
    const searchUsers = async () => {
      if (!searchTerm.trim()) {
        setSearchResults(artists.slice(0, 10));
        setShowDropdown(false);
        return;
      }

      setSearching(true);
      setShowDropdown(true);

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

      setSearchResults(filtered.slice(0, 50));
      setSearching(false);
    };

    const debounceTimer = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm, artists]);

  const handleDataUpdated = () => {
    console.log('💰 Earnings data updated for artist:', selectedArtist?.first_name);
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Earnings Management
              </h1>
              <p className="text-xl text-green-100 max-w-3xl mx-auto">
                Manage artist earnings data, financial metrics, platform revenue, and territory breakdowns
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
                  <Users className="w-6 h-6 text-green-600 mr-3" />
                  <h2 className="text-xl font-semibold text-gray-900">Select Artist</h2>
                </div>

                {/* Search Dropdown */}
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
                      className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                    />
                    {searching && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
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
                                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                                  <Music className="w-4 h-4 text-green-600" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="font-medium text-slate-900 truncate">
                                    {user.artist_name || 
                                     (user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : user.email)
                                    }
                                  </p>
                                  <div className="flex items-center text-xs text-slate-600 space-x-2">
                                    <span className="truncate">{user.email}</span>
                                    <span className={`px-2 py-1 rounded-full whitespace-nowrap text-xs font-medium ${
                                      user.role === 'artist' 
                                        ? 'bg-green-100 text-green-700' 
                                        : 'bg-blue-100 text-blue-700'
                                    }`}>
                                      {user.role === 'artist' ? 'Artist' : 'Label Admin'}
                                    </span>
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
                  <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                          <Music className="w-5 h-5 text-green-600" />
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
                          <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-medium ${
                            selectedArtist.role === 'artist' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {selectedArtist.role === 'artist' ? 'Artist Profile' : 'Label Admin Profile'}
                          </span>
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

                {/* Recent Users */}
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
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                              <Music className="w-4 h-4 text-green-600" />
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
                            <span className={`px-2 py-1 rounded-full text-xs ml-2 font-medium ${
                              user.role === 'artist' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-blue-100 text-blue-700'
                            }`}>
                              {user.role === 'artist' ? 'Artist' : 'Label Admin'}
                            </span>
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

            {/* Earnings Management Panel */}
            <div className="lg:col-span-2">
              {selectedArtist ? (
                <div className="space-y-6">
                  {/* Selected Artist Header */}
                  <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                          <DollarSign className="w-6 h-6 text-green-600" />
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
                          Earnings Management
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Add Earnings Form */}
                  <AddEarningsForm 
                    selectedArtistId={selectedArtist.id}
                    selectedArtistData={selectedArtist}
                    onDataUpdated={handleDataUpdated}
                  />
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-16 text-center">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <TrendingUp className="w-10 h-10 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">Select an Artist</h2>
                  <p className="text-slate-600 mb-8">
                    Choose an artist from the left panel to manage their earnings data, 
                    financial metrics, platform revenue, and territory breakdowns.
                  </p>
                  <div className="flex items-center justify-center space-x-4 text-sm text-slate-500">
                    <div className="flex items-center">
                      <DollarSign className="w-4 h-4 mr-1" />
                      Earnings Metrics
                    </div>
                    <div className="flex items-center">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      Platform Revenue
                    </div>
                    <div className="flex items-center">
                      <Music className="w-4 h-4 mr-1" />
                      Territory Data
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
