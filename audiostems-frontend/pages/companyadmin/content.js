import { useState, useEffect } from 'react';
import { useUser } from '@/components/providers/SupabaseProvider';
import { useRouter } from 'next/router';
import { 
  Music, Play, Eye, Download, Filter, Search,
  Building2, Users, Calendar, TrendingUp, DollarSign
} from 'lucide-react';
import MainLayout from '@/components/layouts/mainLayout';
import SEO from '@/components/seo';
import CurrencySelector, { formatCurrency, useCurrencySync } from '@/components/shared/CurrencySelector';
import { getReleases, getUsers } from '@/lib/emptyData';
import { getUserRole } from '@/lib/user-utils';
import { RELEASE_STATUS_LABELS } from '@/lib/constants';

export default function CompanyAdminContentPage() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [selectedCurrency, updateCurrency] = useCurrencySync('GBP');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [labelFilter, setLabelFilter] = useState('all');
  const [showDetails, setShowDetails] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeTab, setActiveTab] = useState('releases');

  // Get user role
  const userRole = getUserRole(user);

  // Get all data
  const allReleases = getReleases();
  const allUsers = getUsers();
  const artists = allUsers.filter(u => u.role === 'artist');
  const labelAdmins = allUsers.filter(u => u.role === 'label_admin');

  // Check admin access
  useEffect(() => {
    if (!isLoading && user) {
      const role = getUserRole(user);
      if (role !== 'company_admin') {
        router.push('/dashboard');
        return;
      }
      setLoading(false);
    } else if (!isLoading && !user) {
      router.push('/login');
    }
  }, [isLoading, user, user, router]);

  // Group releases by label
  const releasesByLabel = allReleases.reduce((acc, release) => {
    const label = release.label || 'MSC & Co MSC';
    if (!acc[label]) {
      acc[label] = [];
    }
    acc[label].push(release);
    return acc;
  }, {});

  // Get unique labels for filter
  const uniqueLabels = Object.keys(releasesByLabel);

  // Filter releases (with null safety)
  const filteredReleases = allReleases.filter(release => {
    if (!release) return false;
    
    const matchesSearch = (release.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (release.artist || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ((release.label || '').toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || release.status === statusFilter;
    const matchesLabel = labelFilter === 'all' || (release.label || 'MSC & Co MSC') === labelFilter;
    
    return matchesSearch && matchesStatus && matchesLabel;
  });

  // Calculate content statistics
  const contentStats = {
    totalAssets: allReleases.reduce((total, release) => total + (release.trackListing?.length || 1), 0),
    activeArtists: artists.filter(a => a.status === 'active').length,
    totalStreams: allReleases.reduce((total, release) => total + (release.totalStreams || 0), 0),
    totalRevenue: allReleases.reduce((total, release) => total + (release.revenue || 0), 0)
  };

  const handleViewDetails = (item, type) => {
    setSelectedItem({ ...item, type });
    setShowDetails(true);
  };

  const getStatusColor = (status) => {
    const colors = {
      'draft': 'bg-gray-100 text-gray-800',
      'submitted': 'bg-yellow-100 text-yellow-800',
      'in_review': 'bg-blue-100 text-blue-800',
      'approvals': 'bg-purple-100 text-purple-800',
      'live': 'bg-green-100 text-green-800',
      'distributed': 'bg-green-100 text-green-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getArtistStatus = (artistName) => {
    const artist = artists.find(a => a.name === artistName);
    return artist?.status || 'unknown';
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <SEO 
        title="Content Management - Company Admin"
        description="Manage releases and assets across all labels and artists"
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Content Management</h1>
            <p className="text-gray-600 mt-2">Manage releases and assets across all labels and artists</p>
          </div>
          <div className="flex items-center space-x-4">
            <CurrencySelector 
              selectedCurrency={selectedCurrency}
              onCurrencyChange={updateCurrency}
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-600 mb-2">Total Assets</p>
                <p className="font-bold text-blue-600 text-3xl">
                  {contentStats.totalAssets}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <Music className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-600 mb-2">Active Artists</p>
                <p className="font-bold text-green-600 text-3xl">
                  {contentStats.activeArtists}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <Users className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-600 mb-2">Total Streams</p>
                <p className="font-bold text-purple-600 text-3xl">
                  {contentStats.totalStreams.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-600 mb-2">Total Revenue</p>
                <p className="font-bold text-purple-600 text-3xl">
                  {formatCurrency(contentStats.totalRevenue, selectedCurrency)}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <DollarSign className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search releases, artists..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="submitted">Submitted</option>
                <option value="in_review">In Review</option>
                <option value="approvals">Approvals</option>
                <option value="live">Live</option>
                <option value="distributed">Distributed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Label</label>
              <select
                value={labelFilter}
                onChange={(e) => setLabelFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Labels</option>
                {uniqueLabels.map(label => (
                  <option key={label} value={label}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">View</label>
              <div className="flex rounded-lg border border-gray-300 overflow-hidden">
                <button
                  onClick={() => setActiveTab('releases')}
                  className={`flex-1 py-2 px-4 text-sm font-medium ${
                    activeTab === 'releases' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Releases
                </button>
                <button
                  onClick={() => setActiveTab('assets')}
                  className={`flex-1 py-2 px-4 text-sm font-medium ${
                    activeTab === 'assets' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Assets
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {activeTab === 'releases' ? 'Release' : 'Asset'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Artist</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Label</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Artist Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {activeTab === 'releases' ? (
                  filteredReleases.map((release) => (
                    <tr key={release.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <img
                              className="h-10 w-10 rounded-lg object-cover"
                              src={release.coverArt || '/placeholder-album.jpg'}
                              alt={release.title}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{release.title}</div>
                            <div className="text-sm text-gray-500">
                              {release.trackListing?.length || 1} track{(release.trackListing?.length || 1) !== 1 ? 's' : ''}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {release.artist}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {release.label || 'MSC & Co MSC'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(release.status)}`}>
                          {RELEASE_STATUS_LABELS[release.status] || release.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          getArtistStatus(release.artist) === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {getArtistStatus(release.artist) === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(release.revenue || 0, selectedCurrency)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleViewDetails(release, 'release')}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {release.audioFile && (
                            <button
                              className="text-green-600 hover:text-green-900 p-1 rounded"
                              title="Play"
                            >
                              <Play className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  filteredReleases.flatMap(release => 
                    (release.trackListing || [{ title: release.title, duration: '3:45' }]).map((track, index) => (
                      <tr key={`${release.id}-${index}`} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <img
                                className="h-10 w-10 rounded-lg object-cover"
                                src={release.coverArt || '/placeholder-album.jpg'}
                                alt={track.title}
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{track.title}</div>
                              <div className="text-sm text-gray-500">{track.duration || '3:45'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {release.artist}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {release.label || 'MSC & Co MSC'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(release.status)}`}>
                            {RELEASE_STATUS_LABELS[release.status] || release.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            getArtistStatus(release.artist) === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {getArtistStatus(release.artist) === 'active' ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency((release.revenue || 0) / (release.trackListing?.length || 1), selectedCurrency)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleViewDetails({...track, releaseInfo: release}, 'asset')}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              className="text-green-600 hover:text-green-900 p-1 rounded"
                              title="Play"
                            >
                              <Play className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Details Modal */}
        {showDetails && selectedItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedItem.type === 'release' ? 'Release Details' : 'Asset Details'}
                  </h3>
                  <button
                    onClick={() => setShowDetails(false)}
                    className="text-gray-400 hover:text-gray-600 p-1"
                  >
                    ✕
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                {selectedItem.type === 'release' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                      <p className="text-sm text-gray-900">{selectedItem.title}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Artist</label>
                      <p className="text-sm text-gray-900">{selectedItem.artist}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
                      <p className="text-sm text-gray-900">{selectedItem.label || 'MSC & Co MSC'}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedItem.status)}`}>
                        {RELEASE_STATUS_LABELS[selectedItem.status] || selectedItem.status}
                      </span>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Release Date</label>
                      <p className="text-sm text-gray-900">
                        {selectedItem.releaseDate ? new Date(selectedItem.releaseDate).toLocaleDateString() : '---'}
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Genre</label>
                      <p className="text-sm text-gray-900">{selectedItem.genre || '---'}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Total Streams</label>
                      <p className="text-sm text-gray-900">{(selectedItem.totalStreams || 0).toLocaleString()}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Revenue</label>
                      <p className="text-sm text-gray-900">
                        {formatCurrency(selectedItem.revenue || 0, selectedCurrency)}
                      </p>
                    </div>
                    
                    {selectedItem.trackListing && (
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Track Listing</label>
                        <div className="bg-gray-50 rounded-lg p-4">
                          {selectedItem.trackListing.map((track, index) => (
                            <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                              <span className="text-sm text-gray-900">{index + 1}. {track.title}</span>
                              <span className="text-sm text-gray-500">{track.duration}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Track Title</label>
                      <p className="text-sm text-gray-900">{selectedItem.title}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                      <p className="text-sm text-gray-900">{selectedItem.duration || '3:45'}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Artist</label>
                      <p className="text-sm text-gray-900">{selectedItem.releaseInfo?.artist}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Release</label>
                      <p className="text-sm text-gray-900">{selectedItem.releaseInfo?.title}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
                      <p className="text-sm text-gray-900">{selectedItem.releaseInfo?.label || 'MSC & Co MSC'}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedItem.releaseInfo?.status)}`}>
                        {RELEASE_STATUS_LABELS[selectedItem.releaseInfo?.status] || selectedItem.releaseInfo?.status}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}