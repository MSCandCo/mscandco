import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import { 
  Calendar, 
  Grid, 
  List, 
  Filter, 
  Search, 
  Plus,
  Clock,
  Music,
  FileText,
  Users,
  Tag,
  DollarSign,
  Calendar as CalendarIcon,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  PauseCircle,
  PlayCircle
} from 'lucide-react';

const ProjectsPage = () => {
  const { data: session } = useSession();
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('all'); // 'all', 'status', 'calendar'
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    releaseType: '',
    priority: '',
    artist: '',
    genre: '',
    submissionDateFrom: '',
    submissionDateTo: '',
    expectedReleaseDateFrom: '',
    expectedReleaseDateTo: '',
    budgetMin: '',
    budgetMax: '',
    tags: []
  });
  const [showFilters, setShowFilters] = useState(false);
  const [statistics, setStatistics] = useState({});

  useEffect(() => {
    if (session) {
      fetchProjects();
      fetchStatistics();
    }
  }, [session]);

  useEffect(() => {
    applyFilters();
  }, [projects, filters, view]);

  const fetchProjects = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/projects`, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`
        }
      });
      setProjects(response.data.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/projects/statistics`, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`
        }
      });
      setStatistics(response.data.data || {});
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...projects];

    // Apply search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(project => 
        project.attributes.projectName?.toLowerCase().includes(searchTerm) ||
        project.attributes.credits?.toLowerCase().includes(searchTerm) ||
        project.attributes.publishingNotes?.toLowerCase().includes(searchTerm) ||
        project.attributes.feedback?.toLowerCase().includes(searchTerm) ||
        project.attributes.marketingPlan?.toLowerCase().includes(searchTerm)
      );
    }

    // Apply other filters
    if (filters.status) {
      filtered = filtered.filter(project => project.attributes.status === filters.status);
    }
    if (filters.releaseType) {
      filtered = filtered.filter(project => project.attributes.releaseType === filters.releaseType);
    }
    if (filters.priority) {
      filtered = filtered.filter(project => project.attributes.priority === filters.priority);
    }
    if (filters.artist) {
      filtered = filtered.filter(project => project.attributes.artist?.data?.id === parseInt(filters.artist));
    }
    if (filters.genre) {
      filtered = filtered.filter(project => 
        project.attributes.genre?.data?.some(g => g.id === parseInt(filters.genre))
      );
    }

    setFilteredProjects(filtered);
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      submitted: 'bg-blue-100 text-blue-800',
      in_review: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      in_production: 'bg-purple-100 text-purple-800',
      ready_for_release: 'bg-indigo-100 text-indigo-800',
      released: 'bg-emerald-100 text-emerald-800',
      on_hold: 'bg-orange-100 text-orange-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    const icons = {
      draft: FileText,
      submitted: Clock,
      in_review: AlertCircle,
      approved: CheckCircle,
      rejected: XCircle,
      in_production: PlayCircle,
      ready_for_release: TrendingUp,
      released: CheckCircle,
      on_hold: PauseCircle
    };
    return icons[status] || FileText;
  };

  const getReleaseTypeColor = (type) => {
    const colors = {
      single: 'bg-blue-500',
      ep: 'bg-purple-500',
      album: 'bg-green-500',
      mixtape: 'bg-orange-500',
      compilation: 'bg-indigo-500',
      soundtrack: 'bg-pink-500',
      remix_album: 'bg-yellow-500',
      live_album: 'bg-red-500',
      demo: 'bg-gray-500'
    };
    return colors[type] || 'bg-gray-500';
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  const renderAllProjectsView = () => (
    <div className="space-y-6">
      {filteredProjects.map((project) => (
        <div key={project.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  {project.attributes.projectName}
                </h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.attributes.status)}`}>
                  {project.attributes.status.replace('_', ' ')}
                </span>
                <span className={`px-2 py-1 rounded text-xs text-white ${getReleaseTypeColor(project.attributes.releaseType)}`}>
                  {project.attributes.releaseType.replace('_', ' ')}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {project.attributes.artist?.data?.attributes?.stageName || 'Unknown Artist'}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    Expected: {formatDate(project.attributes.expectedReleaseDate)}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Music className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {project.attributes.creations?.data?.length || 0} tracks
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {formatDuration(project.attributes.estimatedDuration)}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>Submitted: {formatDate(project.attributes.submissionDate)}</span>
                <span>Priority: {project.attributes.priority}</span>
                {project.attributes.budget && (
                  <span>Budget: ${project.attributes.budget}</span>
                )}
              </div>
            </div>
            
            <div className="flex space-x-2">
              <button className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800">
                View Details
              </button>
              <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800">
                Edit
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderStatusBoardView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {filteredProjects.map((project) => (
        <div key={project.id} className="bg-white rounded-lg shadow-md p-4 border border-gray-200 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className={`px-2 py-1 rounded text-xs text-white ${getReleaseTypeColor(project.attributes.releaseType)}`}>
              {project.attributes.releaseType.replace('_', ' ')}
            </span>
            {getStatusIcon(project.attributes.status)({ className: "w-5 h-5 text-gray-500" })}
          </div>
          
          <h3 className="font-semibold text-gray-900 mb-2 truncate">
            {project.attributes.projectName}
          </h3>
          
          <p className="text-sm text-gray-600 mb-3">
            {project.attributes.artist?.data?.attributes?.stageName || 'Unknown Artist'}
          </p>
          
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{formatDate(project.attributes.expectedReleaseDate)}</span>
            <span>{project.attributes.creations?.data?.length || 0} tracks</span>
          </div>
        </div>
      ))}
    </div>
  );

  const renderCalendarView = () => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Release Calendar</h3>
        <p className="text-sm text-gray-600">Upcoming releases and important dates</p>
      </div>
      
      <div className="space-y-4">
        {filteredProjects
          .filter(project => project.attributes.expectedReleaseDate)
          .sort((a, b) => new Date(a.attributes.expectedReleaseDate) - new Date(b.attributes.expectedReleaseDate))
          .map((project) => (
            <div key={project.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <CalendarIcon className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{project.attributes.projectName}</h4>
                <p className="text-sm text-gray-600">
                  {project.attributes.artist?.data?.attributes?.stageName || 'Unknown Artist'}
                </p>
              </div>
              
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">
                  {formatDate(project.attributes.expectedReleaseDate)}
                </div>
                <div className="text-xs text-gray-500">
                  {project.attributes.releaseType.replace('_', ' ')}
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );

  const renderFilters = () => (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800"
        >
          <Filter className="w-4 h-4" />
          <span>{showFilters ? 'Hide' : 'Show'} Filters</span>
        </button>
      </div>
      
      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              placeholder="Search projects..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="submitted">Submitted</option>
              <option value="in_review">In Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="in_production">In Production</option>
              <option value="ready_for_release">Ready for Release</option>
              <option value="released">Released</option>
              <option value="on_hold">On Hold</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Release Type</label>
            <select
              value={filters.releaseType}
              onChange={(e) => setFilters({ ...filters, releaseType: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="single">Single</option>
              <option value="ep">EP</option>
              <option value="album">Album</option>
              <option value="mixtape">Mixtape</option>
              <option value="compilation">Compilation</option>
              <option value="soundtrack">Soundtrack</option>
              <option value="remix_album">Remix Album</option>
              <option value="live_album">Live Album</option>
              <option value="demo">Demo</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Expected Release Date From</label>
            <input
              type="date"
              value={filters.expectedReleaseDateFrom}
              onChange={(e) => setFilters({ ...filters, expectedReleaseDateFrom: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Expected Release Date To</label>
            <input
              type="date"
              value={filters.expectedReleaseDateTo}
              onChange={(e) => setFilters({ ...filters, expectedReleaseDateTo: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Projects & Releases</h1>
            <p className="text-gray-600 mt-2">Manage your music projects and track releases</p>
          </div>
          
          <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="w-5 h-5" />
            <span>New Project</span>
          </button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Music className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Projects</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.total || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Released</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.released || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Upcoming</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.upcoming || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.overdue || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex items-center space-x-4 mb-6">
          <button
            onClick={() => setView('all')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              view === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <List className="w-4 h-4" />
            <span>All Projects</span>
          </button>
          
          <button
            onClick={() => setView('status')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              view === 'status' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Grid className="w-4 h-4" />
            <span>Status Board</span>
          </button>
          
          <button
            onClick={() => setView('calendar')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              view === 'calendar' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Release Calendar</span>
          </button>
        </div>

        {/* Filters */}
        {renderFilters()}

        {/* Content */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {filteredProjects.length === 0 ? (
            <div className="text-center py-12">
              <Music className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
              <p className="text-gray-600">Get started by creating your first project.</p>
            </div>
          ) : (
            <>
              {view === 'all' && renderAllProjectsView()}
              {view === 'status' && renderStatusBoardView()}
              {view === 'calendar' && renderCalendarView()}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectsPage; 