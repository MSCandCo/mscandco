import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { getUserRole, getUserBrand } from '../../lib/auth0-config';
import Layout from '../../components/layouts/mainLayout';
import { FaEye, FaEdit, FaPlay, FaCheckCircle, FaFileText, FaFilter, FaSearch } from 'react-icons/fa';
import { Eye, Edit, Play, CheckCircle, FileText, Filter, Search } from 'lucide-react';

// Mock data for label admin releases
const mockReleases = [
  {
    id: 1,
    projectName: 'Summer Vibes EP',
    artist: 'YHWH MSC',
    releaseType: 'EP',
    genre: 'Electronic',
    status: 'live',
    submissionDate: '2024-01-15',
    releaseDate: '2024-02-15',
    earnings: 2340,
    streams: 45678,
    cover: '🎵'
  },
  {
    id: 2,
    projectName: 'Midnight Sessions',
    artist: 'YHWH MSC',
    releaseType: 'Album',
    genre: 'Hip Hop',
    status: 'completed',
    submissionDate: '2024-01-12',
    releaseDate: '2024-03-20',
    earnings: 0,
    streams: 0,
    cover: '🎵'
  },
  {
    id: 3,
    projectName: 'Acoustic Dreams',
    artist: 'MC Flow',
    releaseType: 'Single',
    genre: 'Acoustic',
    status: 'live',
    submissionDate: '2024-01-10',
    releaseDate: '2024-02-01',
    earnings: 890,
    streams: 12345,
    cover: '🎵'
  },
  {
    id: 4,
    projectName: 'Electronic Fusion',
    artist: 'Studio Pro',
    releaseType: 'EP',
    genre: 'Electronic',
    status: 'live',
    submissionDate: '2024-01-08',
    releaseDate: '2024-01-25',
    earnings: 1560,
    streams: 23456,
    cover: '🎵'
  },
  {
    id: 5,
    projectName: 'Urban Nights',
    artist: 'MC Flow',
    releaseType: 'Single',
    genre: 'Hip Hop',
    status: 'under_review',
    submissionDate: '2024-01-20',
    releaseDate: '2024-03-01',
    earnings: 0,
    streams: 0,
    cover: '🎵'
  },
  {
    id: 6,
    projectName: 'Digital Dreams',
    artist: 'Studio Pro',
    releaseType: 'Album',
    genre: 'Electronic',
    status: 'submitted',
    submissionDate: '2024-01-25',
    releaseDate: '2024-04-15',
    earnings: 0,
    streams: 0,
    cover: '🎵'
  }
];

export default function LabelAdminReleases() {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const [selectedRelease, setSelectedRelease] = useState(null);
  const [showReleaseDetails, setShowReleaseDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [genreFilter, setGenreFilter] = useState('all');
  const [artistFilter, setArtistFilter] = useState('all');

  const userRole = getUserRole(user);
  const userBrand = getUserBrand(user);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated || userRole !== 'label_admin') {
    return <div className="flex items-center justify-center min-h-screen">Access Denied</div>;
  }

  // Filter releases based on search and filters
  const filteredReleases = mockReleases.filter(release => {
    const matchesSearch = release.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         release.artist.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || release.status === statusFilter;
    const matchesGenre = genreFilter === 'all' || release.genre === genreFilter;
    const matchesArtist = artistFilter === 'all' || release.artist === artistFilter;
    
    return matchesSearch && matchesStatus && matchesGenre && matchesArtist;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'under_review': return 'bg-amber-100 text-amber-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'live': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'submitted': return <FileText className="w-4 h-4" />;
      case 'under_review': return <Eye className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'live': return <Play className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  // Calculate label totals
  const labelTotals = {
    totalReleases: mockReleases.length,
    totalEarnings: mockReleases.reduce((sum, release) => sum + release.earnings, 0),
    totalStreams: mockReleases.reduce((sum, release) => sum + release.streams, 0),
    liveReleases: mockReleases.filter(r => r.status === 'live').length,
    pendingReleases: mockReleases.filter(r => r.status === 'submitted' || r.status === 'under_review').length
  };

  // Get unique artists for filter
  const uniqueArtists = [...new Set(mockReleases.map(release => release.artist))];

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">All Releases</h1>
                <p className="text-sm text-gray-500">Manage all releases across your label</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Releases</p>
                  <p className="text-2xl font-bold text-gray-900">{labelTotals.totalReleases}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Live Releases</p>
                  <p className="text-2xl font-bold text-gray-900">{labelTotals.liveReleases}</p>
                </div>
                <Play className="w-8 h-8 text-purple-600" />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Releases</p>
                  <p className="text-2xl font-bold text-gray-900">{labelTotals.pendingReleases}</p>
                </div>
                <Eye className="w-8 h-8 text-amber-600" />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                  <p className="text-2xl font-bold text-gray-900">£{labelTotals.totalEarnings.toLocaleString()}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Streams</p>
                  <p className="text-2xl font-bold text-gray-900">{labelTotals.totalStreams.toLocaleString()}</p>
                </div>
                <Play className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search releases..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="submitted">Submitted</option>
                  <option value="under_review">Under Review</option>
                  <option value="completed">Completed</option>
                  <option value="live">Live</option>
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
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Artist</label>
                <select
                  value={artistFilter}
                  onChange={(e) => setArtistFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Artists</option>
                  {uniqueArtists.map(artist => (
                    <option key={artist} value={artist}>{artist}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setGenreFilter('all');
                    setArtistFilter('all');
                  }}
                  className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          {/* Releases Table */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">All Releases ({filteredReleases.length})</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Release</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Artist</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Earnings</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Streams</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Release Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredReleases.map((release) => (
                    <tr key={release.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-lg mr-3">
                            {release.cover}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{release.projectName}</div>
                            <div className="text-sm text-gray-500">{release.releaseType} • {release.genre}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{release.artist}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(release.status)}`}>
                          {getStatusIcon(release.status)}
                          <span className="ml-1">{release.status.replace('_', ' ')}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">£{release.earnings.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{release.streams.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{release.releaseDate}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setSelectedRelease(release);
                              setShowReleaseDetails(true);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            className="text-gray-600 hover:text-gray-900"
                            title="Edit Release"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 