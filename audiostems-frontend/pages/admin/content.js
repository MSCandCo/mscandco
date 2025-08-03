import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useRouter } from 'next/router';
import { 
  Music, Users, FileText, Search, Filter, Plus, Edit, Trash2, Eye,
  TrendingUp, Download, Settings, BarChart3, Play, Pause, Globe,
  CheckCircle, Clock, AlertCircle, User
} from 'lucide-react';
import MainLayout from '@/components/layouts/mainLayout';
import SEO from '@/components/seo';
import CurrencySelector, { formatCurrency, useCurrencySync } from '@/components/shared/CurrencySelector';
import { ARTISTS, RELEASES, SONGS } from '@/lib/mockData';
import { getUserRole } from '@/lib/auth0-config';
import { RELEASE_STATUSES, RELEASE_STATUS_LABELS } from '@/lib/constants';
import { Avatar } from '@/components/shared/Avatar';
import { SuccessModal } from '@/components/shared/SuccessModal';

export default function AdminContentPage() {
  const { user, isLoading, isAuthenticated } = useAuth0();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedCurrency, updateCurrency] = useCurrencySync('GBP');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [playingAsset, setPlayingAsset] = useState(null);

  // Get user role
  const userRole = getUserRole(user);

  // Check admin access
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      const role = getUserRole(user);
      if (!['super_admin', 'company_admin'].includes(role)) {
        router.push('/dashboard');
        return;
      }
      setLoading(false);
    }
  }, [isAuthenticated, isLoading, user, router]);

  // Filter content based on user role
  const getFilteredData = () => {
    if (userRole === 'company_admin') {
      // Company admins see only artists and label admins content
      const filteredArtists = ARTISTS.filter(artist => ['artist', 'label_admin'].includes(artist.role) || artist.role === undefined);
      const filteredReleases = RELEASES.filter(release => {
        // Include releases from artists or those marked for company admin view
        return filteredArtists.some(artist => artist.name === release.artist) || release.companyAdminView;
      });
      return { artists: filteredArtists, releases: filteredReleases, songs: SONGS };
    }
    return { artists: ARTISTS, releases: RELEASES, songs: SONGS };
  };

  const { artists, releases, songs } = getFilteredData();

  // Content statistics
  const contentStats = {
    totalSongs: songs.length,
    totalArtists: artists.length,
    totalReleases: releases.length,
    activeReleases: releases.filter(r => r.status === RELEASE_STATUSES.LIVE).length,
    pendingReleases: releases.filter(r => r.status === RELEASE_STATUSES.UNDER_REVIEW).length,
    totalStreams: SONGS.reduce((sum, song) => sum + (song.streams || 0), 0),
    totalRevenue: ARTISTS.reduce((sum, artist) => sum + (artist.totalEarnings || 0), 0)
  };

  // Filter content based on search and status
  const filteredReleases = releases.filter(release => {
    const matchesSearch = release.projectName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         release.artist?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         release.genre?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || release.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredArtistsForDisplay = artists.filter(artist => {
    const matchesSearch = artist.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         artist.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         artist.genre?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const filteredSongs = songs.filter(song => {
    const matchesSearch = song.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         song.artist?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         song.releaseName?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Handle actions
  const handleAction = (action, item) => {
    if (action === 'View Details' || action === 'View Profile') {
      setSelectedItem(item);
      setShowDetailsModal(true);
    } else {
      console.log(`${action} action for:`, item);
      setSuccessMessage(`${action} completed successfully!`);
      setShowSuccessModal(true);
    }
  };

  // Handle asset playback
  const handlePlayAsset = (asset) => {
    if (playingAsset === asset.id) {
      setPlayingAsset(null);
    } else {
      setPlayingAsset(asset.id);
      // In a real app, this would trigger audio playback
      console.log('Playing asset:', asset.title);
    }
  };

  // Loading state
  if (isLoading || loading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading content management...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Group content by label for overview
  const getContentByLabel = () => {
    const labelGroups = {};
    
    artists.forEach(artist => {
      const label = artist.label || 'Independent';
      if (!labelGroups[label]) {
        labelGroups[label] = {
          name: label,
          artists: [],
          releases: [],
          songs: [],
          totalStreams: 0,
          totalRevenue: 0
        };
      }
      labelGroups[label].artists.push(artist);
    });

    releases.forEach(release => {
      const label = release.label || 'Independent';
      if (!labelGroups[label]) {
        labelGroups[label] = {
          name: label,
          artists: [],
          releases: [],
          songs: [],
          totalStreams: 0,
          totalRevenue: 0
        };
      }
      labelGroups[label].releases.push(release);
      labelGroups[label].totalStreams += release.streams || 0;
      labelGroups[label].totalRevenue += release.earnings || 0;
    });

    songs.forEach(song => {
      const label = song.label || 'Independent';
      if (labelGroups[label]) {
        labelGroups[label].songs.push(song);
      }
    });

    return Object.values(labelGroups);
  };

  // Tab content renderer
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'releases':
        return renderReleases();
      case 'artists':
        return renderArtists();
      case 'assets':
        return renderAssets();
      default:
        return renderOverview();
    }
  };

  const renderOverview = () => {
    const labelData = getContentByLabel();
    
    return (
      <div className="space-y-8">
        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Assets</p>
                <p className="text-3xl font-bold text-gray-900">{contentStats.totalSongs}</p>
                <p className="text-sm text-green-600 flex items-center mt-2">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  +12% this month
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <Music className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Artists</p>
                <p className="text-3xl font-bold text-gray-900">{contentStats.totalArtists}</p>
                <p className="text-sm text-green-600 flex items-center mt-2">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  +8% this month
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <Users className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Streams</p>
                <p className="text-3xl font-bold text-gray-900">{contentStats.totalStreams.toLocaleString()}</p>
                <p className="text-sm text-green-600 flex items-center mt-2">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  +25% this month
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <BarChart3 className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(contentStats.totalRevenue, selectedCurrency)}</p>
                <p className="text-sm text-green-600 flex items-center mt-2">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  +18% this month
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-xl">
                <Download className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Content by Label */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Content Overview by Label</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Label Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Artists</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Releases</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assets</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Streams</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {labelData.map((label, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{label.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {label.artists.length}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {label.releases.length}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {label.songs.length}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {label.totalStreams.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(label.totalRevenue, selectedCurrency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // Group releases by release name
  const getGroupedReleases = () => {
    const grouped = {};
    filteredReleases.forEach(release => {
      const key = release.projectName;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(release);
    });
    return grouped;
  };

  const renderReleases = () => {
    const groupedReleases = getGroupedReleases();
    
    return (
      <div className="space-y-6">
        {Object.entries(groupedReleases).map(([releaseName, releaseGroup]) => {
          const mainRelease = releaseGroup[0];
          return (
            <div key={releaseName} className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{releaseName}</h3>
                    <p className="text-sm text-gray-500">by {mainRelease.artist}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      mainRelease.status === RELEASE_STATUSES.LIVE ? 'bg-green-100 text-green-800' :
                      mainRelease.status === RELEASE_STATUSES.UNDER_REVIEW ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {RELEASE_STATUS_LABELS[mainRelease.status] || mainRelease.status}
                    </span>
                    <button
                      onClick={() => handleAction('View Details', mainRelease)}
                      className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View Details
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Release Details */}
              <div className="px-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Genre</p>
                    <p className="text-sm text-gray-900">{mainRelease.genre}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Release Date</p>
                    <p className="text-sm text-gray-900">{mainRelease.releaseDate || 'TBD'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Streams</p>
                    <p className="text-sm text-gray-900">{(mainRelease.streams || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Earnings</p>
                    <p className="text-sm text-gray-900">{formatCurrency(mainRelease.earnings || 0, selectedCurrency)}</p>
                  </div>
                </div>
                
                {/* Track Listing */}
                {mainRelease.trackListing && mainRelease.trackListing.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Track Listing</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ISRC</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">BPM</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Key</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {mainRelease.trackListing.map((track, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm text-gray-900">{track.title}</td>
                              <td className="px-4 py-3 text-sm text-gray-500">{track.duration}</td>
                              <td className="px-4 py-3 text-sm text-gray-500 font-mono">{track.isrc}</td>
                              <td className="px-4 py-3 text-sm text-gray-500">{track.bpm}</td>
                              <td className="px-4 py-3 text-sm text-gray-500">{track.songKey}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderArtists = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Artists</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Artist</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Genre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Releases</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Streams</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredArtistsForDisplay.map((artist, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Avatar name={artist.name} size="w-10 h-10" />
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{artist.name}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{artist.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{artist.genre || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    artist.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {artist.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{artist.releases || 0}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{(artist.totalStreams || 0).toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    onClick={() => handleAction('View Profile', artist)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleAction('Edit Artist', artist)}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderAssets = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Assets</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Artist</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Release</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ISRC</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Streams</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Earnings</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredSongs.map((song, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <button
                      onClick={() => handlePlayAsset(song)}
                      className={`mr-3 p-2 rounded-full ${
                        playingAsset === song.id 
                          ? 'bg-blue-100 text-blue-600' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {playingAsset === song.id ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </button>
                    <div className="text-sm font-medium text-gray-900">{song.title}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{song.artist}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{song.releaseName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{song.duration}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{song.isrc}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{(song.streams || 0).toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(song.earnings || 0, selectedCurrency)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleAction('View Details', song)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Details Modal Component - Distribution Partner Style View
  const DetailsModal = () => {
    if (!showDetailsModal || !selectedItem) return null;

    const isRelease = selectedItem.projectName;
    const isAsset = selectedItem.title && selectedItem.duration;
    const isArtist = selectedItem.name && selectedItem.email;

    if (isRelease) {
      return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto border w-11/12 md:w-5/6 lg:w-4/5 shadow-lg rounded-md bg-white max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-6 bg-white border-b border-gray-200 sticky top-0 z-10">
              <h3 className="text-lg font-semibold text-gray-900">Release Details - {selectedItem.projectName}</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="ml-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="space-y-6">
              {/* Basic Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-md font-semibold text-gray-900 mb-3">Basic Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Project Name</label>
                    <p className="text-sm text-gray-900">{selectedItem.projectName || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Artist Name</label>
                    <p className="text-sm text-gray-900">{selectedItem.artist || selectedItem.artistName || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Label</label>
                    <p className="text-sm text-gray-900">{selectedItem.label || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Release Type</label>
                    <p className="text-sm text-gray-900">{selectedItem.releaseType || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Genre</label>
                    <p className="text-sm text-gray-900">{selectedItem.genre || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Sub Genre</label>
                    <p className="text-sm text-gray-900">{selectedItem.subGenre || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      selectedItem.status === RELEASE_STATUSES.LIVE ? 'bg-green-100 text-green-800' :
                      selectedItem.status === RELEASE_STATUSES.UNDER_REVIEW ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {RELEASE_STATUS_LABELS[selectedItem.status] || selectedItem.status}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Number of Tracks</label>
                    <p className="text-sm text-gray-900">{selectedItem.trackListing?.length || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Submission Date</label>
                    <p className="text-sm text-gray-900">{selectedItem.submissionDate || selectedItem.created || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Audio Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-md font-semibold text-gray-900 mb-3">Audio Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Duration</label>
                    <p className="text-sm text-gray-900">{selectedItem.duration || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">BPM</label>
                    <p className="text-sm text-gray-900">{selectedItem.bpm || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Song Key</label>
                    <p className="text-sm text-gray-900">{selectedItem.songKey || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Language</label>
                    <p className="text-sm text-gray-900">{selectedItem.language || 'English'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Explicit</label>
                    <p className="text-sm text-gray-900">{selectedItem.explicit || 'No'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">File Type</label>
                    <p className="text-sm text-gray-900">{selectedItem.fileType || 'WAV'}</p>
                  </div>
                </div>
              </div>

              {/* Product Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-md font-semibold text-gray-900 mb-3">Product Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">ISRC</label>
                    <p className="text-sm text-gray-900 font-mono">{selectedItem.isrc || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">UPC</label>
                    <p className="text-sm text-gray-900 font-mono">{selectedItem.upc || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Catalogue No.</label>
                    <p className="text-sm text-gray-900">{selectedItem.catalogueNo || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Barcode</label>
                    <p className="text-sm text-gray-900">{selectedItem.barcode || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">ISWC</label>
                    <p className="text-sm text-gray-900">{selectedItem.iswc || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Format</label>
                    <p className="text-sm text-gray-900">{selectedItem.format || 'Digital'}</p>
                  </div>
                </div>
              </div>

              {/* Release Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-md font-semibold text-gray-900 mb-3">Release Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Release Date</label>
                    <p className="text-sm text-gray-900">{selectedItem.releaseDate || selectedItem.expectedReleaseDate || 'TBD'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Pre-Release Date</label>
                    <p className="text-sm text-gray-900">{selectedItem.preReleaseDate || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Recording Country</label>
                    <p className="text-sm text-gray-900">{selectedItem.recordingCountry || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Territory</label>
                    <p className="text-sm text-gray-900">{selectedItem.territory || 'Worldwide'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Distribution Status</label>
                    <p className="text-sm text-gray-900">{selectedItem.distributionStatus || 'Pending'}</p>
                  </div>
                </div>
              </div>

              {/* Performance Data */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-md font-semibold text-gray-900 mb-3">Performance Data</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Total Streams</label>
                    <p className="text-sm text-gray-900">{(selectedItem.streams || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Total Earnings</label>
                    <p className="text-sm text-gray-900">{formatCurrency(selectedItem.earnings || 0, selectedCurrency)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Downloads</label>
                    <p className="text-sm text-gray-900">{(selectedItem.downloads || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Playlist Adds</label>
                    <p className="text-sm text-gray-900">{(selectedItem.playlistAdds || 0).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Track Listing */}
              {selectedItem.trackListing && selectedItem.trackListing.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-md font-semibold text-gray-900 mb-3">Track Listing</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ISRC</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">BPM</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Key</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedItem.trackListing.map((track, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-900">{track.title}</td>
                            <td className="px-4 py-3 text-sm text-gray-500">{track.duration}</td>
                            <td className="px-4 py-3 text-sm text-gray-500 font-mono">{track.isrc}</td>
                            <td className="px-4 py-3 text-sm text-gray-500">{track.bpm}</td>
                            <td className="px-4 py-3 text-sm text-gray-500">{track.songKey}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Publishing Notes & Feedback */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-md font-semibold text-gray-900 mb-3">Additional Information</h4>
                <div className="space-y-4">
                  {selectedItem.publishingNotes && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Publishing Notes</label>
                      <p className="text-sm text-gray-900 mt-1">{selectedItem.publishingNotes}</p>
                    </div>
                  )}
                  {selectedItem.feedback && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Feedback</label>
                      <p className="text-sm text-gray-900 mt-1">{selectedItem.feedback}</p>
                    </div>
                  )}
                  {selectedItem.marketingPlan && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Marketing Plan</label>
                      <p className="text-sm text-gray-900 mt-1">{selectedItem.marketingPlan}</p>
                    </div>
                  )}
                </div>
              </div>
              </div>
            </div>
            
            <div className="p-6 bg-white border-t border-gray-200 sticky bottom-0">
              <div className="flex justify-center">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-6 py-2 bg-gray-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Comprehensive Asset Details Modal
    if (isAsset) {
      return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto border w-11/12 md:w-5/6 lg:w-4/5 shadow-lg rounded-md bg-white max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-6 bg-white border-b border-gray-200 sticky top-0 z-10">
              <h3 className="text-lg font-semibold text-gray-900">Asset Details - {selectedItem.title}</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="ml-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-md font-semibold text-gray-900 mb-3">Basic Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Track Title</label>
                      <p className="text-sm text-gray-900">{selectedItem.title || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Artist Name</label>
                      <p className="text-sm text-gray-900">{selectedItem.artist || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Release</label>
                      <p className="text-sm text-gray-900">{selectedItem.releaseName || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Genre</label>
                      <p className="text-sm text-gray-900">{selectedItem.genre || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Duration</label>
                      <p className="text-sm text-gray-900">{selectedItem.duration || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">ISRC</label>
                      <p className="text-sm text-gray-900 font-mono">{selectedItem.isrc || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Performance Data */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-md font-semibold text-gray-900 mb-3">Performance Analytics</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Total Streams</label>
                      <p className="text-sm text-gray-900 font-bold">{(selectedItem.streams || 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Total Earnings</label>
                      <p className="text-sm text-gray-900 font-bold">{formatCurrency(selectedItem.earnings || 0, selectedCurrency)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Downloads</label>
                      <p className="text-sm text-gray-900">{(Math.floor((selectedItem.streams || 0) * 0.1)).toLocaleString()}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Playlist Adds</label>
                      <p className="text-sm text-gray-900">{(Math.floor((selectedItem.streams || 0) * 0.05)).toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Technical Details */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-md font-semibold text-gray-900 mb-3">Technical Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">BPM</label>
                      <p className="text-sm text-gray-900">{selectedItem.bpm || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Song Key</label>
                      <p className="text-sm text-gray-900">{selectedItem.songKey || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">File Format</label>
                      <p className="text-sm text-gray-900">WAV/MP3</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Sample Rate</label>
                      <p className="text-sm text-gray-900">44.1 kHz</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Bit Depth</label>
                      <p className="text-sm text-gray-900">16-bit</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Channels</label>
                      <p className="text-sm text-gray-900">Stereo</p>
                    </div>
                  </div>
                </div>

                {/* Platform Distribution */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-md font-semibold text-gray-900 mb-3">Platform Distribution</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Spotify</label>
                      <p className="text-sm text-gray-900">✅ Live - {Math.floor((selectedItem.streams || 0) * 0.4).toLocaleString()} streams</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Apple Music</label>
                      <p className="text-sm text-gray-900">✅ Live - {Math.floor((selectedItem.streams || 0) * 0.25).toLocaleString()} streams</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">YouTube Music</label>
                      <p className="text-sm text-gray-900">✅ Live - {Math.floor((selectedItem.streams || 0) * 0.15).toLocaleString()} streams</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Amazon Music</label>
                      <p className="text-sm text-gray-900">✅ Live - {Math.floor((selectedItem.streams || 0) * 0.1).toLocaleString()} streams</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Deezer</label>
                      <p className="text-sm text-gray-900">✅ Live - {Math.floor((selectedItem.streams || 0) * 0.05).toLocaleString()} streams</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Tidal</label>
                      <p className="text-sm text-gray-900">✅ Live - {Math.floor((selectedItem.streams || 0) * 0.05).toLocaleString()} streams</p>
                    </div>
                  </div>
                </div>

                {/* Copyright Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-md font-semibold text-gray-900 mb-3">Copyright & Publishing</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Copyright Year</label>
                      <p className="text-sm text-gray-900">{new Date().getFullYear()}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">℗ P Line</label>
                      <p className="text-sm text-gray-900">℗ {new Date().getFullYear()} {selectedItem.artist}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">© C Line</label>
                      <p className="text-sm text-gray-900">© {new Date().getFullYear()} {selectedItem.artist}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">PRO</label>
                      <p className="text-sm text-gray-900">ASCAP</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Publisher</label>
                      <p className="text-sm text-gray-900">Self-Published</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Territory</label>
                      <p className="text-sm text-gray-900">Worldwide</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 bg-white border-t border-gray-200 sticky bottom-0">
              <div className="flex justify-center">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-6 py-2 bg-gray-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Fallback for artists (simple view)
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
          <div className="mt-3">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {selectedItem.title || selectedItem.name} - Details
              </h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {Object.entries(selectedItem).map(([key, value]) => {
                if (key === 'id' || value === null || value === undefined) return null;
                
                return (
                  <div key={key} className="grid grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-gray-500 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </dt>
                    <dd className="text-sm text-gray-900 col-span-2">
                      {Array.isArray(value) ? value.join(', ') : 
                       typeof value === 'object' ? JSON.stringify(value, null, 2) : 
                       value.toString()}
                    </dd>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 bg-gray-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <MainLayout>
      <SEO 
        title="Content Management - Admin Dashboard"
        description="Comprehensive content management for artists, releases, and assets"
      />
      
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Content Management</h1>
                <p className="mt-1 text-sm text-gray-500">
                  {userRole === 'company_admin' ? 'Manage and overview content for artists and label administrators' : 'Comprehensive platform content management'}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <CurrencySelector 
                  selectedCurrency={selectedCurrency}
                  onCurrencyChange={updateCurrency}
                />
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div className="flex-1 max-w-lg">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search content..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value={RELEASE_STATUSES.DRAFT}>Draft</option>
                  <option value={RELEASE_STATUSES.SUBMITTED}>Submitted</option>
                  <option value={RELEASE_STATUSES.UNDER_REVIEW}>In Review</option>
                  <option value={RELEASE_STATUSES.APPROVAL_REQUIRED}>Approvals</option>
                  <option value={RELEASE_STATUSES.LIVE}>Live</option>
                </select>
              </div>
            </div>
          </div>

          {/* Content Tabs */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6" aria-label="Tabs">
                {[
                  { id: 'overview', label: 'Overview', icon: BarChart3 },
                  { id: 'releases', label: 'Releases', icon: FileText },
                  { id: 'artists', label: 'Artists', icon: Users },
                  { id: 'assets', label: 'Assets', icon: Music }
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {label}
                  </button>
                ))}
              </nav>
            </div>
            
            {/* Tab Content */}
            <div className="p-6">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <DetailsModal />
      {showSuccessModal && (
        <SuccessModal 
          message={successMessage}
          onClose={() => setShowSuccessModal(false)}
        />
      )}
    </MainLayout>
  );
}