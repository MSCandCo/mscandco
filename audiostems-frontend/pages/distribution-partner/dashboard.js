import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { 
  Search, Filter, Grid, List, BarChart3, PieChart, 
  Play, Pause, Eye, FileText, CheckCircle, Clock,
  Music, Users, Calendar, Globe, Tag, FileAudio,
  Image, BookOpen, Code, Hash, QrCode, Database,
  Mail, Phone, Globe as GlobeIcon, Share2, ExternalLink
} from 'lucide-react';

export default function DistributionPartnerDashboard() {
  const { user, isLoading } = useAuth0();
  const [activeTab, setActiveTab] = useState('all-creations');
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    genre: 'all',
    artist: 'all',
    label: 'all',
    dateRange: 'all'
  });
  const [releases, setReleases] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock data for distribution partner dashboard
  const mockReleases = [
    {
      id: 1,
      songTitle: "Midnight Dreams",
      companyName: "YHWH MSC Records",
      legalName: "John Smith",
      artistName: "Midnight Artist",
      phoneticPronunciation: "mid-night art-ist",
      stylised: "MIDNIGHT ARTIST",
      aka: "Johnny S",
      artistType: "Solo Artist",
      productTitle: "Midnight Dreams EP",
      altTitle: "MD EP",
      trackPosition: 1,
      featuringArtists: "Sarah Vocalist",
      backgroundVocalists: "Choir Group",
      duration: "3:45",
      explicit: "No",
      version: "Original Mix",
      bpm: 128,
      songKey: "C Major",
      moodDescription: "Melancholic, Dreamy",
      tags: ["electronic", "ambient", "chill"],
      lyrics: "In the midnight dreams...",
      fileType: ".wav",
      audioFileName: "midnight_dreams_master.wav",
      coverFileName: "midnight_dreams_cover.jpg",
      language: "English",
      vocalType: "Lead Vocal",
      genre: "Electronic",
      subGenre: "Ambient",
      label: "YHWH MSC",
      catalogueNo: "YHWH001",
      format: "Digital",
      productType: "Single",
      barcode: "1234567890123",
      tunecode: "T123456789",
      iceWorkKey: "ICE123456789",
      iswc: "T-123456789-0",
      isrc: "US-ABC-12-12345",
      upc: "123456789012",
      bowi: "No",
      previousReleaseDate: null,
      recordingCountry: "United States",
      preReleaseDate: "2024-02-15",
      preReleaseUrl: "https://preview.example.com",
      releaseDate: "2024-03-01",
      releaseUrl: "https://release.example.com",
      releaseLabel: "YHWH MSC",
      distributionCompany: "Code Group",
      copyrightYear: 2024,
      copyrightOwner: "YHWH MSC",
      pLine: "℗ 2024 YHWH MSC",
      cLine: "© 2024 YHWH MSC",
      composer: "John Smith",
      role: "Composer",
      pro: "ASCAP",
      caeIpi: "123456789",
      publishing: "YHWH MSC Publishing",
      publisherIpi: "987654321",
      publishingAdmin: "Admin Company",
      publishingAdminIpi: "456789123",
      mechanical: "100%",
      bmiWork: "BMI123456",
      ascapWork: "ASCAP123456",
      isni: "0000000123456789",
      subPublisher: "Sub Pub Co",
      publishingType: "Administration",
      territory: "Worldwide",
      executiveProducer: "Exec Producer",
      producer: "Main Producer",
      mixingEngineer: "Mix Engineer",
      masteringEngineer: "Master Engineer",
      coProducer: "Co Producer",
      assistantProducer: "Assistant Producer",
      engineer: "Recording Engineer",
      editing: "Edit Engineer",
      masteringStudio: "Master Studio",
      recordingEngineer: "Record Engineer",
      additionalProduction: "Additional Prod",
      recordingStudio: "Record Studio",
      keyboards: "Keyboard Player",
      programming: "Programmer",
      bass: "Bass Player",
      drums: "Drummer",
      guitars: "Guitarist",
      organ: "Organ Player",
      percussion: "Percussionist",
      strings: "String Section",
      additionalInstrumentation: "Additional Instruments",
      designArtDirection: "Design Artist",
      management: "Manager Name",
      bookingAgent: "Booking Agent",
      pressContact: "Press Contact",
      primaryContactEmail: "contact@example.com",
      artistEmail: "artist@example.com",
      primaryContactPhone: "+1-555-0123",
      secondaryContactPhone: "+1-555-0124",
      wikipedia: "https://wikipedia.org/artist",
      socialMediaLink: "https://instagram.com/artist",
      shazam: "https://shazam.com/artist",
      tiktok: "https://tiktok.com/@artist",
      instagram: "https://instagram.com/artist",
      genius: "https://genius.com/artist",
      allMusic: "https://allmusic.com/artist",
      discogs: "https://discogs.com/artist",
      musicbrainz: "https://musicbrainz.org/artist",
      imdb: "https://imdb.com/artist",
      jaxsta: "https://jaxsta.com/artist",
      website: "https://artist.com",
      youtube: "https://youtube.com/artist",
      youtubeMusic: "https://music.youtube.com/artist",
      knowledgePanel: "https://google.com/artist",
      tourDates: "https://tourdates.com/artist",
      spotifyUri: "spotify:artist:123456",
      appleId: "apple:artist:123456",
      digitalAssetsFolder: "/assets/artist123",
      metadataApproved: "Yes",
      initials: "JS",
      submittedToStores: "Yes",
      luminate: "Submitted",
      mediabase: "Submitted",
      notes: "Ready for distribution",
      status: "ready_for_distribution",
      submittedDate: "2024-01-15",
      expectedReleaseDate: "2024-03-01"
    },
    {
      id: 2,
      songTitle: "Summer Vibes",
      companyName: "YHWH MSC Records",
      legalName: "Jane Doe",
      artistName: "Summer Artist",
      phoneticPronunciation: "sum-mer art-ist",
      stylised: "SUMMER ARTIST",
      aka: "Jane D",
      artistType: "Solo Artist",
      productTitle: "Summer Vibes Album",
      altTitle: "SV Album",
      trackPosition: 2,
      featuringArtists: "Mike Rapper",
      backgroundVocalists: "Backup Singers",
      duration: "4:20",
      explicit: "Yes",
      version: "Radio Edit",
      bpm: 120,
      songKey: "G Major",
      moodDescription: "Upbeat, Energetic",
      tags: ["pop", "summer", "upbeat"],
      lyrics: "Summer vibes are calling...",
      fileType: ".wav",
      audioFileName: "summer_vibes_master.wav",
      coverFileName: "summer_vibes_cover.jpg",
      language: "English",
      vocalType: "Lead Vocal",
      genre: "Pop",
      subGenre: "Dance Pop",
      label: "YHWH MSC",
      catalogueNo: "YHWH002",
      format: "Digital",
      productType: "Album",
      barcode: "1234567890124",
      tunecode: "T123456790",
      iceWorkKey: "ICE123456790",
      iswc: "T-123456790-0",
      isrc: "US-ABC-12-12346",
      upc: "123456789013",
      bowi: "No",
      previousReleaseDate: null,
      recordingCountry: "United States",
      preReleaseDate: "2024-02-20",
      preReleaseUrl: "https://preview.example.com",
      releaseDate: "2024-03-15",
      releaseUrl: "https://release.example.com",
      releaseLabel: "YHWH MSC",
      distributionCompany: "Code Group",
      copyrightYear: 2024,
      copyrightOwner: "YHWH MSC",
      pLine: "℗ 2024 YHWH MSC",
      cLine: "© 2024 YHWH MSC",
      composer: "Jane Doe",
      role: "Composer",
      pro: "BMI",
      caeIpi: "123456790",
      publishing: "YHWH MSC Publishing",
      publisherIpi: "987654322",
      publishingAdmin: "Admin Company",
      publishingAdminIpi: "456789124",
      mechanical: "100%",
      bmiWork: "BMI123457",
      ascapWork: "ASCAP123457",
      isni: "0000000123456790",
      subPublisher: "Sub Pub Co",
      publishingType: "Administration",
      territory: "Worldwide",
      executiveProducer: "Exec Producer",
      producer: "Main Producer",
      mixingEngineer: "Mix Engineer",
      masteringEngineer: "Master Engineer",
      coProducer: "Co Producer",
      assistantProducer: "Assistant Producer",
      engineer: "Recording Engineer",
      editing: "Edit Engineer",
      masteringStudio: "Master Studio",
      recordingEngineer: "Record Engineer",
      additionalProduction: "Additional Prod",
      recordingStudio: "Record Studio",
      keyboards: "Keyboard Player",
      programming: "Programmer",
      bass: "Bass Player",
      drums: "Drummer",
      guitars: "Guitarist",
      organ: "Organ Player",
      percussion: "Percussionist",
      strings: "String Section",
      additionalInstrumentation: "Additional Instruments",
      designArtDirection: "Design Artist",
      management: "Manager Name",
      bookingAgent: "Booking Agent",
      pressContact: "Press Contact",
      primaryContactEmail: "contact@example.com",
      artistEmail: "artist@example.com",
      primaryContactPhone: "+1-555-0125",
      secondaryContactPhone: "+1-555-0126",
      wikipedia: "https://wikipedia.org/artist",
      socialMediaLink: "https://instagram.com/artist",
      shazam: "https://shazam.com/artist",
      tiktok: "https://tiktok.com/@artist",
      instagram: "https://instagram.com/artist",
      genius: "https://genius.com/artist",
      allMusic: "https://allmusic.com/artist",
      discogs: "https://discogs.com/artist",
      musicbrainz: "https://musicbrainz.org/artist",
      imdb: "https://imdb.com/artist",
      jaxsta: "https://jaxsta.com/artist",
      website: "https://artist.com",
      youtube: "https://youtube.com/artist",
      youtubeMusic: "https://music.youtube.com/artist",
      knowledgePanel: "https://google.com/artist",
      tourDates: "https://tourdates.com/artist",
      spotifyUri: "spotify:artist:123457",
      appleId: "apple:artist:123457",
      digitalAssetsFolder: "/assets/artist124",
      metadataApproved: "Yes",
      initials: "JD",
      submittedToStores: "Yes",
      luminate: "Submitted",
      mediabase: "Submitted",
      notes: "Ready for distribution",
      status: "in_distribution",
      submittedDate: "2024-01-20",
      expectedReleaseDate: "2024-03-15"
    }
  ];

  useEffect(() => {
    if (!isLoading) {
      setReleases(mockReleases);
      setLoading(false);
    }
  }, [isLoading]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'ready_for_distribution': return 'bg-blue-100 text-blue-800';
      case 'in_distribution': return 'bg-green-100 text-green-800';
      case 'distributed': return 'bg-purple-100 text-purple-800';
      case 'on_hold': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ready_for_distribution': return <FileText className="w-4 h-4" />;
      case 'in_distribution': return <Play className="w-4 h-4" />;
      case 'distributed': return <CheckCircle className="w-4 h-4" />;
      case 'on_hold': return <Clock className="w-4 h-4" />;
      default: return <Eye className="w-4 h-4" />;
    }
  };

  const filteredReleases = releases.filter(release => {
    const matchesSearch = release.songTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         release.artistName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         release.productTitle.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filters.status === 'all' || release.status === filters.status;
    const matchesGenre = filters.genre === 'all' || release.genre === filters.genre;
    const matchesArtist = filters.artist === 'all' || release.artistName === filters.artist;
    const matchesLabel = filters.label === 'all' || release.label === filters.label;
    
    return matchesSearch && matchesStatus && matchesGenre && matchesArtist && matchesLabel;
  });

  const renderAllCreations = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">All Creations</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}
          >
            <Grid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReleases.map(release => (
            <div key={release.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{release.songTitle}</h3>
                  <p className="text-sm text-gray-600">{release.artistName}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(release.status)}`}>
                  {release.status.replace('_', ' ')}
                </span>
              </div>
              
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Product:</span>
                  <span className="font-medium">{release.productTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span>Duration:</span>
                  <span>{release.duration}</span>
                </div>
                <div className="flex justify-between">
                  <span>Genre:</span>
                  <span>{release.genre}</span>
                </div>
                <div className="flex justify-between">
                  <span>BPM:</span>
                  <span>{release.bpm}</span>
                </div>
                <div className="flex justify-between">
                  <span>Key:</span>
                  <span>{release.songKey}</span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Submitted: {new Date(release.submittedDate).toLocaleDateString()}</span>
                  <span>Release: {new Date(release.expectedReleaseDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Song</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Artist</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Genre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredReleases.map(release => (
                <tr key={release.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{release.songTitle}</div>
                      <div className="text-sm text-gray-500">{release.version}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{release.artistName}</div>
                    <div className="text-sm text-gray-500">{release.artistType}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{release.productTitle}</div>
                    <div className="text-sm text-gray-500">Track {release.trackPosition}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{release.genre}</div>
                    <div className="text-sm text-gray-500">{release.subGenre}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{release.duration}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(release.status)}`}>
                      {release.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900">View Details</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderAllProjects = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">All Projects/Releases</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReleases.map(release => (
          <div key={release.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{release.productTitle}</h3>
                <p className="text-sm text-gray-600">{release.artistName}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(release.status)}`}>
                {release.status.replace('_', ' ')}
              </span>
            </div>
            
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Label:</span>
                <span className="font-medium">{release.label}</span>
              </div>
              <div className="flex justify-between">
                <span>Format:</span>
                <span>{release.format}</span>
              </div>
              <div className="flex justify-between">
                <span>Product Type:</span>
                <span>{release.productType}</span>
              </div>
              <div className="flex justify-between">
                <span>Catalogue No:</span>
                <span>{release.catalogueNo}</span>
              </div>
              <div className="flex justify-between">
                <span>Release Date:</span>
                <span>{new Date(release.releaseDate).toLocaleDateString()}</span>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Submitted: {new Date(release.submittedDate).toLocaleDateString()}</span>
                <span>Expected: {new Date(release.expectedReleaseDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSyncBoard = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Sync Board</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredReleases.map(release => (
          <div key={release.id} className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-900 truncate">{release.songTitle}</h3>
                <p className="text-xs text-gray-600 truncate">{release.artistName}</p>
              </div>
              <div className={`w-3 h-3 rounded-full ${getStatusColor(release.status).replace('bg-', '').replace(' text-', '')}`}></div>
            </div>
            
            <div className="space-y-1 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Project:</span>
                <span className="font-medium truncate">{release.productTitle}</span>
              </div>
              <div className="flex justify-between">
                <span>Label:</span>
                <span className="truncate">{release.label}</span>
              </div>
              <div className="flex justify-between">
                <span>Genre:</span>
                <span className="truncate">{release.genre}</span>
              </div>
            </div>
            
            <div className="mt-3 pt-2 border-t border-gray-100">
              <div className="flex justify-between text-xs text-gray-500">
                <span>{release.duration}</span>
                <span>{release.bpm} BPM</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading distribution dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Distribution Partner Dashboard</h1>
              <p className="text-sm text-gray-600">Code Group - Release Management</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Total Releases</p>
                <p className="text-2xl font-bold text-gray-900">{releases.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex-1 max-w-lg">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search releases, artists, or projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <select
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="ready_for_distribution">Ready for Distribution</option>
                <option value="in_distribution">In Distribution</option>
                <option value="distributed">Distributed</option>
                <option value="on_hold">On Hold</option>
              </select>
              
              <select
                value={filters.genre}
                onChange={(e) => setFilters({...filters, genre: e.target.value})}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Genres</option>
                <option value="Electronic">Electronic</option>
                <option value="Pop">Pop</option>
                <option value="Hip Hop">Hip Hop</option>
                <option value="Rock">Rock</option>
              </select>
              
              <select
                value={filters.artist}
                onChange={(e) => setFilters({...filters, artist: e.target.value})}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Artists</option>
                <option value="Midnight Artist">Midnight Artist</option>
                <option value="Summer Artist">Summer Artist</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('all-creations')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'all-creations'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                All Creations
              </button>
              <button
                onClick={() => setActiveTab('all-projects')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'all-projects'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                All Projects/Releases
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
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {activeTab === 'all-creations' && renderAllCreations()}
          {activeTab === 'all-projects' && renderAllProjects()}
          {activeTab === 'sync-board' && renderSyncBoard()}
        </div>
      </div>
    </div>
  );
} 