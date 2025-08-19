import { useState, useEffect, useMemo } from 'react';
import { useUser } from '@/components/providers/SupabaseProvider';
import { getUserRoleSync, getUserBrand } from '../../lib/user-utils';
import Layout from '../../components/layouts/mainLayout';
import { FaUsers, FaMusic, FaChartLine, FaDollarSign, FaCalendar, FaEye, FaEdit, FaPlus, FaDownload, FaTimes, FaSearch, FaFilter } from 'react-icons/fa';
import { Users, Music, TrendingUp, DollarSign, Calendar, Eye, Edit, Plus, Download, Search, Filter } from 'lucide-react';
import { RELEASES, ARTISTS, DASHBOARD_STATS } from '../../lib/emptyData';
import { RELEASE_STATUSES, RELEASE_STATUS_LABELS, RELEASE_STATUS_COLORS, GENRES, getStatusLabel, getStatusColor, getStatusIcon } from '../../lib/constants';
import { downloadSingleReleaseExcel, downloadMultipleReleasesExcel } from '../../lib/excel-utils';
import CurrencySelector, { formatCurrency, useCurrencySync } from '../../components/shared/CurrencySelector';
import Link from 'next/link';
import NotificationModal from '@/components/shared/NotificationModal';
import useModals from '@/hooks/useModals';

// Excel download functions
const downloadReleaseExcel = async (release) => {
  try {
    await downloadSingleReleaseExcel(release);
  } catch (error) {
    console.error('Error downloading release:', error);
    showError('Error downloading release data. Please try again.', 'Download Error');
  }
};

const downloadAllReleasesExcel = async (releases) => {
  try {
    await downloadMultipleReleasesExcel(releases);
  } catch (error) {
    console.error('Error downloading releases:', error);
    showError('Error downloading releases data. Please try again.', 'Download Error');
  }
};

