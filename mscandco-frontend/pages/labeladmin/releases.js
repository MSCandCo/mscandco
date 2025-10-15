// LABEL ADMIN RELEASES - View all releases from accepted artists (exactly like artist releases + artist filter)

import { useState, useEffect, useMemo, useRef } from 'react';
import { useUser } from '@/components/providers/SupabaseProvider';
import { createClient } from '@supabase/supabase-js';
import { getUserRoleSync, getUserBrand } from '../../lib/user-utils';
import { useRouter } from 'next/router';
import CurrencySelector, { formatCurrency, useCurrencySync } from '../../components/shared/CurrencySelector';
import { FaPlus, FaFilter, FaSearch, FaCalendar, FaChartBar, FaList, FaEye, FaEdit, FaPlay, FaCheckCircle, FaSend, FaCheck, FaTimes } from 'react-icons/fa';
import { Send, Eye, FileText, CheckCircle, Play, Pause, Check, X, Volume2, VolumeX, Music } from 'lucide-react';
import ViewReleaseDetailsModal from '../../components/releases/ViewReleaseDetailsModal';
import { 
  RELEASE_STATUSES, 
  RELEASE_STATUS_LABELS, 
  RELEASE_STATUS_COLORS, 
  GENRES, 
  RELEASE_TYPES, 
  getStatusLabel, 
  getStatusColor, 
  getStatusIcon, 
  isStatusEditableByArtist, 
  isStatusRequiringApproval 
} from '../../lib/constants';
import { EmptyReleases, LoadingState } from '../../components/shared/EmptyStates';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);


// Server-side permission check BEFORE page renders
export async function getServerSideProps(context) {
  const auth = await requirePermission(context, 'releases:access');

  if (auth.redirect) {
    return { redirect: auth.redirect };
  }

  return { props: { user: auth.user } };
}

