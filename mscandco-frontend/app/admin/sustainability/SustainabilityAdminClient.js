'use client';

import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { PageLoading } from '@/components/ui/LoadingSpinner';
import {
  Leaf,
  TrendingUp,
  TrendingDown,
  Award,
  BarChart3,
  AlertCircle,
  CheckCircle,
  Clock,
  Download,
  Filter,
  Search,
  Calendar,
  Globe,
  Zap,
  Users,
  Music,
  Target,
  Activity,
  FileText,
  DollarSign,
  PieChart,
  LineChart,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw
} from 'lucide-react';

export default function SustainabilityAdminClient({ user }) {
  const supabase = createClient();

  // State management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('all'); // 'today', 'week', 'month', 'quarter', 'year', 'all'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [selectedRelease, setSelectedRelease] = useState(null);

  // Data state
  const [stats, setStats] = useState({
    totalCarbonTracked: 0,
    totalCarbonOffset: 0,
    netCarbonImpact: 0,
    totalStreams: 0,
    activeArtists: 0,
    releasesTracked: 0,
    offsetPercentage: 0,
    carbonNeutralArtists: 0
  });

  const [carbonData, setCarbonData] = useState([]);
  const [offsetTransactions, setOffsetTransactions] = useState([]);
  const [sustainabilityProfiles, setSustainabilityProfiles] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [historicalData, setHistoricalData] = useState([]);
  const [platformBreakdown, setPlatformBreakdown] = useState({});
  const [regionBreakdown, setRegionBreakdown] = useState({});

  // Fetch all data function
  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all data from API route (single source of truth)
      const response = await fetch(`/api/admin/sustainability/data?timeRange=${timeRange}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch sustainability data');
      }

      const { carbonData, offsets, sustainabilityProfiles, achievements } = result.data;

      // Set all data
      setCarbonData(carbonData || []);
      setOffsetTransactions(offsets || []);
      setSustainabilityProfiles(sustainabilityProfiles || []);
      setAchievements(achievements || []);

      // Calculate stats
      calculateStats(carbonData || [], offsets || [], sustainabilityProfiles || []);

      // Calculate historical data (monthly aggregates)
      calculateHistoricalData(carbonData || []);

      // Calculate platform and region breakdowns
      calculateBreakdowns(carbonData || []);

    } catch (error) {
      console.error('Error fetching sustainability data:', error);
      setError(error.message || 'Failed to load sustainability data');
      // Set empty data on error so page doesn't spin forever
      setCarbonData([]);
      setOffsetTransactions([]);
      setSustainabilityProfiles([]);
      setAchievements([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all data on mount and when filters change
  useEffect(() => {
    if (user) {
      fetchAllData();
    }
  }, [user, timeRange]);

  const calculateStats = (carbonData, offsets, profiles) => {
    const totalCarbon = carbonData.reduce((sum, item) => sum + (parseFloat(item.total_carbon_kg) || 0), 0);
    const totalOffset = offsets
      .filter(o => o.transaction_status === 'completed')
      .reduce((sum, item) => sum + (parseFloat(item.offset_amount_kg) || 0), 0);
    const totalStreams = carbonData.reduce((sum, item) => sum + (parseInt(item.total_streams_count) || 0), 0);
    const netCarbon = totalCarbon - totalOffset;
    const offsetPercentage = totalCarbon > 0 ? (totalOffset / totalCarbon) * 100 : 0;
    const carbonNeutralArtists = profiles.filter(p => 
      p.sustainability_commitment === 'carbon_neutral' || 
      p.sustainability_commitment === 'carbon_negative' ||
      (p.net_carbon_kg && parseFloat(p.net_carbon_kg) <= 0)
    ).length;

    setStats({
      totalCarbonTracked: totalCarbon,
      totalCarbonOffset: totalOffset,
      netCarbonImpact: netCarbon,
      totalStreams,
      activeArtists: new Set(carbonData.map(c => c.user_id)).size,
      releasesTracked: new Set(carbonData.map(c => c.release_id)).size,
      offsetPercentage,
      carbonNeutralArtists
    });
  };

  const calculateHistoricalData = (carbonData) => {
    // Group by month
    const monthly = {};
    carbonData.forEach(item => {
      const month = new Date(item.calculation_period_start).toISOString().slice(0, 7);
      if (!monthly[month]) {
        monthly[month] = { carbon: 0, streams: 0 };
      }
      monthly[month].carbon += parseFloat(item.total_carbon_kg) || 0;
      monthly[month].streams += parseInt(item.total_streams_count) || 0;
    });

    const historical = Object.entries(monthly)
      .map(([month, data]) => ({
        month,
        carbon: data.carbon,
        streams: data.streams,
        carbonPerStream: data.streams > 0 ? (data.carbon * 1000) / data.streams : 0 // grams per stream
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    setHistoricalData(historical);
  };

  const calculateBreakdowns = (carbonData) => {
    const platforms = {};
    const regions = {};

    carbonData.forEach(item => {
      // Platform breakdown
      if (item.platform_breakdown && typeof item.platform_breakdown === 'object') {
        Object.entries(item.platform_breakdown).forEach(([platform, data]) => {
          if (!platforms[platform]) {
            platforms[platform] = { carbon: 0, streams: 0 };
          }
          platforms[platform].carbon += parseFloat(data.carbon_kg || 0);
          platforms[platform].streams += parseInt(data.streams || 0);
        });
      }

      // Region breakdown
      if (item.region_breakdown && typeof item.region_breakdown === 'object') {
        Object.entries(item.region_breakdown).forEach(([region, data]) => {
          if (!regions[region]) {
            regions[region] = { carbon: 0, streams: 0 };
          }
          regions[region].carbon += parseFloat(data.carbon_kg || 0);
          regions[region].streams += parseInt(data.streams || 0);
        });
      }
    });

    setPlatformBreakdown(platforms);
    setRegionBreakdown(regions);
  };

  // Filtered data
  const filteredCarbonData = useMemo(() => {
    let filtered = carbonData;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item.releases?.title?.toLowerCase().includes(term) ||
        item.releases?.artist_name?.toLowerCase().includes(term) ||
        item.user_profiles?.artist_name?.toLowerCase().includes(term) ||
        item.user_profiles?.email?.toLowerCase().includes(term)
      );
    }

    if (selectedArtist) {
      filtered = filtered.filter(item => item.user_id === selectedArtist);
    }

    if (selectedRelease) {
      filtered = filtered.filter(item => item.release_id === selectedRelease);
    }

    return filtered;
  }, [carbonData, searchTerm, selectedArtist, selectedRelease]);

  // Format numbers
  const formatNumber = (num, decimals = 2) => {
    if (num === null || num === undefined || isNaN(num)) return '0';
    const parsed = parseFloat(num);
    // If the number is zero or very close to zero, return "0" without decimals
    if (parsed === 0 || Math.abs(parsed) < 0.0001) return '0';
    return parsed.toFixed(decimals);
  };

  // Format grams with appropriate SI prefix (milli, micro, nano, kilo, mega, etc.)
  const formatGrams = (grams) => {
    if (grams === null || grams === undefined || isNaN(grams) || grams === 0) return '0 g';
    
    const absGrams = Math.abs(grams);
    const sign = grams < 0 ? '-' : '';
    
    // Choose the most appropriate unit
    if (absGrams >= 1000000) {
      // Mega grams (Mg) - though rarely used, we'll use kg for large values
      return `${sign}${(absGrams / 1000).toFixed(2)} kg`;
    } else if (absGrams >= 1000) {
      // Kilo grams (kg)
      return `${sign}${(absGrams / 1000).toFixed(2)} kg`;
    } else if (absGrams >= 1) {
      // Grams (g)
      return `${sign}${absGrams.toFixed(2)} g`;
    } else if (absGrams >= 0.001) {
      // Milli grams (mg)
      return `${sign}${(absGrams * 1000).toFixed(2)} mg`;
    } else if (absGrams >= 0.000001) {
      // Micro grams (μg)
      return `${sign}${(absGrams * 1000000).toFixed(2)} μg`;
    } else if (absGrams >= 0.000000001) {
      // Nano grams (ng)
      return `${sign}${(absGrams * 1000000000).toFixed(2)} ng`;
    } else {
      // Pico grams (pg) or smaller
      return `${sign}${(absGrams * 1000000000000).toFixed(2)} pg`;
    }
  };

  const formatLargeNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(2)}K`;
    return num.toString();
  };

  if (loading) {
    return <PageLoading message="Loading carbon monitoring dashboard..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Error: {error}</p>
          <button
            onClick={fetchAllData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1920px] mx-auto px-4 xl:px-12 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Leaf className="w-8 h-8 text-green-600" />
                Carbon Management Dashboard
              </h1>
              <p className="mt-2 text-gray-600">
                Enterprise-level carbon monitoring using DIMPACT 2024 methodology
              </p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
                <option value="all">All Time</option>
              </select>
              <button
                onClick={fetchAllData}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 border-b border-gray-200">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'tracking', label: 'Carbon Tracking', icon: Activity },
              { id: 'offsets', label: 'Offset Management', icon: Target },
              { id: 'artists', label: 'Artist Profiles', icon: Users },
              { id: 'analytics', label: 'Analytics', icon: LineChart },
              { id: 'achievements', label: 'Achievements', icon: Award }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors border-b-2 ${
                    activeTab === tab.id
                      ? 'border-green-600 text-green-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4 mb-8">
          <StatCard
            title="Total Carbon Tracked"
            value={stats.totalCarbonTracked === 0 ? '0 kg' : `${formatNumber(stats.totalCarbonTracked, 2)} kg`}
            subtitle={stats.totalStreams === 0 ? '0 streams' : `${formatLargeNumber(stats.totalStreams)} streams`}
            icon={BarChart3}
            color="bg-gray-500"
            trend={null}
          />
          <StatCard
            title="Carbon Offset"
            value={stats.totalCarbonOffset === 0 ? '0 kg' : `${formatNumber(stats.totalCarbonOffset, 2)} kg`}
            subtitle={stats.offsetPercentage === 0 ? '0% offset' : `${formatNumber(stats.offsetPercentage, 1)}% offset`}
            icon={Target}
            color="bg-green-500"
            trend={stats.offsetPercentage > 50 ? 'up' : 'down'}
          />
          <StatCard
            title="Net Impact"
            value={stats.netCarbonImpact === 0 ? '0 kg' : `${formatNumber(stats.netCarbonImpact, 2)} kg`}
            subtitle={stats.netCarbonImpact <= 0 ? 'Carbon Negative' : 'Carbon Positive'}
            icon={stats.netCarbonImpact <= 0 ? CheckCircle : AlertCircle}
            color={stats.netCarbonImpact <= 0 ? 'bg-green-500' : 'bg-yellow-500'}
            trend={stats.netCarbonImpact <= 0 ? 'up' : 'down'}
          />
          <StatCard
            title="Active Artists"
            value={stats.activeArtists}
            subtitle={`${stats.releasesTracked} releases`}
            icon={Users}
            color="bg-blue-500"
            trend={null}
          />
          <StatCard
            title="Carbon Neutral"
            value={stats.carbonNeutralArtists}
            subtitle="Artists achieved"
            icon={Award}
            color="bg-purple-500"
            trend={null}
          />
          <StatCard
            title="Avg per Stream"
            value={stats.totalStreams === 0 || stats.totalCarbonTracked === 0 ? '0 g' : formatGrams((stats.totalCarbonTracked * 1000) / (stats.totalStreams || 1))}
            subtitle="DIMPACT 2024"
            icon={Zap}
            color="bg-indigo-500"
            trend={null}
          />
          <StatCard
            title="Total Streams"
            value={formatLargeNumber(stats.totalStreams)}
            subtitle="All platforms"
            icon={Music}
            color="bg-pink-500"
            trend={null}
          />
          <StatCard
            title="Releases Tracked"
            value={stats.releasesTracked}
            subtitle="Active monitoring"
            icon={FileText}
            color="bg-orange-500"
            trend={null}
          />
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <OverviewTab
            stats={stats}
            historicalData={historicalData}
            platformBreakdown={platformBreakdown}
            regionBreakdown={regionBreakdown}
            recentCarbon={carbonData.slice(0, 10)}
            recentOffsets={offsetTransactions.slice(0, 10)}
            formatGrams={formatGrams}
          />
        )}

        {activeTab === 'tracking' && (
          <TrackingTab
            carbonData={filteredCarbonData}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedArtist={selectedArtist}
            setSelectedArtist={setSelectedArtist}
            selectedRelease={selectedRelease}
            setSelectedRelease={setSelectedRelease}
            sustainabilityProfiles={sustainabilityProfiles}
            carbonData={carbonData}
          />
        )}

        {activeTab === 'offsets' && (
          <OffsetsTab
            offsetTransactions={offsetTransactions}
            stats={stats}
          />
        )}

        {activeTab === 'artists' && (
          <ArtistsTab
            sustainabilityProfiles={sustainabilityProfiles}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsTab
            historicalData={historicalData}
            platformBreakdown={platformBreakdown}
            regionBreakdown={regionBreakdown}
            carbonData={carbonData}
          />
        )}

        {activeTab === 'achievements' && (
          <AchievementsTab achievements={achievements} />
        )}
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ title, value, subtitle, icon: Icon, color, trend }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`${color} p-3 rounded-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
          </div>
        )}
      </div>
      <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
      <p className="text-xl font-bold text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis" title={value}>{value}</p>
      {subtitle && <p className="text-xs text-gray-500 mt-1 whitespace-nowrap overflow-hidden text-ellipsis" title={subtitle}>{subtitle}</p>}
    </div>
  );
}

// Overview Tab
function OverviewTab({ stats, historicalData, platformBreakdown, regionBreakdown, recentCarbon, recentOffsets, formatGrams }) {
  return (
    <div className="space-y-6">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* DIMPACT Methodology Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-green-600" />
            DIMPACT 2024 Methodology
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Energy per Stream</span>
              <span className="font-semibold">0.055 kWh</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Grid Carbon Factor</span>
              <span className="font-semibold">0.233 kg CO2e/kWh</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
              <span className="text-sm text-gray-900 font-medium">Carbon per Stream</span>
              <span className="font-bold text-green-700 whitespace-nowrap">~{formatGrams(0.0128)} CO2e</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Based on University of Bristol DIMPACT research (2024)
            </p>
          </div>
        </div>

        {/* Earth/Percent Integration */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-600" />
            Earth/Percent Integration
          </h3>
          <div className="space-y-3">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-700 mb-2">
                Artists can automatically donate a percentage of earnings to Earth/Percent climate initiatives.
              </p>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Verified offset marketplace</span>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              Partnership with Earth/Percent (founded by Brian Eno) for climate action
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Carbon Tracking</h3>
          <div className="space-y-3">
            {recentCarbon.length === 0 ? (
              <p className="text-gray-500 text-sm">No carbon tracking data available</p>
            ) : (
              recentCarbon.slice(0, 5).map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{item.releases?.title || 'Unknown Release'}</p>
                    <p className="text-xs text-gray-500">{item.releases?.artist_name || item.user_profiles?.artist_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">{formatNumber(item.total_carbon_kg, 2)} kg</p>
                    <p className="text-xs text-gray-500">{formatLargeNumber(item.total_streams_count)} streams</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Offset Transactions</h3>
          <div className="space-y-3">
            {recentOffsets.length === 0 ? (
              <p className="text-gray-500 text-sm">No offset transactions available</p>
            ) : (
              recentOffsets.slice(0, 5).map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{item.offset_provider}</p>
                    <p className="text-xs text-gray-500">{item.offset_project_name || 'Offset Project'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm text-green-600">{formatNumber(item.offset_amount_kg, 2)} kg</p>
                    <p className="text-xs text-gray-500">{item.transaction_status}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Tracking Tab
function TrackingTab({ carbonData, searchTerm, setSearchTerm, selectedArtist, setSelectedArtist, selectedRelease, setSelectedRelease, sustainabilityProfiles, carbonData: allCarbonData }) {
  const uniqueArtists = useMemo(() => {
    const artists = new Map();
    allCarbonData.forEach(item => {
      if (item.user_profiles && !artists.has(item.user_id)) {
        artists.set(item.user_id, {
          id: item.user_id,
          name: item.user_profiles.artist_name || `${item.user_profiles.first_name} ${item.user_profiles.last_name}`.trim() || item.user_profiles.email
        });
      }
    });
    return Array.from(artists.values());
  }, [allCarbonData]);

  const uniqueReleases = useMemo(() => {
    const releases = new Map();
    allCarbonData.forEach(item => {
      if (item.releases && !releases.has(item.release_id)) {
        releases.set(item.release_id, {
          id: item.release_id,
          title: item.releases.title,
          artist: item.releases.artist_name
        });
      }
    });
    return Array.from(releases.values());
  }, [allCarbonData]);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search releases, artists..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Artist</label>
            <select
              value={selectedArtist || ''}
              onChange={(e) => setSelectedArtist(e.target.value || null)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="">All Artists</option>
              {uniqueArtists.map(artist => (
                <option key={artist.id} value={artist.id}>{artist.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Release</label>
            <select
              value={selectedRelease || ''}
              onChange={(e) => setSelectedRelease(e.target.value || null)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="">All Releases</option>
              {uniqueReleases.map(release => (
                <option key={release.id} value={release.id}>{release.title} - {release.artist}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Carbon Tracking Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Release</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Artist</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Streams</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Carbon (kg)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Per Stream (g)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {carbonData.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    No carbon tracking data found
                  </td>
                </tr>
              ) : (
                carbonData.map((item) => {
                  const carbonPerStream = item.total_streams_count > 0 
                    ? (parseFloat(item.total_carbon_kg) * 1000) / parseInt(item.total_streams_count)
                    : 0;
                  return (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{item.releases?.title || 'Unknown'}</div>
                        <div className="text-xs text-gray-500">{new Date(item.releases?.release_date).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{item.releases?.artist_name || item.user_profiles?.artist_name || 'Unknown'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatLargeNumber(item.total_streams_count)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {formatNumber(item.total_carbon_kg, 3)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatNumber(carbonPerStream, 4)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(item.calculation_period_start).toLocaleDateString()} - {new Date(item.calculation_period_end).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          item.offset_status === 'full' || item.offset_status === 'carbon_negative'
                            ? 'bg-green-100 text-green-800'
                            : item.offset_status === 'partial'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {item.offset_status || 'none'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Offsets Tab
function OffsetsTab({ offsetTransactions, stats }) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Offset Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm text-gray-600 mb-1">Total Offset</p>
            <p className="text-2xl font-bold text-green-700">{formatNumber(stats.totalCarbonOffset, 2)} kg</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-gray-600 mb-1">Offset Percentage</p>
            <p className="text-2xl font-bold text-blue-700">{formatNumber(stats.offsetPercentage, 1)}%</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <p className="text-sm text-gray-600 mb-1">Transactions</p>
            <p className="text-2xl font-bold text-purple-700">{offsetTransactions.length}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Provider</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount (kg)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cost</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {offsetTransactions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">No offset transactions found</td>
                </tr>
              ) : (
                offsetTransactions.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{item.offset_provider}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.offset_project_name || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">{formatNumber(item.offset_amount_kg, 2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.offset_cost_currency} {formatNumber(item.offset_cost_amount, 2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        item.transaction_status === 'completed' ? 'bg-green-100 text-green-800' :
                        item.transaction_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {item.transaction_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(item.transaction_date).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Artists Tab
function ArtistsTab({ sustainabilityProfiles, searchTerm, setSearchTerm }) {
  const filtered = useMemo(() => {
    if (!searchTerm) return sustainabilityProfiles;
    const term = searchTerm.toLowerCase();
    return sustainabilityProfiles.filter(p =>
      p.user_profiles?.artist_name?.toLowerCase().includes(term) ||
      p.user_profiles?.email?.toLowerCase().includes(term)
    );
  }, [sustainabilityProfiles, searchTerm]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search artists..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">No sustainability profiles found</div>
        ) : (
          filtered.map((profile) => (
            <div key={profile.id} className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold text-lg mb-4">
                {profile.user_profiles?.artist_name || profile.user_profiles?.email || 'Unknown Artist'}
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Carbon</span>
                  <span className="font-semibold">{formatNumber(profile.total_carbon_kg, 2)} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Offset</span>
                  <span className="font-semibold text-green-600">{formatNumber(profile.total_offset_kg, 2)} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Net Impact</span>
                  <span className={`font-semibold ${parseFloat(profile.net_carbon_kg) <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatNumber(profile.net_carbon_kg, 2)} kg
                  </span>
                </div>
                <div className="pt-3 border-t">
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                    profile.sustainability_commitment === 'carbon_negative' ? 'bg-green-100 text-green-800' :
                    profile.sustainability_commitment === 'carbon_neutral' ? 'bg-blue-100 text-blue-800' :
                    profile.sustainability_commitment === 'offsetting' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {profile.sustainability_commitment || 'monitoring'}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// Analytics Tab
