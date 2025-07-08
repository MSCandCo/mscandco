import { useAuth0 } from '@auth0/auth0-react';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  PlusIcon, 
  FilterIcon, 
  SearchIcon, 
  CalendarIcon, 
  ViewBoardsIcon, 
  ViewListIcon,
  EyeIcon,
  PencilIcon,
  DuplicateIcon,
  TrashIcon,
  ChevronRightIcon
} from '@heroicons/react/outline';

export default function ProjectsReleases() {
  const { isAuthenticated, user, loginWithRedirect } = useAuth0();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('all-projects');
  const [projects, setProjects] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    releaseType: '',
    genre: '',
    submissionDateFrom: '',
    submissionDateTo: '',
    expectedReleaseDateFrom: '',
    expectedReleaseDateTo: ''
  });
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchUserProfile();
      fetchProjects();
      fetchStatistics();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchProjects();
    }
  }, [filters, activeView]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/auth/get-profile', {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserProfile(data.profile);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      let endpoint = '/api/projects';
      if (activeView === 'status-board') {
        endpoint = '/api/projects/status-board';
      } else if (activeView === 'release-calendar') {
        endpoint = '/api/projects/release-calendar';
      }

      const response = await fetch(`${endpoint}?${queryParams.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setProjects(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await fetch('/api/projects/statistics');
      if (response.ok) {
        const data = await response.json();
        setStatistics(data.data);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      status: '',
      releaseType: '',
      genre: '',
      submissionDateFrom: '',
      submissionDateTo: '',
      expectedReleaseDateFrom: '',
      expectedReleaseDateTo: ''
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      in_progress: 'bg-blue-100 text-blue-800',
      under_review: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      scheduled: 'bg-purple-100 text-purple-800',
      released: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getReleaseTypeColor = (releaseType) => {
    const colors = {
      single: 'bg-blue-500',
      ep: 'bg-green-500',
      album: 'bg-purple-500',
      mixtape: 'bg-orange-500',
      compilation: 'bg-pink-500',
      live_album: 'bg-indigo-500',
      remix_album: 'bg-teal-500',
      soundtrack: 'bg-red-500'
    };
    return colors[releaseType] || 'bg-gray-500';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-center mb-6">Projects & Releases</h1>
          <p className="text-gray-600 text-center mb-6">
            Please sign in to access your projects and releases.
          </p>
          <button
            onClick={() => loginWithRedirect()}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Projects & Releases - Artist Portal - AudioStems</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 mr-4">
                  ← Back to Dashboard
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">Projects & Releases</h1>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.push('/distribution/publishing/artist-portal/releases/create')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  New Project
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Breadcrumb */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-4">
              <li>
                <Link href="/dashboard" className="text-gray-500 hover:text-gray-700">
                  Dashboard
                </Link>
              </li>
              <li>
                <div className="flex items-center">
                  <ChevronRightIcon className="flex-shrink-0 h-5 w-5 text-gray-400" />
                  <Link href="/distribution/publishing" className="ml-4 text-gray-500 hover:text-gray-700">
                    Distribution & Publishing
                  </Link>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <ChevronRightIcon className="flex-shrink-0 h-5 w-5 text-gray-400" />
                  <Link href="/distribution/publishing/artist-portal" className="ml-4 text-gray-500 hover:text-gray-700">
                    Artist Portal
                  </Link>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <ChevronRightIcon className="flex-shrink-0 h-5 w-5 text-gray-400" />
                  <span className="ml-4 text-gray-500">Projects & Releases</span>
                </div>
              </li>
            </ol>
          </nav>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <nav className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Artist Portal</h2>
                <ul className="space-y-2">
                  <li>
                    <Link href="/distribution/publishing/artist-portal" className="block px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md">
                      Overview
                    </Link>
                  </li>
                  <li>
                    <Link href="/distribution/publishing/artist-portal/profile" className="block px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md">
                      Profile
                    </Link>
                  </li>
                  <li>
                    <Link href="/distribution/publishing/artist-portal/releases" className="block px-3 py-2 text-blue-600 bg-blue-50 rounded-md">
                      Projects & Releases
                    </Link>
                  </li>
                  <li>
                    <Link href="/distribution/publishing/artist-portal/analytics" className="block px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md">
                      Analytics
                    </Link>
                  </li>
                  <li>
                    <Link href="/distribution/publishing/artist-portal/royalties" className="block px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md">
                      Royalties
                    </Link>
                  </li>
                </ul>
              </nav>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Statistics Cards */}
              {statistics && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-sm font-medium text-gray-900">Total Projects</h3>
                    <p className="text-2xl font-bold text-blue-600">{statistics.total}</p>
                  </div>
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-sm font-medium text-gray-900">Upcoming Releases</h3>
                    <p className="text-2xl font-bold text-green-600">{statistics.upcoming}</p>
                  </div>
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-sm font-medium text-gray-900">Released</h3>
                    <p className="text-2xl font-bold text-purple-600">{statistics.released}</p>
                  </div>
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-sm font-medium text-gray-900">This Month</h3>
                    <p className="text-2xl font-bold text-orange-600">{statistics.thisMonth}</p>
                  </div>
                </div>
              )}

              {/* View Navigation */}
              <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={() => setActiveView('all-projects')}
                    className={`flex items-center px-4 py-2 rounded-md ${
                      activeView === 'all-projects'
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <ViewListIcon className="h-5 w-5 mr-2" />
                    All Projects
                  </button>
                  <button
                    onClick={() => setActiveView('status-board')}
                    className={`flex items-center px-4 py-2 rounded-md ${
                      activeView === 'status-board'
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <ViewBoardsIcon className="h-5 w-5 mr-2" />
                    Status Board
                  </button>
                  <button
                    onClick={() => setActiveView('release-calendar')}
                    className={`flex items-center px-4 py-2 rounded-md ${
                      activeView === 'release-calendar'
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <CalendarIcon className="h-5 w-5 mr-2" />
                    Release Calendar
                  </button>
                </div>
              </div>

              {/* Filters */}
              {activeView === 'all-projects' && (
                <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Filters</h3>
                    <button
                      onClick={clearFilters}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      Clear all
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                      <div className="relative">
                        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          value={filters.search}
                          onChange={(e) => handleFilterChange('search', e.target.value)}
                          placeholder="Search projects..."
                          className="pl-10 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                        value={filters.status}
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">All Status</option>
                        <option value="draft">Draft</option>
                        <option value="in_progress">In Progress</option>
                        <option value="under_review">Under Review</option>
                        <option value="approved">Approved</option>
                        <option value="scheduled">Scheduled</option>
                        <option value="released">Released</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Release Type</label>
                      <select
                        value={filters.releaseType}
                        onChange={(e) => handleFilterChange('releaseType', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">All Types</option>
                        <option value="single">Single</option>
                        <option value="ep">EP</option>
                        <option value="album">Album</option>
                        <option value="mixtape">Mixtape</option>
                        <option value="compilation">Compilation</option>
                        <option value="live_album">Live Album</option>
                        <option value="remix_album">Remix Album</option>
                        <option value="soundtrack">Soundtrack</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Projects List */}
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">
                    {activeView === 'all-projects' && 'All Projects'}
                    {activeView === 'status-board' && 'Status Board'}
                    {activeView === 'release-calendar' && 'Release Calendar'}
                  </h3>
                </div>
                <div className="p-6">
                  {projects.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-500">No projects found.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {projects.map((project) => (
                        <div key={project.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h4 className="text-lg font-medium text-gray-900">{project.projectName}</h4>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
                                  {project.status.replace('_', ' ')}
                                </span>
                                <div className={`w-3 h-3 rounded-full ${getReleaseTypeColor(project.releaseType)}`}></div>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">
                                Artist: {project.artist?.stageName || project.artist?.firstName || 'Unknown'}
                              </p>
                              <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <span>Expected: {formatDate(project.expectedReleaseDate)}</span>
                                <span>Submitted: {formatDate(project.submissionDate)}</span>
                                <span>Last Updated: {formatDate(project.lastUpdated)}</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => router.push(`/distribution/publishing/artist-portal/releases/${project.id}`)}
                                className="p-2 text-gray-400 hover:text-gray-600"
                                title="View"
                              >
                                <EyeIcon className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => router.push(`/distribution/publishing/artist-portal/releases/${project.id}/edit`)}
                                className="p-2 text-gray-400 hover:text-gray-600"
                                title="Edit"
                              >
                                <PencilIcon className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => router.push(`/distribution/publishing/artist-portal/releases/${project.id}/duplicate`)}
                                className="p-2 text-gray-400 hover:text-gray-600"
                                title="Duplicate"
                              >
                                <DuplicateIcon className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm('Are you sure you want to delete this project?')) {
                                    // Handle delete
                                  }
                                }}
                                className="p-2 text-gray-400 hover:text-red-600"
                                title="Delete"
                              >
                                <TrashIcon className="h-5 w-5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 