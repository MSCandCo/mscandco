import { useState, useEffect, useMemo } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { getUserRole, getUserBrand } from '../../lib/auth0-config';
import Layout from '../../components/layouts/mainLayout';
import { FaPlus, FaFilter, FaSearch, FaCalendar, FaChartBar, FaList, FaEye, FaEdit, FaPlay, FaCheckCircle, FaFileText, FaSend } from 'react-icons/fa';
import { Send, Eye, FileText, CheckCircle, Play } from 'lucide-react';
import CreateReleaseModal from '../../components/releases/CreateReleaseModal';
import ViewReleaseDetailsModal from '../../components/releases/ViewReleaseDetailsModal';

/*
 * Distribution Partner Workflow:
 * 1. Artist creates release → Auto-saves to DRAFT
 * 2. Artist completes all fields → Can SUBMIT
 * 3. Distribution Partner reviews → Moves to UNDER REVIEW
 * 4. Distribution Partner approves → Moves to COMPLETED and sends to DSPs
 * 5. Release goes live on DSPs → Moves to LIVE
 * 
 * Edit functionality: Only available for DRAFT and SUBMITTED releases
 * Distribution Partner controls: UNDER REVIEW, COMPLETED, and LIVE statuses
 */

// Mock data for releases - moved outside component to prevent re-creation
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
    lastUpdated: '2024-01-15',
    cover: '🎵',
    feedback: 'Under review by distribution team - awaiting approval',
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
    status: 'draft',
    submissionDate: '2024-01-10',
    expectedReleaseDate: '2024-02-01',
    assets: 1,
    earnings: 0,
    streams: 0,
    lastUpdated: '2024-01-10',
    cover: '🎵',
    feedback: '',
    marketingPlan: '',
    trackListing: [
      { title: 'Acoustic Dreams', duration: '4:20', isrc: 'USRC12345685' }
    ],
    credits: [
      { role: 'Producer', name: 'YHWH MSC' }
    ],
    publishingNotes: 'Solo acoustic performance'
  },
  {
    id: 4,
    projectName: 'Urban Beats Collection',
    artist: 'YHWH MSC',
    releaseType: 'EP',
    genre: 'Hip Hop',
    status: 'draft',
    submissionDate: '2024-01-08',
    expectedReleaseDate: '2024-02-20',
    assets: 3,
    earnings: 0,
    streams: 0,
    lastUpdated: '2024-01-08',
    cover: '🎵',
    feedback: '',
    marketingPlan: '',
    trackListing: [
      { title: 'Urban Beat', duration: '3:30', isrc: 'USRC12345686' },
      { title: 'Street Rhythm', duration: '4:15', isrc: 'USRC12345687' },
      { title: 'City Lights', duration: '3:45', isrc: 'USRC12345688' }
    ],
    credits: [
      { role: 'Producer', name: 'YHWH MSC' }
    ],
    publishingNotes: 'Urban hip hop collection'
  },
  {
    id: 5,
    projectName: 'Completed Album',
    artist: 'YHWH MSC',
    releaseType: 'Album',
    genre: 'Electronic',
    status: 'completed',
    submissionDate: '2024-01-05',
    expectedReleaseDate: '2024-01-15',
    assets: 8,
    earnings: 5670,
    streams: 89012,
    lastUpdated: '2024-01-15',
    cover: '🎵',
    feedback: 'Successfully completed and distributed',
    marketingPlan: 'Completed marketing campaign',
    trackListing: [
      { title: 'Completed Track 1', duration: '4:20', isrc: 'USRC12345689' },
      { title: 'Completed Track 2', duration: '3:55', isrc: 'USRC12345690' },
      { title: 'Completed Track 3', duration: '4:10', isrc: 'USRC12345691' }
    ],
    credits: [
      { role: 'Producer', name: 'YHWH MSC' },
      { role: 'Mix Engineer', name: 'Studio Pro' }
    ],
    publishingNotes: 'Successfully completed album'
  },
  {
    id: 6,
    projectName: 'Live Single',
    artist: 'YHWH MSC',
    releaseType: 'Single',
    genre: 'Pop',
    status: 'live',
    submissionDate: '2024-01-03',
    expectedReleaseDate: '2024-01-10',
    assets: 1,
    earnings: 1234,
    streams: 15678,
    lastUpdated: '2024-01-10',
    cover: '🎵',
    feedback: 'Live on all platforms',
    marketingPlan: 'Active marketing campaign',
    trackListing: [
      { title: 'Live Single Track', duration: '3:45', isrc: 'USRC12345692' }
    ],
    credits: [
      { role: 'Producer', name: 'YHWH MSC' },
      { role: 'Mastering Engineer', name: 'Master Lab' }
    ],
    publishingNotes: 'Live single performing well'
  },
  {
    id: 7,
    projectName: 'City Nights',
    artist: 'YHWH MSC',
    releaseType: 'EP',
    genre: 'Hip Hop',
    status: 'completed',
    submissionDate: '2023-11-20',
    expectedReleaseDate: '2024-01-10',
    actualReleaseDate: '2024-01-10',
    assets: 3,
    earnings: 890,
    streams: 15678,
    lastUpdated: '2024-01-10',
    cover: '🎵',
    feedback: 'Distributed successfully - performing well on urban playlists',
    marketingPlan: 'Urban radio promotion + influencer partnerships',
    trackListing: [
      { title: 'City Nights', duration: '4:12', isrc: 'USRC12345693' },
      { title: 'Street Vibes', duration: '3:45', isrc: 'USRC12345694' },
      { title: 'Urban Flow', duration: '4:30', isrc: 'USRC12345695' }
    ],
    credits: [
      { role: 'Producer', name: 'YHWH MSC' },
      { role: 'Featured Artist', name: 'Urban MC' }
    ],
    publishingNotes: 'Urban hip-hop EP with street culture themes'
  },
  {
    id: 8,
    projectName: 'Ocean Waves',
    artist: 'YHWH MSC',
    releaseType: 'Single',
    genre: 'Acoustic',
    status: 'live',
    submissionDate: '2023-10-10',
    expectedReleaseDate: '2023-12-01',
    actualReleaseDate: '2023-12-01',
    assets: 1,
    earnings: 2150,
    streams: 45678,
    lastUpdated: '2024-01-20',
    cover: '🎵',
    feedback: 'Live on all platforms - trending on acoustic playlists',
    marketingPlan: 'Acoustic playlist pitching + YouTube promotion',
    trackListing: [
      { title: 'Ocean Waves', duration: '4:25', isrc: 'USRC12345696' }
    ],
    credits: [
      { role: 'Producer', name: 'YHWH MSC' },
      { role: 'Guitar', name: 'YHWH MSC' }
    ],
    publishingNotes: 'Solo acoustic guitar performance'
  },
  {
    id: 9,
    projectName: 'Digital Age',
    artist: 'YHWH MSC',
    releaseType: 'Album',
    genre: 'Electronic',
    status: 'live',
    submissionDate: '2023-09-15',
    expectedReleaseDate: '2023-11-15',
    actualReleaseDate: '2023-11-15',
    assets: 10,
    earnings: 5670,
    streams: 123456,
    lastUpdated: '2024-01-25',
    cover: '🎵',
    feedback: 'Live and performing exceptionally well across all platforms',
    marketingPlan: 'Electronic festival promotion + streaming campaign',
    trackListing: [
      { title: 'Digital Age', duration: '5:30', isrc: 'USRC12345697' },
      { title: 'Future Tech', duration: '4:15', isrc: 'USRC12345698' },
      { title: 'Virtual Reality', duration: '6:45', isrc: 'USRC12345699' },
      { title: 'AI Dreams', duration: '4:55', isrc: 'USRC12345700' },
      { title: 'Cyber World', duration: '5:20', isrc: 'USRC12345701' }
    ],
    credits: [
      { role: 'Producer', name: 'YHWH MSC' },
      { role: 'Sound Design', name: 'Digital Studio' },
      { role: 'Mastering', name: 'Master Lab' }
    ],
    publishingNotes: 'Conceptual electronic album exploring digital themes'
  }
];

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
  const [editingRelease, setEditingRelease] = useState(null);
  const [isEditRequestMode, setIsEditRequestMode] = useState(false);
  const [viewReleaseDetailsModal, setViewReleaseDetailsModal] = useState(false);
  const [selectedRelease, setSelectedRelease] = useState(null);
  const [hoveredStatus, setHoveredStatus] = useState(null);

  // Validation function to check if all required fields are filled
  const validateReleaseForSubmission = (release) => {
    if (!release.projectName || !release.artist || !release.releaseType || !release.genre) {
      return false;
    }
    
    if (!release.trackListing || release.trackListing.length === 0) {
      return false;
    }
    
    // Check if all tracks have required fields
    for (const track of release.trackListing) {
      if (!track.title || !track.duration || !track.isrc) {
        return false;
      }
    }
    
    if (!release.credits || release.credits.length === 0) {
      return false;
    }
    
    // Check if all credits have required fields
    for (const credit of release.credits) {
      if (!credit.role || !credit.name) {
        return false;
      }
    }
    
    return true;
  };

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

  // Memoize filtered releases to prevent unnecessary re-renders
  const filteredReleases = useMemo(() => {
    return releases.filter(release => {
      const matchesStatus = statusFilter === 'all' || release.status === statusFilter;
      const matchesSearch = release.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           release.artist.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGenre = genreFilter === 'all' || release.genre === genreFilter;
      const matchesReleaseType = releaseTypeFilter === 'all' || release.releaseType === releaseTypeFilter;
      
      return matchesStatus && matchesSearch && matchesGenre && matchesReleaseType;
    });
  }, [releases, statusFilter, searchTerm, genreFilter, releaseTypeFilter]);

  // Memoize stats calculation
  const stats = useMemo(() => {
    const statusCounts = { draft: 0, submitted: 0, under_review: 0, completed: 0, live: 0 };
    let totalEarnings = 0;
    let totalStreams = 0;
    let totalReleases = releases.length;
    
    releases.forEach(release => {
      if (statusCounts.hasOwnProperty(release.status)) {
        statusCounts[release.status]++;
      }
      totalEarnings += release.earnings || 0;
      totalStreams += release.streams || 0;
    });
    
    return {
      ...statusCounts,
      totalReleases,
      totalEarnings,
      totalStreams
    };
  }, [releases]);

  // Memoize displayed releases based on hovered status
  const displayedReleases = useMemo(() => {
    return hoveredStatus 
      ? releases.filter(release => release.status === hoveredStatus)
      : releases;
  }, [releases, hoveredStatus]);

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

  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'under_review': return 'bg-amber-100 text-amber-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'live': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'submitted': return <Send className="w-5 h-5" />;
      case 'under_review': return <Eye className="w-5 h-5" />;
      case 'draft': return <FileText className="w-5 h-5" />;
      case 'completed': return <CheckCircle className="w-5 h-5" />;
      case 'live': return <Play className="w-5 h-5" />;
      default: return null;
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
      case 'Single': return 'bg-amber-100 text-amber-800';
      case 'EP': return 'bg-blue-100 text-blue-800';
      case 'Album': return 'bg-green-100 text-green-800';
      case 'Mixtape': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getGenreColor = (genre) => {
    const colors = {
      'Electronic': 'bg-purple-100 text-purple-800',
      'Hip Hop': 'bg-amber-100 text-amber-800',
      'Acoustic': 'bg-green-100 text-green-800',
      'Pop': 'bg-pink-100 text-pink-800',
      'Rock': 'bg-amber-100 text-amber-800',
      'Jazz': 'bg-blue-100 text-blue-800'
    };
    return colors[genre] || 'bg-gray-100 text-gray-800';
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
              { id: 'draft', label: 'Draft', count: stats.draft },
              { id: 'submitted', label: 'Submitted', count: stats.submitted },
              { id: 'under_review', label: 'Under Review', count: stats.under_review },
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
            onClick={() => {
              setEditingRelease(null);
              setShowCreateModal(true);
            }}
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
                {release.status === 'draft' ? (
                  <>
                    <button 
                      onClick={() => {
                        setEditingRelease(release);
                        setShowCreateModal(true);
                      }}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-3 rounded"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => {
                        // Submit the release for review
                        console.log('Submitting release for review:', release);
                        // Here you would call an API to submit the release
                        // For now, we'll just log it
                      }}
                      disabled={!validateReleaseForSubmission(release)}
                      className={`flex-1 text-sm font-medium py-2 px-3 rounded ${
                        validateReleaseForSubmission(release)
                          ? 'bg-green-600 hover:bg-green-700 text-white'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      Submit Release
                    </button>
                  </>
                ) : release.status === 'submitted' ? (
                  <>
                    <button 
                      onClick={() => {
                        setEditingRelease(release);
                        setShowCreateModal(true);
                      }}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-3 rounded"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => {
                        setSelectedRelease(release);
                        setViewReleaseDetailsModal(true);
                      }}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-2 px-3 rounded"
                    >
                      View Details
                    </button>
                  </>
                ) : release.status === 'under_review' ? (
                  <>
                    <button 
                      onClick={() => {
                        // Open edit request modal with existing release data
                        setEditingRelease(release);
                        setIsEditRequestMode(true);
                        setShowCreateModal(true);
                      }}
                      className="flex-1 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium py-2 px-3 rounded"
                    >
                      Request Edit
                    </button>
                    <button 
                      onClick={() => {
                        setSelectedRelease(release);
                        setViewReleaseDetailsModal(true);
                      }}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-2 px-3 rounded"
                    >
                      View Details
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={() => {
                      setSelectedRelease(release);
                      setViewReleaseDetailsModal(true);
                    }}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-2 px-3 rounded"
                  >
                    View Details
                  </button>
                )}
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

  const renderStatusBoard = () => {
    const statusItems = [
      { status: 'draft', label: 'Draft', count: stats.draft, color: 'bg-yellow-500' },
      { status: 'submitted', label: 'Submitted', count: stats.submitted, color: 'bg-blue-500' },
      { status: 'under_review', label: 'Under Review', count: stats.under_review, color: 'bg-amber-500' },
      { status: 'completed', label: 'Completed', count: stats.completed, color: 'bg-green-500' },
      { status: 'live', label: 'Live', count: stats.live, color: 'bg-purple-500' }
    ];

    return (
      <div>
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Release Status Overview</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {statusItems.map((item) => (
              <div 
                key={item.status} 
                className={`bg-white rounded-lg shadow p-4 text-center relative cursor-pointer transition-all duration-200 ${
                  hoveredStatus === item.status 
                    ? 'shadow-lg ring-2 ring-blue-500 ring-opacity-50' 
                    : 'hover:shadow-lg'
                }`}
                onMouseEnter={() => setHoveredStatus(item.status)}
              >
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
          {displayedReleases.map((release) => (
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
                
                <div className="mt-4 flex space-x-2">
                  {release.status === 'draft' ? (
                    <>
                      <button 
                        onClick={() => {
                          setEditingRelease(release);
                          setShowCreateModal(true);
                        }}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-3 rounded"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => {
                          // Submit the release for review
                          console.log('Submitting release for review:', release);
                          // Here you would call an API to submit the release
                          // For now, we'll just log it
                        }}
                        disabled={!validateReleaseForSubmission(release)}
                        className={`flex-1 text-sm font-medium py-2 px-3 rounded ${
                          validateReleaseForSubmission(release)
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        Submit Release
                      </button>
                    </>
                  ) : release.status === 'submitted' ? (
                    <>
                      <button 
                        onClick={() => {
                          setEditingRelease(release);
                          setShowCreateModal(true);
                        }}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-3 rounded"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => {
                          setSelectedRelease(release);
                          setViewReleaseDetailsModal(true);
                        }}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-2 px-3 rounded"
                      >
                        View Details
                      </button>
                    </>
                  ) : release.status === 'under_review' ? (
                    <>
                      <button 
                        onClick={() => {
                          // Open edit request modal with existing release data
                          setEditingRelease(release);
                          setIsEditRequestMode(true);
                          setShowCreateModal(true);
                        }}
                        className="flex-1 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium py-2 px-3 rounded"
                      >
                        Request Edit
                      </button>
                      <button 
                        onClick={() => {
                          setSelectedRelease(release);
                          setViewReleaseDetailsModal(true);
                        }}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-2 px-3 rounded"
                      >
                        View Details
                      </button>
                    </>
                  ) : release.status === 'completed' ? (
                    <>
                      <button 
                        onClick={() => {
                          // Open edit request modal with existing release data
                          setEditingRelease(release);
                          setIsEditRequestMode(true);
                          setShowCreateModal(true);
                        }}
                        className="flex-1 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium py-2 px-3 rounded"
                      >
                        Request Edit
                      </button>
                      <button 
                        onClick={() => {
                          setSelectedRelease(release);
                          setViewReleaseDetailsModal(true);
                        }}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-2 px-3 rounded"
                      >
                        View Details
                      </button>
                    </>
                  ) : release.status === 'live' ? (
                    <>
                      <button 
                        onClick={() => {
                          // Open edit request modal with existing release data
                          setEditingRelease(release);
                          setIsEditRequestMode(true);
                          setShowCreateModal(true);
                        }}
                        className="flex-1 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium py-2 px-3 rounded"
                      >
                        Request Edit
                      </button>
                      <button 
                        onClick={() => {
                          setSelectedRelease(release);
                          setViewReleaseDetailsModal(true);
                        }}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-2 px-3 rounded"
                      >
                        View Details
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={() => {
                        setSelectedRelease(release);
                        setViewReleaseDetailsModal(true);
                      }}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-2 px-3 rounded"
                    >
                      View Details
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

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
              
              <div className="mt-3 flex space-x-2">
                {release.status === 'draft' ? (
                  <>
                    <button 
                      onClick={() => {
                        setEditingRelease(release);
                        setShowCreateModal(true);
                      }}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-3 rounded"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => {
                        // Submit the release for review
                        console.log('Submitting release for review:', release);
                        // Here you would call an API to submit the release
                        // For now, we'll just log it
                      }}
                      disabled={!validateReleaseForSubmission(release)}
                      className={`flex-1 text-sm font-medium py-2 px-3 rounded ${
                        validateReleaseForSubmission(release)
                          ? 'bg-green-600 hover:bg-green-700 text-white'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      Submit Release
                    </button>
                  </>
                ) : release.status === 'submitted' ? (
                  <>
                    <button 
                      onClick={() => {
                        setEditingRelease(release);
                        setShowCreateModal(true);
                      }}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-3 rounded"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => {
                        setSelectedRelease(release);
                        setViewReleaseDetailsModal(true);
                      }}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-2 px-3 rounded"
                    >
                      View Details
                    </button>
                  </>
                ) : release.status === 'under_review' ? (
                  <>
                    <button 
                      onClick={() => {
                        // Request edit for under review release
                        console.log('Requesting edit for under review release:', release.id);
                        // Here you would typically call an API to request an edit
                        alert('Edit request sent for under review release. The distribution team will review your request.');
                      }}
                      className="flex-1 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium py-2 px-3 rounded"
                    >
                      Request Edit
                    </button>
                    <button 
                      onClick={() => {
                        setSelectedRelease(release);
                        setViewReleaseDetailsModal(true);
                      }}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-2 px-3 rounded"
                    >
                      View Details
                    </button>
                  </>
                ) : release.status === 'completed' ? (
                  <>
                    <button 
                      onClick={() => {
                        // Request edit for completed release
                        console.log('Requesting edit for completed release:', release.id);
                        // Here you would typically call an API to request an edit
                        alert('Edit request sent for completed release. The distribution team will review your request.');
                      }}
                      className="flex-1 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium py-2 px-3 rounded"
                    >
                      Request Edit
                    </button>
                    <button 
                      onClick={() => {
                        setSelectedRelease(release);
                        setViewReleaseDetailsModal(true);
                      }}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-2 px-3 rounded"
                    >
                      View Details
                    </button>
                  </>
                ) : release.status === 'live' ? (
                  <>
                    <button 
                      onClick={() => {
                        // Request edit for live release
                        console.log('Requesting edit for live release:', release.id);
                        // Here you would typically call an API to request an edit
                        alert('Edit request sent for live release. The distribution team will review your request.');
                      }}
                      className="flex-1 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium py-2 px-3 rounded"
                    >
                      Request Edit
                    </button>
                    <button 
                      onClick={() => {
                        setSelectedRelease(release);
                        setViewReleaseDetailsModal(true);
                      }}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-2 px-3 rounded"
                    >
                      View Details
                    </button>
                  </>
                ) : null}
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
        onClose={() => {
          setShowCreateModal(false);
          setEditingRelease(null);
          setIsEditRequestMode(false);
        }}
        existingRelease={editingRelease}
        isEditRequest={isEditRequestMode}
      />

      {/* View Release Details Modal */}
      <ViewReleaseDetailsModal
        isOpen={viewReleaseDetailsModal}
        onClose={() => setViewReleaseDetailsModal(false)}
        release={selectedRelease}
      />
    </Layout>
  );
} 