function AnalyticsTab({ historicalData, platformBreakdown, regionBreakdown, carbonData }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Platform Breakdown</h3>
          {Object.keys(platformBreakdown).length === 0 ? (
            <p className="text-gray-500 text-sm">No platform data available</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(platformBreakdown).map(([platform, data]) => (
                <div key={platform} className="p-3 border border-gray-200 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span className="font-medium capitalize">{platform}</span>
                    <span className="text-sm text-gray-600">{formatNumber(data.carbon, 2)} kg</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${(data.carbon / (Object.values(platformBreakdown).reduce((sum, d) => sum + d.carbon, 0) || 1)) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{formatLargeNumber(data.streams)} streams</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Region Breakdown</h3>
          {Object.keys(regionBreakdown).length === 0 ? (
            <p className="text-gray-500 text-sm">No region data available</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(regionBreakdown).map(([region, data]) => (
                <div key={region} className="p-3 border border-gray-200 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span className="font-medium capitalize">{region.replace('_', ' ')}</span>
                    <span className="text-sm text-gray-600">{formatNumber(data.carbon, 2)} kg</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(data.carbon / (Object.values(regionBreakdown).reduce((sum, d) => sum + d.carbon, 0) || 1)) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{formatLargeNumber(data.streams)} streams</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Historical Trends</h3>
        {historicalData.length === 0 ? (
          <p className="text-gray-500 text-sm">No historical data available</p>
        ) : (
          <div className="space-y-4">
            {historicalData.map((item) => (
              <div key={item.month} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{new Date(item.month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                  <span className="text-sm font-semibold">{formatNumber(item.carbon, 2)} kg</span>
                </div>
                <div className="flex gap-4 text-sm text-gray-600">
                  <span>{formatLargeNumber(item.streams)} streams</span>
                  <span>{formatNumber(item.carbonPerStream, 4)} g/stream</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Achievements Tab
function AchievementsTab({ achievements }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Sustainability Achievements</h3>
      {achievements.length === 0 ? (
        <p className="text-gray-500 text-sm">No achievements earned yet</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((achievement) => (
            <div key={achievement.id} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Award className="w-6 h-6 text-yellow-500" />
                <h4 className="font-semibold">{achievement.achievement_title}</h4>
              </div>
              <p className="text-sm text-gray-600 mb-2">{achievement.achievement_description}</p>
              {achievement.milestone_value && (
                <p className="text-xs text-gray-500">
                  {formatNumber(achievement.milestone_value)} {achievement.milestone_unit}
                </p>
              )}
              <p className="text-xs text-gray-400 mt-2">
                {new Date(achievement.earned_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Helper functions
function formatNumber(num, decimals = 2) {
  if (num === null || num === undefined) return '0';
  return parseFloat(num).toFixed(decimals);
}

function formatLargeNumber(num) {
  if (num === null || num === undefined) return '0';
  const n = parseFloat(num);
  if (n >= 1000000) return `${(n / 1000000).toFixed(2)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(2)}K`;
  return n.toString();
}
