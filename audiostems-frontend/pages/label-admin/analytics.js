import { useState, useEffect, useMemo } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { getUserRole, getUserBrand } from '../../lib/auth0-config';
import Layout from '../../components/layouts/mainLayout';
import { ARTISTS, RELEASES, DASHBOARD_STATS } from '../../lib/mockData';
import CurrencySelector, { formatCurrency, useCurrencySync } from '../../components/shared/CurrencySelector';
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

export default function LabelAdminAnalytics() {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const [selectedTimeframe, setSelectedTimeframe] = useState('6-months');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [selectedArtist, setSelectedArtist] = useState('all');
  const [selectedMetric, setSelectedMetric] = useState('revenue');
  const [viewMode, setViewMode] = useState('overview');
  const [chartType, setChartType] = useState('line');
  const [selectedCurrency, updateCurrency] = useCurrencySync('GBP');

  const userRole = getUserRole(user);
  const userBrand = getUserBrand(user);

  // Get label artists and releases
  const labelData = useMemo(() => {
    const labelName = userBrand?.displayName || 'MSC & Co';
    
    const labelArtists = ARTISTS.filter(artist => 
      artist.status === 'active' && 
      (artist.label === labelName || artist.brand === labelName)
    );
    
    const labelArtistIds = labelArtists.map(artist => artist.id);
    const labelReleases = RELEASES.filter(release => 
      labelArtistIds.includes(release.artistId)
    );

    return { labelArtists, labelReleases };
  }, [userBrand]);

  // Calculate analytics data
  const analyticsData = useMemo(() => {
    const { labelArtists, labelReleases } = labelData;
    
    // Calculate totals
    const totalEarnings = labelReleases.reduce((sum, release) => sum + (release.earnings || 0), 0);
    const totalStreams = labelReleases.reduce((sum, release) => sum + (release.streams || 0), 0);
    
    // Generate monthly data
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const monthlyData = monthNames.map(month => ({
      month,
      earnings: Math.round(totalEarnings * (0.15 + Math.random() * 0.1)),
      streams: Math.round(totalStreams * (0.15 + Math.random() * 0.1)),
      releases: Math.floor(Math.random() * 5) + 1
    }));

    // Artist performance breakdown
    const artistPerformance = labelArtists.map(artist => {
      const artistReleases = labelReleases.filter(release => release.artistId === artist.id);
      const artistEarnings = artistReleases.reduce((sum, release) => sum + (release.earnings || 0), 0);
      const artistStreams = artistReleases.reduce((sum, release) => sum + (release.streams || 0), 0);
      
      return {
        name: artist.name,
        earnings: artistEarnings,
        streams: artistStreams,
        releases: artistReleases.length,
        growth: (Math.random() * 40) - 20 // -20% to +20%
      };
    }).sort((a, b) => b.earnings - a.earnings);

    // Platform breakdown
    const platformData = [
      { name: 'Spotify', percentage: 35, earnings: Math.round(totalEarnings * 0.35) },
      { name: 'Apple Music', percentage: 25, earnings: Math.round(totalEarnings * 0.25) },
      { name: 'YouTube Music', percentage: 20, earnings: Math.round(totalEarnings * 0.20) },
      { name: 'Amazon Music', percentage: 12, earnings: Math.round(totalEarnings * 0.12) },
      { name: 'Others', percentage: 8, earnings: Math.round(totalEarnings * 0.08) }
    ];

    // Genre breakdown
    const genreStats = {};
    labelReleases.forEach(release => {
      if (!genreStats[release.genre]) {
        genreStats[release.genre] = { count: 0, earnings: 0, streams: 0 };
      }
      genreStats[release.genre].count++;
      genreStats[release.genre].earnings += release.earnings || 0;
      genreStats[release.genre].streams += release.streams || 0;
    });

    const genreData = Object.entries(genreStats).map(([genre, stats]) => ({
      genre,
      ...stats,
      avgEarnings: stats.earnings / stats.count
    })).sort((a, b) => b.earnings - a.earnings);

    return {
      totalEarnings,
      totalStreams,
      monthlyData,
      artistPerformance,
      platformData,
      genreData,
      avgEarningsPerRelease: totalEarnings / Math.max(labelReleases.length, 1),
      avgStreamsPerRelease: totalStreams / Math.max(labelReleases.length, 1)
    };
  }, [labelData]);

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

  if (!isAuthenticated || userRole !== 'label_admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  // Chart configurations
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const monthlyEarningsChart = {
    labels: analyticsData.monthlyData.map(d => d.month),
    datasets: [
      {
        label: 'Monthly Earnings',
        data: analyticsData.monthlyData.map(d => d.earnings),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
      },
    ],
  };

  const monthlyStreamsChart = {
    labels: analyticsData.monthlyData.map(d => d.month),
    datasets: [
      {
        label: 'Monthly Streams',
        data: analyticsData.monthlyData.map(d => d.streams),
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
      },
    ],
  };

  const artistPerformanceChart = {
    labels: analyticsData.artistPerformance.slice(0, 5).map(a => a.name),
    datasets: [
      {
        label: 'Artist Earnings',
        data: analyticsData.artistPerformance.slice(0, 5).map(a => a.earnings),
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(147, 51, 234, 0.8)',
        ],
      },
    ],
  };

  const platformChart = {
    labels: analyticsData.platformData.map(p => p.name),
    datasets: [
      {
        data: analyticsData.platformData.map(p => p.percentage),
        backgroundColor: [
          '#1DB954', // Spotify green
          '#000000', // Apple Music black
          '#FF0000', // YouTube red
          '#FF9900', // Amazon orange
          '#8B5CF6', // Others purple
        ],
      },
    ],
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Performance Analytics</h1>
                <p className="text-sm text-gray-500">Comprehensive analytics for {userBrand?.displayName || 'MSC & Co'}</p>
              </div>
              <div className="flex items-center space-x-4 flex-wrap">
                <select
                  value={selectedTimeframe}
                  onChange={(e) => setSelectedTimeframe(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="7-days">Last 7 Days</option>
                  <option value="30-days">Last 30 Days</option>
                  <option value="6-months">Last 6 Months</option>
                  <option value="12-months">Last 12 Months</option>
                  <option value="year">This Year</option>
                  <option value="custom">Custom Range</option>
                </select>
                {selectedTimeframe === 'custom' && (
                  <>
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium text-gray-700">From:</label>
                      <input
                        type="date"
                        value={customStartDate}
                        onChange={(e) => setCustomStartDate(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium text-gray-700">To:</label>
                      <input
                        type="date"
                        value={customEndDate}
                        onChange={(e) => setCustomEndDate(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <button
                      onClick={() => {
                        if (customStartDate && customEndDate) {
                          console.log(`Applying custom date range: ${customStartDate} to ${customEndDate}`);
                          // Refresh analytics data with custom date range
                        } else {
                          alert('Please select both start and end dates');
                        }
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Apply
                    </button>
                  </>
                )}
                <CurrencySelector 
                  selectedCurrency={selectedCurrency}
                  onCurrencyChange={updateCurrency}
                  compact={true}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(analyticsData.totalEarnings)}</p>
                  <p className="text-sm text-green-600">+12.5% vs last period</p>
                </div>
                <div className="ml-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-green-600 text-xl">💰</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Total Streams</p>
                  <p className="text-2xl font-bold text-gray-900">{analyticsData.totalStreams.toLocaleString()}</p>
                  <p className="text-sm text-green-600">+8.3% vs last period</p>
                </div>
                <div className="ml-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 text-xl">🎵</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Active Artists</p>
                  <p className="text-2xl font-bold text-gray-900">{labelData.labelArtists.length}</p>
                  <p className="text-sm text-green-600">+2 new this month</p>
                </div>
                <div className="ml-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-purple-600 text-xl">👥</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Total Releases</p>
                  <p className="text-2xl font-bold text-gray-900">{labelData.labelReleases.length}</p>
                  <p className="text-sm text-green-600">+15% vs last period</p>
                </div>
                <div className="ml-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <span className="text-orange-600 text-xl">🎧</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Monthly Earnings Chart */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Revenue Trend</h3>
              <div className="h-64">
                <Line data={monthlyEarningsChart} options={chartOptions} />
              </div>
            </div>

            {/* Monthly Streams Chart */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Streams</h3>
              <div className="h-64">
                <Bar data={monthlyStreamsChart} options={chartOptions} />
              </div>
            </div>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Artist Performance Chart */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Artists by Revenue</h3>
              <div className="h-64">
                <Bar data={artistPerformanceChart} options={chartOptions} />
              </div>
            </div>

            {/* Platform Distribution Chart */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Distribution</h3>
              <div className="h-64">
                <Doughnut data={platformChart} options={{ responsive: true, maintainAspectRatio: false }} />
              </div>
            </div>
          </div>

          {/* Artist Performance Table */}
          <div className="bg-white rounded-lg shadow-sm border mb-8">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Artist Performance Details</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Artist</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Releases</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Streams</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Growth</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg/Release</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {analyticsData.artistPerformance.map((artist, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{artist.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{artist.releases}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(artist.earnings)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{artist.streams.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-medium ${artist.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {artist.growth >= 0 ? '+' : ''}{artist.growth.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(Math.round(artist.earnings / Math.max(artist.releases, 1)))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Platform Performance Table */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Platform Performance</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Platform</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue Share</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {analyticsData.platformData.map((platform, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{platform.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${platform.percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-900">{platform.percentage}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(platform.earnings)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          Excellent
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}