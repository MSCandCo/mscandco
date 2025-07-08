import { useAuth0 } from '@auth0/auth0-react';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { COMPANY_INFO } from '@/lib/brand-config';
import RoleProtectedRoute from '@/components/auth/RoleProtectedRoute';
import RoleBasedNavigation from '@/components/navigation/RoleBasedNavigation';
import { Button, Card, Badge, Modal, TextInput, Label, Select, Checkbox, Table } from 'flowbite-react';
import { 
  HiMusicNote, 
  HiPlus, 
  HiEye, 
  HiPencil, 
  HiTrash,
  HiDownload,
  HiFilter,
  HiSearch,
  HiX,
  HiGlobeAlt,
  HiCollection,
  HiClock,
  HiCalendar
} from 'react-icons/hi';

function AllCreationsView() {
  const { user } = useAuth0();
  const [creations, setCreations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCreation, setSelectedCreation] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    genre: '',
    releaseStatus: '',
    label: '',
    artist: '',
    dateFrom: '',
    dateTo: '',
    explicit: '',
    language: ''
  });
  const [selectedCreations, setSelectedCreations] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  useEffect(() => {
    fetchCreations();
  }, [filters, currentPage]);

  const fetchCreations = async () => {
    try {
      // Mock data - replace with actual API call
      const mockCreations = [
        {
          id: 1,
          songTitle: 'Amazing Grace',
          artistName: 'HTay',
          productTitle: 'Gospel Collection Vol. 1',
          trackPosition: 1,
          duration: '3:45',
          explicit: false,
          genre: 'Gospel',
          subGenre: 'Traditional Gospel',
          language: 'English',
          bpm: 120,
          songKey: 'C Major',
          fileType: 'WAV',
          audioFileName: 'amazing_grace_htay.wav',
          coverFileName: 'amazing_grace_cover.jpg',
          version: '1.0',
          vocalType: 'Lead Vocal',
          moodDescription: 'Uplifting, Inspirational',
          isrc: 'US-ABC-12-34567',
          upc: '123456789012',
          label: 'Gospel Records',
          catalogueNo: 'GR001',
          copyrightOwner: 'HTay Music',
          composerAuthor: 'John Newton',
          publisher: 'HTay Publishing',
          pro: 'BMI',
          bmiWorkNo: '123456789',
          ascapWorkNo: '',
          releaseDate: '2024-01-15',
          releaseLabel: 'Gospel Records',
          distributionCompany: 'MSC Distribution',
          releaseStatus: 'released',
          preReleaseDate: '2024-01-01',
          submittedToStores: true,
          createdAt: '2024-01-01T10:00:00Z',
          updatedAt: '2024-01-15T14:30:00Z'
        },
        {
          id: 2,
          songTitle: 'Praise Him',
          artistName: 'Worship Collective',
          productTitle: 'Contemporary Worship Hits',
          trackPosition: 3,
          duration: '4:12',
          explicit: false,
          genre: 'Worship',
          subGenre: 'Contemporary Worship',
          language: 'English',
          bpm: 85,
          songKey: 'G Major',
          fileType: 'WAV',
          audioFileName: 'praise_him_worship.wav',
          coverFileName: 'praise_him_cover.jpg',
          version: '1.0',
          vocalType: 'Group Vocal',
          moodDescription: 'Celebratory, Joyful',
          isrc: 'US-ABC-12-34568',
          upc: '123456789013',
          label: 'Worship Records',
          catalogueNo: 'WR002',
          copyrightOwner: 'Worship Collective',
          composerAuthor: 'Sarah Johnson',
          publisher: 'Worship Publishing',
          pro: 'ASCAP',
          bmiWorkNo: '',
          ascapWorkNo: '987654321',
          releaseDate: '2024-02-01',
          releaseLabel: 'Worship Records',
          distributionCompany: 'MSC Distribution',
          releaseStatus: 'pending',
          preReleaseDate: '2024-01-20',
          submittedToStores: false,
          createdAt: '2024-01-10T09:00:00Z',
          updatedAt: '2024-01-25T16:45:00Z'
        }
      ];

      setCreations(mockCreations);
    } catch (error) {
      console.error('Error fetching creations:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCreations = creations.filter(creation => {
    const matchesSearch = !filters.search || 
      creation.songTitle.toLowerCase().includes(filters.search.toLowerCase()) ||
      creation.artistName.toLowerCase().includes(filters.search.toLowerCase()) ||
      creation.isrc.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesGenre = !filters.genre || creation.genre === filters.genre;
    const matchesStatus = !filters.releaseStatus || creation.releaseStatus === filters.releaseStatus;
    const matchesLabel = !filters.label || creation.label === filters.label;
    const matchesArtist = !filters.artist || creation.artistName === filters.artist;
    const matchesExplicit = !filters.explicit || creation.explicit.toString() === filters.explicit;
    const matchesLanguage = !filters.language || creation.language === filters.language;
    
    return matchesSearch && matchesGenre && matchesStatus && matchesLabel && 
           matchesArtist && matchesExplicit && matchesLanguage;
  });

  const paginatedCreations = filteredCreations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleCreationSelect = (creationId) => {
    setSelectedCreations(prev => 
      prev.includes(creationId) 
        ? prev.filter(id => id !== creationId)
        : [...prev, creationId]
    );
  };

  const handleSelectAll = () => {
    if (selectedCreations.length === paginatedCreations.length) {
      setSelectedCreations([]);
    } else {
      setSelectedCreations(paginatedCreations.map(c => c.id));
    }
  };

  const handleViewDetails = (creation) => {
    setSelectedCreation(creation);
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
      genre: '',
      releaseStatus: '',
      label: '',
      artist: '',
      dateFrom: '',
      dateTo: '',
      explicit: '',
      language: ''
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading creations...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>All Creations - Distribution Partner - {COMPANY_INFO.name}</title>
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
                <h1 className="text-2xl font-bold text-gray-900">All Creations</h1>
                <Badge color="blue" className="ml-3">
                  {filteredCreations.length} creations
                </Badge>
              </div>
              <div className="flex items-center space-x-4">
                <Button color="blue" size="sm">
                  <HiPlus className="w-4 h-4 mr-2" />
                  New Creation
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
                        placeholder="Search by song title, artist, ISRC..."
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
                        <Label htmlFor="genre">Genre</Label>
                        <Select
                          id="genre"
                          value={filters.genre}
                          onChange={(e) => setFilters({ ...filters, genre: e.target.value })}
                        >
                          <option value="">All Genres</option>
                          <option value="Gospel">Gospel</option>
                          <option value="Worship">Worship</option>
                          <option value="Contemporary Christian">Contemporary Christian</option>
                          <option value="Christian Rock">Christian Rock</option>
                          <option value="Inspirational">Inspirational</option>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="releaseStatus">Release Status</Label>
                        <Select
                          id="releaseStatus"
                          value={filters.releaseStatus}
                          onChange={(e) => setFilters({ ...filters, releaseStatus: e.target.value })}
                        >
                          <option value="">All Status</option>
                          <option value="released">Released</option>
                          <option value="pending">Pending</option>
                          <option value="in_progress">In Progress</option>
                          <option value="rejected">Rejected</option>
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

                {/* Creations Table */}
                <Card>
                  <div className="overflow-x-auto">
                    <Table>
                      <Table.Head>
                        <Table.HeadCell className="w-4">
                          <Checkbox
                            checked={selectedCreations.length === paginatedCreations.length}
                            onChange={handleSelectAll}
                          />
                        </Table.HeadCell>
                        <Table.HeadCell>Song Title</Table.HeadCell>
                        <Table.HeadCell>Artist</Table.HeadCell>
                        <Table.HeadCell>Product Title</Table.HeadCell>
                        <Table.HeadCell>Track #</Table.HeadCell>
                        <Table.HeadCell>Duration</Table.HeadCell>
                        <Table.HeadCell>Genre</Table.HeadCell>
                        <Table.HeadCell>ISRC</Table.HeadCell>
                        <Table.HeadCell>Status</Table.HeadCell>
                        <Table.HeadCell>Actions</Table.HeadCell>
                      </Table.Head>
                      <Table.Body>
                        {paginatedCreations.map((creation) => {
                          const StatusIcon = getStatusIcon(creation.releaseStatus);
                          return (
                            <Table.Row key={creation.id} className="hover:bg-gray-50">
                              <Table.Cell>
                                <Checkbox
                                  checked={selectedCreations.includes(creation.id)}
                                  onChange={() => handleCreationSelect(creation.id)}
                                />
                              </Table.Cell>
                              <Table.Cell>
                                <div>
                                  <div className="font-medium text-gray-900">{creation.songTitle}</div>
                                  <div className="text-sm text-gray-500">{creation.subGenre}</div>
                                </div>
                              </Table.Cell>
                              <Table.Cell className="font-medium text-gray-900">
                                {creation.artistName}
                              </Table.Cell>
                              <Table.Cell className="text-sm text-gray-600">
                                {creation.productTitle}
                              </Table.Cell>
                              <Table.Cell className="text-sm text-gray-600">
                                {creation.trackPosition}
                              </Table.Cell>
                              <Table.Cell className="text-sm text-gray-600">
                                {creation.duration}
                              </Table.Cell>
                              <Table.Cell>
                                <Badge color="gray" size="sm">
                                  {creation.genre}
                                </Badge>
                              </Table.Cell>
                              <Table.Cell className="text-sm text-gray-600 font-mono">
                                {creation.isrc}
                              </Table.Cell>
                              <Table.Cell>
                                <div className="flex items-center space-x-2">
                                  <StatusIcon className="w-4 h-4 text-gray-400" />
                                  <Badge color={getStatusColor(creation.releaseStatus)} size="sm">
                                    {creation.releaseStatus.replace('_', ' ')}
                                  </Badge>
                                </div>
                              </Table.Cell>
                              <Table.Cell>
                                <div className="flex space-x-2">
                                  <Button size="xs" color="gray" onClick={() => handleViewDetails(creation)}>
                                    <HiEye className="w-4 h-4" />
                                  </Button>
                                  <Button size="xs" color="blue">
                                    <HiPencil className="w-4 h-4" />
                                  </Button>
                                </div>
                              </Table.Cell>
                            </Table.Row>
                          );
                        })}
                      </Table.Body>
                    </Table>
                  </div>

                  {/* Pagination */}
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-gray-700">
                      Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredCreations.length)} of {filteredCreations.length} results
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
                        disabled={currentPage * itemsPerPage >= filteredCreations.length}
                        onClick={() => setCurrentPage(currentPage + 1)}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* Creation Detail Modal */}
        <Modal show={showDetailModal} onClose={() => setShowDetailModal(false)} size="4xl">
          <Modal.Header>
            Creation Details - {selectedCreation?.songTitle}
          </Modal.Header>
          <Modal.Body>
            {selectedCreation && (
              <div className="space-y-6">
                {/* Basic Info */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Song Title</Label>
                      <p className="text-sm text-gray-900">{selectedCreation.songTitle}</p>
                    </div>
                    <div>
                      <Label>Artist Name</Label>
                      <p className="text-sm text-gray-900">{selectedCreation.artistName}</p>
                    </div>
                    <div>
                      <Label>Product Title</Label>
                      <p className="text-sm text-gray-900">{selectedCreation.productTitle}</p>
                    </div>
                    <div>
                      <Label>Track Position</Label>
                      <p className="text-sm text-gray-900">{selectedCreation.trackPosition}</p>
                    </div>
                    <div>
                      <Label>Duration</Label>
                      <p className="text-sm text-gray-900">{selectedCreation.duration}</p>
                    </div>
                    <div>
                      <Label>Explicit</Label>
                      <p className="text-sm text-gray-900">{selectedCreation.explicit ? 'Yes' : 'No'}</p>
                    </div>
                    <div>
                      <Label>Genre</Label>
                      <p className="text-sm text-gray-900">{selectedCreation.genre}</p>
                    </div>
                    <div>
                      <Label>Sub Genre</Label>
                      <p className="text-sm text-gray-900">{selectedCreation.subGenre}</p>
                    </div>
                    <div>
                      <Label>Language</Label>
                      <p className="text-sm text-gray-900">{selectedCreation.language}</p>
                    </div>
                  </div>
                </div>

                {/* Technical Info */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Technical Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>BPM</Label>
                      <p className="text-sm text-gray-900">{selectedCreation.bpm}</p>
                    </div>
                    <div>
                      <Label>Song Key</Label>
                      <p className="text-sm text-gray-900">{selectedCreation.songKey}</p>
                    </div>
                    <div>
                      <Label>File Type</Label>
                      <p className="text-sm text-gray-900">{selectedCreation.fileType}</p>
                    </div>
                    <div>
                      <Label>Audio File Name</Label>
                      <p className="text-sm text-gray-900 font-mono">{selectedCreation.audioFileName}</p>
                    </div>
                    <div>
                      <Label>Cover File Name</Label>
                      <p className="text-sm text-gray-900 font-mono">{selectedCreation.coverFileName}</p>
                    </div>
                    <div>
                      <Label>Version</Label>
                      <p className="text-sm text-gray-900">{selectedCreation.version}</p>
                    </div>
                    <div>
                      <Label>Vocal Type</Label>
                      <p className="text-sm text-gray-900">{selectedCreation.vocalType}</p>
                    </div>
                    <div>
                      <Label>Mood Description</Label>
                      <p className="text-sm text-gray-900">{selectedCreation.moodDescription}</p>
                    </div>
                  </div>
                </div>

                {/* Rights & Publishing */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Rights & Publishing</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>ISRC</Label>
                      <p className="text-sm text-gray-900 font-mono">{selectedCreation.isrc}</p>
                    </div>
                    <div>
                      <Label>UPC</Label>
                      <p className="text-sm text-gray-900 font-mono">{selectedCreation.upc}</p>
                    </div>
                    <div>
                      <Label>Label</Label>
                      <p className="text-sm text-gray-900">{selectedCreation.label}</p>
                    </div>
                    <div>
                      <Label>Catalogue No.</Label>
                      <p className="text-sm text-gray-900">{selectedCreation.catalogueNo}</p>
                    </div>
                    <div>
                      <Label>Copyright Owner</Label>
                      <p className="text-sm text-gray-900">{selectedCreation.copyrightOwner}</p>
                    </div>
                    <div>
                      <Label>Composer/Author</Label>
                      <p className="text-sm text-gray-900">{selectedCreation.composerAuthor}</p>
                    </div>
                    <div>
                      <Label>Publisher</Label>
                      <p className="text-sm text-gray-900">{selectedCreation.publisher}</p>
                    </div>
                    <div>
                      <Label>PRO</Label>
                      <p className="text-sm text-gray-900">{selectedCreation.pro}</p>
                    </div>
                    <div>
                      <Label>BMI Work #</Label>
                      <p className="text-sm text-gray-900">{selectedCreation.bmiWorkNo || 'N/A'}</p>
                    </div>
                    <div>
                      <Label>ASCAP Work #</Label>
                      <p className="text-sm text-gray-900">{selectedCreation.ascapWorkNo || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Release Info */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Release Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Release Date</Label>
                      <p className="text-sm text-gray-900">{selectedCreation.releaseDate}</p>
                    </div>
                    <div>
                      <Label>Release Label</Label>
                      <p className="text-sm text-gray-900">{selectedCreation.releaseLabel}</p>
                    </div>
                    <div>
                      <Label>Distribution Company</Label>
                      <p className="text-sm text-gray-900">{selectedCreation.distributionCompany}</p>
                    </div>
                    <div>
                      <Label>Release Status</Label>
                      <Badge color={getStatusColor(selectedCreation.releaseStatus)}>
                        {selectedCreation.releaseStatus.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div>
                      <Label>Pre-Release Date</Label>
                      <p className="text-sm text-gray-900">{selectedCreation.preReleaseDate}</p>
                    </div>
                    <div>
                      <Label>Submitted to Stores</Label>
                      <p className="text-sm text-gray-900">{selectedCreation.submittedToStores ? 'Yes' : 'No'}</p>
                    </div>
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
              Edit Creation
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </>
  );
}

export default function AllCreationsPage() {
  return (
    <RoleProtectedRoute requiredRoles={['distribution_partner']}>
      <AllCreationsView />
    </RoleProtectedRoute>
  );
} 