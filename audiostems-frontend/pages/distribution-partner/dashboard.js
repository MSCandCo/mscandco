import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { getUserRole, getUserBrand } from '../../lib/auth0-config';
import Layout from '../../components/layouts/mainLayout';
import { FaEye, FaEdit, FaCheckCircle, FaPlay, FaFileText, FaFilter, FaSearch, FaTimes } from 'react-icons/fa';
import { Eye, Edit, CheckCircle, Play, FileText, Filter, Search } from 'lucide-react';

// Mock data for distribution partner
const mockAllReleases = [
  {
    id: 1,
    projectName: 'Summer Vibes EP',
    artist: 'YHWH MSC',
    label: 'MSC & Co',
    releaseType: 'EP',
    genre: 'Electronic',
    status: 'submitted',
    submissionDate: '2024-01-15',
    expectedReleaseDate: '2024-02-15',
    assets: 4,
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
    label: 'MSC & Co',
    releaseType: 'Album',
    genre: 'Hip Hop',
    status: 'under_review',
    submissionDate: '2024-01-12',
    expectedReleaseDate: '2024-03-20',
    assets: 6,
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
    projectName: 'Acoustic Dreams',
    artist: 'MC Flow',
    label: 'MSC & Co',
    releaseType: 'Single',
    genre: 'Acoustic',
    status: 'completed',
    submissionDate: '2024-01-10',
    expectedReleaseDate: '2024-02-01',
    assets: 1,
    feedback: 'Approved and sent to DSPs',
    marketingPlan: 'Acoustic playlist targeting',
    trackListing: [
      { title: 'Acoustic Dreams', duration: '4:20', isrc: 'USRC12345685' }
    ],
    credits: [
      { role: 'Producer', name: 'MC Flow' }
    ],
    publishingNotes: 'Solo acoustic performance'
  },
  {
    id: 4,
    projectName: 'Electronic Fusion',
    artist: 'Studio Pro',
    label: 'MSC & Co',
    releaseType: 'EP',
    genre: 'Electronic',
    status: 'live',
    submissionDate: '2024-01-08',
    expectedReleaseDate: '2024-01-25',
    assets: 3,
    feedback: 'Live on all major platforms',
    marketingPlan: 'Electronic music promotion',
    trackListing: [
      { title: 'Fusion Beat', duration: '5:15', isrc: 'USRC12345686' },
      { title: 'Digital Dreams', duration: '4:30', isrc: 'USRC12345687' },
      { title: 'Tech Groove', duration: '6:20', isrc: 'USRC12345688' }
    ],
    credits: [
      { role: 'Producer', name: 'Studio Pro' },
      { role: 'Sound Design', name: 'Studio Pro' }
    ],
    publishingNotes: 'Electronic fusion experiment'
  }
];

