import { useAuth0 } from "@auth0/auth0-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import MainLayout from "@/components/layouts/mainLayout";
import SEO from "@/components/seo";
import { 
  Plus, Edit, Trash2, Eye, Music, Users, FileText, 
  Search, Filter, Download, TrendingUp 
} from "lucide-react";
import CurrencySelector, { formatCurrency, useCurrencySync } from '@/components/shared/CurrencySelector';
import { ARTISTS, RELEASES, SONGS } from "@/lib/mockData";
import { getUserRole } from "@/lib/auth0-config";
import { RELEASE_STATUSES, RELEASE_STATUS_LABELS } from "@/lib/constants";

function AdminContent() {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("songs");
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedCurrency, updateCurrency] = useCurrencySync('GBP');
  const [searchTerm, setSearchTerm] = useState('');

  // Get user role
  const userRole = getUserRole(user);

  // Check if user is admin
  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated || !user?.email?.endsWith('@mscandco.com')) {
      router.push("/");
    }
  }, [isAuthenticated, isLoading, user, router]);

  // Comprehensive mock data for admin content management - matches our database
  const mockSongs = [
    { id: 1, title: 'Urban Beat', artist: 'YHWH MSC', genre: 'Hip Hop', status: 'active', streams: 45000, duration: '3:30' },
    { id: 2, title: 'Street Rhythm', artist: 'YHWH MSC', genre: 'Hip Hop', status: 'active', streams: 38000, duration: '4:15' },
    { id: 3, title: 'City Lights', artist: 'YHWH MSC', genre: 'Hip Hop', status: 'active', streams: 42000, duration: '3:45' },
    { id: 4, title: 'Hit Single #1', artist: 'Global Superstar', genre: 'Pop', status: 'active', streams: 950000, duration: '3:25' },
    { id: 5, title: 'Radio Favorite', artist: 'Global Superstar', genre: 'Pop', status: 'active', streams: 890000, duration: '3:18' },
    { id: 6, title: 'Starlight', artist: 'Seoul Stars', genre: 'Pop', status: 'active', streams: 1500000, duration: '3:15' },
    { id: 7, title: 'Electric Love', artist: 'Seoul Stars', genre: 'Pop', status: 'active', streams: 1200000, duration: '3:42' },
    { id: 8, title: 'Opening Anthem (Live)', artist: 'Rock Legends', genre: 'Rock', status: 'active', streams: 400000, duration: '4:30' },
    { id: 9, title: 'Digital Sunrise', artist: 'DJ Phoenix', genre: 'Electronic', status: 'pending', streams: 0, duration: '4:20' },
    { id: 10, title: 'Fuego', artist: 'Carlos Mendez', genre: 'Latin', status: 'active', streams: 280000, duration: '3:28' }
  ];

  const mockStems = [
    { id: 1, title: 'Urban Beat - Vocals', song: 'Urban Beat', artist: 'YHWH MSC', type: 'vocals', size: '15.2 MB' },
    { id: 2, title: 'Urban Beat - Instrumental', song: 'Urban Beat', artist: 'YHWH MSC', type: 'instrumental', size: '18.4 MB' },
    { id: 3, title: 'Urban Beat - Drums', song: 'Urban Beat', artist: 'YHWH MSC', type: 'drums', size: '12.1 MB' },
    { id: 4, title: 'Starlight - Vocals', song: 'Starlight', artist: 'Seoul Stars', type: 'vocals', size: '14.8 MB' },
    { id: 5, title: 'Starlight - Instrumental', song: 'Starlight', artist: 'Seoul Stars', type: 'instrumental', size: '16.3 MB' },
    { id: 6, title: 'Hit Single #1 - Acapella', song: 'Hit Single #1', artist: 'Global Superstar', type: 'vocals', size: '13.7 MB' }
  ];

  const mockArtists = [
    { id: 1, name: 'YHWH MSC', genre: 'Hip Hop', songs: 6, totalStreams: 125000, status: 'active', label: 'MSC & Co' },
    { id: 2, name: 'Global Superstar', genre: 'Pop', songs: 3, totalStreams: 2800000, status: 'active', label: 'Major Label Music' },
    { id: 3, name: 'Seoul Stars', genre: 'Pop', songs: 3, totalStreams: 4500000, status: 'active', label: 'K-Entertainment' },
    { id: 4, name: 'Rock Legends', genre: 'Rock', songs: 3, totalStreams: 1200000, status: 'active', label: 'Live Music Records' },
    { id: 5, name: 'DJ Phoenix', genre: 'Electronic', songs: 4, totalStreams: 0, status: 'pending', label: 'Digital Beats' },
    { id: 6, name: 'Carlos Mendez', genre: 'Latin', songs: 1, totalStreams: 280000, status: 'active', label: 'Latin Beats Records' },
    { id: 7, name: 'Emma Rodriguez', genre: 'Pop', songs: 1, totalStreams: 0, status: 'pending', label: 'Indie Sounds' },
    { id: 8, name: 'Marcus Williams Quartet', genre: 'Jazz', songs: 3, totalStreams: 0, status: 'inactive', label: 'Jazz Heritage' },
    { id: 9, name: 'The Basement Band', genre: 'Rock', songs: 3, totalStreams: 0, status: 'pending', label: 'Underground Records' },
    { id: 10, name: 'Film Composer Orchestra', genre: 'Classical', songs: 4, totalStreams: 0, status: 'pending', label: 'Cinematic Music' },
    { id: 11, name: 'Nashville Dreams', genre: 'Country', songs: 3, totalStreams: 0, status: 'inactive', label: 'Country Music Nashville' }
  ];

  const mockGenres = [
    { id: 1, name: 'Hip Hop', songs: 6, artists: 1, color: '#8B5CF6' },
    { id: 2, name: 'Pop', songs: 9, artists: 3, color: '#EF4444' },
    { id: 3, name: 'Rock', songs: 6, artists: 2, color: '#F59E0B' },
    { id: 4, name: 'Electronic', songs: 4, artists: 1, color: '#10B981' },
    { id: 5, name: 'Latin', songs: 1, artists: 1, color: '#F97316' },
    { id: 6, name: 'Jazz', songs: 3, artists: 1, color: '#6366F1' },
    { id: 7, name: 'Classical', songs: 4, artists: 1, color: '#84CC16' },
    { id: 8, name: 'Country', songs: 3, artists: 1, color: '#06B6D4' }
  ];

  // Use mock data instead of API calls
  const songs = { data: mockSongs };
  const stems = { data: mockStems };
  const artists = { data: mockArtists };
  const genres = { data: mockGenres };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated || !user?.email?.endsWith('@mscandco.com')) {
    return null;
  }

  const renderContentList = () => {
    const items = activeTab === "songs" ? songs?.data : stems?.data;
    
    return (
      <div className="space-y-4">
        {items?.map((item) => (
          <Card key={item.id}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img
                  src={resourceUrl(item.attributes.cover?.data?.attributes?.url)}
                  alt={item.attributes.title}
                  className="w-16 h-16 object-cover rounded"
                />
                <div>
                  <h3 className="font-semibold">{item.attributes.title}</h3>
                  <p className="text-sm text-gray-600">
                    {item.attributes.artists?.data?.map(a => a.attributes.name).join(", ") ||
                     item.attributes.singers?.data?.map(a => a.attributes.name).join(", ")}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <Badge color="gray">{activeTab.slice(0, -1)}</Badge>
                    {item.attributes.credit && (
                      <Badge color="blue">{item.attributes.credit} credit{item.attributes.credit !== 1 ? 's' : ''}</Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" color="gray">
                  <HiEye className="h-4 w-4" />
                </Button>
                <Button size="sm" color="gray">
                  <HiPencil className="h-4 w-4" />
                </Button>
                <Button size="sm" color="failure">
                  <HiTrash className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <MainLayout>
      <SEO pageTitle="Admin Content Management" />
      <div className="py-8 md:py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Content Management</h1>
            <Button onClick={() => setShowModal(true)}>
              <HiPlus className="h-4 w-4 mr-2" />
              Add {activeTab.slice(0, -1)}
            </Button>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-6">
            <Button
              color={activeTab === "songs" ? "blue" : "gray"}
              onClick={() => setActiveTab("songs")}
            >
              Songs ({songs?.data?.length || 0})
            </Button>
            <Button
              color={activeTab === "stems" ? "blue" : "gray"}
              onClick={() => setActiveTab("stems")}
            >
              Stems ({stems?.data?.length || 0})
            </Button>
            <Button
              color={activeTab === "artists" ? "blue" : "gray"}
              onClick={() => setActiveTab("artists")}
            >
              Artists ({artists?.data?.length || 0})
            </Button>
            <Button
              color={activeTab === "genres" ? "blue" : "gray"}
              onClick={() => setActiveTab("genres")}
            >
              Genres ({genres?.data?.length || 0})
            </Button>
          </div>

          {/* Content List */}
          {renderContentList()}

          {/* Add/Edit Modal */}
          <Modal show={showModal} onClose={() => setShowModal(false)}>
            <Modal.Header>
              {editingItem ? "Edit" : "Add"} {activeTab.slice(0, -1)}
            </Modal.Header>
            <Modal.Body>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <TextInput id="title" placeholder="Enter title" />
                </div>
                <div>
                  <Label htmlFor="credit">Credits Required</Label>
                  <TextInput id="credit" type="number" placeholder="1" />
                </div>
                <div>
                  <Label htmlFor="artist">Artist</Label>
                  <Select id="artist">
                    <option>Select artist</option>
                    {artists?.data?.map(artist => (
                      <option key={artist.id} value={artist.id}>
                        {artist.attributes.name}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label htmlFor="genre">Genre</Label>
                  <Select id="genre">
                    <option>Select genre</option>
                    {genres?.data?.map(genre => (
                      <option key={genre.id} value={genre.id}>
                        {genre.attributes.title}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button onClick={() => setShowModal(false)}>
                {editingItem ? "Update" : "Create"}
              </Button>
              <Button color="gray" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
            </Modal.Footer>
          </Modal>
        </div>
      </div>
    </MainLayout>
  );
}

export default AdminContent; 