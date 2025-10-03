// ARTIST RELEASES - CLEAN & OPTIMIZED

import { useState, useEffect, useMemo, useRef } from 'react';
import { useUser } from '@/components/providers/SupabaseProvider';
import { supabase } from '@/lib/supabase';
import { getUserRoleSync, getUserBrand } from '../../lib/user-utils';
import Layout from '../../components/layouts/mainLayout';
import CurrencySelector, { formatCurrency, useCurrencySync } from '../../components/shared/CurrencySelector';
import { FaPlus, FaFilter, FaSearch, FaCalendar, FaChartBar, FaList, FaEye, FaEdit, FaPlay, FaCheckCircle, FaSend, FaCheck, FaTimes } from 'react-icons/fa';
import { Send, Eye, FileText, CheckCircle, Play, Pause, Check, X, Volume2, VolumeX, Music } from 'lucide-react';
import FinalReleaseForm from '../../components/releases/FinalReleaseForm';
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
import { getReleasesByArtist, getArtistById } from '../../lib/emptyData';
import { EmptyReleases, LoadingState } from '../../components/shared/EmptyStates';
import SubscriptionGate from '../../components/auth/SubscriptionGate';

/*
 * DISTRIBUTION PARTNER WORKFLOW:
 * 1. Artist creates release → Auto-saves to DRAFT
 * 2. Artist completes all fields → Can SUBMIT
 * 3. Distribution Partner reviews → Moves to UNDER REVIEW
 * 4. Distribution Partner approves → Moves to COMPLETED and sends to DSPs
 * 5. Release goes live on DSPs → Moves to LIVE
 * 
 * ✏️ Edit functionality: Only available for DRAFT and SUBMITTED releases
 * 🎛️ Distribution Partner controls: UNDER REVIEW, COMPLETED, and LIVE statuses
 */

