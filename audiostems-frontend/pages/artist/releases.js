import { useState, useEffect, useMemo } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { getUserRole, getUserBrand } from '../../lib/auth0-config';
import Layout from '../../components/layouts/mainLayout';
import { FaPlus, FaFilter, FaSearch, FaCalendar, FaChartBar, FaList, FaEye, FaEdit, FaPlay, FaCheckCircle, FaFileText, FaSend, FaCheck, FaTimes } from 'react-icons/fa';
import { Send, Eye, FileText, CheckCircle, Play, Check, X } from 'lucide-react';
import CreateReleaseModal from '../../components/releases/CreateReleaseModal';
import ViewReleaseDetailsModal from '../../components/releases/ViewReleaseDetailsModal';
import { RELEASE_STATUSES, RELEASE_STATUS_LABELS, RELEASE_STATUS_COLORS, GENRES, RELEASE_TYPES, getStatusLabel, getStatusColor, getStatusIcon, isStatusEditableByArtist, isStatusRequiringApproval } from '../../lib/constants';

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

// Comprehensive mock data for artist releases - consistent with distribution partner database
const mockReleases = [
  // YHWH MSC releases from the shared database
  {
    id: 1,
    projectName: 'Urban Beats Collection',
    artist: 'YHWH MSC',
    releaseType: 'EP',
    genre: 'Hip Hop',
    status: RELEASE_STATUSES.UNDER_REVIEW,
    submissionDate: '2024-01-15',
    expectedReleaseDate: '2025-03-01',
    assets: 3,
    earnings: 0,
    streams: 0,
    lastUpdated: '2024-01-15',
    cover: '🎵',
    feedback: 'Great urban sound, needs minor adjustments',
    marketingPlan: 'Social media campaign, playlist pitching',
    musicFiles: ['urban_beat_01.wav', 'street_rhythm_02.wav', 'city_lights_03.wav'],
    artworkFile: 'urban_beats_cover.jpg',
    trackListing: [
      { title: 'Urban Beat', duration: '3:30', isrc: 'USRC12345686', bpm: '140', songKey: 'C Minor' },
      { title: 'Street Rhythm', duration: '4:15', isrc: 'USRC12345687', bpm: '135', songKey: 'F Minor' },
      { title: 'City Lights', duration: '3:45', isrc: 'USRC12345688', bpm: '145', songKey: 'A Minor' }
    ],
    credits: [
      { role: 'Producer', name: 'YHWH MSC' },
      { role: 'Mix Engineer', name: 'Studio Pro' },
      { role: 'Mastering', name: 'Master Lab' }
    ],
    publishingNotes: 'All tracks written and produced by YHWH MSC'
  },
  {
    id: 16,
    projectName: 'Urban Beat (Remix Package)',
    artist: 'YHWH MSC',
    releaseType: 'Remix',
    genre: 'Hip Hop',
    status: RELEASE_STATUSES.COMPLETED,
    submissionDate: '2024-10-01',
    expectedReleaseDate: '2025-01-15',
    assets: 3,
    earnings: 0,
    streams: 0,
    lastUpdated: '2024-10-01',
    cover: '🎵',
    feedback: 'Remix package completed - ready for release',
    marketingPlan: 'DJ promotion, club distribution, streaming features',
    musicFiles: ['urban_beat_club_remix.wav', 'urban_beat_ambient_remix.wav', 'urban_beat_trap_remix.wav'],
    artworkFile: 'urban_beat_remix_cover.jpg',
    trackListing: [
      { title: 'Urban Beat (Club Remix)', duration: '5:45', isrc: 'USRC12345734', bpm: '128', songKey: 'C Minor' },
      { title: 'Urban Beat (Ambient Remix)', duration: '4:20', isrc: 'USRC12345735', bpm: '85', songKey: 'C Minor' },
      { title: 'Urban Beat (Trap Remix)', duration: '3:50', isrc: 'USRC12345736', bpm: '140', songKey: 'C Minor' }
    ],
    credits: [
      { role: 'Original Artist', name: 'YHWH MSC' },
      { role: 'Remix Producer', name: 'DJ ElectroMaster' },
      { role: 'Additional Remix', name: 'Ambient Artist' }
    ],
    publishingNotes: 'Official remixes by top electronic producers'
  },
  {
    id: 18,
    projectName: 'Movie Epic Soundtrack',
    artist: 'YHWH MSC',
    releaseType: 'Soundtrack',
    genre: 'Classical',
    status: RELEASE_STATUSES.UNDER_REVIEW,
    submissionDate: '2024-11-20',
    expectedReleaseDate: '2025-04-05',
    assets: 4,
    earnings: 0,
    streams: 0,
    lastUpdated: '2024-11-20',
    cover: '🎼',
    feedback: 'Under review - coordinating with film release schedule',
    marketingPlan: '',
    musicFiles: [], // No music files uploaded yet
    artworkFile: null, // No artwork uploaded yet
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
    expectedReleaseDate: '2025-05-20',
    assets: 3,
    earnings: 0,
    streams: 0,
    lastUpdated: '2024-01-08',
    cover: '🎵',
    feedback: '',
    marketingPlan: '',
    musicFiles: ['urban-beat.mp3', 'street-rhythm.mp3'], // Some music files uploaded
    artworkFile: null, // No artwork uploaded yet
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
    expectedReleaseDate: '2025-06-15',
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
    expectedReleaseDate: '2025-07-10',
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
    expectedReleaseDate: '2025-07-10',
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
  },
  {
    id: 10,
    projectName: 'Approval Required EP',
    artist: 'Test Artist',
    releaseType: 'EP',
    genre: 'Electronic',
    status: RELEASE_STATUSES.APPROVAL_REQUIRED,
    submissionDate: '2024-01-15',
    expectedReleaseDate: '2025-08-01',
    musicFiles: ['track1.wav', 'track2.wav', 'track3.wav'],
    artworkFile: 'ep-cover.jpg',
    trackListing: [
      { title: 'Approval Track 1', duration: '3:45', isrc: 'USRC12345693', bpm: '128', songKey: 'C Major' },
      { title: 'Approval Track 2', duration: '4:12', isrc: 'USRC12345694', bpm: '130', songKey: 'A Minor' },
      { title: 'Approval Track 3', duration: '3:58', isrc: 'USRC12345695', bpm: '125', songKey: 'G Major' }
    ],
    credits: [
      { role: 'Producer', fullName: 'Test Producer' },
      { role: 'Mixing Engineer', fullName: 'Test Mixer' }
    ],
    publishingNotes: 'EP ready for approval',
    marketingPlan: 'Marketing plan pending approval',
    feedback: 'Distribution partner has requested changes to track titles and BPM values',
    originalData: {
      trackListing: [
        { title: 'Original Track 1', duration: '3:45', isrc: 'USRC12345693', bpm: '120', songKey: 'C Major' },
        { title: 'Original Track 2', duration: '4:12', isrc: 'USRC12345694', bpm: '125', songKey: 'A Minor' },
        { title: 'Original Track 3', duration: '3:58', isrc: 'USRC12345695', bpm: '122', songKey: 'G Major' }
      ]
    },
    proposedChanges: {
      trackListing: [
        { title: 'Approval Track 1', duration: '3:45', isrc: 'USRC12345693', bpm: '128', songKey: 'C Major' },
        { title: 'Approval Track 2', duration: '4:12', isrc: 'USRC12345694', bpm: '130', songKey: 'A Minor' },
        { title: 'Approval Track 3', duration: '3:58', isrc: 'USRC12345695', bpm: '125', songKey: 'G Major' }
      ]
    }
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
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalRelease, setApprovalRelease] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);

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
    const statusCounts = { draft: 0, submitted: 0, under_review: 0, approval_required: 0, completed: 0, live: 0 };
    let totalEarnings = 0;
    let totalStreams = 0;
    let totalReleases = releases.length;
    let totalAssets = 0;
    
    releases.forEach(release => {
      if (statusCounts.hasOwnProperty(release.status)) {
        statusCounts[release.status]++;
      }
      totalEarnings += release.earnings || 0;
      totalStreams += release.streams || 0;
      totalAssets += release.trackListing ? release.trackListing.length : 0;
    });
    
    return {
      ...statusCounts,
      totalReleases,
      totalAssets,
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

  const getReleaseTypeColor = (type) => {
    switch (type) {
      case 'Single': return 'bg-green-100 text-green-800';
      case 'EP': return 'bg-blue-100 text-blue-800';
      case 'Album': return 'bg-purple-100 text-purple-800';
      case 'Mixtape': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getGenreColor = (genre) => {
    switch (genre) {
      case 'Hip Hop': return 'bg-red-100 text-red-800';
      case 'Rock': return 'bg-amber-100 text-amber-800';
      case 'Electronic': return 'bg-blue-100 text-blue-800';
      case 'Pop': return 'bg-pink-100 text-pink-800';
      case 'Jazz': return 'bg-indigo-100 text-indigo-800';
      case 'Acoustic': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Helper functions for checking release completeness
  const hasMusicFiles = (release) => {
    return release.musicFiles && release.musicFiles.length > 0;
  };

  const hasCoverArtwork = (release) => {
    return release.artworkFile || release.coverArtwork;
  };

  const isReleaseDetailsComplete = (release) => {
    return release.projectName && 
           release.artist && 
           release.releaseType && 
           release.genre && 
           release.expectedReleaseDate &&
           release.trackListing && 
           release.trackListing.length > 0 &&
           release.credits && 
           release.credits.length > 0;
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
              <p className="text-sm font-medium text-gray-600">Total Tracks</p>
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
              { id: RELEASE_STATUSES.DRAFT, label: getStatusLabel(RELEASE_STATUSES.DRAFT), count: stats.draft },
              { id: RELEASE_STATUSES.SUBMITTED, label: getStatusLabel(RELEASE_STATUSES.SUBMITTED), count: stats.submitted },
              { id: RELEASE_STATUSES.UNDER_REVIEW, label: getStatusLabel(RELEASE_STATUSES.UNDER_REVIEW), count: stats.under_review },
              { id: RELEASE_STATUSES.APPROVAL_REQUIRED, label: getStatusLabel(RELEASE_STATUSES.APPROVAL_REQUIRED), count: stats.approval_required },
              { id: RELEASE_STATUSES.COMPLETED, label: getStatusLabel(RELEASE_STATUSES.COMPLETED), count: stats.completed },
              { id: RELEASE_STATUSES.LIVE, label: getStatusLabel(RELEASE_STATUSES.LIVE), count: stats.live }
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
                  {GENRES.map(genre => (
                    <option key={genre} value={genre}>{genre}</option>
                  ))}
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
                  {RELEASE_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
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
                  <span className="text-gray-600">Number of Tracks:</span>
                  <span className="font-medium">{release.trackListing.length}</span>
                </div>
                {[RELEASE_STATUSES.DRAFT, RELEASE_STATUSES.SUBMITTED, RELEASE_STATUSES.UNDER_REVIEW].includes(release.status) ? (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Music Files:</span>
                      <span className="font-medium">
                        {hasMusicFiles(release) ? (
                          <span className="text-green-600">✓</span>
                        ) : (
                          <span className="text-red-600">✗</span>
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Cover Artwork:</span>
                      <span className="font-medium">
                        {hasCoverArtwork(release) ? (
                          <span className="text-green-600">✓</span>
                        ) : (
                          <span className="text-red-600">✗</span>
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Release Details:</span>
                      <span className="font-medium">
                        {isReleaseDetailsComplete(release) ? (
                          <span className="text-green-600">Complete</span>
                        ) : (
                          <span className="text-red-600">Incomplete</span>
                        )}
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Earnings:</span>
                      <span className="font-medium text-green-600">${(release.earnings || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Streams:</span>
                      <span className="font-medium">{(release.streams || 0).toLocaleString()}</span>
                    </div>
                  </>
                )}
                {release.expectedReleaseDate && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Expected:</span>
                    <span className="font-medium">{new Date(release.expectedReleaseDate).toLocaleDateString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Last Updated:</span>
                  <span className="font-medium">{new Date(release.lastUpdated).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="mt-6 flex space-x-2">
                {release.status === RELEASE_STATUSES.DRAFT ? (
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
                ) : release.status === RELEASE_STATUSES.SUBMITTED ? (
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
                ) : release.status === RELEASE_STATUSES.UNDER_REVIEW ? (
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
                ) : release.status === RELEASE_STATUSES.APPROVAL_REQUIRED ? (
                  <>
                    <button 
                      onClick={() => {
                        setApprovalRelease(release);
                        setShowApprovalModal(true);
                      }}
                      className="flex-1 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium py-2 px-3 rounded"
                    >
                      View Changes
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
                ) : release.status === RELEASE_STATUSES.COMPLETED ? (
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
                ) : release.status === RELEASE_STATUSES.LIVE ? (
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
                ) : null}
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
      { status: RELEASE_STATUSES.DRAFT, label: getStatusLabel(RELEASE_STATUSES.DRAFT), count: stats.draft, color: 'bg-yellow-500' },
      { status: RELEASE_STATUSES.SUBMITTED, label: getStatusLabel(RELEASE_STATUSES.SUBMITTED), count: stats.submitted, color: 'bg-blue-500' },
      { status: RELEASE_STATUSES.UNDER_REVIEW, label: getStatusLabel(RELEASE_STATUSES.UNDER_REVIEW), count: stats.under_review, color: 'bg-amber-500' },
      { status: RELEASE_STATUSES.APPROVAL_REQUIRED, label: getStatusLabel(RELEASE_STATUSES.APPROVAL_REQUIRED), count: stats.approval_required, color: 'bg-orange-500' },
      { status: RELEASE_STATUSES.COMPLETED, label: getStatusLabel(RELEASE_STATUSES.COMPLETED), count: stats.completed, color: 'bg-green-500' },
      { status: RELEASE_STATUSES.LIVE, label: getStatusLabel(RELEASE_STATUSES.LIVE), count: stats.live, color: 'bg-purple-500' }
    ];

    return (
      <div>
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Release Status Overview</h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {statusItems.map((item) => (
              <div 
                key={item.status} 
                className={`bg-white rounded-lg shadow p-3 text-center relative cursor-pointer transition-all duration-200 ${
                  hoveredStatus === item.status 
                    ? 'shadow-lg ring-2 ring-blue-500 ring-opacity-50' 
                    : 'hover:shadow-lg'
                }`}
                onMouseEnter={() => setHoveredStatus(item.status)}
              >
                <div className={`w-8 h-8 ${item.color} rounded-full mx-auto mb-2 flex items-center justify-center text-white text-sm`}>
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
                  <p>Number of Tracks: {release.trackListing.length}</p>
                  {['draft', 'submitted', 'under_review'].includes(release.status) ? (
                    <>
                      <p>Music Files: {hasMusicFiles(release) ? '✓' : '✗'}</p>
                      <p>Cover Artwork: {hasCoverArtwork(release) ? '✓' : '✗'}</p>
                      <p>Release Details: {isReleaseDetailsComplete(release) ? 'Complete' : 'Incomplete'}</p>
                    </>
                  ) : (
                    <>
                      <p>Earnings: ${(release.earnings || 0).toLocaleString()}</p>
                      <p>Streams: {(release.streams || 0).toLocaleString()}</p>
                    </>
                  )}
                  <p>Expected: {release.expectedReleaseDate ? new Date(release.expectedReleaseDate).toLocaleDateString() : 'TBD'}</p>
                  <p>Last Updated: {new Date(release.lastUpdated).toLocaleDateString()}</p>
                </div>
                
                <div className="mt-4 flex space-x-2">
                  {release.status === RELEASE_STATUSES.DRAFT ? (
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
                  ) : release.status === RELEASE_STATUSES.SUBMITTED ? (
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
                  ) : release.status === RELEASE_STATUSES.UNDER_REVIEW ? (
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
                  ) : release.status === RELEASE_STATUSES.APPROVAL_REQUIRED ? (
                    <>
                      <button 
                        onClick={() => {
                          setApprovalRelease(release);
                          setShowApprovalModal(true);
                        }}
                        className="flex-1 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium py-2 px-3 rounded"
                      >
                        View Changes
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
                  ) : release.status === RELEASE_STATUSES.COMPLETED ? (
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
                  ) : release.status === RELEASE_STATUSES.LIVE ? (
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
                  <p className="text-sm text-gray-600">{release.artist} • {release.releaseType} • {release.genre}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Number of Tracks: {release.trackListing.length} • Last Updated: {new Date(release.lastUpdated).toLocaleDateString()}
                  </p>
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
                {release.status === RELEASE_STATUSES.DRAFT ? (
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
                ) : release.status === RELEASE_STATUSES.SUBMITTED ? (
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
                ) : release.status === RELEASE_STATUSES.UNDER_REVIEW ? (
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
                ) : release.status === RELEASE_STATUSES.COMPLETED ? (
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
                ) : release.status === RELEASE_STATUSES.LIVE ? (
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
        
        {filteredReleases.filter(release => release.expectedReleaseDate && new Date(release.expectedReleaseDate) > new Date()).length === 0 && (
          <div className="text-center py-6">
            <p className="text-gray-500">No upcoming releases scheduled</p>
          </div>
        )}
      </div>

      {/* Recent Releases */}
      <div className="space-y-4 mt-8">
        <h3 className="text-lg font-semibold text-gray-900">Recent Releases (Last 6 Months)</h3>
        {filteredReleases
          .filter(release => {
            if (!release.expectedReleaseDate) return false;
            const releaseDate = new Date(release.expectedReleaseDate);
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
            return releaseDate <= new Date() && releaseDate >= sixMonthsAgo;
          })
          .sort((a, b) => new Date(b.expectedReleaseDate) - new Date(a.expectedReleaseDate))
          .map((release) => (
            <div key={release.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-gray-900">{release.projectName}</h4>
                  <p className="text-sm text-gray-600">{release.artist} • {release.releaseType} • {release.genre}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Number of Tracks: {release.trackListing.length} • Last Updated: {new Date(release.lastUpdated).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">
                    Released: {new Date(release.expectedReleaseDate).toLocaleDateString()}
                  </p>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(release.status)}`}>
                    {getStatusIcon(release.status)} {getStatusLabel(release.status)}
                  </span>
                  {(release.earnings || release.streams) && (
                    <p className="text-xs text-gray-600 mt-1">
                      ${(release.earnings || 0).toLocaleString()} • {(release.streams || 0).toLocaleString()} streams
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        
        {filteredReleases.filter(release => {
          if (!release.expectedReleaseDate) return false;
          const releaseDate = new Date(release.expectedReleaseDate);
          const sixMonthsAgo = new Date();
          sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
          return releaseDate <= new Date() && releaseDate >= sixMonthsAgo;
        }).length === 0 && (
          <div className="text-center py-6">
            <p className="text-gray-500">No recent releases in the last 6 months</p>
          </div>
        )}
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
        isApprovalEdit={hasChanges}
      />

      {/* View Release Details Modal */}
      <ViewReleaseDetailsModal
        isOpen={viewReleaseDetailsModal}
        onClose={() => setViewReleaseDetailsModal(false)}
        release={selectedRelease}
      />

      {/* Approval Modal */}
      {showApprovalModal && approvalRelease && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-4/5 lg:w-3/4 shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 sticky top-0 bg-white pb-2 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Review Changes - {approvalRelease.projectName}</h3>
              <button
                onClick={() => {
                  setShowApprovalModal(false);
                  setApprovalRelease(null);
                  setHasChanges(false);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Feedback from Distribution Partner */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="text-md font-semibold text-blue-900 mb-2">Distribution Partner Feedback</h4>
                <p className="text-sm text-blue-800">{approvalRelease.feedback}</p>
              </div>

              {/* Changes Comparison */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-md font-semibold text-gray-900 mb-3">Proposed Changes</h4>
                <div className="space-y-4">
                  {approvalRelease.trackListing.map((track, index) => {
                    const originalTrack = approvalRelease.originalData?.trackListing?.[index];
                    const hasChanges = originalTrack && (
                      track.title !== originalTrack.title ||
                      track.bpm !== originalTrack.bpm ||
                      track.songKey !== originalTrack.songKey
                    );
                    
                    return (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <h5 className="font-medium text-gray-900 mb-3">Track {index + 1}</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Original Values */}
                          <div>
                            <h6 className="text-sm font-medium text-gray-700 mb-2">Original</h6>
                            <div className="space-y-2">
                              <div>
                                <label className="block text-xs text-gray-500">Title</label>
                                <p className="text-sm text-gray-900 bg-gray-100 px-2 py-1 rounded">{originalTrack?.title || 'N/A'}</p>
                              </div>
                              <div>
                                <label className="block text-xs text-gray-500">BPM</label>
                                <p className="text-sm text-gray-900 bg-gray-100 px-2 py-1 rounded">{originalTrack?.bpm || 'N/A'}</p>
                              </div>
                              <div>
                                <label className="block text-xs text-gray-500">Key</label>
                                <p className="text-sm text-gray-900 bg-gray-100 px-2 py-1 rounded">{originalTrack?.songKey || 'N/A'}</p>
                              </div>
                            </div>
                          </div>
                          
                          {/* Proposed Values */}
                          <div>
                            <h6 className="text-sm font-medium text-gray-700 mb-2">Proposed</h6>
                            <div className="space-y-2">
                              <div>
                                <label className="block text-xs text-gray-500">Title</label>
                                <p className={`text-sm px-2 py-1 rounded ${
                                  track.title !== originalTrack?.title 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-gray-100 text-gray-900'
                                }`}>
                                  {track.title}
                                  {track.title !== originalTrack?.title && <span className="ml-2 text-xs">← Changed</span>}
                                </p>
                              </div>
                              <div>
                                <label className="block text-xs text-gray-500">BPM</label>
                                <p className={`text-sm px-2 py-1 rounded ${
                                  track.bpm !== originalTrack?.bpm 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-gray-100 text-gray-900'
                                }`}>
                                  {track.bpm}
                                  {track.bpm !== originalTrack?.bpm && <span className="ml-2 text-xs">← Changed</span>}
                                </p>
                              </div>
                              <div>
                                <label className="block text-xs text-gray-500">Key</label>
                                <p className={`text-sm px-2 py-1 rounded ${
                                  track.songKey !== originalTrack?.songKey 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-gray-100 text-gray-900'
                                }`}>
                                  {track.songKey}
                                  {track.songKey !== originalTrack?.songKey && <span className="ml-2 text-xs">← Changed</span>}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    // Accept changes - status becomes "edits_approved"
                    console.log('Accepting changes for release:', approvalRelease.id);
                    alert('Changes accepted! Release will be updated.');
                    setShowApprovalModal(false);
                    setApprovalRelease(null);
                    setHasChanges(false);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
                >
                  <FaCheck className="w-4 h-4 mr-2" />
                  Accept Changes
                </button>
                <button
                  onClick={() => {
                    // Reject changes - status becomes "edits_rejected"
                    console.log('Rejecting changes for release:', approvalRelease.id);
                    alert('Changes rejected! Release will remain unchanged.');
                    setShowApprovalModal(false);
                    setApprovalRelease(null);
                    setHasChanges(false);
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center"
                >
                  <FaTimes className="w-4 h-4 mr-2" />
                  Reject Changes
                </button>
                <button
                  onClick={() => {
                    // Make edits - opens edit modal
                    setEditingRelease(approvalRelease);
                    setShowCreateModal(true);
                    setShowApprovalModal(false);
                    setApprovalRelease(null);
                    setHasChanges(true);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Make Edits
                </button>
                <button
                  onClick={() => {
                    setShowApprovalModal(false);
                    setApprovalRelease(null);
                    setHasChanges(false);
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
} 