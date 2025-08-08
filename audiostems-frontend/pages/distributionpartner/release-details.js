import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
  ArrowLeft, Edit, Download, Eye, FileText, Music, 
  User, Calendar, Globe, Tag, FileAudio, Image, 
  BookOpen, Code, Hash, QrCode, Database, Mail, 
  Phone, Share2, ExternalLink, BarChart3, PieChart,
  Play, Pause, CheckCircle, Clock, AlertTriangle
} from 'lucide-react';

export default function ReleaseDetails() {
  const router = useRouter();
  const { id } = router.query;
  const [release, setRelease] = useState(null);
  const [activeSection, setActiveSection] = useState('basic-info');
  const [loading, setLoading] = useState(true);

  // Mock detailed release data with all 80+ fields
  const mockRelease = {
    id: 1,
    // Basic Information
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
    lyrics: "In the midnight dreams, I find my way...",
    
    // Technical Information
    fileType: ".wav",
    audioFileName: "midnight_dreams_master.wav",
    coverFileName: "midnight_dreams_cover.jpg",
    language: "English",
    vocalType: "Lead Vocal",
    genre: "Electronic",
    subGenre: "Ambient",
    
    // Label & Distribution
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
    
    // Release Information
    preReleaseDate: "2024-02-15",
    preReleaseUrl: "https://preview.example.com",
    releaseDate: "2024-03-01",
    releaseUrl: "https://release.example.com",
    releaseLabel: "YHWH MSC",
    distributionCompany: "Code Group",
    
    // Copyright Information
    copyrightYear: 2024,
    copyrightOwner: "YHWH MSC",
    pLine: "℗ 2024 YHWH MSC",
    cLine: "© 2024 YHWH MSC",
    composer: "John Smith",
    role: "Composer",
    
    // Publishing Information
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
    
    // Production Credits
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
    
    // Musicians
    keyboards: "Keyboard Player",
    programming: "Programmer",
    bass: "Bass Player",
    drums: "Drummer",
    guitars: "Guitarist",
    organ: "Organ Player",
    percussion: "Percussionist",
    strings: "String Section",
    additionalInstrumentation: "Additional Instruments",
    
    // Management & Design
    designArtDirection: "Design Artist",
    management: "Manager Name",
    bookingAgent: "Booking Agent",
    pressContact: "Press Contact",
    
    // Contact Information
    primaryContactEmail: "contact@example.com",
    artistEmail: "artist@example.com",
    primaryContactPhone: "+1-555-0123",
    secondaryContactPhone: "+1-555-0124",
    
    // External Links
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
    
    // Distribution Information
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
  };

  useEffect(() => {
    if (id) {
      setRelease(mockRelease);
      setLoading(false);
    }
  }, [id]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'ready_for_distribution': return 'bg-blue-100 text-blue-800';
      case 'in_distribution': return 'bg-green-100 text-green-800';
      case 'distributed': return 'bg-purple-100 text-purple-800';
      case 'on_hold': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderBasicInfo = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Song Information</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Song Title:</span>
              <span className="text-sm font-medium">{release.songTitle}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Version:</span>
              <span className="text-sm">{release.version}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Duration:</span>
              <span className="text-sm">{release.duration}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">BPM:</span>
              <span className="text-sm">{release.bpm}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Key:</span>
              <span className="text-sm">{release.songKey}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Explicit:</span>
              <span className="text-sm">{release.explicit}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Artist Information</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Artist Name:</span>
              <span className="text-sm font-medium">{release.artistName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Legal Name:</span>
              <span className="text-sm">{release.legalName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Stylised:</span>
              <span className="text-sm">{release.stylised}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">AKA:</span>
              <span className="text-sm">{release.aka}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Artist Type:</span>
              <span className="text-sm">{release.artistType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Pronunciation:</span>
              <span className="text-sm">{release.phoneticPronunciation}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Information</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Product Title:</span>
              <span className="text-sm font-medium">{release.productTitle}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Alt Title:</span>
              <span className="text-sm">{release.altTitle}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Track Position:</span>
              <span className="text-sm">{release.trackPosition}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Format:</span>
              <span className="text-sm">{release.format}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Product Type:</span>
              <span className="text-sm">{release.productType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Genre:</span>
              <span className="text-sm">{release.genre}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Featuring Artists:</span>
              <span className="text-sm">{release.featuringArtists}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Background Vocalists:</span>
              <span className="text-sm">{release.backgroundVocalists}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Language:</span>
              <span className="text-sm">{release.language}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Vocal Type:</span>
              <span className="text-sm">{release.vocalType}</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Sub Genre:</span>
              <span className="text-sm">{release.subGenre}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Mood Description:</span>
              <span className="text-sm">{release.moodDescription}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Recording Country:</span>
              <span className="text-sm">{release.recordingCountry}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">BOWI Previously Released:</span>
              <span className="text-sm">{release.bowi}</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Tags:</span>
              <span className="text-sm">{release.tags.join(', ')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">File Type:</span>
              <span className="text-sm">{release.fileType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Audio File Name:</span>
              <span className="text-sm">{release.audioFileName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Cover File Name:</span>
              <span className="text-sm">{release.coverFileName}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPublishingInfo = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Copyright Information</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Copyright Year:</span>
              <span className="text-sm font-medium">{release.copyrightYear}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Copyright Owner:</span>
              <span className="text-sm">{release.copyrightOwner}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">℗ P Line:</span>
              <span className="text-sm">{release.pLine}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">© C Line:</span>
              <span className="text-sm">{release.cLine}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Composer:</span>
              <span className="text-sm">{release.composer}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Role:</span>
              <span className="text-sm">{release.role}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">PRO Information</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">PRO:</span>
              <span className="text-sm font-medium">{release.pro}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">CAE/IPI:</span>
              <span className="text-sm">{release.caeIpi}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">BMI Work #:</span>
              <span className="text-sm">{release.bmiWork}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">ASCAP Work #:</span>
              <span className="text-sm">{release.ascapWork}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">ISNI:</span>
              <span className="text-sm">{release.isni}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Mechanical:</span>
              <span className="text-sm">{release.mechanical}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Publishing Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Publishing:</span>
              <span className="text-sm font-medium">{release.publishing}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Publisher IPI:</span>
              <span className="text-sm">{release.publisherIpi}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Publishing Admin:</span>
              <span className="text-sm">{release.publishingAdmin}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Publishing Admin IPI:</span>
              <span className="text-sm">{release.publishingAdminIpi}</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Sub-Publisher:</span>
              <span className="text-sm">{release.subPublisher}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Publishing Type:</span>
              <span className="text-sm">{release.publishingType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Territory:</span>
              <span className="text-sm">{release.territory}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderProductionCredits = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Production Team</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Executive Producer:</span>
              <span className="text-sm">{release.executiveProducer}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Producer:</span>
              <span className="text-sm font-medium">{release.producer}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Co-Producer:</span>
              <span className="text-sm">{release.coProducer}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Assistant Producer:</span>
              <span className="text-sm">{release.assistantProducer}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Additional Production:</span>
              <span className="text-sm">{release.additionalProduction}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Engineering</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Mixing Engineer:</span>
              <span className="text-sm">{release.mixingEngineer}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Mastering Engineer:</span>
              <span className="text-sm">{release.masteringEngineer}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Recording Engineer:</span>
              <span className="text-sm">{release.recordingEngineer}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Engineer:</span>
              <span className="text-sm">{release.engineer}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Editing:</span>
              <span className="text-sm">{release.editing}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Studios</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Recording Studio:</span>
              <span className="text-sm">{release.recordingStudio}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Mastering Studio:</span>
              <span className="text-sm">{release.masteringStudio}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Musicians</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Keyboards:</span>
              <span className="text-sm">{release.keyboards}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Programming:</span>
              <span className="text-sm">{release.programming}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Bass:</span>
              <span className="text-sm">{release.bass}</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Drums:</span>
              <span className="text-sm">{release.drums}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Guitars:</span>
              <span className="text-sm">{release.guitars}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Organ:</span>
              <span className="text-sm">{release.organ}</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Percussion:</span>
              <span className="text-sm">{release.percussion}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Strings:</span>
              <span className="text-sm">{release.strings}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Additional Instrumentation:</span>
              <span className="text-sm">{release.additionalInstrumentation}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDistributionInfo = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Release Information</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Release Date:</span>
              <span className="text-sm font-medium">{new Date(release.releaseDate).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Pre-Release Date:</span>
              <span className="text-sm">{new Date(release.preReleaseDate).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Expected Release:</span>
              <span className="text-sm">{new Date(release.expectedReleaseDate).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Submitted Date:</span>
              <span className="text-sm">{new Date(release.submittedDate).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Previous Release Date:</span>
              <span className="text-sm">{release.previousReleaseDate ? new Date(release.previousReleaseDate).toLocaleDateString() : 'N/A'}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribution Status</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Status:</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(release.status)}`}>
                {release.status.replace('_', ' ')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Distribution Company:</span>
              <span className="text-sm font-medium">{release.distributionCompany}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Release Label:</span>
              <span className="text-sm">{release.releaseLabel}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Metadata Approved:</span>
              <span className="text-sm">{release.metadataApproved}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Submitted to Stores:</span>
              <span className="text-sm">{release.submittedToStores}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribution Services</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Luminate:</span>
              <span className="text-sm">{release.luminate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Mediabase:</span>
              <span className="text-sm">{release.mediabase}</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Digital Assets Folder:</span>
              <span className="text-sm">{release.digitalAssetsFolder}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Initials:</span>
              <span className="text-sm">{release.initials}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContactInfo = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Primary Contact Email:</span>
              <span className="text-sm font-medium">{release.primaryContactEmail}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Artist Email:</span>
              <span className="text-sm">{release.artistEmail}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Primary Contact Phone:</span>
              <span className="text-sm">{release.primaryContactPhone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Secondary Contact Phone:</span>
              <span className="text-sm">{release.secondaryContactPhone}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Management</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Management:</span>
              <span className="text-sm">{release.management}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Booking Agent:</span>
              <span className="text-sm">{release.bookingAgent}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Press Contact:</span>
              <span className="text-sm">{release.pressContact}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Design/Art Direction:</span>
              <span className="text-sm">{release.designArtDirection}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">External Links</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Website:</span>
              <a href={release.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:text-blue-800">
                {release.website}
              </a>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Wikipedia:</span>
              <a href={release.wikipedia} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:text-blue-800">
                {release.wikipedia}
              </a>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Instagram:</span>
              <a href={release.instagram} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:text-blue-800">
                {release.instagram}
              </a>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">TikTok:</span>
              <a href={release.tiktok} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:text-blue-800">
                {release.tiktok}
              </a>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">YouTube:</span>
              <a href={release.youtube} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:text-blue-800">
                {release.youtube}
              </a>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Spotify URI:</span>
              <span className="text-sm">{release.spotifyUri}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Apple ID:</span>
              <span className="text-sm">{release.appleId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Shazam:</span>
              <a href={release.shazam} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:text-blue-800">
                {release.shazam}
              </a>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Genius:</span>
              <a href={release.genius} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:text-blue-800">
                {release.genius}
              </a>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Discogs:</span>
              <a href={release.discogs} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:text-blue-800">
                {release.discogs}
              </a>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">AllMusic:</span>
              <a href={release.allMusic} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:text-blue-800">
                {release.allMusic}
              </a>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Jaxsta:</span>
              <a href={release.jaxsta} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:text-blue-800">
                {release.jaxsta}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderLyrics = () => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Lyrics</h3>
      <div className="bg-gray-50 p-4 rounded-lg">
        <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">{release.lyrics}</pre>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading release details...</p>
        </div>
      </div>
    );
  }

  if (!release) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Release Not Found</h2>
          <p className="text-gray-600 mb-4">The release you're looking for doesn't exist.</p>
          <button
            onClick={() => router.back()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
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
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{release.songTitle}</h1>
                <p className="text-sm text-gray-600">{release.artistName} • {release.productTitle}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(release.status)}`}>
                {release.status.replace('_', ' ')}
              </span>
              <button className="p-2 rounded-lg hover:bg-gray-100">
                <Edit className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 rounded-lg hover:bg-gray-100">
                <Download className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveSection('basic-info')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeSection === 'basic-info'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Basic Information
              </button>
              <button
                onClick={() => setActiveSection('publishing')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeSection === 'publishing'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Publishing
              </button>
              <button
                onClick={() => setActiveSection('production')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeSection === 'production'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Production Credits
              </button>
              <button
                onClick={() => setActiveSection('distribution')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeSection === 'distribution'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Distribution
              </button>
              <button
                onClick={() => setActiveSection('contact')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeSection === 'contact'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Contact & Links
              </button>
              <button
                onClick={() => setActiveSection('lyrics')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeSection === 'lyrics'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Lyrics
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-8">
          {activeSection === 'basic-info' && renderBasicInfo()}
          {activeSection === 'publishing' && renderPublishingInfo()}
          {activeSection === 'production' && renderProductionCredits()}
          {activeSection === 'distribution' && renderDistributionInfo()}
          {activeSection === 'contact' && renderContactInfo()}
          {activeSection === 'lyrics' && renderLyrics()}
        </div>
      </div>
    </div>
  );
} 