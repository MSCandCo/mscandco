import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useRouter } from 'next/router';
import { 
  Music, Users, FileText, Search, Filter, Plus, Edit, Trash2, Eye,
  TrendingUp, Download, Settings, BarChart3, Play, Pause, Globe
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
                         artist.primaryGenre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         artist.email?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const filteredSongs = songs.filter(song => {
    const matchesSearch = song.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         song.artist?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         song.genre?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Handle actions
  const handleAction = (action, item) => {
    console.log(`${action} action for:`, item);
    setSuccessMessage(`${action} completed successfully!`);
    setShowSuccessModal(true);
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

  // Tab content renderer
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'releases':
        return renderReleases();
      case 'artists':
        return renderArtists();
      case 'songs':
        return renderSongs();
      default:
        return renderOverview();
    }
  };

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Songs</p>
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

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Recent Activity</h3>
        <div className="space-y-4">
          {RELEASES.slice(0, 5).map((release) => (
            <div key={release.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold">
                  {release.projectName.charAt(0)}
                </div>
                <div className="ml-4">
                  <div className="font-medium text-gray-900">{release.projectName}</div>
                  <div className="text-sm text-gray-500">by {release.artist} • {release.genre}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">{RELEASE_STATUS_LABELS[release.status]}</div>
                <div className="text-sm text-gray-500">{release.lastUpdated}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderReleases = () => (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Releases</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by project, artist, or genre..."
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              {Object.entries(RELEASE_STATUS_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Releases List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-900">Releases ({filteredReleases.length})</h3>
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4 mr-2" />
            Add Release
          </button>
        </div>
        <div className="divide-y divide-gray-200">
          {filteredReleases.map((release) => (
            <div key={release.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold">
                    {release.projectName.charAt(0)}
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-semibold text-gray-900">{release.projectName}</h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>by {release.artist}</span>
                      <span>•</span>
                      <span>{release.genre}</span>
                      <span>•</span>
                      <span>{release.trackListing?.length || 1} tracks</span>
                    </div>
                    <div className="flex items-center mt-2 space-x-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800`}>
                        {RELEASE_STATUS_LABELS[release.status]}
                      </span>
                      <span className="text-sm text-gray-600">
                        Revenue: {formatCurrency(release.earnings || 0, selectedCurrency)}
                      </span>
                      <span className="text-sm text-gray-600">
                        Streams: {(release.streams || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleAction('View', release)}
                    className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View
                  </button>
                  <button
                    onClick={() => handleAction('Edit', release)}
                    className="flex items-center px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderArtists = () => (
    <div className="space-y-6">
      {/* Artists Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Artists Management</h3>
            <p className="text-gray-600">Manage all artists across the platform</p>
          </div>
          <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            <Plus className="w-4 h-4 mr-2" />
            Add Artist
          </button>
        </div>
      </div>

      {/* Artists Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredArtistsForDisplay.map((artist) => (
          <div key={artist.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-4">
              <Avatar 
                name={artist.name}
                image={artist.profileImage}
                size="w-12 h-12"
                textSize="text-lg"
              />
              <div className="ml-4">
                <h4 className="font-semibold text-gray-900">{artist.name}</h4>
                <p className="text-sm text-gray-600">{artist.primaryGenre}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">{artist.releases || 0}</div>
                <div className="text-xs text-gray-500">Releases</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">{formatCurrency(artist.totalEarnings || 0, selectedCurrency)}</div>
                <div className="text-xs text-gray-500">Earnings</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">{artist.totalStreams?.toLocaleString() || '0'}</div>
                <div className="text-xs text-gray-500">Streams</div>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => handleAction('View Profile', artist)}
                className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
              >
                View Profile
              </button>
              <button
                onClick={() => handleAction('Edit Artist', artist)}
                className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSongs = () => (
    <div className="space-y-6">
      {/* Songs List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-900">Songs Library ({filteredSongs.length})</h3>
          <button className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            <Plus className="w-4 h-4 mr-2" />
            Add Song
          </button>
        </div>
        <div className="divide-y divide-gray-200">
          {filteredSongs.map((song) => (
            <div key={song.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white">
                    <Music className="w-5 h-5" />
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-semibold text-gray-900">{song.title}</h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>by {song.artist}</span>
                      <span>•</span>
                      <span>{song.genre}</span>
                      <span>•</span>
                      <span>{song.duration}</span>
                      <span>•</span>
                      <span>{(song.streams || 0).toLocaleString()} streams</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <button className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors">
                    <Play className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleAction('Edit Song', song)}
                    className="flex items-center px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <MainLayout>
      <SEO 
        title="Content Management"
        description="Admin content management dashboard"
      />
      
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white mb-8">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold mb-2">Content Management</h1>
                <p className="text-blue-100 text-lg">
                  Manage songs, artists, releases, and platform content
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-blue-100">Platform Health</div>
                <div className="text-2xl font-bold">99.2%</div>
              </div>
            </div>
          </div>

          {/* Currency Selector */}
          <div className="mb-6 flex justify-end">
            <CurrencySelector />
          </div>

          {/* Tabs Navigation */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {[
                  { id: 'overview', label: 'Overview', icon: BarChart3 },
                  { id: 'releases', label: 'Releases', icon: FileText },
                  { id: 'artists', label: 'Artists', icon: Users },
                  { id: 'songs', label: 'Songs', icon: Music }
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

      {/* Success Modal */}
      {showSuccessModal && (
        <SuccessModal 
          message={successMessage}
          onClose={() => setShowSuccessModal(false)}
        />
      )}
    </MainLayout>
  );
}