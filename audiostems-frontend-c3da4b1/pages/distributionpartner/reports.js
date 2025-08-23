import { useState, useEffect, useMemo } from 'react';
import { useUser } from '@/components/providers/SupabaseProvider';
import { getUserRole } from '@/lib/user-utils';
import Layout from '@/components/layouts/mainLayout';
import CurrencySelector, { formatCurrency as sharedFormatCurrency, useCurrencySync } from '@/components/shared/CurrencySelector';
import { formatGrowthPercentage } from '@/lib/number-utils';
import NotificationModal from '@/components/shared/NotificationModal';
import useModals from '@/hooks/useModals';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
  Filler
);

export default function PartnerReports() {
  const { user, isLoading } = useUser();
  const isAuthenticated = !!user;
  const [selectedPeriod, setSelectedPeriod] = useState('all-time');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  
  // Filter states (for main page filtering)
  const [selectedArtistFilter, setSelectedArtistFilter] = useState('all');
  const [selectedRelease, setSelectedRelease] = useState('all');
  const [selectedAsset, setSelectedAsset] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Revenue reporting states
  const [showReportModal, setShowReportModal] = useState(false);
  const [revenueReports, setRevenueReports] = useState([]); // TODO: Load from Supabase revenue_reports table
  const [newReport, setNewReport] = useState({
    platform: '',
    amount: '',
    date: '',
    selectedAssets: [],
    notes: ''
  });
  const [artistSearch, setArtistSearch] = useState('');
  const [releaseSearch, setReleaseSearch] = useState('');
  const [selectedArtistForReport, setSelectedArtistForReport] = useState(null);
  const [selectedReleaseForReport, setSelectedReleaseForReport] = useState(null);
  const [availableAssets, setAvailableAssets] = useState([]);
  
  // TODO: Connect to Supabase for real data
  const [artists, setArtists] = useState([]); // TODO: Load from Supabase artists table
  const [releases, setReleases] = useState([]); // TODO: Load from Supabase releases table  
  const [assets, setAssets] = useState([]); // TODO: Load from Supabase assets table
  
  // Currency state
  const [selectedCurrency, updateCurrency] = useCurrencySync('GBP');

  // Initialize modals hook
  const {
    notificationModal,
    showError,
    showWarning,
    closeNotificationModal
  } = useModals();

  // Revenue reporting functions
  const handleReportRevenue = () => {
    setShowReportModal(true);
  };

  const handleSubmitReport = () => {
    if (!newReport.platform || !newReport.amount || !newReport.date) {
      showError('Please fill in all required fields', 'Missing Information');
      return;
    }

    if (newReport.selectedAssets.length === 0) {
      showError('Please select at least one asset', 'Missing Assets');
      return;
    }

    const report = {
      id: Date.now(),
      platform: newReport.platform,
      amount: parseFloat(newReport.amount),
      currency: selectedCurrency,
      date: newReport.date,
      status: 'pending',
      submittedDate: new Date().toISOString().split('T')[0],
      assets: newReport.selectedAssets.map(asset => asset.name),
      artistId: selectedArtistForReport?.id,
      artistName: selectedArtistForReport?.stageName || selectedArtistForReport?.name,
      releaseId: selectedReleaseForReport?.id,
      releaseName: selectedReleaseForReport?.title,
      notes: newReport.notes
    };

    // TODO: Submit to Supabase revenue_reports table
    setRevenueReports(prev => [report, ...prev]);
    
    // Reset form
    setNewReport({ platform: '', amount: '', date: '', selectedAssets: [], notes: '' });
    setArtistSearch('');
    setReleaseSearch('');
    setSelectedArtistForReport(null);
    setSelectedReleaseForReport(null);
    setAvailableAssets([]);
    setShowReportModal(false);
    
    showWarning('Revenue report submitted successfully! Awaiting approval from admin.', 'Report Submitted');
  };

  // Calculate totals from real data
  const pendingTotal = revenueReports
    .filter(report => report.status === 'pending')
    .reduce((sum, report) => sum + report.amount, 0);
  
  const approvedThisMonth = revenueReports
    .filter(report => report.status === 'approved' && report.approvedDate?.startsWith(new Date().toISOString().slice(0, 7)))
    .reduce((sum, report) => sum + report.amount, 0);
    
  const totalReported = revenueReports
    .reduce((sum, report) => sum + report.amount, 0);

  // Filter functions for artist/release search
  const filteredArtists = artists.filter(artist => 
    artist.name.toLowerCase().includes(artistSearch.toLowerCase()) ||
    (artist.stageName && artist.stageName.toLowerCase().includes(artistSearch.toLowerCase()))
  );

  const filteredReleases = releases.filter(release => 
    (!selectedArtistForReport || release.artistId === selectedArtistForReport.id) &&
    release.title.toLowerCase().includes(releaseSearch.toLowerCase())
  );

  // Handler functions for form interactions
  const handleArtistSelect = (artist) => {
    setSelectedArtistForReport(artist);
    setArtistSearch(artist.stageName || artist.name);
    setReleaseSearch('');
    setSelectedReleaseForReport(null);
    setAvailableAssets([]);
    setNewReport(prev => ({ ...prev, selectedAssets: [] }));
  };

  const handleReleaseSelect = (release) => {
    setSelectedReleaseForReport(release);
    setReleaseSearch(release.title);
    // TODO: Load assets for this release from Supabase
    const releaseAssets = assets.filter(asset => asset.releaseId === release.id);
    setAvailableAssets(releaseAssets);
    setNewReport(prev => ({ ...prev, selectedAssets: [] }));
  };

  const handleAssetToggle = (asset) => {
    setNewReport(prev => ({
      ...prev,
      selectedAssets: prev.selectedAssets.find(a => a.id === asset.id)
        ? prev.selectedAssets.filter(a => a.id !== asset.id)
        : [...prev.selectedAssets, asset]
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600">Please log in to access this page.</p>
        </div>
      </div>
    );
  }

  const userRole = getUserRole(user);
  
  if (userRole !== 'distribution_partner') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }



  // Enhanced earnings summary
  const earningsData = {
    totalEarnings: 0.92,
    monthlyEarnings: 3245.67,
    pendingPayouts: 1240.50,
    paidOut: 23347.42,
    averagePerStream: 0.00394,
    topEarningMonth: { month: 'March 2024', amount: 4234.56 },
    revenueStreams: {
      streaming: 14752.75,
      downloads: 5634.21,
      mechanical: 2100.48,
      performance: 1567.32,
      licensing: 533.16
    }
  };

  // Platform earnings breakdown with Other Platforms
  // Clean platform earnings data - ground zero state
  const platformEarnings = {
    spotify: { 
      name: 'Spotify', 
      earnings: 0, 
      streams: 0, 
      growth: 0, 
      color: '#1DB954',
      royaltyRate: 0.004,
      marketShare: 0
    },
    apple: { 
      name: 'Apple Music', 
      earnings: 0, 
      streams: 0, 
      growth: 0, 
      color: '#FA243C',
      royaltyRate: 0.0045,
      marketShare: 0
    },
    youtube: { 
      name: 'YouTube Music', 
      earnings: 0, 
      streams: 0, 
      growth: 0, 
      color: '#FF0000',
      royaltyRate: 0.003,
      marketShare: 0
    },
    amazon: { 
      name: 'Amazon Music', 
      earnings: 0, 
      streams: 0, 
      growth: 0, 
      color: '#FF9900',
      royaltyRate: 0.004,
      marketShare: 0
    },
    deezer: { 
      name: 'Deezer', 
      earnings: 0, 
      streams: 0, 
      growth: 0, 
      color: '#FEAA2D',
      royaltyRate: 0.0035,
      marketShare: 0
    },
    tidal: { 
      name: 'TIDAL', 
      earnings: 0, 
      streams: 0, 
      growth: 0, 
      color: '#000000',
      royaltyRate: 0.0052,
      marketShare: 0
    },
    other: { 
      name: 'Other Platforms', 
      earnings: 0, 
      streams: 0, 
      growth: 0, 
      color: '#6B7280',
      royaltyRate: 0.0034,
      marketShare: 10.6,
      description: 'Pandora, iHeartRadio, Napster, Audiomack, Bandcamp, and 15+ other services',
      platforms: ['Pandora', 'iHeartRadio', 'Napster', 'Audiomack', 'Bandcamp', 'JioSaavn', 'Anghami', 'Boomplay', 'NetEase', 'QQ Music', 'KKBox', 'Joox', 'Yandex Music', 'VK Music', 'Gaana', 'Wynk', 'Saavn', 'Hungama', 'TikTok Music', 'Instagram Music', 'Facebook Music']
    }
  };

  // Time series earnings data
  const monthlyEarningsData = {
    labels: ['Jan 2024', 'Feb 2024', 'Mar 2024', 'Apr 2024', 'May 2024', 'Jun 2024'],
    totalEarnings: [3456.78, 3789.45, 4234.56, 3967.23, 4123.87, 4345.92],
    streamingEarnings: [2134.56, 2367.89, 2634.21, 2445.67, 2567.34, 2689.12],
    downloadEarnings: [789.45, 856.23, 934.56, 867.89, 923.45, 976.32],
    mechanicalEarnings: [345.67, 378.23, 423.45, 389.67, 412.34, 435.89],
    performanceEarnings: [187.10, 187.10, 242.34, 264.00, 220.74, 244.59]
  };

  // Artist earnings breakdown with Other Platforms
  const artistEarningsData = [
    {
      artist: 'YHWH MSC',
      totalEarnings: 0.67,
      monthlyEarnings: 2045.32,
      topTrack: 'Lost in Time',
      trackEarnings: 3456.78,
      platforms: {
        spotify: 5234.56,
        apple: 3456.78,
        youtube: 2134.56,
        amazon: 987.65,
        deezer: 423.89,
        tidal: 198.77,
        soundcloud: 267.34,
        other: 642.12
      },
      growth: 24.5,
      otherPlatformBreakdown: {
        pandora: 156.78,
        iheart: 123.45,
        napster: 89.67,
        audiomack: 67.89,
        bandcamp: 45.23,
        others: 159.10
      }
    },
    {
      artist: 'Audio MSC',
      totalEarnings: 0.43,
      monthlyEarnings: 1456.89,
      topTrack: 'Beach Dreams',
      trackEarnings: 2345.67,
      platforms: {
        spotify: 3789.45,
        apple: 2456.78,
        youtube: 1523.67,
        amazon: 678.90,
        deezer: 287.45,
        tidal: 134.56,
        soundcloud: 178.92,
        other: 415.70
      },
      growth: 19.2,
      otherPlatformBreakdown: {
        pandora: 98.45,
        iheart: 87.23,
        napster: 65.34,
        audiomack: 54.21,
        bandcamp: 32.18,
        others: 78.29
      }
    },
    {
      artist: 'Independent Artists',
      totalEarnings: 0.82,
      monthlyEarnings: 743.76,
      topTrack: 'Thunder Road',
      trackEarnings: 987.65,
      platforms: {
        spotify: 1523.67,
        apple: 976.32,
        youtube: 634.21,
        amazon: 234.56,
        deezer: 123.45,
        tidal: 67.89,
        soundcloud: 89.12,
        other: 127.60
      },
      growth: 16.8,
      otherPlatformBreakdown: {
        pandora: 34.56,
        iheart: 29.78,
        napster: 21.34,
        audiomack: 18.67,
        bandcamp: 11.25,
        others: 12.00
      }
    }
  ];

  // Detailed mock earnings data for export with Other Platforms
  const detailedEarningsData = [
    {
      month: 'January 2024',
      artist: 'YHWH MSC',
      release: 'Midnight Sessions',
      track: 'Lost in Time',
      platform: 'Spotify',
      streams: 45789,
      downloads: 234,
      streamingRevenue: 183.16,
      downloadRevenue: 234.00,
      mechanicalRevenue: 45.50,
      performanceRevenue: 67.80,
      totalEarnings: 0.46
    },
    {
      month: 'January 2024',
      artist: 'Audio MSC',
      release: 'Summer Vibes',
      track: 'Beach Dreams',
      platform: 'Apple Music',
      streams: 32456,
      downloads: 189,
      streamingRevenue: 129.82,
      downloadRevenue: 189.00,
      mechanicalRevenue: 32.25,
      performanceRevenue: 48.40,
      totalEarnings: 0.47
    },
    {
      month: 'February 2024',
      artist: 'YHWH MSC',
      release: 'Urban Beats Collection',
      track: 'City Lights',
      platform: 'YouTube Music',
      streams: 67234,
      downloads: 156,
      streamingRevenue: 201.70,
      downloadRevenue: 156.00,
      mechanicalRevenue: 56.12,
      performanceRevenue: 78.90,
      totalEarnings: 0.72
    },
    {
      month: 'March 2024',
      artist: 'YHWH MSC',
      release: 'Lost in Time - Single',
      track: 'Lost in Time',
      platform: 'Other Platforms',
      streams: 18234,
      downloads: 145,
      streamingRevenue: 156.78,
      downloadRevenue: 145.00,
      mechanicalRevenue: 28.90,
      performanceRevenue: 34.50,
      totalEarnings: 0.18,
      platformBreakdown: 'Pandora (35%), iHeartRadio (25%), Napster (15%), Audiomack (10%), Others (15%)'
    },
    {
      month: 'April 2024',
      artist: 'Audio MSC',
      release: 'Summer Vibes EP',
      track: 'Beach Dreams',
      platform: 'Other Platforms',
      streams: 12456,
      downloads: 89,
      streamingRevenue: 98.45,
      downloadRevenue: 89.00,
      mechanicalRevenue: 19.60,
      performanceRevenue: 23.40,
      totalEarnings: 0.45,
      platformBreakdown: 'Pandora (40%), iHeartRadio (20%), Bandcamp (15%), Audiomack (12%), Others (13%)'
    },
    {
      month: 'May 2024',
      artist: 'Independent Artists',
      release: 'Indie Collection',
      track: 'Thunder Road',
      platform: 'Other Platforms',
      streams: 8934,
      downloads: 56,
      streamingRevenue: 67.89,
      downloadRevenue: 56.00,
      mechanicalRevenue: 14.20,
      performanceRevenue: 16.80,
      totalEarnings: 0.89,
      platformBreakdown: 'Bandcamp (45%), Audiomack (20%), Napster (15%), iHeartRadio (10%), Others (10%)'
    }
  ];

  // Comprehensive mock data for filters - matches full database
  const mockArtists = [
    { id: 'all', name: 'All Artists' },
    { id: 'yhwh_msc', name: 'YHWH MSC' },
    { id: 'global_superstar', name: 'Global Superstar' },
    { id: 'seoul_stars', name: 'Seoul Stars' },
    { id: 'rock_legends', name: 'Rock Legends' },
    { id: 'dj_phoenix', name: 'DJ Phoenix' },
    { id: 'emma_rodriguez', name: 'Emma Rodriguez' },
    { id: 'marcus_williams', name: 'Marcus Williams Quartet' },
    { id: 'basement_band', name: 'The Basement Band' },
    { id: 'carlos_mendez', name: 'Carlos Mendez' },
    { id: 'film_composer', name: 'Film Composer Orchestra' },
    { id: 'nashville_dreams', name: 'Nashville Dreams' }
  ];

  const mockReleases = [
    { id: 'all', name: 'All Releases' },
    { id: 'urban_beats_collection', name: 'Urban Beats Collection' },
    { id: 'remix_package', name: 'Urban Beat (Remix Package)' },
    { id: 'movie_soundtrack', name: 'Movie Epic Soundtrack' },
    { id: 'classic_hits', name: 'Classic Hits Single' },
    { id: 'collaborative_single', name: 'Collaborative Single' },
    { id: 'chart_topper_hits', name: 'Chart Topper Hits' },
    { id: 'kpop_sensation', name: 'K-Pop Sensation' },
    { id: 'madison_square_live', name: 'Madison Square Garden Live' },
    { id: 'electronic_horizons', name: 'Electronic Horizons' },
    { id: 'indie_rock_revival', name: 'Indie Rock Revival' },
    { id: 'reggaeton_fuego', name: 'Reggaeton Fuego' },
    { id: 'new_dreams_single', name: 'New Dreams Single' },
    { id: 'jazz_fusion_mixtape', name: 'Jazz Fusion Mixtape' },
    { id: 'country_roads', name: 'Country Roads Album' }
  ];

  const mockAssets = [
    { id: 'all', name: 'All Assets/Tracks' },
    { id: 'singles', name: 'Singles' },
    { id: 'albums', name: 'Albums' },
    { id: 'eps', name: 'EPs' },
    { id: 'mixtapes', name: 'Mixtapes' },
    { id: 'compilations', name: 'Compilations' },
    { id: 'remixes', name: 'Remixes' },
    { id: 'live_albums', name: 'Live Albums' },
    { id: 'soundtracks', name: 'Soundtracks' }
  ];

  const mockPlatforms = [
    { id: 'all', name: 'All Platforms' },
    { id: 'spotify', name: 'Spotify' },
    { id: 'apple', name: 'Apple Music' },
    { id: 'youtube', name: 'YouTube Music' },
    { id: 'amazon', name: 'Amazon Music' },
    { id: 'deezer', name: 'Deezer' },
    { id: 'tidal', name: 'TIDAL' },
    { id: 'soundcloud', name: 'SoundCloud' },
    { id: 'other', name: 'Other Platforms' }
  ];

  // Filter and search functions
  const clearAllFilters = () => {
    setSelectedArtistFilter('all');
    setSelectedRelease('all');
    setSelectedAsset('all');
    setSearchQuery('');
  };

  const applyFilters = () => {
    console.log('Applying earnings filters:', {
      artist: selectedArtistFilter,
      release: selectedRelease,
      asset: selectedAsset,
      search: searchQuery,
      period: selectedPeriod,
      customDates: selectedPeriod === 'custom' ? { start: customStartDate, end: customEndDate } : null
    });
    // Here you would typically call your API with the filter parameters
  };

  // Filter the earnings data based on current filters
  const getFilteredEarningsData = () => {
    let filteredData = [...detailedEarningsData];

    // Apply artist filter
    if (selectedArtistFilter !== 'all') {
      const artistMap = {
        'yhwh_msc': 'YHWH MSC',
        'audio_msc': 'Audio MSC',
        'independent': 'Independent Artists'
      };
      filteredData = filteredData.filter(item => item.artist === artistMap[selectedArtistFilter]);
    }

    // Apply release filter  
    if (selectedRelease !== 'all') {
      const releaseMap = {
        'midnight_sessions': 'Midnight Sessions',
        'summer_vibes': 'Summer Vibes',
        'urban_beats': 'Urban Beats Collection',
        'rock_anthem': 'Rock Anthem',
        'electronic_fusion': 'Electronic Fusion EP'
      };
      filteredData = filteredData.filter(item => item.release === releaseMap[selectedRelease]);
    }

    // Apply asset filter (simplified - would normally be more complex)
    if (selectedAsset !== 'all') {
      // For demo purposes, we'll filter by some logic
      if (selectedAsset === 'singles') {
        filteredData = filteredData.filter(item => 
          !['Collection', 'EP'].some(term => item.release.includes(term))
        );
      }
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredData = filteredData.filter(item =>
        item.artist.toLowerCase().includes(query) ||
        item.release.toLowerCase().includes(query) ||
        item.track.toLowerCase().includes(query) ||
        item.platform.toLowerCase().includes(query)
      );
    }

    return filteredData;
  };

  // Excel export function
  const exportToExcel = () => {
    try {
      const filteredData = getFilteredEarningsData();
      
      // Create a new workbook
      const workbook = XLSX.utils.book_new();
      
      // Prepare the data for Excel
      const excelData = filteredData.map(item => ({
        'Month': item.month,
        'Artist': item.artist,
        'Release': item.release,
        'Track': item.track,
        'Platform': item.platform,
        'Streams': item.streams.toLocaleString(),
        'Downloads': item.downloads.toLocaleString(),
        'Streaming Revenue': sharedFormatCurrency(item.streamingRevenue, selectedCurrency),
        'Download Revenue': sharedFormatCurrency(item.downloadRevenue, selectedCurrency),
        'Mechanical Revenue': sharedFormatCurrency(item.mechanicalRevenue, selectedCurrency),
        'Performance Revenue': sharedFormatCurrency(item.performanceRevenue, selectedCurrency),
        'Total Earnings': sharedFormatCurrency(item.totalEarnings, selectedCurrency)
      }));

      // Add summary row
      const totalEarnings = filteredData.reduce((sum, item) => sum + item.totalEarnings, 0);
      const totalStreams = filteredData.reduce((sum, item) => sum + item.streams, 0);
      const totalDownloads = filteredData.reduce((sum, item) => sum + item.downloads, 0);
      
      excelData.push({
        'Month': 'TOTAL',
        'Artist': '',
        'Release': '',
        'Track': '',
        'Platform': '',
        'Streams': totalStreams.toLocaleString(),
        'Downloads': totalDownloads.toLocaleString(),
        'Streaming Revenue': '',
        'Download Revenue': '',
        'Mechanical Revenue': '',
        'Performance Revenue': '',
        'Total Earnings': sharedFormatCurrency(totalEarnings, selectedCurrency)
      });

      // Create worksheet
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      
      // Add the worksheet to the workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Earnings Report');
      
      // Generate filename
      const currentDate = new Date();
      const dateString = currentDate.toISOString().split('T')[0];
      const filename = `MSC-Earnings-Report-${selectedPeriod}-${dateString}.xlsx`;
      
      // Save the file
      XLSX.writeFile(workbook, filename);
      
      console.log('Excel export completed successfully');
    } catch (error) {
      console.error('Excel export error:', error);
      showError('Error generating Excel file. Please try again.', 'Export Error');
    }
  };

  // PDF export function
  const exportToPDF = () => {
    try {
      const filteredData = getFilteredEarningsData();
      
      // Create new PDF document
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(18);
      doc.text('MSC & Co - Earnings Report', 20, 20);
      
      // Add period and filters info
      doc.setFontSize(12);
      doc.text(`Period: ${selectedPeriod}`, 20, 35);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 45);
      
      if (selectedArtistFilter !== 'all' || selectedRelease !== 'all' || selectedAsset !== 'all' || searchQuery) {
        let filtersText = 'Filters: ';
        const activeFilters = [];
        if (selectedArtistFilter !== 'all') activeFilters.push(`Artist: ${artists.find(a => a.id === selectedArtistFilter)?.name || 'Unknown'}`);
        if (selectedRelease !== 'all') activeFilters.push(`Release: ${releases.find(r => r.id === selectedRelease)?.name || 'Unknown'}`);
        if (selectedAsset !== 'all') activeFilters.push(`Asset: ${assets.find(a => a.id === selectedAsset)?.name || 'Unknown'}`);
        if (searchQuery) activeFilters.push(`Search: "${searchQuery}"`);
        filtersText += activeFilters.join(', ');
        doc.text(filtersText, 20, 55);
      }

      // Prepare table data
      const tableHeaders = [
        'Month', 'Artist', 'Release', 'Track', 'Platform', 
        'Streams', 'Downloads', 'Total Earnings'
      ];
      
      const tableData = filteredData.map(item => [
        item.month,
        item.artist,
        item.release,
        item.track,
        item.platform,
        item.streams.toLocaleString(),
        item.downloads.toLocaleString(),
        sharedFormatCurrency(item.totalEarnings, selectedCurrency)
      ]);

      // Add summary row
      const totalEarnings = filteredData.reduce((sum, item) => sum + item.totalEarnings, 0);
      const totalStreams = filteredData.reduce((sum, item) => sum + item.streams, 0);
      const totalDownloads = filteredData.reduce((sum, item) => sum + item.downloads, 0);
      
      tableData.push([
        'TOTAL', '', '', '', '',
        totalStreams.toLocaleString(),
        totalDownloads.toLocaleString(),
        sharedFormatCurrency(totalEarnings, selectedCurrency)
      ]);

      // Add the table
      autoTable(doc, {
        head: [tableHeaders],
        body: tableData,
        startY: 70,
        styles: {
          fontSize: 8,
          cellPadding: 2
        },
        headStyles: {
          fillColor: [68, 114, 196],
          textColor: 255,
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        },
        didParseCell: function(data) {
          // Make the total row bold
          if (data.row.index === tableData.length - 1) {
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.fillColor = [220, 220, 220];
          }
        }
      });

      // Generate filename
      const currentDate = new Date();
      const dateString = currentDate.toISOString().split('T')[0];
      const filename = `MSC-Earnings-Report-${selectedPeriod}-${dateString}.pdf`;
      
      // Save the PDF
      doc.save(filename);
      
      console.log('PDF export completed successfully');
    } catch (error) {
      console.error('PDF export error:', error);
      showError('Error generating PDF file. Please try again.', 'Export Error');
    }
  };

  // Chart configurations for earnings visualization
  const earningsTimeSeriesData = {
    labels: monthlyEarningsData.labels,
    datasets: [
      {
        label: 'Total Earnings',
        data: monthlyEarningsData.totalEarnings,
        borderColor: '#4F46E5',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#4F46E5',
        pointBorderColor: '#FFFFFF',
        pointBorderWidth: 2,
        pointRadius: 6,
      },
      {
        label: 'Streaming Revenue',
        data: monthlyEarningsData.streamingEarnings,
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#10B981',
        pointBorderColor: '#FFFFFF',
        pointBorderWidth: 2,
        pointRadius: 4,
      },
      {
        label: 'Download Revenue',
        data: monthlyEarningsData.downloadEarnings,
        borderColor: '#F59E0B',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        fill: false,
        tension: 0.4,
        pointBackgroundColor: '#F59E0B',
        pointBorderColor: '#FFFFFF',
        pointBorderWidth: 2,
        pointRadius: 4,
      }
    ]
  };

  const platformEarningsData = {
    labels: Object.values(platformEarnings).map(p => p.name),
    datasets: [{
      label: 'Platform Earnings ($)',
      data: Object.values(platformEarnings).map(p => p.earnings),
      backgroundColor: Object.values(platformEarnings).map(p => p.color),
      borderColor: Object.values(platformEarnings).map(p => p.color),
      borderWidth: 2,
      borderRadius: 8,
      borderSkipped: false,
    }]
  };

  const revenueStreamData = {
    labels: Object.keys(earningsData.revenueStreams).map(key => 
      key.charAt(0).toUpperCase() + key.slice(1)
    ),
    datasets: [{
      data: Object.values(earningsData.revenueStreams),
      backgroundColor: [
        '#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'
      ],
      borderWidth: 2,
      borderColor: '#FFFFFF',
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            weight: '500'
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#FFFFFF',
        bodyColor: '#FFFFFF',
        borderColor: '#4F46E5',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        displayColors: true,
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${sharedFormatCurrency(context.parsed.y || context.parsed, selectedCurrency)}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          callback: function(value) {
            return sharedFormatCurrency(value, selectedCurrency);
          }
        }
      }
    }
  };

  const handleExportReport = (format) => {
    console.log(`Exporting ${format} report for period: ${selectedPeriod}`);
    
    if (format === 'excel') {
      exportToExcel();
    } else if (format === 'pdf') {
      exportToPDF();
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Finance & Revenue Management</h1>
                <p className="text-sm text-gray-500">Report and manage revenue from all distributed releases and assets across platforms</p>
              </div>
              <div className="flex items-center space-x-6">
                {/* Currency Selector */}
                <CurrencySelector
                  selectedCurrency={selectedCurrency}
                  onCurrencyChange={updateCurrency}
                  compact={true}
                />
                
                {/* Export Buttons */}
                <div className="flex space-x-3">
                <button
                  onClick={() => handleExportReport('excel')}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <svg className="mr-2 h-4 w-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Export Excel
                </button>
                <button
                  onClick={() => handleExportReport('pdf')}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <svg className="mr-2 h-4 w-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Export PDF
                </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Period Selector */}
          <div className="mb-6">
            <div className="flex flex-wrap items-center gap-4">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="current-month">Current Month</option>
                <option value="last-month">Last Month</option>
                <option value="last-3-months">Last 3 Months</option>
                <option value="last-6-months">Last 6 Months</option>
                <option value="current-year">Current Year</option>
                <option value="custom">Custom Range</option>
                <option value="all-time">All Time</option>
              </select>
              
              {selectedPeriod === 'custom' && (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <label htmlFor="reports-start-date" className="text-sm font-medium text-gray-700">From:</label>
                    <input
                      id="reports-start-date"
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label htmlFor="reports-end-date" className="text-sm font-medium text-gray-700">To:</label>
                    <input
                      id="reports-end-date"
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <button
                    onClick={() => {
                      if (customStartDate && customEndDate) {
                        console.log(`Applying custom date range for reports: ${customStartDate} to ${customEndDate}`);
                        // Here you would typically refresh the earnings data with the new date range
                      } else {
                        showWarning('Please select both start and end dates', 'Date Selection Required');
                      }
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Apply
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Revenue Reporting Section */}
          <div className="mb-6 bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Revenue Reporting</h3>
              <button 
                onClick={handleReportRevenue}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                + Report New Revenue
              </button>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-blue-800">Revenue Flow Process</p>
                  <p className="text-sm text-blue-700">Report revenue from all platforms → Approval by Super Admin/Company Admin → Distribution to artists and labels</p>
                </div>
              </div>
            </div>
            
            {/* Pending Approvals Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="text-sm font-medium text-yellow-800">Pending Approval</div>
                <div className="text-2xl font-bold text-yellow-900">{sharedFormatCurrency(pendingTotal, selectedCurrency)}</div>
                <div className="text-sm text-yellow-700">
                  {revenueReports.length === 0 ? 'No reports submitted yet' : `${revenueReports.filter(r => r.status === 'pending').length} reports awaiting approval`}
                </div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="text-sm font-medium text-green-800">Approved This Month</div>
                <div className="text-2xl font-bold text-green-900">{sharedFormatCurrency(approvedThisMonth, selectedCurrency)}</div>
                <div className="text-sm text-green-700">
                  {revenueReports.length === 0 ? 'No reports approved yet' : `${revenueReports.filter(r => r.status === 'approved').length} reports approved`}
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-sm font-medium text-blue-800">Total Reported</div>
                <div className="text-2xl font-bold text-blue-900">{sharedFormatCurrency(totalReported, selectedCurrency)}</div>
                <div className="text-sm text-blue-700">
                  {revenueReports.length === 0 ? 'Start by reporting revenue' : `${revenueReports.length} total reports submitted`}
                </div>
              </div>
            </div>
          </div>

          {/* Revenue Reports List */}
          <div className="mb-6 bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue Reports</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Platform</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assets</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {revenueReports.map((report) => (
                    <tr key={report.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {report.platform}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {sharedFormatCurrency(report.amount, selectedCurrency)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {report.period}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          report.status === 'pending' 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : report.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {report.submittedDate}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div className="max-w-xs truncate">
                          {report.assets.join(', ')}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {revenueReports.length === 0 && (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                        No revenue reports submitted yet. Click "Report New Revenue" to get started.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Filters Section */}
          <div className="mb-6 bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Filters & Search</h3>
            
            {/* Search Field */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search releases, artists, or tracks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {/* Artist Filter */}
              <div>
                <label htmlFor="reports-artist-filter" className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Artist
                </label>
                <select
                  id="reports-artist-filter"
                                          value={selectedArtistFilter}
                        onChange={(e) => setSelectedArtistFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Artists</option>
                  {artists.map((artist) => (
                    <option key={artist.id} value={artist.id}>
                      {artist.stageName || artist.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Release Filter */}
              <div>
                <label htmlFor="reports-release-filter" className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Release
                </label>
                <select
                  id="reports-release-filter"
                  value={selectedRelease}
                  onChange={(e) => setSelectedRelease(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {mockReleases.map((release) => (
                    <option key={release.id} value={release.id}>
                      {release.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Asset/Track Filter */}
              <div>
                <label htmlFor="reports-asset-filter" className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Asset Type
                </label>
                <select
                  id="reports-asset-filter"
                  value={selectedAsset}
                  onChange={(e) => setSelectedAsset(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {mockAssets.map((asset) => (
                    <option key={asset.id} value={asset.id}>
                      {asset.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Filter Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={applyFilters}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Apply Filters
              </button>
              <button
                onClick={clearAllFilters}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Clear All
              </button>
              <div className="text-sm text-gray-500">
                {(selectedArtistFilter !== 'all' || selectedRelease !== 'all' || selectedAsset !== 'all' || searchQuery) && (
                  <span>
                    Filters active: {[
                      selectedArtistFilter !== 'all' && 'Artist',
                      selectedRelease !== 'all' && 'Release', 
                      selectedAsset !== 'all' && 'Asset',
                      searchQuery && 'Search'
                    ].filter(Boolean).join(', ')}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Enhanced Earnings Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            {/* Total Earnings */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl shadow-lg p-6 border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 mb-1">Total Earnings</p>
                  <p className="text-2xl font-bold text-gray-900">{sharedFormatCurrency(earningsData.totalEarnings, selectedCurrency)}</p>
                  <p className="text-xs text-green-600 font-medium mt-1">
                    💰 All time revenue
                  </p>
                </div>
                <div className="h-12 w-12 bg-green-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-lg">💵</span>
                </div>
              </div>
            </div>

            {/* Monthly Earnings */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl shadow-lg p-6 border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 mb-1">This Month</p>
                  <p className="text-2xl font-bold text-gray-900">{sharedFormatCurrency(earningsData.monthlyEarnings, selectedCurrency)}</p>
                  <p className="text-xs text-blue-600 font-medium mt-1">
                    📅 {earningsData.topEarningMonth.month.split(' ')[0]} earnings
                  </p>
                </div>
                <div className="h-12 w-12 bg-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-lg">📊</span>
                </div>
              </div>
            </div>

            {/* Average Per Stream */}
            <div className="bg-gradient-to-br from-purple-50 to-violet-100 rounded-xl shadow-lg p-6 border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600 mb-1">Avg Per Stream</p>
                  <p className="text-2xl font-bold text-gray-900">{sharedFormatCurrency(earningsData.averagePerStream, selectedCurrency)}</p>
                  <p className="text-xs text-purple-600 font-medium mt-1">
                    🎵 Revenue rate
                  </p>
                </div>
                <div className="h-12 w-12 bg-purple-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-lg">🎯</span>
                </div>
              </div>
            </div>

            {/* Pending Payouts */}
            <div className="bg-gradient-to-br from-orange-50 to-amber-100 rounded-xl shadow-lg p-6 border border-orange-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600 mb-1">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">{sharedFormatCurrency(earningsData.pendingPayouts, selectedCurrency)}</p>
                  <p className="text-xs text-orange-600 font-medium mt-1">
                    ⏳ Awaiting payout
                  </p>
                </div>
                <div className="h-12 w-12 bg-orange-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-lg">⏰</span>
                </div>
              </div>
            </div>

            {/* Paid Out */}
            <div className="bg-gradient-to-br from-teal-50 to-cyan-100 rounded-xl shadow-lg p-6 border border-teal-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-teal-600 mb-1">Paid Out</p>
                  <p className="text-2xl font-bold text-gray-900">{sharedFormatCurrency(earningsData.paidOut, selectedCurrency)}</p>
                  <p className="text-xs text-teal-600 font-medium mt-1">
                    ✅ {earningsData.totalEarnings > 0 ? Math.round((earningsData.paidOut / earningsData.totalEarnings) * 100) : 0}% completed
                  </p>
                </div>
                <div className="h-12 w-12 bg-teal-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-lg">✨</span>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Charts Dashboard */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
            {/* Earnings Timeline */}
            <div className="xl:col-span-2 bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Earnings Timeline</h3>
                <div className="text-sm text-gray-500">
                  Last 6 months
                </div>
              </div>
              <div className="h-80">
                <Line data={earningsTimeSeriesData} options={chartOptions} />
              </div>
            </div>

            {/* Revenue Streams Breakdown */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Revenue Streams</h3>
                <div className="text-sm text-gray-500">
                  Breakdown
                </div>
              </div>
              <div className="h-80">
                <Doughnut data={revenueStreamData} options={{
                  ...chartOptions,
                  plugins: {
                    ...chartOptions.plugins,
                    tooltip: {
                      ...chartOptions.plugins.tooltip,
                      callbacks: {
                        label: function(context) {
                          const total = context.dataset.data.reduce((a, b) => a + b, 0);
                          const percentage = ((context.parsed / total) * 100).toFixed(1);
                          return `${context.label}: ${sharedFormatCurrency(context.parsed, selectedCurrency)} (${percentage}%)`;
                        }
                      }
                    }
                  }
                }} />
              </div>
            </div>
          </div>

          {/* Platform Earnings Analysis */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Platform Earnings Analysis</h3>
              <div className="text-sm text-gray-500">
                {Object.keys(platformEarnings).length} platforms
              </div>
            </div>
            <div className="h-96 mb-6">
              <Bar data={platformEarningsData} options={chartOptions} />
            </div>
            
            {/* Platform Details Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Object.entries(platformEarnings).map(([key, platform]) => (
                <div key={key} className={`bg-gray-50 rounded-lg p-4 border border-gray-200 ${key === 'other' ? 'md:col-span-2 lg:col-span-1 xl:col-span-2' : ''}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: platform.color }}
                      ></div>
                      <span className="font-medium text-gray-900">{platform.name}</span>
                      {key === 'other' && (
                        <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                          {platform.platforms?.length}+ services
                        </span>
                      )}
                    </div>
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                      {formatGrowthPercentage(platform.growth)}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Earnings:</span>
                      <span className="font-medium">{sharedFormatCurrency(platform.earnings, selectedCurrency)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Streams:</span>
                      <span className="font-medium">{platform.streams.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Royalty Rate:</span>
                      <span className="font-medium">{sharedFormatCurrency(platform.royaltyRate, selectedCurrency)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Market Share:</span>
                      <span className="font-medium">{platform.marketShare}%</span>
                    </div>
                  </div>

                  {/* Other Platforms Breakdown */}
                  {key === 'other' && platform.platforms && (
                    <div className="mt-4 pt-3 border-t border-gray-300">
                      <h5 className="text-xs font-medium text-gray-700 mb-2">Includes:</h5>
                      <div className="grid grid-cols-2 gap-1 text-xs text-gray-600">
                        {platform.platforms.slice(0, 10).map((p, index) => (
                          <div key={index} className="truncate">• {p}</div>
                        ))}
                        {platform.platforms.length > 10 && (
                          <div className="text-gray-500 italic col-span-2 text-center pt-1">
                            +{platform.platforms.length - 10} more platforms
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Artist Earnings Breakdown */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Artist Earnings Breakdown</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Artist</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Earnings</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monthly</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Top Track</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Growth</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Top Platform</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {artistEarningsData.map((artist, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center">
                            <span className="text-white text-sm font-bold">{artist.artist.charAt(0)}</span>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">{artist.artist}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {sharedFormatCurrency(artist.totalEarnings, selectedCurrency)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {sharedFormatCurrency(artist.monthlyEarnings, selectedCurrency)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{artist.topTrack}</div>
                        <div className="text-xs text-gray-500">{sharedFormatCurrency(artist.trackEarnings, selectedCurrency)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          artist.growth > 20 
                            ? 'bg-green-100 text-green-800' 
                            : artist.growth > 15 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {formatGrowthPercentage(artist.growth)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {Object.entries(artist.platforms).sort(([,a], [,b]) => b - a)[0][0].charAt(0).toUpperCase() + Object.entries(artist.platforms).sort(([,a], [,b]) => b - a)[0][0].slice(1)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {sharedFormatCurrency(Object.entries(artist.platforms).sort(([,a], [,b]) => b - a)[0][1], selectedCurrency)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
        {/* Revenue Report Modal */}
        {showReportModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Report New Revenue</h3>
                  <button
                    onClick={() => setShowReportModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Platform *</label>
                    <select
                      value={newReport.platform}
                      onChange={(e) => setNewReport(prev => ({ ...prev, platform: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Platform</option>
                      <option value="Spotify">Spotify</option>
                      <option value="Apple Music">Apple Music</option>
                      <option value="YouTube Music">YouTube Music</option>
                      <option value="Amazon Music">Amazon Music</option>
                      <option value="Deezer">Deezer</option>
                      <option value="TikTok">TikTok</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Revenue Amount *</label>
                      <input
                        type="number"
                        step="0.01"
                        value={newReport.amount}
                        onChange={(e) => setNewReport(prev => ({ ...prev, amount: e.target.value }))}
                        placeholder="0.00"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                      <input
                        type="date"
                        value={newReport.date}
                        onChange={(e) => setNewReport(prev => ({ ...prev, date: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Artist Search */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Search Artist *</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={artistSearch}
                        onChange={(e) => setArtistSearch(e.target.value)}
                        placeholder="Type artist name or stage name..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      {artistSearch && filteredArtists.length > 0 && !selectedArtistForReport && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                          {filteredArtists.map((artist) => (
                            <button
                              key={artist.id}
                              onClick={() => handleArtistSelect(artist)}
                              className="w-full text-left px-3 py-2 hover:bg-gray-100 focus:bg-gray-100"
                            >
                              <div className="font-medium">{artist.stageName || artist.name}</div>
                              {artist.stageName && <div className="text-sm text-gray-500">{artist.name}</div>}
                            </button>
                          ))}
                        </div>
                      )}
                      {artistSearch && filteredArtists.length === 0 && artists.length === 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-3 text-gray-500 text-sm">
                          No artists found. Artists need to be added to the platform first.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Release Search */}
                  {selectedArtistForReport && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Search Release *</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={releaseSearch}
                          onChange={(e) => setReleaseSearch(e.target.value)}
                          placeholder="Type release title..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        {releaseSearch && filteredReleases.length > 0 && !selectedReleaseForReport && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                            {filteredReleases.map((release) => (
                              <button
                                key={release.id}
                                onClick={() => handleReleaseSelect(release)}
                                className="w-full text-left px-3 py-2 hover:bg-gray-100 focus:bg-gray-100"
                              >
                                <div className="font-medium">{release.title}</div>
                                <div className="text-sm text-gray-500">{release.type}</div>
                              </button>
                            ))}
                          </div>
                        )}
                        {releaseSearch && filteredReleases.length === 0 && releases.length === 0 && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-3 text-gray-500 text-sm">
                            No releases found for this artist.
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Assets Selection */}
                  {selectedReleaseForReport && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Select Assets *</label>
                      {availableAssets.length === 0 ? (
                        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 text-sm">
                          No assets found for this release. Assets need to be uploaded first.
                        </div>
                      ) : (
                        <div className="border border-gray-300 rounded-lg p-3 max-h-40 overflow-y-auto">
                          {availableAssets.map((asset) => (
                            <label key={asset.id} className="flex items-center py-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={newReport.selectedAssets.find(a => a.id === asset.id) !== undefined}
                                onChange={() => handleAssetToggle(asset)}
                                className="mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-sm">{asset.name}</span>
                              <span className="ml-2 text-xs text-gray-500">({asset.type})</span>
                            </label>
                          ))}
                        </div>
                      )}
                      {newReport.selectedAssets.length > 0 && (
                        <div className="mt-2 text-sm text-gray-600">
                          Selected: {newReport.selectedAssets.map(a => a.name).join(', ')}
                        </div>
                      )}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
                    <textarea
                      value={newReport.notes}
                      onChange={(e) => setNewReport(prev => ({ ...prev, notes: e.target.value }))}
                      rows="3"
                      placeholder="Additional information about this revenue report..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowReportModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitReport}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Submit Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

            {/* Branded Modals */}
        <NotificationModal
          isOpen={notificationModal.isOpen}
          onClose={closeNotificationModal}
          title={notificationModal.title}
          message={notificationModal.message}
          type={notificationModal.type}
          buttonText={notificationModal.buttonText}
        />
      </Layout>
    );
  }