// Mock data for edit requests and amendments
const mockEditRequests = [
  {
    id: 101,
    projectName: 'Completed Album',
    artist: 'YHWH MSC',
    label: 'MSC & Co',
    releaseType: 'Album',
    genre: 'Electronic',
    originalStatus: 'completed',
    requestType: 'edit_request',
    requestDate: '2024-01-20',
    requestReason: 'Artist wants to update track titles and add new artwork',
    requestDetails: 'Need to change track names and upload new cover art',
    status: 'pending_review',
    trackListing: [
      { title: 'Completed Track 1', duration: '4:20', isrc: 'USRC12345689' },
      { title: 'Completed Track 2', duration: '3:55', isrc: 'USRC12345690' },
      { title: 'Completed Track 3', duration: '4:10', isrc: 'USRC12345691' }
    ],
    credits: [
      { role: 'Producer', name: 'YHWH MSC' },
      { role: 'Mix Engineer', name: 'Studio Pro' }
    ],
    publishingNotes: 'Successfully completed album - requesting updates'
  },
  {
    id: 102,
    projectName: 'Live Single',
    artist: 'YHWH MSC',
    label: 'MSC & Co',
    releaseType: 'Single',
    genre: 'Pop',
    originalStatus: 'live',
    requestType: 'edit_request',
    requestDate: '2024-01-18',
    requestReason: 'Artist wants to update metadata and add new credits',
    requestDetails: 'Need to update artist name spelling and add new producer credit',
    status: 'pending_review',
    trackListing: [
      { title: 'Live Single Track', duration: '3:45', isrc: 'USRC12345692' }
    ],
    credits: [
      { role: 'Producer', name: 'YHWH MSC' },
      { role: 'Mastering Engineer', name: 'Master Lab' }
    ],
    publishingNotes: 'Live single performing well - requesting metadata updates'
  },
  {
    id: 103,
    projectName: 'Urban Beats Collection',
    artist: 'YHWH MSC',
    label: 'MSC & Co',
    releaseType: 'EP',
    genre: 'Hip Hop',
    originalStatus: 'under_review',
    requestType: 'amendment',
    requestDate: '2024-01-22',
    requestReason: 'Artist submitted additional tracks and updated artwork',
    requestDetails: 'Added 2 new tracks and updated cover art design',
    status: 'pending_review',
    trackListing: [
      { title: 'Urban Beat', duration: '3:30', isrc: 'USRC12345686' },
      { title: 'Street Rhythm', duration: '4:15', isrc: 'USRC12345687' },
      { title: 'City Lights', duration: '3:45', isrc: 'USRC12345688' },
      { title: 'New Track 1', duration: '3:20', isrc: 'USRC12345693' },
      { title: 'New Track 2', duration: '4:05', isrc: 'USRC12345694' }
    ],
    credits: [
      { role: 'Producer', name: 'YHWH MSC' },
      { role: 'Additional Production', name: 'Beat Maker' }
    ],
    publishingNotes: 'Urban hip hop collection - added new tracks'
  }
];

