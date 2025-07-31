import { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { getUserRole } from '@/lib/auth0-config';
import Layout from '@/components/layouts/mainLayout';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function PartnerReports() {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const [selectedPeriod, setSelectedPeriod] = useState('all-time');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  
  // Filter states
  const [selectedArtist, setSelectedArtist] = useState('all');
  const [selectedRelease, setSelectedRelease] = useState('all');
  const [selectedAsset, setSelectedAsset] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Simple mock data
  const earningsData = {
    totalEarnings: 24587.92,
    monthlyEarnings: 3245.67,
    pendingPayouts: 1240.50,
    paidOut: 23347.42
  };

  // Detailed mock earnings data for export
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
      totalEarnings: 530.46
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
      totalEarnings: 399.47
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
      totalEarnings: 492.72
    },
    {
      month: 'February 2024',
      artist: 'Independent Artists',
      release: 'Rock Anthem',
      track: 'Thunder Road',
      platform: 'Amazon Music',
      streams: 23567,
      downloads: 345,
      streamingRevenue: 94.27,
      downloadRevenue: 345.00,
      mechanicalRevenue: 28.40,
      performanceRevenue: 41.80,
      totalEarnings: 509.47
    },
    {
      month: 'March 2024',
      artist: 'Audio MSC',
      release: 'Electronic Fusion EP',
      track: 'Digital Dreams',
      platform: 'Deezer',
      streams: 34567,
      downloads: 278,
      streamingRevenue: 138.27,
      downloadRevenue: 278.00,
      mechanicalRevenue: 41.50,
      performanceRevenue: 55.20,
      totalEarnings: 512.97
    },
    {
      month: 'March 2024',
      artist: 'YHWH MSC',
      release: 'Midnight Sessions',
      track: 'Eternal Night',
      platform: 'Spotify',
      streams: 56789,
      downloads: 234,
      streamingRevenue: 227.16,
      downloadRevenue: 234.00,
      mechanicalRevenue: 62.10,
      performanceRevenue: 89.30,
      totalEarnings: 612.56
    }
  ];

  // Mock data for filters
  const mockArtists = [
    { id: 'all', name: 'All Artists' },
    { id: 'yhwh_msc', name: 'YHWH MSC' },
    { id: 'audio_msc', name: 'Audio MSC' },
    { id: 'independent', name: 'Independent Artists' }
  ];

  const mockReleases = [
    { id: 'all', name: 'All Releases' },
    { id: 'midnight_sessions', name: 'Midnight Sessions' },
    { id: 'summer_vibes', name: 'Summer Vibes' },
    { id: 'urban_beats', name: 'Urban Beats Collection' },
    { id: 'rock_anthem', name: 'Rock Anthem' },
    { id: 'electronic_fusion', name: 'Electronic Fusion EP' }
  ];

  const mockAssets = [
    { id: 'all', name: 'All Assets/Tracks' },
    { id: 'singles', name: 'Singles' },
    { id: 'albums', name: 'Albums' },
    { id: 'eps', name: 'EPs' },
    { id: 'remixes', name: 'Remixes' }
  ];

  // Filter and search functions
  const clearAllFilters = () => {
    setSelectedArtist('all');
    setSelectedRelease('all');
    setSelectedAsset('all');
    setSearchQuery('');
  };

  const applyFilters = () => {
    console.log('Applying earnings filters:', {
      artist: selectedArtist,
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
    if (selectedArtist !== 'all') {
      const artistMap = {
        'yhwh_msc': 'YHWH MSC',
        'audio_msc': 'Audio MSC',
        'independent': 'Independent Artists'
      };
      filteredData = filteredData.filter(item => item.artist === artistMap[selectedArtist]);
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
        'Streaming Revenue': `$${item.streamingRevenue.toFixed(2)}`,
        'Download Revenue': `$${item.downloadRevenue.toFixed(2)}`,
        'Mechanical Revenue': `$${item.mechanicalRevenue.toFixed(2)}`,
        'Performance Revenue': `$${item.performanceRevenue.toFixed(2)}`,
        'Total Earnings': `$${item.totalEarnings.toFixed(2)}`
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
        'Total Earnings': `$${totalEarnings.toFixed(2)}`
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
      alert('Error generating Excel file. Please try again.');
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
      
      if (selectedArtist !== 'all' || selectedRelease !== 'all' || selectedAsset !== 'all' || searchQuery) {
        let filtersText = 'Filters: ';
        const activeFilters = [];
        if (selectedArtist !== 'all') activeFilters.push(`Artist: ${mockArtists.find(a => a.id === selectedArtist)?.name}`);
        if (selectedRelease !== 'all') activeFilters.push(`Release: ${mockReleases.find(r => r.id === selectedRelease)?.name}`);
        if (selectedAsset !== 'all') activeFilters.push(`Asset: ${mockAssets.find(a => a.id === selectedAsset)?.name}`);
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
        `$${item.totalEarnings.toFixed(2)}`
      ]);

      // Add summary row
      const totalEarnings = filteredData.reduce((sum, item) => sum + item.totalEarnings, 0);
      const totalStreams = filteredData.reduce((sum, item) => sum + item.streams, 0);
      const totalDownloads = filteredData.reduce((sum, item) => sum + item.downloads, 0);
      
      tableData.push([
        'TOTAL', '', '', '', '',
        totalStreams.toLocaleString(),
        totalDownloads.toLocaleString(),
        `$${totalEarnings.toFixed(2)}`
      ]);

      // Add the table
      doc.autoTable({
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
      alert('Error generating PDF file. Please try again.');
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
                <h1 className="text-2xl font-bold text-gray-900">Earnings Reports</h1>
                <p className="text-sm text-gray-500">Earnings from all distributed releases and assets</p>
              </div>
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
                        alert('Please select both start and end dates');
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
                  value={selectedArtist}
                  onChange={(e) => setSelectedArtist(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {mockArtists.map((artist) => (
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
                {(selectedArtist !== 'all' || selectedRelease !== 'all' || selectedAsset !== 'all' || searchQuery) && (
                  <span>
                    Filters active: {[
                      selectedArtist !== 'all' && 'Artist',
                      selectedRelease !== 'all' && 'Release', 
                      selectedAsset !== 'all' && 'Asset',
                      searchQuery && 'Search'
                    ].filter(Boolean).join(', ')}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Earnings Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-green-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">$</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Earnings</p>
                  <p className="text-2xl font-semibold text-gray-900">{formatCurrency(earningsData.totalEarnings)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">M</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">This Month</p>
                  <p className="text-2xl font-semibold text-gray-900">{formatCurrency(earningsData.monthlyEarnings)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-orange-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">P</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Pending Payouts</p>
                  <p className="text-2xl font-semibold text-gray-900">{formatCurrency(earningsData.pendingPayouts)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">✓</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Paid Out</p>
                  <p className="text-2xl font-semibold text-gray-900">{formatCurrency(earningsData.paidOut)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Reports Content */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Earnings Reports</h3>
            <p className="text-gray-600 mb-4">
              This section provides detailed earnings reports for all distributed releases. Use the export buttons above to download reports in Excel or PDF format.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Earnings Summary</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Total earnings to date: {formatCurrency(earningsData.totalEarnings)}</li>
                  <li>• Average monthly earnings: {formatCurrency(earningsData.monthlyEarnings)}</li>
                  <li>• Payout completion rate: {Math.round((earningsData.paidOut / earningsData.totalEarnings) * 100)}%</li>
                </ul>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Payment Status</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Amount paid out: {formatCurrency(earningsData.paidOut)}</li>
                  <li>• Pending payments: {formatCurrency(earningsData.pendingPayouts)}</li>
                  <li>• Next payout date: End of current month</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}