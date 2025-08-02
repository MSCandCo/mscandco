import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { getUserRole, getUserBrand } from '../../lib/auth0-config';
import Layout from '../../components/layouts/mainLayout';
import { FaEye, FaEdit, FaPlay, FaCheckCircle, FaFileText, FaFilter, FaSearch } from 'react-icons/fa';
import { Eye, Edit, Play, CheckCircle, FileText, Filter, Search, Plus } from 'lucide-react';
import CurrencySelector, { formatCurrency, useCurrencySync } from '../../components/shared/CurrencySelector';

// Import centralized mock data
import { RELEASES, ARTISTS, DASHBOARD_STATS } from '../../lib/mockData';
import { RELEASE_STATUSES, RELEASE_STATUS_LABELS, RELEASE_STATUS_COLORS, getStatusLabel, getStatusColor, getStatusIcon } from '../../lib/constants';
import { downloadSingleReleaseExcel, downloadMultipleReleasesExcel } from '../../lib/excel-utils';
import CreateReleaseModal from '../../components/releases/CreateReleaseModal';

// Excel download functions
const downloadReleaseExcel = async (release) => {
  try {
    await downloadSingleReleaseExcel(release);
  } catch (error) {
    console.error('Error downloading release:', error);
    alert('Error downloading release data. Please try again.');
  }
};

