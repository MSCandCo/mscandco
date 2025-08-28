import { useState, useEffect, useMemo } from 'react';
import { useUser } from '@/components/providers/SupabaseProvider';
import { createClient } from '@supabase/supabase-js';
import { getUserRoleSync } from '@/lib/user-utils';
import Layout from '@/components/layouts/mainLayout';
import CurrencySelector, { formatCurrency as sharedFormatCurrency, useCurrencySync } from '@/components/shared/CurrencySelector';
import { formatGrowthPercentage } from '@/lib/number-utils';
import NotificationModal from '@/components/shared/NotificationModal';
import useModals from '@/hooks/useModals';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { BarChart3, Music, Target, CheckCircle } from 'lucide-react';
import SubscriptionGate from '../../components/auth/SubscriptionGate';
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

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function PartnerReports() {
  const { user, isLoading } = useUser();
  const [selectedPeriod, setSelectedPeriod] = useState('all-time');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Filter states (for main page filtering)
  const [selectedArtistFilter, setSelectedArtistFilter] = useState('all');
  const [selectedRelease, setSelectedRelease] = useState('all');
  const [selectedAsset, setSelectedAsset] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Revenue reporting states
  const [showReportModal, setShowReportModal] = useState(false);
  const [revenueReports, setRevenueReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const [newReport, setNewReport] = useState({
    platform: '',
    amount: '',
    date: '',
    selectedAsset: null,
    notes: ''
  });
  const [assetSearch, setAssetSearch] = useState('');
  const [selectedAssetForReport, setSelectedAssetForReport] = useState(null);
  const [loadingAssets, setLoadingAssets] = useState(false);
  
  // Real data from Supabase
  const [artists, setArtists] = useState([]);
  const [releases, setReleases] = useState([]);  
  const [assets, setAssets] = useState([]);
  
  // Currency state
  const [selectedCurrency, updateCurrency] = useCurrencySync('GBP');

  // Load revenue reports from API
  const loadRevenueReports = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log('No session found for loading reports');
        setLoadingReports(false);
        return;
      }

      const response = await fetch('/api/revenue/list', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Loaded revenue reports:', result.reports?.length || 0);
        
        // Transform API data to match UI expectations
        const transformedReports = (result.reports || []).map(report => ({
          id: report.id,
          platform: report.description?.split(' ')[0] || 'Unknown Platform',
          amount: report.amount,
          currency: report.currency,
          date: report.period || report.created_at?.split('T')[0],
          status: report.status,
          submittedDate: report.created_at?.split('T')[0],
          assets: [], // Could be enhanced to show actual assets
          artistName: report.artist_email,
          notes: report.description
        }));
        
        setRevenueReports(transformedReports);
      } else {
        console.error('Failed to load revenue reports:', response.status);
      }
    } catch (error) {
      console.error('Error loading revenue reports:', error);
    } finally {
      setLoadingReports(false);
    }
  };

  // Load assets from API
  const loadAssets = async (searchTerm = '') => {
    try {
      setLoadingAssets(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log('No session found for loading assets');
        return;
      }

      const url = searchTerm 
        ? `/api/assets/list?search=${encodeURIComponent(searchTerm)}`
        : '/api/assets/list';

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Loaded assets:', result.assets?.length || 0);
        setAssets(result.assets || []);
      } else {
        console.error('Failed to load assets:', response.status);
      }
    } catch (error) {
      console.error('Error loading assets:', error);
    } finally {
      setLoadingAssets(false);
    }
  };

  // Load reports when component mounts
  useEffect(() => {
    if (user) {
      loadRevenueReports();
      loadAssets();
    }
  }, [user]);

  // Handle date range changes
  const handleDateRangeChange = (start, end) => {
    setStartDate(start);
    setEndDate(end);
    console.log('Distribution Partner reports date range changed:', { start, end });
  };

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

  const handleSubmitReport = async () => {
    if (!newReport.platform || !newReport.amount || !newReport.date) {
      showError('Please fill in all required fields', 'Missing Information');
      return;
    }

    if (!selectedAssetForReport) {
      showError('Please select an asset', 'Missing Asset');
      return;
    }

    try {
      // Get user session for API call
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        showError('Please log in to continue', 'Authentication Required');
        return;
      }

      // Submit to real revenue reporting API
      const response = await fetch('/api/revenue/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          artistEmail: selectedAssetForReport.artist.email,
          amount: parseFloat(newReport.amount),
          currency: selectedCurrency,
          description: `${newReport.platform} revenue for ${selectedAssetForReport.name}`,
          releaseTitle: selectedAssetForReport.name,
          period: newReport.date
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit revenue report');
      }

      console.log('Revenue report submitted:', result);

      // Add to local state for immediate UI update
      const report = {
        id: result.report.id,
        platform: newReport.platform,
        amount: parseFloat(newReport.amount),
        currency: selectedCurrency,
        date: newReport.date,
        status: 'pending_approval',
        submittedDate: new Date().toISOString().split('T')[0],
        assets: [selectedAssetForReport.name],
        artistId: selectedAssetForReport.artist.id,
        artistName: selectedAssetForReport.artist.displayName,
        assetName: selectedAssetForReport.name,
        notes: newReport.notes
      };

      setRevenueReports(prev => [report, ...prev]);
      
      // Reset form
      setNewReport({ platform: '', amount: '', date: '', selectedAsset: null, notes: '' });
      setAssetSearch('');
      setSelectedAssetForReport(null);
      setShowReportModal(false);
      
      showWarning('Revenue report submitted successfully! Awaiting approval from admin.', 'Report Submitted');

    } catch (error) {
      console.error('Revenue report submission failed:', error);
      showError(error.message || 'Failed to submit revenue report. Please try again.', 'Submission Failed');
    }
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

  // Filter assets for dropdown
  const filteredAssets = assets.filter(asset => 
    asset.name.toLowerCase().includes(assetSearch.toLowerCase()) ||
    asset.artist.displayName.toLowerCase().includes(assetSearch.toLowerCase()) ||
    asset.artist.email.toLowerCase().includes(assetSearch.toLowerCase()) ||
    asset.type.toLowerCase().includes(assetSearch.toLowerCase())
  );

  // Handler functions for form interactions
  const handleAssetSelect = (asset) => {
    setSelectedAssetForReport(asset);
    setAssetSearch(`${asset.name} - ${asset.artist.displayName}`);
    setNewReport(prev => ({ ...prev, selectedAsset: asset }));
  };

  // Handle asset search with debouncing for API calls
  const handleAssetSearchChange = (value) => {
    setAssetSearch(value);
    if (!selectedAssetForReport) {
      // Clear selection if user is typing
      setNewReport(prev => ({ ...prev, selectedAsset: null }));
      
      // Debounce API calls for search
      clearTimeout(window.assetSearchTimeout);
      window.assetSearchTimeout = setTimeout(() => {
        if (value.length >= 2) {
          loadAssets(value);
        } else if (value.length === 0) {
          loadAssets();
        }
      }, 300);
    }
  };

  // Clear asset selection
  const clearAssetSelection = () => {
    setSelectedAssetForReport(null);
    setAssetSearch('');
    setNewReport(prev => ({ ...prev, selectedAsset: null }));
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

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600">Please log in to access this page.</p>
        </div>
      </div>
    );
  }

  const userRole = getUserRoleSync(user);
  
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



  // Calculate real earnings from revenue reports
  const earningsData = {
    totalEarnings: totalReported,
    monthlyEarnings: revenueReports
      .filter(report => {
        const reportDate = new Date(report.date || report.created_at);
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        return reportDate.getMonth() === currentMonth && reportDate.getFullYear() === currentYear;
      })
      .reduce((sum, report) => sum + report.amount, 0),
    pendingPayouts: pendingTotal,
    paidOut: approvedThisMonth,
    averagePerStream: totalReported > 0 ? totalReported / Math.max(revenueReports.length * 1000, 1) : 0,
    topEarningMonth: { month: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }), amount: approvedThisMonth }
  };

  // Calculate platform earnings from real revenue reports
  const platformEarningsMap = {};
  revenueReports.forEach(report => {
    const platform = report.platform || 'Other';
    if (!platformEarningsMap[platform]) {
      platformEarningsMap[platform] = {
        name: platform,
        earnings: 0,
        count: 0,
        color: getPlatformColor(platform)
      };
    }
    platformEarningsMap[platform].earnings += report.amount;
    platformEarningsMap[platform].count += 1;
  });

  // Helper function to get platform colors
  function getPlatformColor(platform) {
    const colors = {
      'Spotify': '#1DB954',
      'Apple Music': '#FA243C', 
      'YouTube Music': '#FF0000',
      'Amazon Music': '#FF9900',
      'Deezer': '#FEAA2D',
      'TIDAL': '#000000',
      'TikTok': '#000000',
      'Other': '#6B7280'
    };
    return colors[platform] || '#6B7280';
  }

  // Calculate monthly earnings from real data
  const last6Months = Array.from({length: 6}, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - i));
    return {
      label: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      month: date.getMonth(),
      year: date.getFullYear()
    };
  });

  const monthlyEarningsData = {
    labels: last6Months.map(m => m.label),
    totalEarnings: last6Months.map(m => {
      return revenueReports
        .filter(report => {
          const reportDate = new Date(report.date || report.created_at);
          return reportDate.getMonth() === m.month && reportDate.getFullYear() === m.year;
        })
        .reduce((sum, report) => sum + report.amount, 0);
    })
  };

  // Calculate artist earnings from real revenue reports
  const artistEarningsMap = {};
  revenueReports.forEach(report => {
    const artistName = report.artistName || 'Unknown Artist';
    if (!artistEarningsMap[artistName]) {
      artistEarningsMap[artistName] = {
        artist: artistName,
        totalEarnings: 0,
        monthlyEarnings: 0,
        reportCount: 0
      };
    }
    artistEarningsMap[artistName].totalEarnings += report.amount;
    
    // Calculate monthly earnings
    const reportDate = new Date(report.date || report.created_at);
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    if (reportDate.getMonth() === currentMonth && reportDate.getFullYear() === currentYear) {
      artistEarningsMap[artistName].monthlyEarnings += report.amount;
    }
    
    artistEarningsMap[artistName].reportCount += 1;
  });

  const artistEarningsData = Object.values(artistEarningsMap);

  // Use real revenue reports as detailed earnings data
  const detailedEarningsData = revenueReports.map(report => ({
    month: new Date(report.date || report.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    artist: report.artistName || 'Unknown Artist',
    release: report.assetName || 'Unknown Release',
    track: report.assetName || 'Unknown Track',
    platform: report.platform || 'Other',
    streams: 0, // Would need to be tracked separately
    downloads: 0, // Would need to be tracked separately
    streamingRevenue: report.amount,
    downloadRevenue: 0,
    mechanicalRevenue: 0,
    performanceRevenue: 0,
    totalEarnings: report.amount
  }));

  // Real filter options based on actual data
  const filterArtists = [
    { id: 'all', name: 'All Artists' },
    ...artistEarningsData.map(artist => ({
      id: artist.artist.toLowerCase().replace(/\s+/g, '_'),
      name: artist.artist
    }))
  ];

  const filterReleases = [
    { id: 'all', name: 'All Releases' },
    ...Array.from(new Set(revenueReports.map(r => r.assetName).filter(Boolean)))
      .map(name => ({
        id: name.toLowerCase().replace(/\s+/g, '_'),
        name: name
      }))
  ];

  const filterAssets = [
    { id: 'all', name: 'All Assets/Tracks' },
    { id: 'singles', name: 'Singles' },
    { id: 'albums', name: 'Albums' },
    { id: 'eps', name: 'EPs' }
  ];

  const filterPlatforms = [
    { id: 'all', name: 'All Platforms' },
    ...Array.from(new Set(revenueReports.map(r => r.platform).filter(Boolean)))
      .map(platform => ({
        id: platform.toLowerCase().replace(/\s+/g, '_'),
        name: platform
      }))
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
      customDates: selectedPeriod === 'custom' ? { start: startDate, end: endDate } : null
    });
    // Here you would typically call your API with the filter parameters
  };

  // Filter the earnings data based on current filters
  const getFilteredEarningsData = () => {
    let filteredData = [...detailedEarningsData];

    // Apply artist filter
    if (selectedArtistFilter !== 'all') {
      const artistMap = {
        'yhwh_msc': 'MSC & Co MSC',
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

  // Chart configurations using real data
  const platformEarningsData = {
    labels: Object.values(platformEarningsMap).map(p => p.name),
    datasets: [{
      label: 'Platform Earnings',
      data: Object.values(platformEarningsMap).map(p => p.earnings),
      backgroundColor: Object.values(platformEarningsMap).map(p => p.color),
      borderColor: Object.values(platformEarningsMap).map(p => p.color),
      borderWidth: 2,
      borderRadius: 8,
      borderSkipped: false,
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
    <SubscriptionGate 
      requiredFor="revenue reporting and analytics"
      showFeaturePreview={true}
      userRole="distribution_partner"
    >
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
                  {filterArtists.map((artist) => (
                    <option key={artist.id} value={artist.id}>
                      {artist.name}
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
                  {filterReleases.map((release) => (
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
                  {filterAssets.map((asset) => (
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
                  <BarChart3 className="w-5 h-5 text-white" />
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
                    <Music className="w-4 h-4 inline mr-1" /> Revenue rate
                  </p>
                </div>
                <div className="h-12 w-12 bg-purple-500 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-white" />
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
                    <CheckCircle className="w-4 h-4 inline mr-1" /> {earningsData.totalEarnings > 0 ? Math.round((earningsData.paidOut / earningsData.totalEarnings) * 100) : 0}% completed
                  </p>
                </div>
                <div className="h-12 w-12 bg-teal-500 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
          </div>



          {/* Platform Earnings Analysis */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Platform Earnings Analysis</h3>
              <div className="text-sm text-gray-500">
                {Object.keys(platformEarningsMap).length} platforms
              </div>
            </div>
            <div className="h-96 mb-6">
              <Bar data={platformEarningsData} options={chartOptions} />
            </div>
            
            {/* Platform Details Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Object.entries(platformEarningsMap).map(([key, platform]) => (
                <div key={key} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: platform.color }}
                      ></div>
                      <span className="font-medium text-gray-900">{platform.name}</span>
                    </div>
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                      {platform.count} reports
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Earnings:</span>
                      <span className="font-medium">{sharedFormatCurrency(platform.earnings, selectedCurrency)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Reports:</span>
                      <span className="font-medium">{platform.count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Avg per Report:</span>
                      <span className="font-medium">{sharedFormatCurrency(platform.earnings / platform.count, selectedCurrency)}</span>
                    </div>
                  </div>
                </div>
              ))}
              {Object.keys(platformEarningsMap).length === 0 && (
                <div className="col-span-full text-center py-8 text-gray-500">
                  No platform data available. Submit revenue reports to see platform breakdown.
                </div>
              )}
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">This Month</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Track Data</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reports</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Average</th>
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
                        <div className="text-sm text-gray-900">-</div>
                        <div className="text-xs text-gray-500">Track data not available</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {artist.reportCount} reports
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {sharedFormatCurrency(artist.totalEarnings / artist.reportCount, selectedCurrency)}
                        </div>
                        <div className="text-xs text-gray-500">
                          Avg per report
                        </div>
                      </td>
                    </tr>
                  ))}
                  {artistEarningsData.length === 0 && (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                        No artist earnings data available. Submit revenue reports to see artist breakdown.
                      </td>
                    </tr>
                  )}
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

                  {/* Asset Search */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Search Asset *</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={assetSearch}
                        onChange={(e) => handleAssetSearchChange(e.target.value)}
                        placeholder="Type asset name, artist name, or email..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      {loadingAssets && (
                        <div className="absolute right-3 top-3">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        </div>
                      )}
                      {assetSearch && filteredAssets.length > 0 && !selectedAssetForReport && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {filteredAssets.map((asset) => (
                            <button
                              key={asset.id}
                              onClick={() => handleAssetSelect(asset)}
                              className="w-full text-left px-3 py-2 hover:bg-gray-100 focus:bg-gray-100 border-b border-gray-100 last:border-b-0"
                            >
                              <div className="font-medium text-gray-900">{asset.name}</div>
                              <div className="text-sm text-gray-600">
                                Artist: {asset.artist.displayName} • {asset.type} • {asset.genre}
                              </div>
                              <div className="text-xs text-gray-500">{asset.artist.email}</div>
                            </button>
                          ))}
                        </div>
                      )}
                      {assetSearch && filteredAssets.length === 0 && !loadingAssets && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-3 text-gray-500 text-sm">
                          {assetSearch.length < 2 ? 'Type at least 2 characters to search' : 'No assets found matching your search.'}
                        </div>
                      )}
                      {selectedAssetForReport && (
                        <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-green-900">{selectedAssetForReport.name}</div>
                              <div className="text-sm text-green-700">
                                Artist: {selectedAssetForReport.artist.displayName}
                              </div>
                              <div className="text-xs text-green-600">{selectedAssetForReport.artist.email}</div>
                            </div>
                            <button
                              onClick={clearAssetSelection}
                              className="text-green-600 hover:text-green-800"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>



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
    </SubscriptionGate>
  );
}