export default function LabelAdminReleases() {
  const router = useRouter();
  const { user, isLoading } = useUser();
    const [selectedCurrency, updateCurrency] = useCurrencySync('GBP');
  const [releases, setReleases] = useState([]);
  const [acceptedArtists, setAcceptedArtists] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [genreFilter, setGenreFilter] = useState('all');
  const [artistFilter, setArtistFilter] = useState('all'); // NEW: Artist filter
  const [typeFilter, setTypeFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [hoveredStatus, setHoveredStatus] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedRelease, setSelectedRelease] = useState(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  
  // Audio player state
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const audioRefs = useRef({});

  const userRole = getUserRoleSync(user);
  const userBrand = getUserBrand(user);

  // Permission check
  
  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      Object.values(audioRefs.current).forEach(audio => {
        audio.pause();
      });
    };
  }, []);

  // Audio player functions
  const togglePlay = (releaseId, audioUrl) => {
    console.log('🎵 togglePlay called:', { releaseId, audioUrl });

    if (!audioUrl) {
      console.log('❌ No audio URL provided');
      return;
    }

    const audio = audioRefs.current[releaseId];
    if (!audio) {
      // Create new audio element
      console.log('🆕 Creating new Audio element');
      audioRefs.current[releaseId] = new Audio(audioUrl);
      audioRefs.current[releaseId].muted = isMuted;

      // Handle audio end
      audioRefs.current[releaseId].addEventListener('ended', () => {
        setCurrentlyPlaying(null);
      });

      // Handle errors
      audioRefs.current[releaseId].addEventListener('error', (e) => {
        console.error('❌ Audio error:', e);
        setCurrentlyPlaying(null);
      });
    }

    if (currentlyPlaying === releaseId) {
      // Pause current
      audioRefs.current[releaseId].pause();
      setCurrentlyPlaying(null);
    } else {
      // Stop all other audio
      Object.entries(audioRefs.current).forEach(([id, audio]) => {
        if (id !== releaseId) {
          audio.pause();
        }
      });

      // Play this audio
      audioRefs.current[releaseId].play();
      setCurrentlyPlaying(releaseId);
    }
  };

  // Sync hover state with current filter
  useEffect(() => {
    if (statusFilter !== 'all') {
      setHoveredStatus(statusFilter);
    } else {
      setHoveredStatus('all');
    }
  }, [statusFilter]);

  // Fetch accepted artists and their releases
  useEffect(() => {
    if (user) {
      fetchAcceptedArtistsAndReleases();
    }
  }, [user]);

  const fetchAcceptedArtistsAndReleases = async () => {
    try {
      setIsLoadingData(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        console.error('No session token available');
        return;
      }

      // Fetch accepted artists (those who accepted label partnerships)
      const artistsResponse = await fetch('/api/labeladmin/accepted-artists', {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      });
      const artistsData = await artistsResponse.json();
      const artists = artistsData.artists || [];
      setAcceptedArtists(artists);

      // Fetch releases from all accepted artists
      const releasesPromises = artists.map(async (artist) => {
        try {
          const { data, error } = await supabase
            .from('releases')
            .select('*')
            .eq('artist_id', artist.artistId)
            .order('created_at', { ascending: false });

          if (error) {
            console.error(`Error fetching releases for artist ${artist.artistId}:`, error);
            return [];
          }

          // Add artist info to each release
          return (data || []).map(release => ({
            ...release,
            artistName: artist.artistName,
            artistEmail: artist.artistEmail
          }));
        } catch (error) {
          console.error(`Error fetching releases for artist ${artist.artistId}:`, error);
          return [];
        }
      });

      const allReleases = await Promise.all(releasesPromises);
      const flattenedReleases = allReleases.flat();
      
      console.log(`📋 Loaded ${flattenedReleases.length} releases from ${artists.length} accepted artists`);
      setReleases(flattenedReleases);

    } catch (error) {
      console.error('Error loading releases:', error);
    } finally {
      setIsLoadingData(false);
    }
  };

  // Filter releases
  const filteredReleases = useMemo(() => {
    return releases.filter(release => {
      // Status filter
      if (statusFilter !== 'all' && release.status !== statusFilter) {
        return false;
      }

      // Search filter
      if (searchTerm && !release.title?.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !release.artistName?.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      // Genre filter
      if (genreFilter !== 'all' && release.genre !== genreFilter) {
        return false;
      }

      // Artist filter (NEW)
      if (artistFilter !== 'all' && release.artist_id !== artistFilter) {
        return false;
      }

      // Type filter
      if (typeFilter !== 'all' && release.type !== typeFilter) {
        return false;
      }

      return true;
    });
  }, [releases, statusFilter, searchTerm, genreFilter, artistFilter, typeFilter]);

  // Status counts for filter badges
  const statusCounts = useMemo(() => {
    const counts = { all: releases.length };
    Object.values(RELEASE_STATUSES).forEach(status => {
      counts[status] = releases.filter(r => r.status === status).length;
    });
    return counts;
  }, [releases]);

  const handleViewRelease = (release) => {
    setSelectedRelease(release);
    setIsViewModalOpen(true);
  };

  // Render release card (exactly like artist releases)
  const renderReleaseCard = (release) => {
    const isPlaying = currentlyPlaying === release.id;
    const hasAudio = release.audio_file_url || release.audioFileUrl || release.demo_url || release.audio_url;
    const hasArtwork = release.artwork_url || release.artworkUrl;

    return (
      <div key={release.id} className="relative bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-visible group">
        {/* Portrait Card with 10:18 aspect ratio */}
        <div className="relative overflow-hidden rounded-2xl" style={{ aspectRatio: '10/18' }}>

          {/* Artwork Section - Top 60% */}
          <div className="relative h-3/5 overflow-hidden">
            {hasArtwork ? (
              <img
                src={release.artwork_url || release.artworkUrl}
                alt={release.title || release.projectName}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-slate-200 via-slate-300 to-slate-400 flex items-center justify-center">
                <Music className="w-12 h-12 text-slate-500" />
              </div>
            )}

            {/* Status Badge - Top Right */}
            <div className="absolute top-3 right-3 z-20">
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold shadow-lg backdrop-blur-sm bg-opacity-10 ${getStatusColor(release.status)}`}>
                {getStatusLabel(release.status)}
              </span>
            </div>

            {/* Play Button Overlay - Make sure it's clickable */}
            {hasAudio && (
              <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePlay(release.id, release.audio_file_url || release.audioFileUrl || release.demo_url || release.audio_url);
                  }}
                  className="w-16 h-16 bg-black bg-opacity-30 hover:bg-opacity-50 rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-sm opacity-80 hover:opacity-100 transform hover:scale-110 pointer-events-auto"
                >
                  {isPlaying ? (
                    <Pause className="w-8 h-8 text-white ml-0" />
                  ) : (
                    <Play className="w-8 h-8 text-white ml-1" />
                  )}
                </button>
              </div>
            )}

            {/* Gradient Overlay with Title and Artist - Don't block clicks */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/70 via-black/40 to-transparent flex flex-col justify-end p-4 pointer-events-none">
              <h3 className="text-lg font-bold text-white mb-1 line-clamp-2 leading-tight drop-shadow-lg">
                {release.title || release.projectName}
              </h3>
              <p className="text-sm text-white/90 font-medium drop-shadow-md">
                {release.artistName || release.artist || release.artist_name}
              </p>
            </div>
          </div>

          {/* Information Section - Bottom 40% - FULL WIDTH */}
          <div className="h-2/5 p-3 flex flex-col justify-between">

            {/* Release Details Tags */}
            <div className="flex flex-nowrap gap-1 mb-1.5 min-h-[24px]">
              <span className="bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded text-[10px] font-medium whitespace-nowrap flex-shrink truncate">
                {release.releaseType || release.release_type || release.type || 'single'}
              </span>
              <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded text-[10px] font-medium whitespace-nowrap flex-shrink truncate">
                {release.genre || 'African'}
              </span>
              <span className="bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded text-[10px] font-medium whitespace-nowrap flex-shrink truncate">
                {release.trackListing?.length || release.track_count || 1} tracks
              </span>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-2 mb-1.5">
              <div className="text-center bg-green-50 rounded-lg py-1.5">
                <div className="text-sm font-bold text-green-600">
                  {formatCurrency(release.earnings || 0, selectedCurrency)}
                </div>
                <div className="text-[10px] text-green-700 font-medium">Earnings</div>
              </div>
              <div className="text-center bg-blue-50 rounded-lg py-1.5">
                <div className="text-sm font-bold text-blue-600">
                  {(release.streams || 0).toLocaleString()}
                </div>
                <div className="text-[10px] text-blue-700 font-medium">Streams</div>
              </div>
            </div>

            {/* Timeline Info */}
            <div className="text-[10px] -space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Release Date:</span>
                <span className="text-gray-900 font-semibold">
                  {release.releaseDate || release.release_date || '2025-12-01'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Last Updated:</span>
                <span className="text-gray-900 font-semibold">
                  {release.lastUpdated || release.updated_at?.split('T')[0] || '2025-10-03'}
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* Action Buttons - OUTSIDE card, sticking to the right */}
        <div className="absolute -right-20 top-12 space-y-0 z-10">

          {/* View Button */}
          <button
            onClick={() => {
              setSelectedRelease(release);
              setIsViewModalOpen(true);
            }}
            className="w-20 h-12 bg-gray-600 hover:bg-gray-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 flex flex-col items-center justify-center rounded-r-lg gap-0.5"
            title="View Release"
          >
            <Eye className="w-4 h-4" />
            <span className="text-[9px] font-medium">View</span>
          </button>

          {/* Edit Button */}
          <button
            onClick={() => window.open(`/releases/edit/${release.id}`, '_blank')}
            className="w-20 h-12 bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 flex flex-col items-center justify-center rounded-r-lg gap-0.5"
            title="Edit Release"
          >
            <FaEdit className="w-4 h-4" />
            <span className="text-[9px] font-medium">Edit</span>
          </button>

          {/* Submit Button - Only for drafts */}
          {release.status === 'draft' && (
            <button
              onClick={() => handleSubmitRelease(release.id)}
              className="w-20 h-12 bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 flex flex-col items-center justify-center rounded-r-lg gap-0.5"
              title="Submit for Review"
            >
              <Send className="w-4 h-4" />
              <span className="text-[9px] font-medium">Submit</span>
            </button>
          )}

          {/* Delete Button - Only for drafts */}
          {release.status === 'draft' && (
            <button
              onClick={() => handleDeleteRelease(release)}
              className="w-20 h-12 bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 flex flex-col items-center justify-center rounded-r-lg gap-0.5"
              title="Delete Draft"
            >
              <X className="w-4 h-4" />
              <span className="text-[9px] font-medium">Delete</span>
            </button>
          )}
        </div>
      </div>
    );
  };

  const handleSubmitRelease = async (releaseId) => {
    // Implementation for submitting release
    console.log('Submit release:', releaseId);
  };

  const handleDeleteRelease = (release) => {
    // Implementation for deleting release
    console.log('Delete release:', release.id);
  };

  if (isLoading || isLoadingData) {
    return <LoadingState message="Loading releases..." />;
  }

  // Determine empty state message
  const hasActiveFilters = searchTerm || statusFilter !== 'all' || artistFilter !== 'all';
  const emptyMessage = hasActiveFilters
    ? "No releases match your current filters."
    : "No releases found from your accepted artists.";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Releases</h1>
              <p className="mt-2 text-gray-600">View all releases from your accepted artists</p>
            </div>
            <div className="flex items-center space-x-3">
              <CurrencySelector
                selectedCurrency={selectedCurrency}
                onCurrencyChange={updateCurrency}
                compact={true}
              />
            </div>
          </div>

          {/* Interactive Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mt-8">
            <div
              className={`rounded-lg p-4 text-center cursor-pointer transition-all duration-200 ${
                hoveredStatus === 'all' || statusFilter === 'all' ? 'bg-gray-200 shadow-md transform scale-105' : 'bg-gray-50 hover:bg-gray-100'
              }`}
              onMouseEnter={() => setHoveredStatus('all')}
              onClick={() => {setStatusFilter('all'); setHoveredStatus('all');}}
            >
              <div className="text-2xl font-bold text-gray-900">{statusCounts.all}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
            <div
              className={`rounded-lg p-4 text-center cursor-pointer transition-all duration-200 ${
                hoveredStatus === RELEASE_STATUSES.DRAFT || statusFilter === RELEASE_STATUSES.DRAFT ? 'bg-yellow-200 shadow-md transform scale-105' : 'bg-yellow-50 hover:bg-yellow-100'
              }`}
              onMouseEnter={() => setHoveredStatus(RELEASE_STATUSES.DRAFT)}
              onClick={() => {
                setStatusFilter(RELEASE_STATUSES.DRAFT);
                setHoveredStatus(RELEASE_STATUSES.DRAFT);
              }}
            >
              <div className="text-2xl font-bold text-yellow-800">{statusCounts[RELEASE_STATUSES.DRAFT] || 0}</div>
              <div className="text-sm text-yellow-700">Draft</div>
            </div>
            <div
              className={`rounded-lg p-4 text-center cursor-pointer transition-all duration-200 ${
                hoveredStatus === RELEASE_STATUSES.SUBMITTED || statusFilter === RELEASE_STATUSES.SUBMITTED ? 'bg-blue-200 shadow-md transform scale-105' : 'bg-blue-50 hover:bg-blue-100'
              }`}
              onMouseEnter={() => setHoveredStatus(RELEASE_STATUSES.SUBMITTED)}
              onClick={() => {setStatusFilter(RELEASE_STATUSES.SUBMITTED); setHoveredStatus(RELEASE_STATUSES.SUBMITTED);}}
            >
              <div className="text-2xl font-bold text-blue-800">{statusCounts[RELEASE_STATUSES.SUBMITTED] || 0}</div>
              <div className="text-sm text-blue-700">Submitted</div>
            </div>
            <div
              className={`rounded-lg p-4 text-center cursor-pointer transition-all duration-200 ${
                hoveredStatus === RELEASE_STATUSES.IN_REVIEW || statusFilter === RELEASE_STATUSES.IN_REVIEW ? 'bg-orange-200 shadow-md transform scale-105' : 'bg-orange-50 hover:bg-orange-100'
              }`}
              onMouseEnter={() => setHoveredStatus(RELEASE_STATUSES.IN_REVIEW)}
              onClick={() => {setStatusFilter(RELEASE_STATUSES.IN_REVIEW); setHoveredStatus(RELEASE_STATUSES.IN_REVIEW);}}
            >
              <div className="text-2xl font-bold text-orange-800">{statusCounts[RELEASE_STATUSES.IN_REVIEW] || 0}</div>
              <div className="text-sm text-orange-700">In Review</div>
            </div>
            <div
              className={`rounded-lg p-4 text-center cursor-pointer transition-all duration-200 ${
                hoveredStatus === RELEASE_STATUSES.REVISION || statusFilter === RELEASE_STATUSES.REVISION ? 'bg-purple-200 shadow-md transform scale-105' : 'bg-purple-50 hover:bg-purple-100'
              }`}
              onMouseEnter={() => setHoveredStatus(RELEASE_STATUSES.REVISION)}
              onClick={() => {setStatusFilter(RELEASE_STATUSES.REVISION); setHoveredStatus(RELEASE_STATUSES.REVISION);}}
            >
              <div className="text-2xl font-bold text-purple-800">{statusCounts[RELEASE_STATUSES.REVISION] || 0}</div>
              <div className="text-sm text-purple-700">Revision</div>
            </div>
            <div
              className={`rounded-lg p-4 text-center cursor-pointer transition-all duration-200 ${
                hoveredStatus === RELEASE_STATUSES.COMPLETED || statusFilter === RELEASE_STATUSES.COMPLETED ? 'bg-indigo-200 shadow-md transform scale-105' : 'bg-indigo-50 hover:bg-indigo-100'
              }`}
              onMouseEnter={() => setHoveredStatus(RELEASE_STATUSES.COMPLETED)}
              onClick={() => {setStatusFilter(RELEASE_STATUSES.COMPLETED); setHoveredStatus(RELEASE_STATUSES.COMPLETED);}}
            >
              <div className="text-2xl font-bold text-indigo-800">{statusCounts[RELEASE_STATUSES.COMPLETED] || 0}</div>
              <div className="text-sm text-indigo-700">Completed</div>
            </div>
            <div
              className={`rounded-lg p-4 text-center cursor-pointer transition-all duration-200 ${
                hoveredStatus === RELEASE_STATUSES.LIVE || statusFilter === RELEASE_STATUSES.LIVE ? 'bg-green-200 shadow-md transform scale-105' : 'bg-green-50 hover:bg-green-100'
              }`}
              onMouseEnter={() => setHoveredStatus(RELEASE_STATUSES.LIVE)}
              onClick={() => {setStatusFilter(RELEASE_STATUSES.LIVE); setHoveredStatus(RELEASE_STATUSES.LIVE);}}
            >
              <div className="text-2xl font-bold text-green-800">{statusCounts[RELEASE_STATUSES.LIVE] || 0}</div>
              <div className="text-sm text-green-700">Live</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
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
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setHoveredStatus(e.target.value === 'all' ? 'all' : e.target.value);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                {Object.entries(RELEASE_STATUSES).map(([key, value]) => (
                  <option key={value} value={value}>{getStatusLabel(value)}</option>
                ))}
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
                {acceptedArtists.map(artist => (
                  <option key={artist.artistId} value={artist.artistId}>
                    {artist.artistName}
                  </option>
                ))}
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
                {GENRES.map(genre => (
                  <option key={genre} value={genre}>{genre}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Types</option>
                {RELEASE_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col justify-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setArtistFilter('all');
                  setGenreFilter('all');
                  setTypeFilter('all');
                }}
                className="w-full px-3 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {filteredReleases.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border">
            <EmptyReleases message={emptyMessage} />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-x-28 gap-y-9 pr-20">
            {filteredReleases.map(renderReleaseCard)}
          </div>
        )}
      </div>

      {/* View Release Modal */}
      {isViewModalOpen && selectedRelease && (
        <ViewReleaseDetailsModal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          release={selectedRelease}
          userRole={userRole}
        />
      )}
    </div>
  );
}