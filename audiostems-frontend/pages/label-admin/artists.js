import { useState, useEffect, useMemo } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { getUserRole, getUserBrand } from '../../lib/auth0-config';
import Layout from '../../components/layouts/mainLayout';
import { FaPlus, FaEye, FaEdit, FaMusic, FaChartLine, FaDollarSign } from 'react-icons/fa';
import { Plus, Eye, Edit, Music, TrendingUp, DollarSign } from 'lucide-react';
import { ARTISTS, RELEASES } from '../../lib/mockData';

export default function LabelAdminArtists() {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [showAddArtist, setShowAddArtist] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [artistFilter, setArtistFilter] = useState('all');

  const userRole = getUserRole(user);
  const userBrand = getUserBrand(user);

  // Get label artists from centralized data
  const labelArtists = useMemo(() => {
    const labelName = userBrand?.displayName || 'MSC & Co';
    
    console.log('=== Label Admin Artists Debug ===');
    console.log('userBrand:', userBrand);
    console.log('labelName:', labelName);
    console.log('Total ARTISTS in database:', ARTISTS.length);
    
    const filteredArtists = ARTISTS.filter(artist => 
      artist.status === 'active' && 
      (artist.label === labelName || artist.brand === labelName)
    );
    
    console.log('Filtered artists for label:', filteredArtists.length);
    console.log('Artists details:');
    filteredArtists.forEach(artist => {
      console.log(`- ${artist.name}: label="${artist.label}", brand="${artist.brand}", status="${artist.status}"`);
    });
    
    return filteredArtists.map(artist => {
      // Calculate artist releases and earnings
      const artistReleases = RELEASES.filter(release => release.artistId === artist.id);
      const totalEarnings = artistReleases.reduce((sum, release) => sum + (release.earnings || 0), 0);
      const totalStreams = artistReleases.reduce((sum, release) => sum + (release.streams || 0), 0);
      
      return {
        ...artist,
        releases: artistReleases.length,
        totalEarnings,
        totalStreams,
        followers: artist.followers || 0,
        lastRelease: artistReleases.length > 0 ? 
          artistReleases.sort((a, b) => new Date(b.submissionDate) - new Date(a.submissionDate))[0].submissionDate : 
          null,
        avatar: artist.avatar || '🎤'
      };
    });
  }, [userBrand]);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated || userRole !== 'label_admin') {
    return <div className="flex items-center justify-center min-h-screen">Access Denied</div>;
  }

  // Filter artists based on search and filters
  const filteredArtists = labelArtists.filter(artist => {
    const matchesSearch = artist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         artist.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         artist.genre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || artist.status === statusFilter;
    const matchesArtist = artistFilter === 'all' || artist.name === artistFilter;
    
    return matchesSearch && matchesStatus && matchesArtist;
  });

  // Calculate label totals
  const labelTotals = {
    totalArtists: labelArtists.length,
    activeArtists: labelArtists.filter(a => a.status === 'active').length,
    totalEarnings: labelArtists.reduce((sum, artist) => sum + artist.totalEarnings, 0),
    totalStreams: labelArtists.reduce((sum, artist) => sum + artist.totalStreams, 0),
    totalFollowers: labelArtists.reduce((sum, artist) => sum + artist.followers, 0),
    totalReleases: labelArtists.reduce((sum, artist) => sum + artist.releases, 0)
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Artists</h1>
                <p className="text-sm text-gray-500">Manage your label's artists and their releases</p>
              </div>
              <button
                onClick={() => setShowAddArtist(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Artist
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Artists</p>
                  <p className="text-2xl font-bold text-gray-900">{labelTotals.totalArtists}</p>
                </div>
                <Music className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Artists</p>
                  <p className="text-2xl font-bold text-gray-900">{labelTotals.activeArtists}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                  <p className="text-2xl font-bold text-gray-900">£{labelTotals.totalEarnings.toLocaleString()}</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Streams</p>
                  <p className="text-2xl font-bold text-gray-900">{labelTotals.totalStreams.toLocaleString()}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Followers</p>
                  <p className="text-2xl font-bold text-gray-900">{labelTotals.totalFollowers.toLocaleString()}</p>
                </div>
                <Music className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <input
                  type="text"
                  placeholder="Search artists..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Artist</label>
                <select
                  value={artistFilter}
                  onChange={(e) => setArtistFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Artists</option>
                  {labelArtists.map(artist => (
                    <option key={artist.id} value={artist.name}>{artist.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setArtistFilter('all');
                  }}
                  className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          {/* Artists Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArtists.map((artist) => (
              <div key={artist.id} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-2xl">
                      {artist.avatar}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{artist.name}</h3>
                      <p className="text-sm text-gray-500">{artist.email}</p>
                    </div>
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    artist.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {artist.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Releases</p>
                    <p className="text-lg font-semibold text-gray-900">{artist.releases}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Earnings</p>
                    <p className="text-lg font-semibold text-gray-900">£{artist.totalEarnings.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Streams</p>
                    <p className="text-lg font-semibold text-gray-900">{artist.totalStreams.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Followers</p>
                    <p className="text-lg font-semibold text-gray-900">{artist.followers.toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Genre:</span>
                    <span className="font-medium">{artist.genre}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Location:</span>
                    <span className="font-medium">{artist.location}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Last Release:</span>
                    <span className="font-medium">{artist.lastRelease}</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-500">Joined: {artist.joinDate}</p>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setSelectedArtist(artist)}
                      className="text-blue-600 hover:text-blue-900"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button 
                      className="text-gray-600 hover:text-gray-900"
                      title="Edit Artist"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
} 