import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { getUserRole, getUserBrand } from '../../lib/auth0-config';
import Layout from '../../components/layouts/mainLayout';
import { FaUsers, FaMusic, FaChartLine, FaDollarSign, FaCalendar, FaEye, FaEdit, FaPlus } from 'react-icons/fa';
import { Users, Music, TrendingUp, DollarSign, Calendar, Eye, Edit, Plus } from 'lucide-react';

// Mock data for label admin
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
    avatar: '🎤'
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
    avatar: '🎵'
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
    avatar: '🎧'
  }
];

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
    streams: 45678
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
    streams: 0
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
    streams: 12345
  }
];

export default function LabelAdminDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [showAddArtist, setShowAddArtist] = useState(false);

  const userRole = getUserRole(user);
  const userBrand = getUserBrand(user);

  // Calculate label totals
  const labelTotals = {
    totalEarnings: mockArtists.reduce((sum, artist) => sum + artist.totalEarnings, 0),
    totalStreams: mockArtists.reduce((sum, artist) => sum + artist.totalStreams, 0),
    totalFollowers: mockArtists.reduce((sum, artist) => sum + artist.followers, 0),
    totalReleases: mockArtists.reduce((sum, artist) => sum + artist.releases, 0)
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated || userRole !== 'label_admin') {
    return <div className="flex items-center justify-center min-h-screen">Access Denied</div>;
  }

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Label Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
            <TrendingUp className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Followers</p>
              <p className="text-2xl font-bold text-gray-900">{labelTotals.totalFollowers.toLocaleString()}</p>
            </div>
            <Users className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Releases</p>
              <p className="text-2xl font-bold text-gray-900">{labelTotals.totalReleases}</p>
            </div>
            <Music className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Recent Releases */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Releases</h3>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {mockReleases.map((release) => (
                <tr key={release.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{release.projectName}</div>
                      <div className="text-sm text-gray-500">{release.releaseType} • {release.genre}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{release.artist}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      release.status === 'live' ? 'bg-green-100 text-green-800' :
                      release.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {release.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">£{release.earnings.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{release.streams.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-3">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="text-gray-600 hover:text-gray-900">
                      <Edit className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderMyArtists = () => (
    <div className="space-y-6">
      {/* Add Artist Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">My Artists</h2>
        <button
          onClick={() => setShowAddArtist(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Artist
        </button>
      </div>

      {/* Artists Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockArtists.map((artist) => (
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
            
            <div className="flex justify-between items-center">
              <p className="text-xs text-gray-500">Last release: {artist.lastRelease}</p>
              <div className="flex gap-2">
                <button className="text-blue-600 hover:text-blue-900">
                  <Eye className="w-4 h-4" />
                </button>
                <button className="text-gray-600 hover:text-gray-900">
                  <Edit className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Label Admin Dashboard</h1>
                <p className="text-sm text-gray-500">Manage your artists and releases</p>
              </div>
              <div className="text-sm text-gray-500">
                {userBrand?.displayName || 'Label Admin'}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('artists')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'artists'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                My Artists
              </button>
              <button
                onClick={() => setActiveTab('releases')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'releases'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                All Releases
              </button>
              <button
                onClick={() => setActiveTab('earnings')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'earnings'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Earnings
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'artists' && renderMyArtists()}
          {activeTab === 'releases' && <div>All Releases Content</div>}
          {activeTab === 'earnings' && <div>Earnings Content</div>}
        </div>
      </div>
    </Layout>
  );
} 