export default function ArtistReleases() {
  const { user, isLoading } = useUser();
  const [selectedCurrency, updateCurrency] = useCurrencySync('GBP');
  const [releases, setReleases] = useState([]);
  const [profileData, setProfileData] = useState(null);
  const [activeTab, setActiveTab] = useState('all-projects');
  const [userPlan, setUserPlan] = useState('starter'); // 'starter' or 'pro'
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [genreFilter, setGenreFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [hoveredStatus, setHoveredStatus] = useState(null);
  
  // Sync hover state with current filter
  useEffect(() => {
    if (statusFilter !== 'all') {
      setHoveredStatus(statusFilter);
    } else {
      setHoveredStatus('all');
    }
  }, [statusFilter]);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedRelease, setSelectedRelease] = useState(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [releaseToDelete, setReleaseToDelete] = useState(null);
  
  // Audio player state
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const audioRefs = useRef({});

  const userRole = getUserRoleSync(user);
  const userBrand = getUserBrand(user);

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
    if (!audioUrl) return;
    
    const audio = audioRefs.current[releaseId];
    if (!audio) {
      // Create new audio element
      audioRefs.current[releaseId] = new Audio(audioUrl);
      audioRefs.current[releaseId].muted = isMuted;
      
      // Handle audio end
      audioRefs.current[releaseId].addEventListener('ended', () => {
        setCurrentlyPlaying(null);
      });
    }
    
    if (currentlyPlaying === releaseId) {
      // Pause current
      audioRefs.current[releaseId].pause();
      setCurrentlyPlaying(null);
    } else {
      // Pause any other playing audio
      Object.keys(audioRefs.current).forEach(id => {
        if (id !== releaseId) {
          audioRefs.current[id].pause();
        }
      });
      
      // Play this audio
      audioRefs.current[releaseId].play();
      setCurrentlyPlaying(releaseId);
    }
  };

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    
    // Update all audio elements
    Object.values(audioRefs.current).forEach(audio => {
      audio.muted = newMuted;
    });
  };

  // Handle submitting a release (draft → submitted)
  const handleSubmitRelease = async (releaseId) => {
    try {
      console.log('📤 Submitting release:', releaseId);
      
      const response = await fetch(`/api/releases/${releaseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'submitted',
          submitted_at: new Date().toISOString()
        })
      });

      if (response.ok) {
        console.log('✅ Release submitted successfully');
        
        // Show success notification
        const successDiv = document.createElement('div');
        successDiv.innerHTML = `
          <div style="
            position: fixed; 
            top: 20px; 
            right: 20px; 
            background: #f0fdf4; 
            border-left: 4px solid #065f46; 
            padding: 16px 24px; 
            color: #065f46; 
            border-radius: 8px; 
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            z-index: 1000;
          ">
            Release submitted for review!
          </div>
        `;
        document.body.appendChild(successDiv);
        setTimeout(() => document.body.removeChild(successDiv), 3000);

        // Update the release status in local state (no refresh needed!)
        setReleases(prev => prev.map(release => 
          release.id === releaseId 
            ? { ...release, status: 'submitted', submissionDate: new Date().toISOString() }
            : release
        ));
      } else {
        console.error('❌ Failed to submit release:', response.status);
        alert('Failed to submit release. Please try again.');
      }
    } catch (error) {
      console.error('❌ Error submitting release:', error);
      alert('Error submitting release. Please try again.');
    }
  };

  // Handle deleting a draft release
  // Handle deleting a release - open confirmation modal
  const handleDeleteDraft = (releaseId, releaseTitle = 'this draft release') => {
    const release = releases.find(r => r.id === releaseId);
    setReleaseToDelete({ 
      id: releaseId, 
      title: release?.title || releaseTitle 
    });
    setIsDeleteModalOpen(true);
  };

  // Actually delete the release after confirmation
  const confirmDeleteRelease = async () => {
    if (!releaseToDelete) return;

    try {
      console.log('🗑️ Deleting draft release:', releaseToDelete.id);
      
      const response = await fetch(`/api/releases/delete?id=${releaseToDelete.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        console.log('✅ Release deleted successfully');
        
        // Show success notification
        const successDiv = document.createElement('div');
        successDiv.innerHTML = `
          <div style="
            position: fixed; 
            top: 20px; 
            right: 20px; 
            background: #fef2f2; 
            border-left: 4px solid #ef4444; 
            padding: 16px 24px; 
            color: #ef4444; 
            border-radius: 8px; 
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            z-index: 1000;
          ">
            Draft release deleted!
          </div>
        `;
        document.body.appendChild(successDiv);
        setTimeout(() => document.body.removeChild(successDiv), 3000);

        // Remove the deleted release from local state (no refresh needed!)
        setReleases(prev => prev.filter(release => release.id !== releaseToDelete.id));
        
        // Close the modal and reset state
        setIsDeleteModalOpen(false);
        setReleaseToDelete(null);
      } else {
        console.error('❌ Failed to delete release:', response.status);
        alert('Failed to delete release. Please try again.');
      }
    } catch (error) {
      console.error('❌ Error deleting release:', error);
      alert('Error deleting release. Please try again.');
    }
  };

  // Load data from centralized source
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load profile data (pre-fill release info)
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        
        if (token) {
          const profileResponse = await fetch('/api/artist/profile', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (profileResponse.ok) {
            const profile = await profileResponse.json();
            setProfileData(profile);
          }
        }
        
        // 🔥 Load releases from database API
        console.log('📋 Fetching releases from database...');
        const releasesResponse = await fetch('/api/artist/releases', {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        if (releasesResponse.ok) {
          const artistReleases = await releasesResponse.json();
          console.log(`✅ Loaded ${artistReleases.length} releases from database`);
          setReleases(artistReleases);
        } else {
          console.error('❌ Failed to load releases from database, using fallback');
          // Fallback to mock data if API fails
          const artistReleases = getReleasesByArtist('msc_co');
          setReleases(artistReleases);
        }

        // Simple plan check - One source of truth
        if (user?.sub) {
          const hasUpgraded = localStorage.getItem(`user_upgraded_${user.sub}`) === 'true';
          setUserPlan(hasUpgraded ? 'pro' : 'starter');
          console.log('Simple Plan Check:', { userId: user.sub, hasUpgraded, plan: hasUpgraded ? 'pro' : 'starter' });
        }
        setIsLoadingData(false);
      } catch (error) {
        console.error('Error loading data:', error);
        // Fallback to mock data on any error
        const artistReleases = getReleasesByArtist('msc_co');
        setReleases(artistReleases);
        setIsLoadingData(false);
      }
    };

    if (user && !isLoading) {
      loadData();
    }
  }, [user, isLoading, user?.sub]);

  // Load subscription status for real plan detection
  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      if (!user) return;
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        
        if (!token) {
          setSubscriptionLoading(false);
          return;
        }

        const response = await fetch('/api/user/subscription-status', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const result = await response.json();
        
        if (result.success) {
          setSubscriptionStatus(result.data);
          // Update user plan based on real subscription
          const plan = result.data.isPro ? 'pro' : 'starter';
          setUserPlan(plan);
          console.log('Real Subscription Status:', { 
            plan, 
            isPro: result.data.isPro,
            planName: result.data.planName,
            tier: result.data.planId 
          });
        } else {
          // Set default starter plan
          setSubscriptionStatus({
            status: 'none',
            planName: 'No Subscription',
            hasSubscription: false,
            isPro: false,
            isStarter: false
          });
          setUserPlan('starter');
          console.log('No Subscription - Defaulting to Starter');
        }
      } catch (error) {
        console.error('Failed to fetch subscription status:', error);
        setUserPlan('starter'); // Default to starter on error
      } finally {
        setSubscriptionLoading(false);
      }
    };

    fetchSubscriptionStatus();
  }, [user]);

  // Calculate release counts for starter plan limits
  const releaseCount = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const releasesThisYear = releases.filter(release => {
      const releaseDate = new Date(release.releaseDate);
      return releaseDate.getFullYear() === currentYear;
    }).length;
    
    const maxReleases = userPlan === 'starter' ? 5 : Infinity;
    const remaining = Math.max(0, maxReleases - releasesThisYear);
    
    return {
      thisYear: releasesThisYear,
      remaining: remaining,
      maxReleases: maxReleases,
      isLimited: userPlan === 'starter'
    };
  }, [releases, userPlan]);

  // Advanced filtering system
  const filteredReleases = useMemo(() => {

    let filtered = releases;

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(release => release.status === statusFilter);

    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(release =>
        release.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        release.genre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        release.releaseType.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Genre filter
    if (genreFilter !== 'all') {
      filtered = filtered.filter(release => release.genre === genreFilter);
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(release => release.releaseType === typeFilter);
    }


    return filtered;
  }, [releases, statusFilter, searchTerm, genreFilter, typeFilter]);

  // Statistics calculation
  const stats = useMemo(() => {
    return {
      total: releases.length,
      draft: releases.filter(r => r.status === RELEASE_STATUSES.DRAFT).length,
      submitted: releases.filter(r => r.status === RELEASE_STATUSES.SUBMITTED).length,
      inReview: releases.filter(r => r.status === RELEASE_STATUSES.IN_REVIEW).length,
      approvals: releases.filter(r => r.status === RELEASE_STATUSES.APPROVALS).length,
      completed: releases.filter(r => r.status === RELEASE_STATUSES.COMPLETED).length,
      live: releases.filter(r => r.status === RELEASE_STATUSES.LIVE).length,

      totalStreams: releases.reduce((sum, r) => sum + (r.streams || 0), 0)
    };
  }, [releases]);

  // Render functions
  const renderReleaseCard = (release) => {
    const isPlaying = currentlyPlaying === release.id;
    const hasAudio = release.audio_file_url || release.audioFileUrl;
    const hasArtwork = release.artwork_url || release.artworkUrl;
    
    return (
      <div key={release.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden group">
        {/* Portrait Card with 10:16 aspect ratio */}
        <div className="relative" style={{ aspectRatio: '10/16' }}>
          
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
            <div className="absolute top-3 right-3">
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold shadow-lg backdrop-blur-sm ${getStatusColor(release.status)}`}>
                {getStatusLabel(release.status)}
              </span>
            </div>
            
            {/* Faint Play Button Overlay - Only when audio exists */}
            {hasAudio && (
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  onClick={() => togglePlay(release.id, release.audio_file_url || release.audioFileUrl)}
                  className="w-16 h-16 bg-black bg-opacity-30 hover:bg-opacity-50 rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-sm opacity-80 hover:opacity-100 transform hover:scale-110"
                >
                  {isPlaying ? (
                    <Pause className="w-8 h-8 text-white ml-0" />
                  ) : (
                    <Play className="w-8 h-8 text-white ml-1" />
                  )}
                </button>
              </div>
            )}
            
            {/* Gradient Overlay for better text readability */}
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/20 to-transparent"></div>
          </div>

          {/* Information Section - Bottom 40% */}
          <div className="h-2/5 p-5 flex flex-col">
            
            {/* Title and Artist */}
            <div className="mb-4">
              <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 leading-tight">
                {release.title || release.projectName}
              </h3>
              <p className="text-base text-gray-600 font-medium">
                {release.artist || release.artist_name}
              </p>
            </div>

            {/* Release Details Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-medium">
                {release.releaseType || release.release_type || 'single'}
              </span>
              <span className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-sm font-medium">
                {release.genre || 'African'}
              </span>
              <span className="bg-purple-50 text-purple-700 px-3 py-1.5 rounded-lg text-sm font-medium">
                {release.trackListing?.length || 1} tracks
              </span>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center bg-green-50 rounded-xl py-3 px-2">
                <div className="text-xl font-bold text-green-600">
                  {formatCurrency(release.earnings || 0, selectedCurrency)}
                </div>
                <div className="text-sm text-green-700 font-medium">Earnings</div>
              </div>
              <div className="text-center bg-blue-50 rounded-xl py-3 px-2">
                <div className="text-xl font-bold text-blue-600">
                  {(release.streams || 0).toLocaleString()}
                </div>
                <div className="text-sm text-blue-700 font-medium">Streams</div>
              </div>
            </div>

            {/* Timeline Info */}
            <div className="space-y-2 mb-4 text-sm bg-gray-50 rounded-lg p-3">
              <div className="flex justify-between">
                <span className="text-gray-600 font-medium">Release Date:</span>
                <span className="text-gray-800 font-semibold">
                  {release.releaseDate || release.release_date || '2025-12-01'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 font-medium">Last Updated:</span>
                <span className="text-gray-800 font-semibold">
                  {release.lastUpdated || release.updated_at?.split('T')[0] || '2025-10-03'}
                </span>
              </div>
            </div>

            {/* Audio Controls */}
            {hasAudio && (
              <div className="flex items-center justify-center space-x-3 mb-4 bg-slate-50 rounded-lg py-2">
                <button
                  onClick={toggleMute}
                  className="p-2 text-gray-500 hover:text-gray-700 transition-colors rounded-lg hover:bg-white"
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? (
                    <VolumeX className="w-5 h-5" />
                  ) : (
                    <Volume2 className="w-5 h-5" />
                  )}
                </button>
                <span className="text-sm text-gray-600 font-medium">Audio Available</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 mt-auto">
              <button
                onClick={() => {
                  setSelectedRelease(release);
                  setIsViewModalOpen(true);
                }}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2 text-sm font-medium"
              >
                <Eye className="w-4 h-4" />
                <span>View</span>
              </button>
              
              {isStatusEditableByArtist(release.status) && (
                <button
                  onClick={() => {
                    console.log('✏️ EDIT BUTTON CLICKED - release data:', release);
                    setSelectedRelease(release);
                    setIsCreateModalOpen(true);
                  }}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 text-sm font-medium"
                >
                  <FaEdit className="w-4 h-4" />
                  <span>Edit</span>
                </button>
              )}
            </div>

            {/* Additional Actions for Drafts */}
            {release.status === 'draft' && isStatusEditableByArtist(release.status) && (
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => handleSubmitRelease(release.id)}
                  className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 text-sm font-medium"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit</span>
                </button>
                
                <button
                  onClick={() => handleDeleteDraft(release.id)}
                  className="px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors flex items-center justify-center text-sm font-medium"
                >
                  <X className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (isLoading || isLoadingData) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your releases...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Role check temporarily disabled - TODO: Fix role system
  if (false && (!user || userRole !== 'artist')) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-xl font-semibold text-gray-900">Access Denied</h1>
            <p className="text-gray-600">You must be logged in as an artist to view this page.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <SubscriptionGate 
      requiredFor="release management"
      showFeaturePreview={true}
      userRole="artist"
    >
      <Layout>
        <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">My Releases</h1>
                <p className="mt-2 text-gray-600">Manage your music releases and track their progress</p>
                
                {/* Show plan status for all users */}
                {!subscriptionLoading && (
                  <div className="mt-3">
                    {releaseCount.isLimited ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            releaseCount.remaining > 0 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            <span>Releases Remaining: {releaseCount.remaining} / {releaseCount.maxReleases}</span>
                          </div>
                          <div className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            {subscriptionStatus?.planName || 'Artist Starter'}
                          </div>
                        </div>
                        {releaseCount.remaining === 0 && (
                          <a 
                            href="/billing" 
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                          >
                            Upgrade to Pro for unlimited releases →
                          </a>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                          <span>Unlimited Releases</span>
                        </div>
                        <div className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800">
                          {subscriptionStatus?.planName || 'Artist Pro'}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                disabled={releaseCount.isLimited && releaseCount.remaining === 0}
                className={`px-6 py-3 rounded-lg flex items-center space-x-2 ${
                  releaseCount.isLimited && releaseCount.remaining === 0
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <FaPlus className="w-4 h-4" />
                <span>Create New Release</span>
              </button>
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
                <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
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
                <div className="text-2xl font-bold text-yellow-800">{stats.draft}</div>
                <div className="text-sm text-yellow-700">Draft</div>
              </div>
              <div 
                className={`rounded-lg p-4 text-center cursor-pointer transition-all duration-200 ${
                  hoveredStatus === RELEASE_STATUSES.SUBMITTED || statusFilter === RELEASE_STATUSES.SUBMITTED ? 'bg-blue-200 shadow-md transform scale-105' : 'bg-blue-50 hover:bg-blue-100'
                }`}
                onMouseEnter={() => setHoveredStatus(RELEASE_STATUSES.SUBMITTED)}
                onClick={() => {setStatusFilter(RELEASE_STATUSES.SUBMITTED); setHoveredStatus(RELEASE_STATUSES.SUBMITTED);}}
              >
                <div className="text-2xl font-bold text-blue-800">{stats.submitted}</div>
                <div className="text-sm text-blue-700">Submitted</div>
              </div>
              <div 
                className={`rounded-lg p-4 text-center cursor-pointer transition-all duration-200 ${
                  hoveredStatus === RELEASE_STATUSES.IN_REVIEW || statusFilter === RELEASE_STATUSES.IN_REVIEW ? 'bg-orange-200 shadow-md transform scale-105' : 'bg-orange-50 hover:bg-orange-100'
                }`}
                onMouseEnter={() => setHoveredStatus(RELEASE_STATUSES.IN_REVIEW)}
                onClick={() => {setStatusFilter(RELEASE_STATUSES.IN_REVIEW); setHoveredStatus(RELEASE_STATUSES.IN_REVIEW);}}
              >
                <div className="text-2xl font-bold text-orange-800">{stats.inReview}</div>
                <div className="text-sm text-orange-700">In Review</div>
              </div>
              <div 
                className={`rounded-lg p-4 text-center cursor-pointer transition-all duration-200 ${
                  hoveredStatus === RELEASE_STATUSES.APPROVALS || statusFilter === RELEASE_STATUSES.APPROVALS ? 'bg-purple-200 shadow-md transform scale-105' : 'bg-purple-50 hover:bg-purple-100'
                }`}
                onMouseEnter={() => setHoveredStatus(RELEASE_STATUSES.APPROVALS)}
                onClick={() => {setStatusFilter(RELEASE_STATUSES.APPROVALS); setHoveredStatus(RELEASE_STATUSES.APPROVALS);}}
              >
                <div className="text-2xl font-bold text-purple-800">{stats.approvals}</div>
                <div className="text-sm text-purple-700">Approvals</div>
              </div>
              <div 
                className={`rounded-lg p-4 text-center cursor-pointer transition-all duration-200 ${
                  hoveredStatus === RELEASE_STATUSES.COMPLETED || statusFilter === RELEASE_STATUSES.COMPLETED ? 'bg-indigo-200 shadow-md transform scale-105' : 'bg-indigo-50 hover:bg-indigo-100'
                }`}
                onMouseEnter={() => setHoveredStatus(RELEASE_STATUSES.COMPLETED)}
                onClick={() => {setStatusFilter(RELEASE_STATUSES.COMPLETED); setHoveredStatus(RELEASE_STATUSES.COMPLETED);}}
              >
                <div className="text-2xl font-bold text-indigo-800">{stats.completed}</div>
                <div className="text-sm text-indigo-700">Completed</div>
              </div>
              <div 
                className={`rounded-lg p-4 text-center cursor-pointer transition-all duration-200 ${
                  hoveredStatus === RELEASE_STATUSES.LIVE || statusFilter === RELEASE_STATUSES.LIVE ? 'bg-green-200 shadow-md transform scale-105' : 'bg-green-50 hover:bg-green-100'
                }`}
                onMouseEnter={() => setHoveredStatus(RELEASE_STATUSES.LIVE)}
                onClick={() => {setStatusFilter(RELEASE_STATUSES.LIVE); setHoveredStatus(RELEASE_STATUSES.LIVE);}}
              >
                <div className="text-2xl font-bold text-green-800">{stats.live}</div>
                <div className="text-sm text-green-700">Live</div>
              </div>

            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
          {isLoadingData ? (
            <div className="bg-white rounded-lg shadow-sm border">
              <LoadingState message="Loading your releases..." />
            </div>
          ) : filteredReleases.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border">
              {releases.length === 0 ? (
                <EmptyReleases 
                  onCreateRelease={() => setIsCreateModalOpen(true)}
                  userRole="artist"
                />
              ) : (
                <div className="p-8 text-center">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No releases match your filters</h3>
                  <p className="text-gray-500 mb-4">Try adjusting your search criteria or clearing the filters.</p>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('all');
                      setGenreFilter('all');
                      setTypeFilter('all');
                    }}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {filteredReleases.map(renderReleaseCard)}
            </div>
          )}
        </div>

        {/* Modals */}
        {isCreateModalOpen && (
          <FinalReleaseForm
            isOpen={isCreateModalOpen}
            onClose={() => {
              setIsCreateModalOpen(false);
              setSelectedRelease(null);
            }}
            onSuccess={(newRelease) => {
              console.log('🎉 Release operation completed:', newRelease);
              
              // Check if we're editing or creating
              if (selectedRelease) {
                // Editing: Update existing release in the list
                setReleases(prev => prev.map(release => 
                  release.id === selectedRelease.id ? { ...release, ...newRelease } : release
                ));
              } else {
                // Creating: Add new release to the list
                setReleases(prev => [newRelease, ...prev]);
              }
              
              setIsCreateModalOpen(false);
              setSelectedRelease(null);
              // No page refresh needed! ✨
            }}
            editingRelease={selectedRelease}
          />
        )}

        {isViewModalOpen && selectedRelease && (
          <ViewReleaseDetailsModal
            isOpen={isViewModalOpen}
            onClose={() => {
              setIsViewModalOpen(false);
              setSelectedRelease(null);
            }}
            release={selectedRelease}
          />
        )}
        {/* Branded Delete Confirmation Modal */}
        {isDeleteModalOpen && releaseToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4">
              <div className="p-6">
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                  Delete Draft Release
                </h3>
                <p className="text-sm text-gray-600 text-center mb-6">
                  Are you sure you want to delete <strong>"{releaseToDelete.title}"</strong>? This action cannot be undone.
                </p>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsDeleteModalOpen(false);
                      setReleaseToDelete(null);
                    }}
                    className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={confirmDeleteRelease}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </Layout>
    </SubscriptionGate>
  );
}