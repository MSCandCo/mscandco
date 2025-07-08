import { useAuth0 } from '@auth0/auth0-react';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { COMPANY_INFO } from '@/lib/brand-config';
import RoleProtectedRoute from '@/components/auth/RoleProtectedRoute';
import RoleBasedNavigation from '@/components/navigation/RoleBasedNavigation';
import { Button, Card, Badge, Modal, TextInput, Label, Select, Table } from 'flowbite-react';
import { 
  HiCollection, 
  HiPlus, 
  HiEye, 
  HiPencil, 
  HiTrash,
  HiDownload,
  HiFilter,
  HiSearch,
  HiMusicNote,
  HiUserGroup,
  HiCalendar,
  HiGlobeAlt,
  HiClock,
  HiX
} from 'react-icons/hi';

function AllProjectsView() {
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
    releaseType: '',
    label: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);

  useEffect(() => {
    fetchProjects();
  }, [filters, currentPage]);

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
    const matchesReleaseType = !filters.releaseType || project.releaseType === filters.releaseType;
    const matchesLabel = !filters.label || project.releaseLabel === filters.label;
    
    return matchesSearch && matchesStatus && matchesArtist && matchesReleaseType && matchesLabel;
  });

  const paginatedProjects = filteredProjects.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleViewDetails = (project) => {
    setSelectedProject(project);
    setShowDetailModal(true);
  };

  const getStatusColor = (status) => {
    const colors = {
      released: 'success',
      pending: 'warning',
      in_progress: 'info',
      rejected: 'failure'
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

  const clearFilters = () => {
    setFilters({
      search: '',
      status: '',
      artist: '',
      releaseType: '',
      label: ''
    });
  };

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
    <>
      <Head>
        <title>All Projects - Distribution Partner - {COMPANY_INFO.name}</title>
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
                <h1 className="text-2xl font-bold text-gray-900">All Projects</h1>
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
                <Button color="gray" size="sm">
                  <HiDownload className="w-4 h-4 mr-2" />
                  Export
                </Button>
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
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t">
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
                        </Select>
                      </div>
                    </div>
                  )}
                </Card>

                {/* Projects Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedProjects.map((project) => {
                    const StatusIcon = getStatusIcon(project.status);
                    return (
                      <Card key={project.id} className="hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
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
                          <Button size="xs" color="gray" onClick={() => handleViewDetails(project)}>
                            <HiEye className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Release Label:</span>
                            <span className="text-gray-900">{project.releaseLabel}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Release Date:</span>
                            <span className="text-gray-900">{project.releaseDate}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Tracks:</span>
                            <span className="text-gray-900">{project.totalTracks}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Duration:</span>
                            <span className="text-gray-900">{project.totalDuration}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Type:</span>
                            <span className="text-gray-900">{project.releaseType}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Genre:</span>
                            <Badge color="gray" size="xs">
                              {project.genre}
                            </Badge>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t">
                          <div className="flex justify-between items-center">
                            <div className="text-xs text-gray-500">
                              Cat: {project.catalogueNo}
                            </div>
                            <div className="flex space-x-1">
                              <Button size="xs" color="blue">
                                <HiPencil className="w-3 h-3" />
                              </Button>
                              <Button size="xs" color="gray">
                                <HiDownload className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredProjects.length)} of {filteredProjects.length} results
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      color="gray"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                    >
                      Previous
                    </Button>
                    <Button
                      size="sm"
                      color="gray"
                      disabled={currentPage * itemsPerPage >= filteredProjects.length}
                      onClick={() => setCurrentPage(currentPage + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
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
                  <div className="overflow-x-auto">
                    <Table>
                      <Table.Head>
                        <Table.HeadCell>Track #</Table.HeadCell>
                        <Table.HeadCell>Title</Table.HeadCell>
                        <Table.HeadCell>Duration</Table.HeadCell>
                        <Table.HeadCell>Status</Table.HeadCell>
                      </Table.Head>
                      <Table.Body>
                        {selectedProject.tracks.map((track, index) => (
                          <Table.Row key={track.id}>
                            <Table.Cell>{index + 1}</Table.Cell>
                            <Table.Cell className="font-medium text-gray-900">{track.title}</Table.Cell>
                            <Table.Cell className="text-sm text-gray-600">{track.duration}</Table.Cell>
                            <Table.Cell>
                              <Badge color={getStatusColor(track.status)} size="sm">
                                {track.status}
                              </Badge>
                            </Table.Cell>
                          </Table.Row>
                        ))}
                      </Table.Body>
                    </Table>
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

export default function AllProjectsPage() {
  return (
    <RoleProtectedRoute requiredRoles={['distribution_partner']}>
      <AllProjectsView />
    </RoleProtectedRoute>
  );
} 