import { useAuth0 } from '@auth0/auth0-react';
import { useState, useEffect } from 'react';
import { getUserRole, getUserBrand } from '../../lib/auth0-config';
import Layout from '../../components/layouts/mainLayout';
import { FaPlus, FaFilter, FaSearch, FaCalendar, FaChartBar, FaList } from 'react-icons/fa';
import CreateReleaseModal from '../../components/releases/CreateReleaseModal';

export default function ArtistReleases() {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const [releases, setReleases] = useState([]);
  const [profileData, setProfileData] = useState(null);
  const [activeTab, setActiveTab] = useState('all-projects');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [genreFilter, setGenreFilter] = useState('all');
  const [releaseTypeFilter, setReleaseTypeFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Mock data for releases
  const mockReleases = [
    {
      id: 1,
      projectName: 'Summer Vibes EP',
      artist: 'YHWH MSC',
      releaseType: 'EP',
      genre: 'Electronic',
      status: 'submitted',
      submissionDate: '2024-01-15',
      expectedReleaseDate: '2024-02-15',
      assets: 4,
      earnings: 2340,
      streams: 45678,
      lastUpdated: '2024-01-15',
      cover: '🎵',
      feedback: 'Great production quality',
      marketingPlan: 'Social media campaign + playlist pitching',
      trackListing: [
        { title: 'Summer Vibes', duration: '3:45', isrc: 'USRC12345678' },
        { title: 'Ocean Waves', duration: '4:12', isrc: 'USRC12345679' },
        { title: 'Sunset Dreams', duration: '3:58', isrc: 'USRC12345680' },
        { title: 'Beach Party', duration: '4:30', isrc: 'USRC12345681' }
      ],
      credits: [
        { role: 'Producer', name: 'YHWH MSC' },
        { role: 'Mix Engineer', name: 'Studio Pro' },
        { role: 'Mastering', name: 'Master Lab' }
      ],
      publishingNotes: 'All tracks written and produced by YHWH MSC'
    },
    {
      id: 2,
      projectName: 'Midnight Sessions',
      artist: 'YHWH MSC',
      releaseType: 'Album',
      genre: 'Hip Hop',
      status: 'under_review',
      submissionDate: '2024-01-12',
      expectedReleaseDate: '2024-03-20',
      assets: 6,
      earnings: 0,
      streams: 0,
      lastUpdated: '2024-01-12',
      cover: '🎵',
      feedback: 'Under review by distribution team',
      marketingPlan: 'TBD',
      trackListing: [
        { title: 'Midnight Intro', duration: '2:15', isrc: 'USRC12345682' },
        { title: 'Street Lights', duration: '3:30', isrc: 'USRC12345683' },
        { title: 'Urban Nights', duration: '4:05', isrc: 'USRC12345684' }
      ],
      credits: [
        { role: 'Producer', name: 'YHWH MSC' },
        { role: 'Featured Artist', name: 'MC Flow' }
      ],
      publishingNotes: 'Collaborative project with MC Flow'
    },
    {
      id: 3,
      projectName: 'Acoustic Collection',
      artist: 'YHWH MSC',
      releaseType: 'Single',
      genre: 'Acoustic',
      status: 'completed',
      submissionDate: '2024-01-05',
      expectedReleaseDate: '2024-01-20',
      assets: 1,
      earnings: 5670,
      streams: 89012,
      lastUpdated: '2024-01-05',
      cover: '🎵',
      feedback: 'Distribution confirmed - live on all platforms',
      marketingPlan: 'Radio promotion + acoustic playlist features',
      trackListing: [
        { title: 'Acoustic Dreams', duration: '4:15', isrc: 'USRC12345685' }
      ],
      credits: [
        { role: 'Artist', name: 'YHWH MSC' },
        { role: 'Guitar', name: 'YHWH MSC' },
        { role: 'Vocals', name: 'YHWH MSC' }
      ],
      publishingNotes: 'Solo acoustic performance'
    },
    {
      id: 4,
      projectName: 'Live at the Studio',
      artist: 'YHWH MSC',
      releaseType: 'Live Album',
      genre: 'Jazz',
      status: 'live',
      submissionDate: '2024-01-08',
      expectedReleaseDate: '2024-01-25',
      assets: 8,
      earnings: 8900,
      streams: 123456,
      lastUpdated: '2024-01-08',
      cover: '🎵',
      feedback: 'Live recording approved and distributed',
      marketingPlan: 'Jazz festival promotion + live music platforms',
      trackListing: [
        { title: 'Studio Jam', duration: '5:30', isrc: 'USRC12345686' },
        { title: 'Improvisation', duration: '7:15', isrc: 'USRC12345687' },
        { title: 'Jazz Standards', duration: '4:45', isrc: 'USRC12345688' }
      ],
      credits: [
        { role: 'Band Leader', name: 'YHWH MSC' },
        { role: 'Piano', name: 'YHWH MSC' },
        { role: 'Saxophone', name: 'Jazz Master' }
      ],
      publishingNotes: 'Live recording from studio session'
    }
  ];

  // Load profile data and releases
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load profile data (pre-fill release info)
        const profileResponse = await fetch('/api/artist/get-profile');
        if (profileResponse.ok) {
          const profile = await profileResponse.json();
          setProfileData(profile);
        }
        
        // Load releases data
        setReleases(mockReleases);
        setIsLoadingData(false);
      } catch (error) {
        console.error('Error loading data:', error);
        setReleases(mockReleases);
        setIsLoadingData(false);
      }
    };

    if (isAuthenticated && !isLoading) {
      loadData();
    }
  }, [isAuthenticated, isLoading]);

  if (isLoading || isLoadingData) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <div className="flex items-center justify-center min-h-screen">Please log in to view your releases.</div>;
  }

  const userRole = getUserRole(user);
  const userBrand = getUserBrand(user);

  // Only allow artists to access this page
  if (userRole !== 'artist') {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
            <p className="text-gray-600">This page is only available for artists.</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Filter releases based on current filters
  const filteredReleases = releases.filter(release => {
    const matchesStatus = statusFilter === 'all' || release.status === statusFilter;
    const matchesSearch = release.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         release.artist.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGenre = genreFilter === 'all' || release.genre === genreFilter;
    const matchesReleaseType = releaseTypeFilter === 'all' || release.releaseType === releaseTypeFilter;
    
    return matchesStatus && matchesSearch && matchesGenre && matchesReleaseType;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'under_review': return 'bg-orange-100 text-orange-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'live': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'submitted': return '📤';
      case 'under_review': return '🔍';
      case 'draft': return '📝';
      case 'completed': return '✅';
      case 'live': return '🎵';
      default: return '⚪';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'submitted': return 'Submitted';
      case 'under_review': return 'Under Review';
      case 'draft': return 'Draft';
      case 'completed': return 'Completed';
      case 'live': return 'Live';
      default: return 'Unknown';
    }
  };

  const getReleaseTypeColor = (type) => {
    switch (type) {
      case 'Single': return 'bg-red-100 text-red-800';
      case 'EP': return 'bg-blue-100 text-blue-800';
      case 'Album': return 'bg-green-100 text-green-800';
      case 'Mixtape': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getGenreColor = (genre) => {
    const colors = {
      'Electronic': 'bg-purple-100 text-purple-800',
      'Hip Hop': 'bg-orange-100 text-orange-800',
      'Acoustic': 'bg-green-100 text-green-800',
      'Pop': 'bg-pink-100 text-pink-800',
      'Rock': 'bg-red-100 text-red-800',
      'Jazz': 'bg-blue-100 text-blue-800'
    };
    return colors[genre] || 'bg-gray-100 text-gray-800';
  };

  const stats = {
    totalReleases: releases.length,
    totalAssets: releases.reduce((sum, release) => sum + release.assets, 0),
    totalEarnings: releases.reduce((sum, release) => sum + release.earnings, 0),
    totalStreams: releases.reduce((sum, release) => sum + release.streams, 0),
    submitted: releases.filter(r => r.status === 'submitted').length,
    under_review: releases.filter(r => r.status === 'under_review').length,
    draft: releases.filter(r => r.status === 'draft').length,
    completed: releases.filter(r => r.status === 'completed').length,
    live: releases.filter(r => r.status === 'live').length
  };

  const renderAllProjects = () => (
    <div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-2xl">📁</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Releases</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalReleases}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-2xl">🎵</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Assets</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalAssets}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <span className="text-2xl">💰</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Earnings</p>
              <p className="text-2xl font-bold text-gray-900">${stats.totalEarnings.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <span className="text-2xl">📈</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Streams</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalStreams.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'all', label: 'All Releases', count: stats.totalReleases },
              { id: 'submitted', label: 'Submitted', count: stats.submitted },
              { id: 'draft', label: 'Draft', count: stats.draft },
              { id: 'completed', label: 'Completed', count: stats.completed },
              { id: 'live', label: 'Live', count: stats.live }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  statusFilter === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium"
          >
            <FaFilter className="mr-2" />
            Filters
          </button>
          
          <div className="flex-1 max-w-md">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search releases..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Genre</label>
                <select
                  value={genreFilter}
                  onChange={(e) => setGenreFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Genres</option>
                  <option value="Electronic">Electronic</option>
                  <option value="Hip Hop">Hip Hop</option>
                  <option value="Acoustic">Acoustic</option>
                  <option value="Pop">Pop</option>
                  <option value="Rock">Rock</option>
                  <option value="Jazz">Jazz</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Release Type</label>
                <select
                  value={releaseTypeFilter}
                  onChange={(e) => setReleaseTypeFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="Single">Single</option>
                  <option value="EP">EP</option>
                  <option value="Album">Album</option>
                  <option value="Mixtape">Mixtape</option>
                </select>
              </div>
              
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setGenreFilter('all');
                    setReleaseTypeFilter('all');
                    setStatusFilter('all');
                  }}
                  className="w-full px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-medium"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

              {/* Create New Release Button */}
        <div className="mb-6">
          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg flex items-center"
          >
            <FaPlus className="mr-2" />
            Create New Release
          </button>
        </div>

      {/* Releases Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReleases.map((release) => (
          <div key={release.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="text-3xl mr-3">{release.cover}</div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{release.projectName}</h3>
                    <div className="flex flex-wrap gap-1 mt-1">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(release.status)}`}>
                        {getStatusIcon(release.status)} {getStatusLabel(release.status)}
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getReleaseTypeColor(release.releaseType)}`}>
                        {release.releaseType}
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getGenreColor(release.genre)}`}>
                        {release.genre}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Artist:</span>
                  <span className="font-medium">{release.artist}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Assets:</span>
                  <span className="font-medium">{release.assets}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Earnings:</span>
                  <span className="font-medium text-green-600">${release.earnings.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Streams:</span>
                  <span className="font-medium">{release.streams.toLocaleString()}</span>
                </div>
                {release.expectedReleaseDate && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Release Date:</span>
                    <span className="font-medium">{new Date(release.expectedReleaseDate).toLocaleDateString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Updated:</span>
                  <span className="font-medium">{new Date(release.lastUpdated).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="mt-6 flex space-x-2">
                <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-3 rounded">
                  Edit
                </button>
                <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-2 px-3 rounded">
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredReleases.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎵</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No releases found</h3>
          <p className="text-gray-600">Create your first music release to get started!</p>
        </div>
      )}
    </div>
  );

  const renderStatusBoard = () => (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Release Status Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { status: 'submitted', label: 'Submitted', count: stats.submitted, color: 'bg-blue-500' },
            { status: 'draft', label: 'Draft', count: stats.draft, color: 'bg-yellow-500' },
            { status: 'completed', label: 'Completed', count: stats.completed, color: 'bg-green-500' },
            { status: 'live', label: 'Live', count: stats.live, color: 'bg-purple-500' }
          ].map((item) => (
            <div key={item.status} className="bg-white rounded-lg shadow p-4 text-center">
              <div className={`w-12 h-12 ${item.color} rounded-full mx-auto mb-2 flex items-center justify-center text-white text-xl`}>
                {getStatusIcon(item.status)}
              </div>
              <h3 className="font-semibold text-gray-900">{item.label}</h3>
              <p className="text-2xl font-bold text-gray-900">{item.count}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReleases.map((release) => (
          <div key={release.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-3xl">{release.cover}</div>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(release.status)}`}>
                  {getStatusIcon(release.status)} {getStatusLabel(release.status)}
                </span>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{release.projectName}</h3>
              <p className="text-gray-600 mb-3">{release.artist}</p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getReleaseTypeColor(release.releaseType)}`}>
                  {release.releaseType}
                </span>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getGenreColor(release.genre)}`}>
                  {release.genre}
                </span>
              </div>
              
              <div className="text-sm text-gray-600">
                <p>Assets: {release.assets}</p>
                <p>Expected: {release.expectedReleaseDate ? new Date(release.expectedReleaseDate).toLocaleDateString() : 'TBD'}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderReleaseCalendar = () => (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Release Calendar</h2>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-7 gap-1 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>
          
          {/* Simplified calendar view - in production this would be a proper calendar component */}
          <div className="text-center py-8">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Calendar View</h3>
            <p className="text-gray-600">Interactive calendar showing upcoming releases</p>
            <p className="text-sm text-gray-500 mt-2">
              {filteredReleases.filter(r => r.expectedReleaseDate).length} releases scheduled
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Upcoming Releases</h3>
        {filteredReleases
          .filter(release => release.expectedReleaseDate && new Date(release.expectedReleaseDate) > new Date())
          .sort((a, b) => new Date(a.expectedReleaseDate) - new Date(b.expectedReleaseDate))
          .map((release) => (
            <div key={release.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-gray-900">{release.projectName}</h4>
                  <p className="text-sm text-gray-600">{release.artist} • {release.releaseType}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">
                    {new Date(release.expectedReleaseDate).toLocaleDateString()}
                  </p>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(release.status)}`}>
                    {getStatusIcon(release.status)} {getStatusLabel(release.status)}
                  </span>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Releases</h1>
          <p className="text-gray-600">Manage your music releases and track their performance</p>
        </div>

        {/* Main Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'all-projects', label: 'All Releases', icon: FaList },
                { id: 'status-board', label: 'Status Board', icon: FaChartBar },
                { id: 'release-calendar', label: 'Release Calendar', icon: FaCalendar }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="mr-2" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'all-projects' && renderAllProjects()}
        {activeTab === 'status-board' && renderStatusBoard()}
        {activeTab === 'release-calendar' && renderReleaseCalendar()}
      </div>

      {/* Create Release Modal */}
      <CreateReleaseModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        profileData={profileData}
      />
    </Layout>
  );
} 