import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { getUserRole, getUserBrand } from '../../lib/auth0-config';
import Layout from '../../components/layouts/mainLayout';
import { FaPlus, FaEye, FaEdit, FaMusic, FaChartLine, FaDollarSign } from 'react-icons/fa';
import { Plus, Eye, Edit, Music, TrendingUp, DollarSign } from 'lucide-react';

// Mock data for label admin artists
const mockArtists = [
  {
    id: 1,
    name: 'YHWH MSC',
    email: 'yhwh@mscandco.com',
    releases: 8,
    totalEarnings: 15420,
    totalStreams: 234567,
    followers: 12500,
    status: 'active',
    lastRelease: '2024-01-15',
    avatar: '🎤',
    genre: 'Electronic',
    location: 'London, UK',
    joinDate: '2023-01-15'
  },
  {
    id: 2,
    name: 'MC Flow',
    email: 'mcflow@mscandco.com',
    releases: 3,
    totalEarnings: 5670,
    totalStreams: 89012,
    followers: 3400,
    status: 'active',
    lastRelease: '2024-01-10',
    avatar: '🎵',
    genre: 'Hip Hop',
    location: 'Manchester, UK',
    joinDate: '2023-06-20'
  },
  {
    id: 3,
    name: 'Studio Pro',
    email: 'studiopro@mscandco.com',
    releases: 5,
    totalEarnings: 8920,
    totalStreams: 145678,
    followers: 7800,
    status: 'active',
    lastRelease: '2024-01-08',
    avatar: '🎧',
    genre: 'Electronic',
    location: 'Birmingham, UK',
    joinDate: '2023-03-10'
  },
  {
    id: 4,
    name: 'Acoustic Dreams',
    email: 'acoustic@mscandco.com',
    releases: 2,
    totalEarnings: 2340,
    totalStreams: 45678,
    followers: 2100,
    status: 'inactive',
    lastRelease: '2023-11-15',
    avatar: '🎸',
    genre: 'Acoustic',
    location: 'Liverpool, UK',
    joinDate: '2023-09-05'
  }
];

export default function LabelAdminArtists() {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [showAddArtist, setShowAddArtist] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [genreFilter, setGenreFilter] = useState('all');

  const userRole = getUserRole(user);
  const userBrand = getUserBrand(user);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated || userRole !== 'label_admin') {
    return <div className="flex items-center justify-center min-h-screen">Access Denied</div>;
  }

  // Filter artists based on search and filters
  const filteredArtists = mockArtists.filter(artist => {
    const matchesSearch = artist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         artist.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         artist.genre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || artist.status === statusFilter;
    const matchesGenre = genreFilter === 'all' || artist.genre === genreFilter;
    
    return matchesSearch && matchesStatus && matchesGenre;
  });

  // Calculate label totals
  const labelTotals = {
    totalArtists: mockArtists.length,
    activeArtists: mockArtists.filter(a => a.status === 'active').length,
    totalEarnings: mockArtists.reduce((sum, artist) => sum + artist.totalEarnings, 0),
    totalStreams: mockArtists.reduce((sum, artist) => sum + artist.totalStreams, 0),
    totalFollowers: mockArtists.reduce((sum, artist) => sum + artist.followers, 0),
    totalReleases: mockArtists.reduce((sum, artist) => sum + artist.releases, 0)
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
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Genre</label>
                <select
                  value={genreFilter}
                  onChange={(e) => setGenreFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Genres</option>
                  <option value="Electronic">Electronic</option>
                  <option value="Hip Hop">Hip Hop</option>
                  <option value="Acoustic">Acoustic</option>
                  <option value="Rock">Rock</option>
                  <option value="Pop">Pop</option>
                </select>
              </div>
              
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setGenreFilter('all');
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