import { useUser } from '@/components/providers/SupabaseProvider';
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import MainLayout from "@/components/layouts/mainLayout";
import SEO from "@/components/seo";
import { Card, Button, Badge, Modal, TextInput, Label, Select, Tabs, Table } from "flowbite-react";
import { HiFilter, HiEye, HiDownload, HiChartBar, HiCalendar, HiUsers, HiMusicNote } from "lucide-react";
import useSWR from "swr";
import { apiRoute } from "@/lib/utils";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import ExportButton from "@/components/export/ExportButton";
import ExportSettingsModal from "@/components/export/ExportSettingsModal";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

function DistributionPartnerDashboard() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all-creations");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({});
  const [selectedCreation, setSelectedCreation] = useState(null);
  const [showCreationModal, setShowCreationModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportSettings, setExportSettings] = useState({});

  // Check if user is distribution partner
  useEffect(() => {
    if (isLoading) return;
    if (!user || !user || user['https://mscandco.com/role'] !== 'distribution_partner') {
      router.push("/");
    }
  }, [user, isLoading, user, router]);

  const { data: creations, mutate: mutateCreations } = useSWR(
    apiRoute("/creations?populate=*&sort=createdAt:desc")
  );

  const { data: projects, mutate: mutateProjects } = useSWR(
    apiRoute("/projects?populate=*&sort=createdAt:desc")
  );

  const { data: artists, mutate: mutateArtists } = useSWR(
    apiRoute("/artists?populate=*&sort=name:asc")
  );

  const { data: genres, mutate: mutateGenres } = useSWR(
    apiRoute("/genres?populate=*&sort=title:asc")
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user || !user || user['https://mscandco.com/role'] !== 'distribution_partner') {
    return null;
  }

  const filteredCreations = creations?.data?.filter(creation => {
    if (!filters.artist && !filters.genre && !filters.status && !filters.explicit) {
      return true;
    }
    
    return (
      (!filters.artist || creation.attributes.artistName?.includes(filters.artist)) &&
      (!filters.genre || creation.attributes.genre?.some(g => g.title?.includes(filters.genre))) &&
      (!filters.status || creation.attributes.status === filters.status) &&
      (!filters.explicit || creation.attributes.isExplicit === (filters.explicit === 'true'))
    );
  }) || [];

  const statusCounts = {
    draft: filteredCreations.filter(c => c.attributes.status === 'draft').length,
    in_progress: filteredCreations.filter(c => c.attributes.status === 'in_progress').length,
    completed: filteredCreations.filter(c => c.attributes.status === 'completed').length,
    approved: filteredCreations.filter(c => c.attributes.status === 'approved').length,
    rejected: filteredCreations.filter(c => c.attributes.status === 'rejected').length
  };

  const chartData = {
    labels: Object.keys(statusCounts),
    datasets: [
      {
        label: 'Creations by Status',
        data: Object.values(statusCounts),
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)'
        ],
        borderWidth: 1
      }
    ]
  };

  const viewCreation = (creation) => {
    setSelectedCreation(creation);
    setShowCreationModal(true);
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: 'gray',
      in_progress: 'yellow',
      completed: 'green',
      approved: 'blue',
      rejected: 'red'
    };
    return colors[status] || 'gray';
  };

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Export columns configuration
  const exportColumns = [
    { header: 'Song Title', key: 'title', width: 30 },
    { header: 'Artist', key: 'artistName', width: 25 },
    { header: 'ISRC', key: 'isrc', width: 15 },
    { header: 'Duration', key: 'duration', width: 12 },
    { header: 'BPM', key: 'bpm', width: 10 },
    { header: 'Key', key: 'key', width: 10 },
    { header: 'Genre', key: 'genre', width: 20 },
    { header: 'Status', key: 'status', width: 15 },
    { header: 'Release Date', key: 'releaseDate', width: 15 },
    { header: 'Explicit', key: 'isExplicit', width: 10 },
    { header: 'Recording Studio', key: 'recordingStudio', width: 25 },
    { header: 'Producer', key: 'producer', width: 25 },
    { header: 'Mixer', key: 'mixer', width: 25 },
    { header: 'Mastering Engineer', key: 'masteringEngineer', width: 25 },
    { header: 'Publishing', key: 'publishing', width: 25 },
    { header: 'Publishing Admin', key: 'publishingAdmin', width: 25 },
    { header: 'Publisher IPI', key: 'publisherIpi', width: 15 },
    { header: 'Publishing Type', key: 'publishingType', width: 20 },
    { header: 'Vocals', key: 'vocals', width: 25 },
    { header: 'Guitars', key: 'guitars', width: 25 },
    { header: 'Bass', key: 'bass', width: 25 },
    { header: 'Drums', key: 'drums', width: 25 },
    { header: 'Keyboards', key: 'keyboards', width: 25 },
    { header: 'Programming', key: 'programming', width: 25 },
    { header: 'Featuring Artists', key: 'featuringArtists', width: 30 }
  ];

  // Prepare data for export
  const exportData = filteredCreations.map(creation => ({
    title: creation.attributes.title,
    artistName: creation.attributes.artistName,
    isrc: creation.attributes.isrc,
    duration: creation.attributes.duration ? formatDuration(creation.attributes.duration) : '',
    bpm: creation.attributes.bpm,
    key: creation.attributes.key,
    genre: creation.attributes.genre?.map(g => g.title).join(', ') || '',
    status: creation.attributes.status,
    releaseDate: creation.attributes.releaseDate,
    isExplicit: creation.attributes.isExplicit ? 'Yes' : 'No',
    recordingStudio: creation.attributes.recordingStudio,
    producer: creation.attributes.producer,
    mixer: creation.attributes.mixer,
    masteringEngineer: creation.attributes.masteringEngineer,
    publishing: creation.attributes.publishing,
    publishingAdmin: creation.attributes.publishingAdmin,
    publisherIpi: creation.attributes.publisherIpi,
    publishingType: creation.attributes.publishingType,
    vocals: creation.attributes.vocals,
    guitars: creation.attributes.guitars,
    bass: creation.attributes.bass,
    drums: creation.attributes.drums,
    keyboards: creation.attributes.keyboards,
    programming: creation.attributes.programming,
    featuringArtists: creation.attributes.featuringArtists
  }));

  const handleExport = async (settings) => {
    try {
      // Use the API export manager for server-side generation
      const response = await fetch('/api/export/creations/excel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.access_token}`
        },
        body: JSON.stringify({
          filters,
          columns: settings.selectedColumns || exportColumns.map(col => col.key),
          format: settings.format || 'excel',
          detailLevel: settings.detailLevel || 'detailed'
        })
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${settings.filename || 'msc-creations-export'}.${settings.format || 'xlsx'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
      console.error('Export failed:', error.message);
    }
  };

  return (
    <MainLayout>
      <SEO title="Distribution Partner Dashboard" />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Distribution Partner Dashboard</h1>
          <p className="text-gray-600">Manage and view all creations and projects for distribution</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <div className="flex items-center">
              <HiMusicNote className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Creations</p>
                <p className="text-2xl font-bold text-gray-900">{filteredCreations.length}</p>
              </div>
            </div>
          </Card>
          
          <Card>
            <div className="flex items-center">
              <HiCalendar className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Projects</p>
                <p className="text-2xl font-bold text-gray-900">{projects?.data?.length || 0}</p>
              </div>
            </div>
          </Card>
          
          <Card>
            <div className="flex items-center">
              <HiUsers className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Artists</p>
                <p className="text-2xl font-bold text-gray-900">{artists?.data?.length || 0}</p>
              </div>
            </div>
          </Card>
          
          <Card>
            <div className="flex items-center">
              <HiChartBar className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Genres</p>
                <p className="text-2xl font-bold text-gray-900">{genres?.data?.length || 0}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Filters</h3>
            <div className="flex gap-2">
              <ExportButton
                userRole={user?.['https://mscandco.com/role']}
                exportType="creations"
                data={exportData}
                columns={exportColumns}
                filters={filters}
                onExportStart={() => console.log('Export started')}
                onExportComplete={() => console.log('Export completed')}
                onExportError={(error) => console.error('Export failed:', error)}
                variant="blue"
                size="sm"
              />
              <Button
                color="gray"
                onClick={() => setShowFilters(!showFilters)}
              >
                <HiFilter className="mr-2 h-4 w-4" />
                {showFilters ? 'Hide' : 'Show'} Filters
              </Button>
            </div>
          </div>
          
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="artist">Artist</Label>
                <TextInput
                  id="artist"
                  placeholder="Filter by artist..."
                  value={filters.artist || ''}
                  onChange={(e) => setFilters({...filters, artist: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="genre">Genre</Label>
                <Select
                  id="genre"
                  value={filters.genre || ''}
                  onChange={(e) => setFilters({...filters, genre: e.target.value})}
                >
                  <option value="">All Genres</option>
                  {genres?.data?.map(genre => (
                    <option key={genre.id} value={genre.attributes.title}>
                      {genre.attributes.title}
                    </option>
                  ))}
                </Select>
              </div>
              
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  id="status"
                  value={filters.status || ''}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                >
                  <option value="">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="explicit">Explicit</Label>
                <Select
                  id="explicit"
                  value={filters.explicit || ''}
                  onChange={(e) => setFilters({...filters, explicit: e.target.value})}
                >
                  <option value="">All</option>
                  <option value="true">Explicit</option>
                  <option value="false">Clean</option>
                </Select>
              </div>
            </div>
          )}
        </Card>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card>
            <h3 className="text-lg font-semibold mb-4">Creations by Status</h3>
            <div className="h-64">
              <Pie data={chartData} options={{ maintainAspectRatio: false }} />
            </div>
          </Card>
          
          <Card>
            <h3 className="text-lg font-semibold mb-4">Status Overview</h3>
            <div className="space-y-3">
              {Object.entries(statusCounts).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <span className="capitalize">{status.replace('_', ' ')}</span>
                  <Badge color={getStatusColor(status)}>{count}</Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs.Group style="pills" onActiveTabChange={(tab) => setActiveTab(tab)}>
          <Tabs.Item title="All Creations" icon={HiMusicNote}>
            <Card>
              <div className="overflow-x-auto">
                <Table>
                  <Table.Head>
                    <Table.HeadCell>Title</Table.HeadCell>
                    <Table.HeadCell>Artist</Table.HeadCell>
                    <Table.HeadCell>Duration</Table.HeadCell>
                    <Table.HeadCell>BPM</Table.HeadCell>
                    <Table.HeadCell>Status</Table.HeadCell>
                    <Table.HeadCell>Actions</Table.HeadCell>
                  </Table.Head>
                  <Table.Body>
                    {filteredCreations.map(creation => (
                      <Table.Row key={creation.id}>
                        <Table.Cell className="font-medium">
                          {creation.attributes.title}
                        </Table.Cell>
                        <Table.Cell>
                          {creation.attributes.artistName || 'N/A'}
                        </Table.Cell>
                        <Table.Cell>
                          {creation.attributes.duration ? formatDuration(creation.attributes.duration) : 'N/A'}
                        </Table.Cell>
                        <Table.Cell>
                          {creation.attributes.bpm || 'N/A'}
                        </Table.Cell>
                        <Table.Cell>
                          <Badge color={getStatusColor(creation.attributes.status)}>
                            {creation.attributes.status.replace('_', ' ')}
                          </Badge>
                        </Table.Cell>
                        <Table.Cell>
                          <Button size="sm" onClick={() => viewCreation(creation)}>
                            <HiEye className="mr-2 h-4 w-4" />
                            View
                          </Button>
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table>
              </div>
            </Card>
          </Tabs.Item>
          
          <Tabs.Item title="Sync Board" icon={HiChartBar}>
            <Card>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCreations.map(creation => (
                  <div key={creation.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-sm">{creation.attributes.title}</h4>
                      <Badge color={getStatusColor(creation.attributes.status)} size="sm">
                        {creation.attributes.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">
                      {creation.attributes.artistName || 'Unknown Artist'}
                    </p>
                    <p className="text-xs text-gray-600 mb-3">
                      {creation.attributes.releaseLabel || 'No Label'}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">
                        {creation.attributes.genre?.map(g => g.title).join(', ') || 'No Genre'}
                      </span>
                      <Button size="xs" onClick={() => viewCreation(creation)}>
                        <HiEye className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </Tabs.Item>
          
          <Tabs.Item title="Projects" icon={HiCalendar}>
            <Card>
              <div className="overflow-x-auto">
                <Table>
                  <Table.Head>
                    <Table.HeadCell>Project Title</Table.HeadCell>
                    <Table.HeadCell>Artist</Table.HeadCell>
                    <Table.HeadCell>Type</Table.HeadCell>
                    <Table.HeadCell>Status</Table.HeadCell>
                    <Table.HeadCell>Actions</Table.HeadCell>
                  </Table.Head>
                  <Table.Body>
                    {projects?.data?.map(project => (
                      <Table.Row key={project.id}>
                        <Table.Cell className="font-medium">
                          {project.attributes.title}
                        </Table.Cell>
                        <Table.Cell>
                          {project.attributes.artist?.name || 'N/A'}
                        </Table.Cell>
                        <Table.Cell>
                          {project.attributes.type || 'N/A'}
                        </Table.Cell>
                        <Table.Cell>
                          <Badge color={getStatusColor(project.attributes.status)}>
                            {project.attributes.status.replace('_', ' ')}
                          </Badge>
                        </Table.Cell>
                        <Table.Cell>
                          <Button size="sm">
                            <HiEye className="mr-2 h-4 w-4" />
                            View
                          </Button>
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table>
              </div>
            </Card>
          </Tabs.Item>
        </Tabs.Group>

        {/* Creation Detail Modal */}
        <Modal show={showCreationModal} onClose={() => setShowCreationModal(false)} size="4xl">
          <Modal.Header>
            Creation Details
          </Modal.Header>
          <Modal.Body>
            {selectedCreation && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">Basic Information</h4>
                    <div className="space-y-2 text-sm">
                      <div><strong>Title:</strong> {selectedCreation.attributes.title}</div>
                      <div><strong>Artist:</strong> {selectedCreation.attributes.artistName}</div>
                      <div><strong>Duration:</strong> {selectedCreation.attributes.duration ? formatDuration(selectedCreation.attributes.duration) : 'N/A'}</div>
                      <div><strong>BPM:</strong> {selectedCreation.attributes.bpm || 'N/A'}</div>
                      <div><strong>Key:</strong> {selectedCreation.attributes.key || 'N/A'}</div>
                      <div><strong>Explicit:</strong> {selectedCreation.attributes.isExplicit ? 'Yes' : 'No'}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Distribution Information</h4>
                    <div className="space-y-2 text-sm">
                      <div><strong>ISRC:</strong> {selectedCreation.attributes.isrc || 'N/A'}</div>
                      <div><strong>UPC:</strong> {selectedCreation.attributes.upc || 'N/A'}</div>
                      <div><strong>Label:</strong> {selectedCreation.attributes.label || 'N/A'}</div>
                      <div><strong>Release Date:</strong> {selectedCreation.attributes.releaseDate || 'N/A'}</div>
                      <div><strong>Format:</strong> {selectedCreation.attributes.format || 'N/A'}</div>
                      <div><strong>Product Type:</strong> {selectedCreation.attributes.productType || 'N/A'}</div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">Credits</h4>
                    <div className="space-y-2 text-sm">
                      <div><strong>Composer:</strong> {selectedCreation.attributes.composer || 'N/A'}</div>
                      <div><strong>Producer:</strong> {selectedCreation.attributes.producer || 'N/A'}</div>
                      <div><strong>Mixer:</strong> {selectedCreation.attributes.mixer || 'N/A'}</div>
                      <div><strong>Mastering Engineer:</strong> {selectedCreation.attributes.masteringEngineer || 'N/A'}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Publishing</h4>
                    <div className="space-y-2 text-sm">
                      <div><strong>PRO:</strong> {selectedCreation.attributes.pro || 'N/A'}</div>
                      <div><strong>Publishing:</strong> {selectedCreation.attributes.publishing || 'N/A'}</div>
                      <div><strong>Copyright Year:</strong> {selectedCreation.attributes.copyrightYear || 'N/A'}</div>
                      <div><strong>Copyright Owner:</strong> {selectedCreation.attributes.copyrightOwner || 'N/A'}</div>
                    </div>
                  </div>
                </div>
                
                {selectedCreation.attributes.lyrics && (
                  <div>
                    <h4 className="font-semibold mb-2">Lyrics</h4>
                    <div className="bg-gray-50 p-4 rounded text-sm max-h-40 overflow-y-auto">
                      {selectedCreation.attributes.lyrics}
                    </div>
                  </div>
                )}
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={() => setShowCreationModal(false)}>Close</Button>
            <Button color="blue">
              <HiDownload className="mr-2 h-4 w-4" />
              Download Metadata
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Export Settings Modal */}
        <ExportSettingsModal
          show={showExportModal}
          onClose={() => setShowExportModal(false)}
          exportType="creations"
          availableColumns={exportColumns}
          currentFilters={filters}
          onExport={handleExport}
          userRole={user?.['https://mscandco.com/role']}
        />
      </div>
    </MainLayout>
  );
}

export default DistributionPartnerDashboard; 