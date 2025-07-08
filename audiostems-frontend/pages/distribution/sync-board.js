import { useAuth0 } from '@auth0/auth0-react';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { COMPANY_INFO } from '@/lib/brand-config';
import RoleProtectedRoute from '@/components/auth/RoleProtectedRoute';
import RoleBasedNavigation from '@/components/navigation/RoleBasedNavigation';
import { Button, Card, Badge, Modal, TextInput, Label, Select, Checkbox } from 'flowbite-react';
import { 
  HiGlobeAlt, 
  HiPlus, 
  HiEye, 
  HiPencil, 
  HiFilter,
  HiSearch,
  HiCalendar,
  HiClock,
  HiCollection,
  HiX,
  HiMusicNote,
  HiUserGroup,
  HiTag
} from 'react-icons/hi';

function SyncBoardView() {
  const { user } = useAuth0();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    artist: '',
    genre: '',
    label: '',
    releaseType: ''
  });
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  useEffect(() => {
    fetchProjects();
  }, [filters]);

  const fetchProjects = async () => {
    try {
      // Mock data - replace with actual API call
      const mockProjects = [
        {
          id: 1,
          projectName: 'Gospel Collection Vol. 1',
          artistName: 'HTay',
          releaseLabel: 'Gospel Records',
          status: 'released',
          releaseDate: '2024-01-15',
          totalTracks: 12,
          releaseType: 'Album',
          genre: 'Gospel',
          catalogueNo: 'GR001',
          upc: '123456789012',
          isrc: 'US-ABC-12-34567',
          distributionCompany: 'MSC Distribution',
          preReleaseDate: '2024-01-01',
          submittedToStores: true,
          totalDuration: '45:30',
          createdAt: '2024-01-01T10:00:00Z',
          updatedAt: '2024-01-15T14:30:00Z',
          tracks: [
            { id: 1, title: 'Amazing Grace', duration: '3:45', status: 'released' },
            { id: 2, title: 'Praise Him', duration: '4:12', status: 'released' },
            { id: 3, title: 'Worship Song', duration: '3:58', status: 'released' }
          ]
        },
        {
          id: 2,
          projectName: 'Contemporary Worship Hits',
          artistName: 'Worship Collective',
          releaseLabel: 'Worship Records',
          status: 'pending',
          releaseDate: '2024-02-01',
          totalTracks: 8,
          releaseType: 'EP',
          genre: 'Worship',
          catalogueNo: 'WR002',
          upc: '123456789013',
          isrc: 'US-ABC-12-34568',
          distributionCompany: 'MSC Distribution',
          preReleaseDate: '2024-01-20',
          submittedToStores: false,
          totalDuration: '32:15',
          createdAt: '2024-01-10T09:00:00Z',
          updatedAt: '2024-01-25T16:45:00Z',
          tracks: [
            { id: 4, title: 'Praise Him', duration: '4:12', status: 'pending' },
            { id: 5, title: 'Worship Song', duration: '3:58', status: 'pending' }
          ]
        },
        {
          id: 3,
          projectName: 'Christian Rock Anthems',
          artistName: 'Rock Gospel Band',
          releaseLabel: 'Christian Music',
          status: 'in_progress',
          releaseDate: '2024-03-01',
          totalTracks: 15,
          releaseType: 'Album',
          genre: 'Christian Rock',
          catalogueNo: 'CM003',
          upc: '123456789014',
          isrc: 'US-ABC-12-34569',
          distributionCompany: 'MSC Distribution',
          preReleaseDate: '2024-02-15',
          submittedToStores: false,
          totalDuration: '58:45',
          createdAt: '2024-01-20T11:00:00Z',
          updatedAt: '2024-01-30T13:20:00Z',
          tracks: [
            { id: 6, title: 'Rock Anthem', duration: '4:30', status: 'in_progress' },
            { id: 7, title: 'Gospel Rock', duration: '3:45', status: 'in_progress' }
          ]
        },
        {
          id: 4,
          projectName: 'Inspirational Ballads',
          artistName: 'Graceful Voices',
          releaseLabel: 'Inspiration Records',
          status: 'rejected',
          releaseDate: '2024-02-15',
          totalTracks: 10,
          releaseType: 'Album',
          genre: 'Inspirational',
          catalogueNo: 'IR004',
          upc: '123456789015',
          isrc: 'US-ABC-12-34570',
          distributionCompany: 'MSC Distribution',
          preReleaseDate: '2024-02-01',
          submittedToStores: false,
          totalDuration: '42:20',
          createdAt: '2024-01-25T14:00:00Z',
          updatedAt: '2024-02-05T10:15:00Z',
          tracks: [
            { id: 8, title: 'Inspirational Song', duration: '4:15', status: 'rejected' },
            { id: 9, title: 'Graceful Melody', duration: '3:55', status: 'rejected' }
          ]
        },
        {
          id: 5,
          projectName: 'Praise & Worship Singles',
          artistName: 'Various Artists',
          releaseLabel: 'Praise Records',
          status: 'pending',
          releaseDate: '2024-02-20',
          totalTracks: 5,
          releaseType: 'Single',
          genre: 'Worship',
          catalogueNo: 'PR005',
          upc: '123456789016',
          isrc: 'US-ABC-12-34571',
          distributionCompany: 'MSC Distribution',
          preReleaseDate: '2024-02-10',
          submittedToStores: false,
          totalDuration: '18:30',
          createdAt: '2024-01-30T16:00:00Z',
          updatedAt: '2024-02-08T12:30:00Z',
          tracks: [
            { id: 10, title: 'Praise Song', duration: '3:45', status: 'pending' },
            { id: 11, title: 'Worship Anthem', duration: '4:12', status: 'pending' }
          ]
        }
      ];

      setProjects(mockProjects);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = !filters.search || 
      project.projectName.toLowerCase().includes(filters.search.toLowerCase()) ||
      project.artistName.toLowerCase().includes(filters.search.toLowerCase()) ||
      project.catalogueNo.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesStatus = !filters.status || project.status === filters.status;
    const matchesArtist = !filters.artist || project.artistName === filters.artist;
    const matchesGenre = !filters.genre || project.genre === filters.genre;
    const matchesLabel = !filters.label || project.releaseLabel === filters.label;
    const matchesReleaseType = !filters.releaseType || project.releaseType === filters.releaseType;
    
    return matchesSearch && matchesStatus && matchesArtist && matchesGenre && matchesLabel && matchesReleaseType;
  });

  const handleViewDetails = (project) => {
    setSelectedProject(project);
    setShowDetailModal(true);
  };

  const getStatusColor = (status) => {
    const colors = {
      released: 'green',
      pending: 'yellow',
      in_progress: 'blue',
      rejected: 'red'
    };
    return colors[status] || 'gray';
  };

  const getStatusIcon = (status) => {
    const icons = {
      released: HiCalendar,
      pending: HiClock,
      in_progress: HiCollection,
      rejected: HiX
    };
    return icons[status] || HiClock;
  };

  const getStatusBgColor = (status) => {
    const colors = {
      released: 'bg-green-50 border-green-200',
      pending: 'bg-yellow-50 border-yellow-200',
      in_progress: 'bg-blue-50 border-blue-200',
      rejected: 'bg-red-50 border-red-200'
    };
    return colors[status] || 'bg-gray-50 border-gray-200';
  };

  const getStatusTextColor = (status) => {
    const colors = {
      released: 'text-green-800',
      pending: 'text-yellow-800',
      in_progress: 'text-blue-800',
      rejected: 'text-red-800'
    };
    return colors[status] || 'text-gray-800';
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      status: '',
      artist: '',
      genre: '',
      label: '',
      releaseType: ''
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading sync board...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Sync Board - Distribution Partner - {COMPANY_INFO.name}</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <Link href="/distribution/dashboard" className="text-gray-600 hover:text-gray-900 mr-4">
                  ← Back to Distribution Dashboard
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">Sync Board</h1>
                <Badge color="blue" className="ml-3">
                  {filteredProjects.length} projects
                </Badge>
              </div>
              <div className="flex items-center space-x-4">
                <Button color="blue" size="sm">
                  <HiPlus className="w-4 h-4 mr-2" />
                  New Project
                </Button>
                <Button color="gray" size="sm" onClick={() => setShowFilters(!showFilters)}>
                  <HiFilter className="w-4 h-4 mr-2" />
                  Filters
                </Button>
                <div className="flex border rounded-lg">
                  <Button
                    size="sm"
                    color={viewMode === 'grid' ? 'blue' : 'gray'}
                    onClick={() => setViewMode('grid')}
                    className="rounded-r-none"
                  >
                    Grid
                  </Button>
                  <Button
                    size="sm"
                    color={viewMode === 'list' ? 'blue' : 'gray'}
                    onClick={() => setViewMode('list')}
                    className="rounded-l-none"
                  >
                    List
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <HiGlobeAlt className="w-6 h-6 text-blue-500" />
                  <h2 className="text-lg font-semibold text-gray-900">Distribution Navigation</h2>
                </div>
                <RoleBasedNavigation />
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="space-y-6">
                {/* Search and Filters */}
                <Card>
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="flex-1">
                      <TextInput
                        placeholder="Search by project name, artist, catalogue number..."
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        icon={HiSearch}
                      />
                    </div>
                    <Button color="gray" size="sm" onClick={clearFilters}>
                      Clear Filters
                    </Button>
                  </div>

                  {showFilters && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                      <div>
                        <Label htmlFor="status">Status</Label>
                        <Select
                          id="status"
                          value={filters.status}
                          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        >
                          <option value="">All Status</option>
                          <option value="released">Released</option>
                          <option value="pending">Pending</option>
                          <option value="in_progress">In Progress</option>
                          <option value="rejected">Rejected</option>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="artist">Artist</Label>
                        <Select
                          id="artist"
                          value={filters.artist}
                          onChange={(e) => setFilters({ ...filters, artist: e.target.value })}
                        >
                          <option value="">All Artists</option>
                          <option value="HTay">HTay</option>
                          <option value="Worship Collective">Worship Collective</option>
                          <option value="Rock Gospel Band">Rock Gospel Band</option>
                          <option value="Graceful Voices">Graceful Voices</option>
                          <option value="Various Artists">Various Artists</option>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="genre">Genre</Label>
                        <Select
                          id="genre"
                          value={filters.genre}
                          onChange={(e) => setFilters({ ...filters, genre: e.target.value })}
                        >
                          <option value="">All Genres</option>
                          <option value="Gospel">Gospel</option>
                          <option value="Worship">Worship</option>
                          <option value="Christian Rock">Christian Rock</option>
                          <option value="Inspirational">Inspirational</option>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="label">Label</Label>
                        <Select
                          id="label"
                          value={filters.label}
                          onChange={(e) => setFilters({ ...filters, label: e.target.value })}
                        >
                          <option value="">All Labels</option>
                          <option value="Gospel Records">Gospel Records</option>
                          <option value="Worship Records">Worship Records</option>
                          <option value="Christian Music">Christian Music</option>
                          <option value="Inspiration Records">Inspiration Records</option>
                          <option value="Praise Records">Praise Records</option>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="releaseType">Release Type</Label>
                        <Select
                          id="releaseType"
                          value={filters.releaseType}
                          onChange={(e) => setFilters({ ...filters, releaseType: e.target.value })}
                        >
                          <option value="">All Types</option>
                          <option value="Album">Album</option>
                          <option value="EP">EP</option>
                          <option value="Single">Single</option>
                        </Select>
                      </div>
                    </div>
                  )}
                </Card>

                {/* Status Summary */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card className="bg-green-50 border-green-200">
                    <div className="flex items-center">
                      <div className="p-3 rounded-full bg-green-100">
                        <HiCalendar className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-green-600">Released</p>
                        <p className="text-2xl font-bold text-green-900">
                          {filteredProjects.filter(p => p.status === 'released').length}
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="bg-yellow-50 border-yellow-200">
                    <div className="flex items-center">
                      <div className="p-3 rounded-full bg-yellow-100">
                        <HiClock className="w-6 h-6 text-yellow-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-yellow-600">Pending</p>
                        <p className="text-2xl font-bold text-yellow-900">
                          {filteredProjects.filter(p => p.status === 'pending').length}
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="bg-blue-50 border-blue-200">
                    <div className="flex items-center">
                      <div className="p-3 rounded-full bg-blue-100">
                        <HiCollection className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-blue-600">In Progress</p>
                        <p className="text-2xl font-bold text-blue-900">
                          {filteredProjects.filter(p => p.status === 'in_progress').length}
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="bg-red-50 border-red-200">
                    <div className="flex items-center">
                      <div className="p-3 rounded-full bg-red-100">
                        <HiX className="w-6 h-6 text-red-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-red-600">Issues</p>
                        <p className="text-2xl font-bold text-red-900">
                          {filteredProjects.filter(p => p.status === 'rejected').length}
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Projects Grid/List */}
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProjects.map((project) => {
                      const StatusIcon = getStatusIcon(project.status);
                      return (
                        <Card 
                          key={project.id} 
                          className={`hover:shadow-lg transition-all duration-200 cursor-pointer ${getStatusBgColor(project.status)}`}
                          onClick={() => handleViewDetails(project)}
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
                                {project.projectName}
                              </h3>
                              <p className="text-sm text-gray-600 mb-2">{project.artistName}</p>
                              <div className="flex items-center space-x-2 mb-3">
                                <StatusIcon className="w-4 h-4 text-gray-400" />
                                <Badge color={getStatusColor(project.status)} size="sm">
                                  {project.status.replace('_', ' ')}
                                </Badge>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-gray-500 mb-1">{project.releaseType}</div>
                              <div className="text-xs text-gray-500">{project.totalTracks} tracks</div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Label:</span>
                              <span className="text-gray-900 font-medium">{project.releaseLabel}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Release:</span>
                              <span className="text-gray-900">{project.releaseDate}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Duration:</span>
                              <span className="text-gray-900">{project.totalDuration}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Genre:</span>
                              <Badge color="gray" size="xs">
                                {project.genre}
                              </Badge>
                            </div>
                          </div>

                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="flex justify-between items-center">
                              <div className="text-xs text-gray-500 font-mono">
                                {project.catalogueNo}
                              </div>
                              <div className="flex space-x-1">
                                <Button size="xs" color="blue">
                                  <HiEye className="w-3 h-3" />
                                </Button>
                                <Button size="xs" color="gray">
                                  <HiPencil className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredProjects.map((project) => {
                      const StatusIcon = getStatusIcon(project.status);
                      return (
                        <Card 
                          key={project.id} 
                          className={`hover:shadow-md transition-shadow cursor-pointer ${getStatusBgColor(project.status)}`}
                          onClick={() => handleViewDetails(project)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className={`p-3 rounded-full bg-${getStatusColor(project.status)}-100`}>
                                <StatusIcon className={`w-6 h-6 text-${getStatusColor(project.status)}-600`} />
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900">{project.projectName}</h3>
                                <p className="text-sm text-gray-600">{project.artistName}</p>
                                <div className="flex items-center space-x-2 mt-1">
                                  <Badge color={getStatusColor(project.status)} size="sm">
                                    {project.status.replace('_', ' ')}
                                  </Badge>
                                  <span className="text-xs text-gray-500">{project.releaseType}</span>
                                  <span className="text-xs text-gray-500">{project.totalTracks} tracks</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-gray-900 font-medium">{project.releaseLabel}</div>
                              <div className="text-sm text-gray-600">{project.releaseDate}</div>
                              <div className="text-xs text-gray-500 font-mono">{project.catalogueNo}</div>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Project Detail Modal */}
        <Modal show={showDetailModal} onClose={() => setShowDetailModal(false)} size="4xl">
          <Modal.Header>
            Project Details - {selectedProject?.projectName}
          </Modal.Header>
          <Modal.Body>
            {selectedProject && (
              <div className="space-y-6">
                {/* Project Overview */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Project Overview</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Project Name</Label>
                      <p className="text-sm text-gray-900">{selectedProject.projectName}</p>
                    </div>
                    <div>
                      <Label>Artist Name</Label>
                      <p className="text-sm text-gray-900">{selectedProject.artistName}</p>
                    </div>
                    <div>
                      <Label>Release Label</Label>
                      <p className="text-sm text-gray-900">{selectedProject.releaseLabel}</p>
                    </div>
                    <div>
                      <Label>Status</Label>
                      <Badge color={getStatusColor(selectedProject.status)}>
                        {selectedProject.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div>
                      <Label>Release Date</Label>
                      <p className="text-sm text-gray-900">{selectedProject.releaseDate}</p>
                    </div>
                    <div>
                      <Label>Pre-Release Date</Label>
                      <p className="text-sm text-gray-900">{selectedProject.preReleaseDate}</p>
                    </div>
                    <div>
                      <Label>Release Type</Label>
                      <p className="text-sm text-gray-900">{selectedProject.releaseType}</p>
                    </div>
                    <div>
                      <Label>Genre</Label>
                      <p className="text-sm text-gray-900">{selectedProject.genre}</p>
                    </div>
                    <div>
                      <Label>Total Tracks</Label>
                      <p className="text-sm text-gray-900">{selectedProject.totalTracks}</p>
                    </div>
                    <div>
                      <Label>Total Duration</Label>
                      <p className="text-sm text-gray-900">{selectedProject.totalDuration}</p>
                    </div>
                  </div>
                </div>

                {/* Technical Details */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Technical Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Catalogue No.</Label>
                      <p className="text-sm text-gray-900 font-mono">{selectedProject.catalogueNo}</p>
                    </div>
                    <div>
                      <Label>UPC</Label>
                      <p className="text-sm text-gray-900 font-mono">{selectedProject.upc}</p>
                    </div>
                    <div>
                      <Label>ISRC</Label>
                      <p className="text-sm text-gray-900 font-mono">{selectedProject.isrc}</p>
                    </div>
                    <div>
                      <Label>Distribution Company</Label>
                      <p className="text-sm text-gray-900">{selectedProject.distributionCompany}</p>
                    </div>
                    <div>
                      <Label>Submitted to Stores</Label>
                      <p className="text-sm text-gray-900">{selectedProject.submittedToStores ? 'Yes' : 'No'}</p>
                    </div>
                  </div>
                </div>

                {/* Tracks List */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Tracks ({selectedProject.tracks.length})</h3>
                  <div className="space-y-2">
                    {selectedProject.tracks.map((track, index) => (
                      <div key={track.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <span className="text-sm font-medium text-gray-900">{index + 1}</span>
                          <div>
                            <div className="font-medium text-gray-900">{track.title}</div>
                            <div className="text-sm text-gray-600">{track.duration}</div>
                          </div>
                        </div>
                        <Badge color={getStatusColor(track.status)} size="sm">
                          {track.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button color="blue" onClick={() => setShowDetailModal(false)}>
              Close
            </Button>
            <Button color="gray" onClick={() => setShowDetailModal(false)}>
              Edit Project
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </>
  );
}

export default function SyncBoardPage() {
  return (
    <RoleProtectedRoute requiredRoles={['distribution_partner']}>
      <SyncBoardView />
    </RoleProtectedRoute>
  );
} 