export default function LabelAdminDashboard() {
  const { user, isLoading } = useUser();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [showAddArtist, setShowAddArtist] = useState(false);
  
  // Table filtering and search states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [artistFilter, setArtistFilter] = useState('all');
  const [editingIsrc, setEditingIsrc] = useState(null);
  const [tempIsrc, setTempIsrc] = useState('');
  const [showReleaseDetails, setShowReleaseDetails] = useState(false);
  const [selectedRelease, setSelectedRelease] = useState(null);

  const userRole = getUserRoleSync();
  const userBrand = getUserBrand(user);
  
  // Currency system integration
  const [selectedCurrency, updateCurrency] = useCurrencySync('GBP');

  // Initialize modals hook
  const {
    notificationModal,
    showError,
    closeNotificationModal
  } = useModals();

  // Get approved artists for this label
  const approvedArtists = useMemo(() => {
    const labelName = userBrand?.displayName || 'YHWH MSC';
    
    // Get artists approved for this label (approvalStatus: approved, and associated with label)
    const filteredArtists = ARTISTS.filter(artist => 
      artist.approvalStatus === 'approved' && 
      artist.label === labelName
    );
    
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
          'No releases',
        avatar: artist.avatar || '🎤'
      };
    });
  }, [userBrand]);

  // Filter releases for label admin - only approved artists under this label
  const labelReleases = useMemo(() => {
    const approvedArtistIds = approvedArtists.map(artist => artist.id);
    
    // Filter releases by approved artists
    return RELEASES.filter(release => 
      approvedArtistIds.includes(release.artistId)
    );
  }, [approvedArtists]);

  // Apply search and filter logic
  const filteredReleases = useMemo(() => {
    let filtered = labelReleases;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(release =>
        release.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        release.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
        release.genre.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(release => release.status === statusFilter);
    }

    // Artist filter
    if (artistFilter !== 'all') {
      filtered = filtered.filter(release => release.artist === artistFilter);
    }

    return filtered;
  }, [labelReleases, searchTerm, statusFilter, artistFilter]);

  // Calculate label totals using centralized stats
  const labelTotals = {
    totalEarnings: DASHBOARD_STATS.labelAdmin.labelRevenue,
    totalStreams: DASHBOARD_STATS.labelAdmin.labelStreams,
    totalReleases: labelReleases.length,
    activeArtists: DASHBOARD_STATS.labelAdmin.labelArtists
  };

  // Calculate earnings data from releases
  const earningsData = useMemo(() => {
    const totalEarnings = labelReleases.reduce((sum, release) => sum + (release.earnings || 0), 0);
    const totalStreams = labelReleases.reduce((sum, release) => sum + (release.streams || 0), 0);
    
    // Calculate artist breakdown
    const artistBreakdown = approvedArtists.map(artist => {
      const artistReleases = labelReleases.filter(release => release.artistId === artist.id);
      const artistEarnings = artistReleases.reduce((sum, release) => sum + (release.earnings || 0), 0);
      const artistStreams = artistReleases.reduce((sum, release) => sum + (release.streams || 0), 0);
      
      return {
        artist: artist.name,
        earnings: artistEarnings,
        streams: artistStreams,
        releases: artistReleases.length
      };
    }).sort((a, b) => b.earnings - a.earnings);

    // Get top earning releases
    const topReleases = labelReleases
      .filter(release => release.earnings > 0)
      .sort((a, b) => b.earnings - a.earnings)
      .slice(0, 5);

    return {
      totalEarnings,
      totalStreams,
      artistBreakdown,
      topReleases,
      avgEarningsPerRelease: totalEarnings / Math.max(labelReleases.length, 1),
      avgStreamsPerRelease: totalStreams / Math.max(labelReleases.length, 1)
    };
  }, [labelReleases, approvedArtists]);

  // ISRC editing functions
  const startEditingIsrc = (releaseId, trackIndex, currentIsrc) => {
    setEditingIsrc({ releaseId, trackIndex });
    setTempIsrc(currentIsrc);
  };

  const saveIsrc = (releaseId, trackIndex) => {
    // In a real app, this would make an API call
    console.log(`Saving ISRC for release ${releaseId}, track ${trackIndex}: ${tempIsrc}`);
    setEditingIsrc(null);
    setTempIsrc('');
  };

  const cancelEditingIsrc = () => {
    setEditingIsrc(null);
    setTempIsrc('');
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  // Role check temporarily disabled - TODO: Fix role system
  // if (!user || userRole !== 'label_admin') {
  //   return <div className="flex items-center justify-center min-h-screen">Access Denied</div>;
  // }

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Label Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                              <p className="text-2xl font-bold text-gray-900">{formatCurrency(labelTotals.totalEarnings, selectedCurrency)}</p>
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
              <p className="text-sm font-medium text-gray-600">Active Artists</p>
              <p className="text-2xl font-bold text-gray-900">{labelTotals.activeArtists}</p>
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

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              {Object.entries(RELEASE_STATUSES).map(([key, value]) => (
                <option key={value} value={value}>{getStatusLabel(value)}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Approved Artists</label>
            <select
              value={artistFilter}
              onChange={(e) => setArtistFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Approved Artists</option>
              {approvedArtists.map(artist => (
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

      {/* Releases with Individual Tables (Same as Distribution Partner) */}
      <div className="space-y-8">
        {filteredReleases.map((release) => (
          <div key={release.id} className="bg-white rounded-lg shadow-sm border">
            {/* Release Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-4">
                    <h3 className="text-xl font-semibold text-gray-900">{release.projectName}</h3>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(release.status)}`}>
                      <span>{getStatusLabel(release.status)}</span>
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    <span className="font-medium">{release.artist}</span> • {release.releaseType} • {release.genre} • {release.trackListing?.length || 1} tracks
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    Submitted: {release.submissionDate} • Expected Release: {release.expectedReleaseDate}
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => downloadReleaseExcel(release)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
                    title="Download all assets for this release"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Release</span>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedRelease(release);
                      setShowReleaseDetails(true);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                    title="View release details"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View Details</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Assets Table for this Release */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Track Position</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Song Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">BPM</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Key</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ISRC</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(release.trackListing || [{ title: release.projectName, duration: '3:30', bpm: '120', songKey: 'C Major', isrc: release.isrc }]).map((track, trackIndex) => (
                    <tr key={trackIndex} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className="bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-sm font-bold">
                          {trackIndex + 1}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{track.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{track.duration || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{track.bpm || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{track.songKey || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {editingIsrc?.releaseId === release.id && editingIsrc?.trackIndex === trackIndex ? (
                          <div className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={tempIsrc}
                              onChange={(e) => setTempIsrc(e.target.value)}
                              className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                              autoFocus
                            />
                            <button
                              onClick={() => saveIsrc(release.id, trackIndex)}
                              className="text-green-600 hover:text-green-800"
                            >
                              ✓
                            </button>
                            <button
                              onClick={cancelEditingIsrc}
                              className="text-red-600 hover:text-red-800"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <span>{track.isrc || 'N/A'}</span>
                            <button
                              onClick={() => startEditingIsrc(release.id, trackIndex, track.isrc || '')}
                              className="text-blue-600 hover:text-blue-800"
                              title="Edit ISRC"
                            >
                              <Edit className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
        
        {filteredReleases.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <Music className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Releases Found</h3>
            <p className="text-gray-500">
              {searchTerm || statusFilter !== 'all' || artistFilter !== 'all'
                ? 'No releases match your current filters.'
                : 'No approved releases available for this label.'}
            </p>
          </div>
        )}
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
        {approvedArtists.map((artist) => (
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
                <p className="text-lg font-semibold text-gray-900">{formatCurrency(artist.totalEarnings, selectedCurrency)}</p>
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

  const renderEarnings = () => (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                              <p className="text-2xl font-bold text-gray-900">{formatCurrency(earningsData.totalEarnings, selectedCurrency)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Per Release</p>
                              <p className="text-2xl font-bold text-gray-900">{formatCurrency(Math.round(earningsData.avgEarningsPerRelease), selectedCurrency)}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Streams</p>
              <p className="text-2xl font-bold text-gray-900">{earningsData.totalStreams.toLocaleString()}</p>
            </div>
            <Music className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Streams/Release</p>
              <p className="text-2xl font-bold text-gray-900">{Math.round(earningsData.avgStreamsPerRelease).toLocaleString()}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/labeladmin/earnings" className="block">
          <div className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Detailed Earnings</h3>
                <p className="text-sm text-gray-500">View transactions, withdrawals & analytics</p>
              </div>
            </div>
          </div>
        </Link>

        <Link href="/labeladmin/artists" className="block">
          <div className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Artist Management</h3>
                <p className="text-sm text-gray-500">Manage artist contracts & royalties</p>
              </div>
            </div>
          </div>
        </Link>

        <Link href="/labeladmin/releases" className="block">
          <div className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Music className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Release Performance</h3>
                <p className="text-sm text-gray-500">Track release revenues & streams</p>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Top Earning Artists */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Top Earning Artists</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Artist</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Releases</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Earnings</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Streams</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {earningsData.artistBreakdown.slice(0, 5).map((artist, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{artist.artist}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{artist.releases}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(artist.earnings, selectedCurrency)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{artist.streams.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link href={`/labeladmin/artists?search=${encodeURIComponent(artist.artist)}`} className="text-blue-600 hover:text-blue-900">
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Earning Releases */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Top Earning Releases</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Release</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Artist</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Earnings</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Streams</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {earningsData.topReleases.map((release, index) => (
                <tr key={release.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{release.projectName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{release.artist}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{release.releaseType}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(release.earnings, selectedCurrency)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{release.streams.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link href={`/labeladmin/releases?search=${encodeURIComponent(release.projectName)}`} className="text-blue-600 hover:text-blue-900">
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
                <h1 className="text-2xl font-bold text-gray-900">
                  {userBrand?.displayName || 'YHWH MSC'} - Label Management Dashboard
                </h1>
                <p className="text-sm text-gray-500">Manage your artists and releases</p>
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
          {activeTab === 'earnings' && renderEarnings()}
        </div>
      </div>
            {/* Branded Modals */}
        <NotificationModal
          isOpen={notificationModal.isOpen}
          onClose={closeNotificationModal}
          title={notificationModal.title}
          message={notificationModal.message}
          type={notificationModal.type}
          buttonText={notificationModal.buttonText}
        />
      </Layout>
    );
  } 