export default function LabelAdminReleases() {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const [selectedRelease, setSelectedRelease] = useState(null);
  const [showReleaseDetails, setShowReleaseDetails] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [artistFilter, setArtistFilter] = useState('all');
  const [selectedCurrency, updateCurrency] = useCurrencySync('GBP');


  const userRole = getUserRole(user);
  const userBrand = getUserBrand(user);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated || userRole !== 'label_admin') {
    return <div className="flex items-center justify-center min-h-screen">Access Denied</div>;
  }

  // Get approved artists for this label
  const approvedArtists = ARTISTS.filter(artist => 
    artist.status === 'active' && 
    (artist.label === userBrand?.displayName || artist.brand === userBrand?.displayName || 'MSC & Co')
  );

  // Filter releases for label admin - only approved artists under this label
  const labelReleases = RELEASES.filter(release => {
    const approvedArtistIds = approvedArtists.map(artist => artist.id);
    return approvedArtistIds.includes(release.artistId);
  });

  // Apply search and filter logic
  const filteredReleases = labelReleases.filter(release => {
    const matchesSearch = release.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         release.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         release.genre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || release.status === statusFilter;
    const matchesArtist = artistFilter === 'all' || release.artist === artistFilter;
    
    return matchesSearch && matchesStatus && matchesArtist;
  });

  // Calculate label totals using centralized stats
  const labelTotals = {
    totalReleases: labelReleases.length,
    totalEarnings: DASHBOARD_STATS.labelAdmin.labelRevenue,
    totalStreams: DASHBOARD_STATS.labelAdmin.labelStreams,
    activeArtists: approvedArtists.length
  };

  // Get unique artists for filter
  const uniqueArtists = [...new Set(labelReleases.map(release => release.artist))];



  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          
          {/* Release Details Modal */}
          {showReleaseDetails && selectedRelease && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
              <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
                <div className="mt-3">
                  {/* Modal Header */}
                  <div className="flex items-center justify-between pb-4 border-b">
                    <h3 className="text-2xl font-bold text-gray-900">{selectedRelease.projectName}</h3>
                    <button
                      onClick={() => {
                        setShowReleaseDetails(false);
                        setSelectedRelease(null);
                      }}
                      className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                    >
                      ×
                    </button>
                  </div>

                  {/* Release Information */}
                  <div className="py-6 space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">Release Information</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-700">Artist:</span>
                            <span className="text-gray-900">{selectedRelease.artist}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-700">Release Type:</span>
                            <span className="text-gray-900">{selectedRelease.releaseType}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-700">Genre:</span>
                            <span className="text-gray-900">{selectedRelease.genre}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-700">Status:</span>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedRelease.status)}`}>
                              {getStatusIcon(selectedRelease.status)}
                              <span className="ml-1">{getStatusLabel(selectedRelease.status)}</span>
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-700">Total Tracks:</span>
                            <span className="text-gray-900">{selectedRelease.trackListing?.length || 1}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">Dates & Timeline</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-700">Submission Date:</span>
                            <span className="text-gray-900">{selectedRelease.submissionDate}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-700">Expected Release:</span>
                            <span className="text-gray-900">{selectedRelease.expectedReleaseDate}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-700">Created:</span>
                            <span className="text-gray-900">{selectedRelease.createdAt || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-700">Last Updated:</span>
                            <span className="text-gray-900">{selectedRelease.updatedAt || 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Performance Metrics */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Performance Metrics</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{selectedRelease.totalStreams?.toLocaleString() || '0'}</div>
                            <div className="text-sm text-blue-700">Total Streams</div>
                          </div>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{formatCurrency(selectedRelease.totalRevenue || 0, selectedCurrency)}</div>
                            <div className="text-sm text-green-700">Total Revenue</div>
                          </div>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">{selectedRelease.platformCount || '8'}</div>
                            <div className="text-sm text-purple-700">Platforms</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Track Listing */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Track Listing</h4>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">BPM</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Key</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ISRC</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {(selectedRelease.trackListing || [{ title: selectedRelease.projectName, duration: '3:30', bpm: '120', songKey: 'C Major', isrc: selectedRelease.isrc }]).map((track, index) => (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-sm font-medium text-gray-900">{index + 1}</td>
                                <td className="px-4 py-3 text-sm text-gray-900">{track.title}</td>
                                <td className="px-4 py-3 text-sm text-gray-900">{track.duration || 'N/A'}</td>
                                <td className="px-4 py-3 text-sm text-gray-900">{track.bpm || 'N/A'}</td>
                                <td className="px-4 py-3 text-sm text-gray-900">{track.songKey || 'N/A'}</td>
                                <td className="px-4 py-3 text-sm text-gray-900 font-mono text-xs">{track.isrc || selectedRelease.isrc || 'N/A'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Additional Information */}
                    {(selectedRelease.description || selectedRelease.marketingPlan || selectedRelease.feedback) && (
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">Additional Information</h4>
                        <div className="space-y-4">
                          {selectedRelease.description && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                              <p className="text-sm text-gray-600 p-3 bg-gray-50 rounded-lg">{selectedRelease.description}</p>
                            </div>
                          )}
                          {selectedRelease.marketingPlan && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Marketing Plan</label>
                              <p className="text-sm text-gray-600 p-3 bg-gray-50 rounded-lg">{selectedRelease.marketingPlan}</p>
                            </div>
                          )}
                          {selectedRelease.feedback && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Feedback</label>
                              <p className="text-sm text-gray-600 p-3 bg-gray-50 rounded-lg">{selectedRelease.feedback}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Modal Footer */}
                  <div className="flex justify-end space-x-3 pt-4 border-t">
                    <button
                      onClick={() => downloadReleaseExcel(selectedRelease)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Download Excel</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowReleaseDetails(false);
                        setSelectedRelease(null);
                      }}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">All Releases</h1>
                <p className="mt-2 text-sm text-gray-600">
                  Manage and track all releases from your label artists
                </p>
              </div>
              <div className="flex items-center gap-4">
                <CurrencySelector 
                  selectedCurrency={selectedCurrency}
                  onCurrencyChange={updateCurrency}
                  compact={true}
                  showLabel={false}
                />
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Release
                </button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
                  <p className="text-sm font-medium text-gray-600">Active Artists</p>
                  <p className="text-2xl font-bold text-gray-900">{labelTotals.activeArtists}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                                  <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(labelTotals.totalEarnings, selectedCurrency)}</p>
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
                          {getStatusIcon(release.status)}
                          <span className="ml-1">{getStatusLabel(release.status)}</span>
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
                        <FileText className="w-4 h-4" />
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
                            <span className="font-mono text-xs">{track.isrc || release.isrc || 'N/A'}</span>
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
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Releases Found</h3>
                <p className="text-gray-500">
                  {searchTerm || statusFilter !== 'all' || artistFilter !== 'all'
                    ? 'No releases match your current filters.'
                    : 'No releases available for this label.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Release Modal */}
      <CreateReleaseModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        userRole={userRole}
      />
    </Layout>
  );
}