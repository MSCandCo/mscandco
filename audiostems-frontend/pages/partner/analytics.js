import { useState, useEffect, useMemo } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { getUserRole } from '@/lib/auth0-config';
import Layout from '@/components/layouts/mainLayout';
import { ARTISTS, RELEASES } from '../../lib/mockData';
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

export default function PartnerAnalytics() {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const [selectedTimeframe, setSelectedTimeframe] = useState('all-time');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  
  // Filter states
  const [selectedArtist, setSelectedArtist] = useState('all');
  const [selectedRelease, setSelectedRelease] = useState('all');
  const [selectedAsset, setSelectedAsset] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Advanced filter states
  const [selectedPlatforms, setSelectedPlatforms] = useState(['all']);
  const [selectedCountries, setSelectedCountries] = useState(['all']);
  const [selectedMetric, setSelectedMetric] = useState('revenue');
  const [viewMode, setViewMode] = useState('overview'); // overview, detailed, comparison
  const [chartType, setChartType] = useState('line');

  
  // Comparison mode specific states
  const [comparisonType, setComparisonType] = useState('industry');
  const [comparisonPeriod, setComparisonPeriod] = useState('current_month');
  const [selectedCompetitor, setSelectedCompetitor] = useState('market_average');
  
  // Currency state
  const [selectedCurrency, setSelectedCurrency] = useState('GBP');
  
  // Currency formatting function
  const formatCurrency = (amount) => {
    const symbol = selectedCurrency === 'GBP' ? '£' : selectedCurrency === 'EUR' ? '€' : '$';
    return `${symbol}${amount.toLocaleString()}`;
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

  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num);
  };



  // 🎯 CLEANED UP - Using centralized data from lib/mockData.js
  const mockArtists = [
    { id: 'all', name: 'All Artists' },
    ...ARTISTS.map(artist => ({
      id: artist.id,
      name: artist.name,
      releases: artist.releases,
      totalStreams: artist.totalStreams,
      totalRevenue: artist.totalRevenue,
      genres: artist.genres,
      topTrack: artist.topTrack
    }))
  ];

  const mockReleases = [
    { id: 'all', name: 'All Releases' },
    ...RELEASES.map(release => ({
      id: release.id,
      name: release.projectName,
      artist: release.artist,
      status: release.status,
      type: release.releaseType,
      streams: release.streams || 0,
      revenue: release.earnings || 0
    }))
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

  // Comprehensive analytics data based on actual releases from our database
  const platformData = {
    spotify: { 
      name: 'Spotify', 
      streams: 3247893, 
      revenue: 12991.57, 
      growth: 23.4, 
      color: '#1DB954',
      releases: ['Chart Topper Hits', 'K-Pop Sensation', 'Madison Square Garden Live', 'Classic Hits Single'],
      topRelease: { name: 'K-Pop Sensation', streams: 4500000, artist: 'Seoul Stars' }
    },
    apple: { 
      name: 'Apple Music', 
      streams: 1896547, 
      revenue: 7586.19, 
      growth: 18.7, 
      color: '#FA243C',
      releases: ['Chart Topper Hits', 'Rock Legends Live', 'Electronic Horizons'],
      topRelease: { name: 'Chart Topper Hits', streams: 2800000, artist: 'Global Superstar' }
    },
    youtube: { 
      name: 'YouTube Music', 
      streams: 963721, 
      revenue: 2891.16, 
      growth: 15.2, 
      color: '#FF0000',
      releases: ['K-Pop Sensation', 'Urban Beat Remix Package', 'Reggaeton Fuego'],
      topRelease: { name: 'K-Pop Sensation', streams: 4500000, artist: 'Seoul Stars' }
    },
    amazon: { 
      name: 'Amazon Music', 
      streams: 598456, 
      revenue: 2394.18, 
      growth: 12.8, 
      color: '#FF9900',
      releases: ['Madison Square Garden Live', 'Chart Topper Hits'],
      topRelease: { name: 'Madison Square Garden Live', streams: 1200000, artist: 'Rock Legends' }
    },
    deezer: { 
      name: 'Deezer', 
      streams: 287634, 
      revenue: 1150.54, 
      growth: 9.3, 
      color: '#FEAA2D',
      releases: ['Electronic Horizons', 'Jazz Fusion Mixtape'],
      topRelease: { name: 'Electronic Horizons', streams: 450000, artist: 'DJ Phoenix' }
    },
    tidal: { 
      name: 'TIDAL', 
      streams: 198234, 
      revenue: 792.94, 
      growth: 7.1, 
      color: '#000000',
      releases: ['Madison Square Garden Live', 'Movie Epic Soundtrack'],
      topRelease: { name: 'Madison Square Garden Live', streams: 1200000, artist: 'Rock Legends' }
    },
    soundcloud: { 
      name: 'SoundCloud', 
      streams: 356789, 
      revenue: 1071.67, 
      growth: 14.6, 
      color: '#FF3300',
      releases: ['Urban Beat Remix Package', 'Indie Rock Revival'],
      topRelease: { name: 'Urban Beat Remix Package', streams: 350000, artist: 'YHWH MSC' }
    },
    other: { 
      name: 'Other Platforms', 
      streams: 445678, 
      revenue: 1823.45, 
      growth: 11.2, 
      color: '#6B7280',
      description: 'Includes Pandora, iHeartRadio, Napster, Audiomack, Bandcamp, and 15+ other services',
      releases: ['Country Roads Album', 'Jazz Fusion Mixtape', 'Reggaeton Fuego'],
      platforms: ['Pandora', 'iHeartRadio', 'Napster', 'Audiomack', 'Bandcamp', 'JioSaavn', 'Anghami', 'Boomplay', 'NetEase Music', 'QQ Music', 'KKBox', 'Joox', 'Yandex Music', 'VK Music', 'Gaana', 'Wynk Music', 'Hungama', 'MelOn', 'Bugs Music', 'Genie Music']
    }
  };

  const countryData = {
    us: { name: 'United States', streams: 1145632, revenue: 4582.53, percentage: 32.1 },
    uk: { name: 'United Kingdom', streams: 523789, revenue: 2095.16, percentage: 14.7 },
    canada: { name: 'Canada', streams: 398234, revenue: 1592.94, percentage: 11.2 },
    germany: { name: 'Germany', streams: 456123, revenue: 1824.49, percentage: 12.8 },
    france: { name: 'France', streams: 234567, revenue: 938.27, percentage: 6.6 },
    australia: { name: 'Australia', streams: 198745, revenue: 794.98, percentage: 5.6 },
    other: { name: 'Other Countries', streams: 612178, revenue: 2448.71, percentage: 17.0 }
  };

  const timeSeriesData = {
    labels: ['Jan 2024', 'Feb 2024', 'Mar 2024', 'Apr 2024', 'May 2024', 'Jun 2024'],
    revenue: [8947.23, 9234.56, 10456.78, 11234.91, 12450.75, 13678.92],
    streams: [1847293, 2134567, 2456789, 2678912, 2847293, 3123456],
    downloads: [32847, 38456, 42789, 45827, 48234, 52678],
    growth: [12.3, 15.7, 18.2, 21.4, 18.5, 16.8]
  };

  const artistPerformance = [
    { artist: 'YHWH MSC', streams: 1234567, revenue: 4938.27, growth: 25.4, releases: 3, topTrack: 'Lost in Time' },
    { artist: 'Audio MSC', streams: 987654, revenue: 3950.62, growth: 18.9, releases: 2, topTrack: 'Beach Dreams' },
    { artist: 'Independent Artists', streams: 625072, revenue: 2500.29, growth: 22.1, releases: 1, topTrack: 'Thunder Road' }
  ];

  // Comparison options
  const comparisonTypes = {
    industry: 'Industry Benchmark',
    competitors: 'Direct Competitors', 
    historical: 'Historical Performance',
    market_leaders: 'Market Leaders',
    similar_artists: 'Similar Artists'
  };

  const comparisonPeriods = {
    current_month: 'vs Current Month',
    last_month: 'vs Last Month',
    last_quarter: 'vs Last Quarter',
    last_year: 'vs Last Year',
    ytd: 'vs Year to Date'
  };

  const competitorOptions = {
    market_average: 'Market Average',
    top_10_percent: 'Top 10% Performers',
    similar_size: 'Similar Size Labels',
    direct_competitors: 'Direct Competitors',
    indie_benchmark: 'Independent Benchmark'
  };

  // View mode specific data
  const getViewModeData = useMemo(() => {
    switch (viewMode) {
      case 'overview':
        return {
          title: 'High-Level Overview',
          description: 'Summary metrics and key performance indicators',
          platformData: {
            spotify: { name: 'Spotify', streams: 1247893, revenue: 4991.57, growth: 23.4, color: '#1DB954', marketShare: 35.2 },
            apple: { name: 'Apple Music', streams: 896547, revenue: 3586.19, growth: 18.7, color: '#FA243C', marketShare: 25.3 },
            youtube: { name: 'YouTube Music', streams: 563721, revenue: 1691.16, growth: 15.2, color: '#FF0000', marketShare: 15.9 },
            other: { name: 'Other Platforms', streams: 245678, revenue: 1123.45, growth: 11.2, color: '#6B7280', marketShare: 23.6 }
          },
          metrics: {
            totalRevenue: 11392.37,
            totalStreams: 2953839,
            avgGrowth: 17.1,
            topPerformer: 'Spotify'
          }
        };
      


      
      default:
        return getViewModeData('overview');
    }
  }, [viewMode, comparisonType, comparisonPeriod, selectedCompetitor]);

  // Advanced filtering logic
  const getFilteredData = useMemo(() => {
    const viewData = getViewModeData;
    let filteredPlatforms = { ...viewData.platformData };
    let filteredCountries = { ...countryData };
    let filteredArtists = [...artistPerformance];

    // Apply platform filters
    if (!selectedPlatforms.includes('all')) {
      const filtered = {};
      selectedPlatforms.forEach(platform => {
        if (filteredPlatforms[platform]) {
          filtered[platform] = filteredPlatforms[platform];
        }
      });
      filteredPlatforms = filtered;
    }

    // Apply country filters
    if (!selectedCountries.includes('all')) {
      const filtered = {};
      selectedCountries.forEach(country => {
        if (filteredCountries[country]) {
          filtered[country] = filteredCountries[country];
        }
      });
      filteredCountries = filtered;
    }

    // Apply artist filters
    if (selectedArtist !== 'all') {
      const artistMap = {
        'yhwh_msc': 'YHWH MSC',
        'audio_msc': 'Audio MSC',
        'independent': 'Independent Artists'
      };
      filteredArtists = filteredArtists.filter(artist => 
        artist.artist === artistMap[selectedArtist]
      );
    }

    return { 
      filteredPlatforms, 
      filteredCountries, 
      filteredArtists,
      viewModeInfo: viewData
    };
  }, [selectedPlatforms, selectedCountries, selectedArtist, getViewModeData, countryData, artistPerformance]);

  // Chart configurations
  const platformChartData = {
    labels: Object.values(getFilteredData.filteredPlatforms).map(p => p.name),
    datasets: [{
      label: selectedMetric === 'revenue' ? 'Revenue ($)' : 'Streams',
      data: Object.values(getFilteredData.filteredPlatforms).map(p => 
        selectedMetric === 'revenue' ? p.revenue : p.streams
      ),
      backgroundColor: Object.values(getFilteredData.filteredPlatforms).map(p => p.color),
      borderColor: Object.values(getFilteredData.filteredPlatforms).map(p => p.color),
      borderWidth: 2,
      borderRadius: 8,
      borderSkipped: false,
    }]
  };

  const timeSeriesChartData = {
    labels: timeSeriesData.labels,
    datasets: [
      {
        label: 'Revenue ($)',
        data: timeSeriesData.revenue,
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
        label: 'Streams',
        data: timeSeriesData.streams.map(s => s / 1000), // Scale for visibility
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#10B981',
        pointBorderColor: '#FFFFFF',
        pointBorderWidth: 2,
        pointRadius: 6,
        yAxisID: 'y1',
      }
    ]
  };

  const countryChartData = {
    labels: Object.values(getFilteredData.filteredCountries).map(c => c.name),
    datasets: [{
      data: Object.values(getFilteredData.filteredCountries).map(c => c.percentage),
      backgroundColor: [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
        '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'
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
            if (selectedMetric === 'revenue') {
              return `${context.dataset.label}: $${context.parsed.y?.toLocaleString() || context.parsed}`;
            }
            return `${context.dataset.label}: ${(context.parsed.y || context.parsed)?.toLocaleString()}`;
          }
        }
      }
    },
    scales: chartType === 'line' ? {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          callback: function(value) {
            return selectedMetric === 'revenue' ? `$${value.toLocaleString()}` : value.toLocaleString();
          }
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          callback: function(value) {
            return `${value}K`;
          }
        }
      }
    } : {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          callback: function(value) {
            return selectedMetric === 'revenue' ? `$${value.toLocaleString()}` : value.toLocaleString();
          }
        }
      }
    }
  };

  // Filter and search functions
  const clearAllFilters = () => {
    setSelectedArtist('all');
    setSelectedRelease('all');
    setSelectedAsset('all');
    setSearchQuery('');
    setSelectedPlatforms(['all']);
    setSelectedCountries(['all']);
  };

  const applyFilters = () => {
    console.log('Applying advanced filters:', {
      artist: selectedArtist,
      release: selectedRelease,
      asset: selectedAsset,
      search: searchQuery,
      platforms: selectedPlatforms,
      countries: selectedCountries,
      metric: selectedMetric,
      viewMode: viewMode,
      timeframe: selectedTimeframe,
      customDates: selectedTimeframe === 'custom' ? { start: customStartDate, end: customEndDate } : null
    });
    // Here you would typically call your API with the filter parameters
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Distribution Analytics</h1>
                  <p className="text-sm text-gray-500">Analytics for all distributed releases</p>
                </div>
                
                {/* Currency Selector */}
                <div className="flex items-center space-x-3">
                  <label className="text-sm font-medium text-gray-700">Currency:</label>
                  <select
                    value={selectedCurrency}
                    onChange={(e) => setSelectedCurrency(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    <option value="GBP">GBP (£)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Timeframe Selector */}
          <div className="mb-6">
            <div className="flex flex-wrap items-center gap-4">
              <select
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="7-days">Last 7 Days</option>
                <option value="30-days">Last 30 Days</option>
                <option value="90-days">Last 90 Days</option>
                <option value="custom">Custom Range</option>
                <option value="all-time">All Time</option>
              </select>
              
              {selectedTimeframe === 'custom' && (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <label htmlFor="start-date" className="text-sm font-medium text-gray-700">From:</label>
                    <input
                      id="start-date"
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label htmlFor="end-date" className="text-sm font-medium text-gray-700">To:</label>
                    <input
                      id="end-date"
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <button
                    onClick={() => {
                      if (customStartDate && customEndDate) {
                        console.log(`Applying custom date range: ${customStartDate} to ${customEndDate}`);
                        // Here you would typically refresh the data with the new date range
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

          {/* Advanced Filters Section */}
          <div className="mb-6 bg-white rounded-xl shadow-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3 animate-pulse"></span>
                  Analytics
                </h3>

              </div>
            </div>

            <div className="p-6 space-y-6">

              {/* Smart Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="🔍 Smart search: artists, releases, tracks, platforms..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                  🎯
                </div>
              </div>

              {/* Multi-Select Filters */}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
                {/* Platform Multi-Select */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Platforms</label>
                  <div className="max-h-64 overflow-y-auto border border-gray-300 rounded-lg bg-white">
                    {/* All Platforms Option */}
                    <label className="flex items-center p-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100">
                      <input
                        type="checkbox"
                        checked={selectedPlatforms.includes('all')}
                        onChange={(e) => {
                          setSelectedPlatforms(e.target.checked ? ['all'] : []);
                        }}
                        className="mr-2 rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span className="w-3 h-3 rounded-full mr-2 inline-block bg-blue-500"></span>
                      <span className="text-sm font-medium">All Platforms</span>
                    </label>
                    
                    {/* Individual Platform Options */}
                    {Object.entries(platformData).map(([key, platform]) => (
                      <label key={key} className="flex items-center p-2 hover:bg-gray-50 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={selectedPlatforms.includes('all') || selectedPlatforms.includes(key)}
                          onChange={(e) => {
                            setSelectedPlatforms(prev => {
                              const filtered = prev.filter(p => p !== 'all');
                              if (e.target.checked) {
                                return [...filtered, key];
                              } else {
                                return filtered.filter(p => p !== key);
                              }
                            });
                          }}
                          className="mr-2 rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span className="w-3 h-3 rounded-full mr-2 inline-block" 
                              style={{ backgroundColor: platform.color }}></span>
                        <div className="flex-1">
                          <span className="text-sm">{platform.name}</span>
                          {key === 'other' && (
                            <div className="text-xs text-gray-500 mt-1 group-hover:text-gray-700">
                              {platform.description}
                            </div>
                          )}
                        </div>
                        {key === 'other' && (
                          <span className="text-xs text-gray-400 ml-2">20+</span>
                        )}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Country Multi-Select */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Countries</label>
                  <div className="max-h-64 overflow-y-auto border border-gray-300 rounded-lg bg-white">
                    {Object.entries(countryData).map(([key, country]) => (
                      <label key={key} className="flex items-center p-2 hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedCountries.includes('all') || selectedCountries.includes(key)}
                          onChange={(e) => {
                            if (key === 'all') {
                              setSelectedCountries(e.target.checked ? ['all'] : []);
                            } else {
                              setSelectedCountries(prev => {
                                const filtered = prev.filter(c => c !== 'all');
                                if (e.target.checked) {
                                  return [...filtered, key];
                                } else {
                                  return filtered.filter(c => c !== key);
                                }
                              });
                            }
                          }}
                          className="mr-2 rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm">{country.name}</span>
                        <span className="text-xs text-gray-500 ml-auto">{country.percentage}%</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Metric Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Primary Metric</label>
                  <div className="space-y-2">
                    {['revenue', 'streams', 'downloads', 'growth'].map((metric) => (
                      <label key={metric} className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="metric"
                          value={metric}
                          checked={selectedMetric === metric}
                          onChange={(e) => setSelectedMetric(e.target.value)}
                          className="mr-2 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm capitalize">{metric}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Legacy Filters */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Legacy Filters</label>
                  <div className="space-y-2">
                    <select
                      value={selectedArtist}
                      onChange={(e) => setSelectedArtist(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                    >
                      {mockArtists.map((artist) => (
                        <option key={artist.id} value={artist.id}>{artist.name}</option>
                      ))}
                    </select>
                    <select
                      value={selectedAsset}
                      onChange={(e) => setSelectedAsset(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                    >
                      {mockAssets.map((asset) => (
                        <option key={asset.id} value={asset.id}>{asset.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Filter Actions */}
              <div className="flex flex-wrap items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={applyFilters}
                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-lg"
                  >
                    🚀 Apply Filters
                  </button>
                  <button
                    onClick={clearAllFilters}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
                  >
                    🔄 Reset All
                  </button>
                </div>

                <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                  {(() => {
                    const activeFilters = [
                      selectedArtist !== 'all' && '👤 Artist',
                      !selectedPlatforms.includes('all') && `📱 ${selectedPlatforms.length} Platforms`,
                      !selectedCountries.includes('all') && `🌍 ${selectedCountries.length} Countries`,
                      searchQuery && '🔍 Search',
                      selectedMetric !== 'revenue' && `📊 ${selectedMetric}`
                    ].filter(Boolean);
                    
                    return activeFilters.length > 0 
                      ? `Active: ${activeFilters.join(', ')}` 
                      : '✨ No filters active';
                  })()}
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Revenue Card */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl shadow-lg p-6 border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 mb-1">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${Object.values(getFilteredData.filteredPlatforms).reduce((sum, p) => sum + p.revenue, 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-green-600 font-medium mt-1">
                    ↗ +{(Object.values(getFilteredData.filteredPlatforms).reduce((sum, p) => sum + p.growth, 0) / Object.values(getFilteredData.filteredPlatforms).length).toFixed(1)}%
                  </p>
                </div>
                <div className="h-12 w-12 bg-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-lg">💰</span>
                </div>
              </div>
            </div>

            {/* Total Streams Card */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl shadow-lg p-6 border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 mb-1">Total Streams</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Object.values(getFilteredData.filteredPlatforms).reduce((sum, p) => sum + p.streams, 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-green-600 font-medium mt-1">
                    📈 Across {Object.keys(getFilteredData.filteredPlatforms).length} platforms
                  </p>
                </div>
                <div className="h-12 w-12 bg-green-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-lg">🎵</span>
                </div>
              </div>
            </div>

            {/* Platform Performance */}
            <div className="bg-gradient-to-br from-purple-50 to-violet-100 rounded-xl shadow-lg p-6 border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600 mb-1">Top Platform</p>
                  <p className="text-xl font-bold text-gray-900">
                    {Object.values(getFilteredData.filteredPlatforms).sort((a, b) => b.revenue - a.revenue)[0]?.name || 'Spotify'}
                  </p>
                  <p className="text-xs text-purple-600 font-medium mt-1">
                    🏆 Best performer
                  </p>
                </div>
                <div className="h-12 w-12 bg-purple-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-lg">🚀</span>
                </div>
              </div>
            </div>

            {/* Growth Metric */}
            <div className="bg-gradient-to-br from-yellow-50 to-orange-100 rounded-xl shadow-lg p-6 border border-yellow-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-600 mb-1">Avg Growth</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {(Object.values(getFilteredData.filteredPlatforms).reduce((sum, p) => sum + p.growth, 0) / Object.values(getFilteredData.filteredPlatforms).length).toFixed(1)}%
                  </p>
                  <p className="text-xs text-yellow-600 font-medium mt-1">
                    📊 Month over month
                  </p>
                </div>
                <div className="h-12 w-12 bg-yellow-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-lg">📈</span>
                </div>
              </div>
            </div>
          </div>

          {/* View Mode Information Panel */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{getFilteredData.viewModeInfo.title}</h3>
                <p className="text-sm text-gray-600">{getFilteredData.viewModeInfo.description}</p>
              </div>
              <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {viewMode.charAt(0).toUpperCase() + viewMode.slice(1)} Mode
              </div>
            </div>
            
            {/* View Mode Specific Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {viewMode === 'overview' && (
                <>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-sm text-blue-600 font-medium">Total Revenue</div>
                    <div className="text-xl font-bold text-blue-900">{formatCurrency(getFilteredData.viewModeInfo.metrics.totalRevenue)}</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-sm text-green-600 font-medium">Total Streams</div>
                    <div className="text-xl font-bold text-green-900">{getFilteredData.viewModeInfo.metrics.totalStreams.toLocaleString()}</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-sm text-purple-600 font-medium">Avg Growth</div>
                    <div className="text-xl font-bold text-purple-900">{getFilteredData.viewModeInfo.metrics.avgGrowth}%</div>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <div className="text-sm text-yellow-600 font-medium">Top Performer</div>
                    <div className="text-xl font-bold text-yellow-900">{getFilteredData.viewModeInfo.metrics.topPerformer}</div>
                  </div>
                </>
              )}
              


            </div>
          </div>

          {/* Interactive Charts Dashboard */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
            {/* Platform Performance Chart */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Platform Performance</h3>

              </div>
              <div className="h-80">
                {chartType === 'bar' && <Bar data={platformChartData} options={chartOptions} />}
                {chartType === 'line' && Object.keys(getFilteredData.filteredPlatforms).length > 1 && (
                  <Line data={timeSeriesChartData} options={chartOptions} />
                )}
                {chartType === 'doughnut' && <Doughnut data={platformChartData} options={chartOptions} />}
              </div>
            </div>

            {/* Geographic Distribution */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Geographic Distribution</h3>
                <div className="text-sm text-gray-500">
                  {Object.keys(getFilteredData.filteredCountries).length} countries
                </div>
              </div>
              <div className="h-80">
                <Doughnut data={countryChartData} options={{
                  ...chartOptions,
                  plugins: {
                    ...chartOptions.plugins,
                    tooltip: {
                      ...chartOptions.plugins.tooltip,
                      callbacks: {
                        label: function(context) {
                          return `${context.label}: ${context.parsed}%`;
                        }
                      }
                    }
                  }
                }} />
              </div>
            </div>
          </div>

          {/* Platform Breakdown Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Object.entries(getFilteredData.filteredPlatforms).map(([key, platform]) => (
              <div key={key} className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: platform.color }}
                    ></div>
                    <h4 className="font-semibold text-gray-900">{platform.name}</h4>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    platform.growth > 15 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    +{platform.growth}%
                  </span>
                </div>
                
                <div className="space-y-3">
                  {/* Basic metrics for all view modes */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-600">Streams</span>
                      <span className="text-sm font-medium">{platform.streams.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full" 
                        style={{ 
                          backgroundColor: platform.color,
                          width: `${(platform.streams / Math.max(...Object.values(getFilteredData.filteredPlatforms).map(p => p.streams))) * 100}%`
                        }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-600">Revenue</span>
                      <span className="text-sm font-medium">{formatCurrency(platform.revenue)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full opacity-75" 
                        style={{ 
                          backgroundColor: platform.color,
                          width: `${(platform.revenue / Math.max(...Object.values(getFilteredData.filteredPlatforms).map(p => p.revenue))) * 100}%`
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* View mode specific content */}
                  {viewMode === 'overview' && platform.marketShare && (
                    <div className="pt-2 border-t border-gray-100">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Market Share</span>
                        <span className="text-sm font-medium text-blue-600">{platform.marketShare}%</span>
                      </div>
                    </div>
                  )}




                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}