export default function DistributionPartnerDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const [activeTab, setActiveTab] = useState('all-releases');
  const [selectedRelease, setSelectedRelease] = useState(null);
  const [showReleaseDetails, setShowReleaseDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [genreFilter, setGenreFilter] = useState('all');

  const userRole = getUserRole(user);
  const userBrand = getUserBrand(user);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated || userRole !== 'distribution_partner') {
    return <div className="flex items-center justify-center min-h-screen">Access Denied</div>;
  }

  // Filter releases based on search and filters
  const filteredReleases = mockAllReleases.filter(release => {
    const matchesSearch = release.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         release.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         release.label.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || release.status === statusFilter;
    const matchesGenre = genreFilter === 'all' || release.genre === genreFilter;
    
    return matchesSearch && matchesStatus && matchesGenre;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'under_review': return 'bg-amber-100 text-amber-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'live': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'submitted': return <FileText className="w-4 h-4" />;
      case 'under_review': return <Eye className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'live': return <Play className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const handleStatusChange = (releaseId, newStatus) => {
    // In a real app, this would update the database
    console.log(`Changing release ${releaseId} status to ${newStatus}`);
  };

  const renderAllReleases = () => (
    <div className="space-y-6">
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
              <option value="submitted">Submitted</option>
              <option value="under_review">Under Review</option>
              <option value="completed">Completed</option>
              <option value="live">Live</option>
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
              <option value="Electronic">Electronic</option>
              <option value="Hip Hop">Hip Hop</option>
              <option value="Acoustic">Acoustic</option>
              <option value="Rock">Rock</option>
              <option value="Pop">Pop</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setGenreFilter('all');
              }}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Releases Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">All Releases ({filteredReleases.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Release</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Artist</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Label</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submission Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredReleases.map((release) => (
                <tr key={release.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{release.projectName}</div>
                      <div className="text-sm text-gray-500">{release.releaseType} • {release.genre}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{release.artist}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{release.label}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(release.status)}`}>
                      {getStatusIcon(release.status)}
                      <span className="ml-1">{release.status.replace('_', ' ')}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{release.submissionDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedRelease(release);
                          setShowReleaseDetails(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedRelease(release);
                          // Open edit modal
                        }}
                        className="text-gray-600 hover:text-gray-900"
                        title="Edit Release"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {release.status === 'submitted' && (
                        <button
                          onClick={() => handleStatusChange(release.id, 'under_review')}
                          className="text-amber-600 hover:text-amber-900"
                          title="Move to Under Review"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      {release.status === 'under_review' && (
                        <button
                          onClick={() => handleStatusChange(release.id, 'completed')}
                          className="text-green-600 hover:text-green-900"
                          title="Mark as Completed"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderSyncBoard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Submitted</p>
              <p className="text-2xl font-bold text-blue-600">
                {mockAllReleases.filter(r => r.status === 'submitted').length}
              </p>
            </div>
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Under Review</p>
              <p className="text-2xl font-bold text-amber-600">
                {mockAllReleases.filter(r => r.status === 'under_review').length}
              </p>
            </div>
            <Eye className="w-8 h-8 text-amber-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">
                {mockAllReleases.filter(r => r.status === 'completed').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Live</p>
              <p className="text-2xl font-bold text-purple-600">
                {mockAllReleases.filter(r => r.status === 'live').length}
              </p>
            </div>
            <Play className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Status Board */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {['submitted', 'under_review', 'completed', 'live'].map((status) => (
          <div key={status} className="bg-white rounded-lg shadow-sm border">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 capitalize">
                {status.replace('_', ' ')}
              </h3>
            </div>
            <div className="p-4">
              {mockAllReleases
                .filter(release => release.status === status)
                .map(release => (
                  <div key={release.id} className="mb-3 p-3 bg-gray-50 rounded-lg">
                    <div className="font-medium text-sm text-gray-900">{release.projectName}</div>
                    <div className="text-xs text-gray-500">{release.artist} • {release.releaseType}</div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderEditRequests = () => (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Review</p>
              <p className="text-2xl font-bold text-orange-600">
                {mockEditRequests.filter(r => r.status === 'pending_review').length}
              </p>
            </div>
            <Eye className="w-8 h-8 text-orange-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Edit Requests</p>
              <p className="text-2xl font-bold text-blue-600">
                {mockEditRequests.filter(r => r.requestType === 'edit_request').length}
              </p>
            </div>
            <Edit className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Amendments</p>
              <p className="text-2xl font-bold text-green-600">
                {mockEditRequests.filter(r => r.requestType === 'amendment').length}
              </p>
            </div>
            <FileText className="w-8 h-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Edit Requests Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Edit Requests & Amendments ({mockEditRequests.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Release</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Artist</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Original Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {mockEditRequests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{request.projectName}</div>
                      <div className="text-sm text-gray-500">{request.releaseType} • {request.genre}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{request.artist}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      request.requestType === 'edit_request' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {request.requestType === 'edit_request' ? 'Edit Request' : 'Amendment'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      request.originalStatus === 'completed' ? 'bg-green-100 text-green-800' :
                      request.originalStatus === 'live' ? 'bg-purple-100 text-purple-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {request.originalStatus.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{request.requestDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedRelease(request);
                          setShowReleaseDetails(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          console.log('Approving edit request:', request.id);
                          alert('Edit request approved and will be processed.');
                        }}
                        className="text-green-600 hover:text-green-900"
                        title="Approve Request"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          console.log('Rejecting edit request:', request.id);
                          alert('Edit request rejected.');
                        }}
                        className="text-red-600 hover:text-red-900"
                        title="Reject Request"
                      >
                        <FaTimes className="w-4 h-4" />
                      </button>
                    </div>
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
                <h1 className="text-2xl font-bold text-gray-900">Distribution Partner Dashboard</h1>
                <p className="text-sm text-gray-500">Manage and review all releases</p>
              </div>
              <div className="text-sm text-gray-500">
                Code Group Distribution
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('all-releases')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'all-releases'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                All Releases
              </button>
              <button
                onClick={() => setActiveTab('sync-board')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'sync-board'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Sync Board
              </button>
              <button
                onClick={() => setActiveTab('edit-requests')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'edit-requests'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Edit Requests
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'all-releases' && renderAllReleases()}
          {activeTab === 'sync-board' && renderSyncBoard()}
          {activeTab === 'edit-requests' && renderEditRequests()}
        </div>
      </div>
    </Layout>
  );
} 