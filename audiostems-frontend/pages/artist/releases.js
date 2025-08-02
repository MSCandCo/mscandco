// 🎯 ARTIST RELEASES - CLEAN & OPTIMIZED
// Uses centralized data from lib/mockData.js - NO duplicate data

import { useState, useEffect, useMemo } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { getUserRole, getUserBrand } from '../../lib/auth0-config';
import Layout from '../../components/layouts/mainLayout';
import CurrencySelector, { formatCurrency, useCurrencySync } from '../../components/shared/CurrencySelector';
import { FaPlus, FaFilter, FaSearch, FaCalendar, FaChartBar, FaList, FaEye, FaEdit, FaPlay, FaCheckCircle, FaSend, FaCheck, FaTimes } from 'react-icons/fa';
import { Send, Eye, FileText, CheckCircle, Play, Check, X } from 'lucide-react';
import CreateReleaseModal from '../../components/releases/CreateReleaseModal';
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
import { getReleasesByArtist, getArtistById } from '../../lib/mockData';

/*
 * 🔄 DISTRIBUTION PARTNER WORKFLOW:
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
  const { user, isAuthenticated, isLoading } = useAuth0();
  const [selectedCurrency, updateCurrency] = useCurrencySync('GBP');
  const [releases, setReleases] = useState([]);
  const [profileData, setProfileData] = useState(null);
  const [activeTab, setActiveTab] = useState('all-projects');
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

  const userRole = getUserRole(user);
  const userBrand = getUserBrand(user);

  // 🎯 Load data from centralized source
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load profile data (pre-fill release info)
        const profileResponse = await fetch('/api/artist/get-profile');
        if (profileResponse.ok) {
          const profile = await profileResponse.json();
          setProfileData(profile);
        }
        
        // 🔥 Load releases from centralized database (NO MORE DUPLICATES!)
        const artistReleases = getReleasesByArtist('yhwh_msc');
        setReleases(artistReleases);
        setIsLoadingData(false);
      } catch (error) {
        console.error('Error loading data:', error);
        // Fallback to centralized data
        const artistReleases = getReleasesByArtist('yhwh_msc');
        setReleases(artistReleases);
        setIsLoadingData(false);
      }
    };

    if (isAuthenticated && !isLoading) {
      loadData();
    }
  }, [isAuthenticated, isLoading, user?.sub]);

  // 🔍 ADVANCED FILTERING SYSTEM
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

  // 📊 STATISTICS CALCULATION
  const stats = useMemo(() => {
    return {
      total: releases.length,
      draft: releases.filter(r => r.status === RELEASE_STATUSES.DRAFT).length,
      submitted: releases.filter(r => r.status === RELEASE_STATUSES.SUBMITTED).length,
      underReview: releases.filter(r => r.status === RELEASE_STATUSES.UNDER_REVIEW).length,
      approvalRequired: releases.filter(r => r.status === RELEASE_STATUSES.APPROVAL_REQUIRED).length,
      completed: releases.filter(r => r.status === RELEASE_STATUSES.COMPLETED).length,
      live: releases.filter(r => r.status === RELEASE_STATUSES.LIVE).length,
      totalEarnings: releases.reduce((sum, r) => sum + (r.earnings || 0), 0),
      totalStreams: releases.reduce((sum, r) => sum + (r.streams || 0), 0)
    };
  }, [releases]);

  // 🎨 RENDER FUNCTIONS
  const renderReleaseCard = (release) => (
    <div key={release.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow duration-200">
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{release.projectName}</h3>
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <span>{release.releaseType}</span>
              <span>•</span>
              <span>{release.genre}</span>
              <span>•</span>
              <span>{release.trackListing?.length || 1} tracks</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(release.status)}`}>
              {getStatusIcon(release.status)}
              <span className="ml-1">{getStatusLabel(release.status)}</span>
            </span>
          </div>
        </div>

        {/* Details */}
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div>
            <span className="text-gray-500">Submitted:</span>
            <span className="ml-2 text-gray-900">{release.submissionDate || 'Not submitted'}</span>
          </div>
          <div>
            <span className="text-gray-500">Expected Release:</span>
            <span className="ml-2 text-gray-900">{release.expectedReleaseDate || 'TBD'}</span>
          </div>
          <div>
            <span className="text-gray-500">Earnings:</span>
            <span className="ml-2 text-gray-900">{formatCurrency(release.earnings || 0, selectedCurrency)}</span>
          </div>
          <div>
            <span className="text-gray-500">Streams:</span>
            <span className="ml-2 text-gray-900">{(release.streams || 0).toLocaleString()}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center">
          <div className="text-xs text-gray-500">
            Last updated: {release.lastUpdated || 'Unknown'}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => {
                setSelectedRelease(release);
                setIsViewModalOpen(true);
              }}
              className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 flex items-center space-x-1"
            >
              <Eye className="w-3 h-3" />
              <span>View</span>
            </button>
            {isStatusEditableByArtist(release.status) && (
              <button
                onClick={() => {
                  setSelectedRelease(release);
                  setIsCreateModalOpen(true);
                }}
                className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 flex items-center space-x-1"
              >
                <FaEdit className="w-3 h-3" />
                <span>Edit</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

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

  if (!isAuthenticated || userRole !== 'artist') {
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
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">My Releases</h1>
                <p className="mt-2 text-gray-600">Manage your music releases and track their progress</p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <FaPlus className="w-4 h-4" />
                <span>New Release</span>
              </button>
            </div>

            {/* Interactive Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mt-8">
              <div 
                className={`rounded-lg p-4 text-center cursor-pointer transition-all duration-200 ${
                  hoveredStatus === 'all' ? 'bg-gray-200 shadow-md transform scale-105' : 'bg-gray-50 hover:bg-gray-100'
                }`}
                onMouseEnter={() => setHoveredStatus('all')}
                onClick={() => {setStatusFilter('all'); setHoveredStatus('all');}}
              >
                <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
              <div 
                className={`rounded-lg p-4 text-center cursor-pointer transition-all duration-200 ${
                  hoveredStatus === 'DRAFT' ? 'bg-yellow-200 shadow-md transform scale-105' : 'bg-yellow-50 hover:bg-yellow-100'
                }`}
                onMouseEnter={() => setHoveredStatus('DRAFT')}
                onClick={() => {setStatusFilter('DRAFT'); setHoveredStatus('DRAFT');}}
              >
                <div className="text-2xl font-bold text-yellow-800">{stats.draft}</div>
                <div className="text-sm text-yellow-700">Draft</div>
              </div>
              <div 
                className={`rounded-lg p-4 text-center cursor-pointer transition-all duration-200 ${
                  hoveredStatus === 'SUBMITTED' ? 'bg-blue-200 shadow-md transform scale-105' : 'bg-blue-50 hover:bg-blue-100'
                }`}
                onMouseEnter={() => setHoveredStatus('SUBMITTED')}
                onClick={() => {setStatusFilter('SUBMITTED'); setHoveredStatus('SUBMITTED');}}
              >
                <div className="text-2xl font-bold text-blue-800">{stats.submitted}</div>
                <div className="text-sm text-blue-700">Submitted</div>
              </div>
              <div 
                className={`rounded-lg p-4 text-center cursor-pointer transition-all duration-200 ${
                  hoveredStatus === 'UNDER_REVIEW' ? 'bg-orange-200 shadow-md transform scale-105' : 'bg-orange-50 hover:bg-orange-100'
                }`}
                onMouseEnter={() => setHoveredStatus('UNDER_REVIEW')}
                onClick={() => {setStatusFilter('UNDER_REVIEW'); setHoveredStatus('UNDER_REVIEW');}}
              >
                <div className="text-2xl font-bold text-orange-800">{stats.underReview}</div>
                <div className="text-sm text-orange-700">Under Review</div>
              </div>
              <div 
                className={`rounded-lg p-4 text-center cursor-pointer transition-all duration-200 ${
                  hoveredStatus === 'APPROVAL_REQUIRED' ? 'bg-purple-200 shadow-md transform scale-105' : 'bg-purple-50 hover:bg-purple-100'
                }`}
                onMouseEnter={() => setHoveredStatus('APPROVAL_REQUIRED')}
                onClick={() => {setStatusFilter('APPROVAL_REQUIRED'); setHoveredStatus('APPROVAL_REQUIRED');}}
              >
                <div className="text-2xl font-bold text-purple-800">{stats.approvalRequired}</div>
                <div className="text-sm text-purple-700">Approval Req.</div>
              </div>
              <div 
                className={`rounded-lg p-4 text-center cursor-pointer transition-all duration-200 ${
                  hoveredStatus === 'COMPLETED' ? 'bg-indigo-200 shadow-md transform scale-105' : 'bg-indigo-50 hover:bg-indigo-100'
                }`}
                onMouseEnter={() => setHoveredStatus('COMPLETED')}
                onClick={() => {setStatusFilter('COMPLETED'); setHoveredStatus('COMPLETED');}}
              >
                <div className="text-2xl font-bold text-indigo-800">{stats.completed}</div>
                <div className="text-sm text-indigo-700">Completed</div>
              </div>
              <div 
                className={`rounded-lg p-4 text-center cursor-pointer transition-all duration-200 ${
                  hoveredStatus === 'LIVE' ? 'bg-green-200 shadow-md transform scale-105' : 'bg-green-50 hover:bg-green-100'
                }`}
                onMouseEnter={() => setHoveredStatus('LIVE')}
                onClick={() => {setStatusFilter('LIVE'); setHoveredStatus('LIVE');}}
              >
                <div className="text-2xl font-bold text-green-800">{stats.live}</div>
                <div className="text-sm text-green-700">Live</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-lg font-bold text-gray-900">{formatCurrency(stats.totalEarnings, selectedCurrency)}</div>
                <div className="text-sm text-gray-600">Earnings</div>
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
                  onChange={(e) => setStatusFilter(e.target.value)}
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
              
              <div className="flex flex-col items-start space-y-2">
                <CurrencySelector
                  selectedCurrency={selectedCurrency}
                  onCurrencyChange={updateCurrency}
                  showLabel={true}
                  compact={true}
                />
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setGenreFilter('all');
                    setTypeFilter('all');
                  }}
                  className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          {filteredReleases.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
                              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Releases Found</h3>
              <p className="text-gray-500 mb-4">
                {releases.length === 0 
                  ? 'Get started by creating your first release.'
                  : 'No releases match your current filters.'
                }
              </p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
              >
                Create New Release
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredReleases.map(renderReleaseCard)}
            </div>
          )}
        </div>

        {/* Modals */}
        {isCreateModalOpen && (
          <CreateReleaseModal
            isOpen={isCreateModalOpen}
            onClose={() => {
              setIsCreateModalOpen(false);
              setSelectedRelease(null);
            }}
            onSuccess={(newRelease) => {
              setReleases(prev => [...prev, newRelease]);
              setIsCreateModalOpen(false);
              setSelectedRelease(null);
            }}
            editingRelease={selectedRelease}
            profileData={profileData}
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
      </div>
    </Layout>
  );
}