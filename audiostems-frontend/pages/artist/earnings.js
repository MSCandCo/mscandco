// New Artist Earnings Page - Manual System with Basic/Advanced Tabs
import { useUser } from '@/components/providers/SupabaseProvider';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import Layout from '../../components/layouts/mainLayout';
import SubscriptionGate from '../../components/auth/SubscriptionGate';
import { 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Download, 
  Crown, 
  Lock, 
  CreditCard, 
  PieChart, 
  BarChart3,
  Globe,
  Music,
  Play,
  Pause,
  Users,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import CurrencySelector, { formatCurrency, useCurrencySync } from '../../components/shared/CurrencySelector';
import { Line, Bar, Doughnut, Pie } from 'react-chartjs-2';
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

export default function ArtistEarnings() {
  const { user, isLoading } = useUser();
  const [activeTab, setActiveTab] = useState('basic');
  const [selectedCurrency, updateCurrency] = useCurrencySync('GBP');
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  const [earningsData, setEarningsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('all'); // all, 7d, 30d, 90d, 1y, custom
  const [filteredEarningsData, setFilteredEarningsData] = useState(null);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  
  const hasProAccess = subscriptionStatus?.isPro || false;

  // Filter earnings data based on selected time period
  const filterEarningsByDate = (data, filter) => {
    if (!data || !data.history || filter === 'all') {
      return data;
    }

    const now = new Date();
    let cutoffDate;

    switch (filter) {
      case '7d':
        cutoffDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case '30d':
        cutoffDate = new Date(now.setDate(now.getDate() - 30));
        break;
      case '90d':
        cutoffDate = new Date(now.setDate(now.getDate() - 90));
        break;
      case '1y':
        cutoffDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      case 'custom':
        if (!customStartDate || !customEndDate) return data;
        const startDate = new Date(customStartDate);
        const endDate = new Date(customEndDate);
        endDate.setHours(23, 59, 59, 999); // Include full end date
        
        const customFilteredHistory = data.history.filter(entry => {
          const entryDate = new Date(entry.timestamp);
          return entryDate >= startDate && entryDate <= endDate;
        });

        return {
          ...data,
          filteredPeriod: 'custom',
          customRange: { startDate: customStartDate, endDate: customEndDate },
          history: customFilteredHistory,
          basicMetrics: aggregateBasicMetrics(customFilteredHistory),
          advancedMetrics: aggregateAdvancedMetrics(customFilteredHistory),
          platformRevenue: aggregatePlatformRevenue(customFilteredHistory),
          territoryRevenue: aggregateTerritoryRevenue(customFilteredHistory)
        };
      default:
        return data;
    }

    // Filter history entries by timestamp
    const filteredHistory = data.history.filter(entry => 
      new Date(entry.timestamp) >= cutoffDate
    );

    // Calculate aggregated data from filtered history
    const aggregatedData = {
      ...data,
      filteredPeriod: filter,
      history: filteredHistory,
      // Aggregate metrics from filtered entries
      basicMetrics: aggregateBasicMetrics(filteredHistory),
      advancedMetrics: aggregateAdvancedMetrics(filteredHistory),
      platformRevenue: aggregatePlatformRevenue(filteredHistory),
      territoryRevenue: aggregateTerritoryRevenue(filteredHistory)
    };

    return aggregatedData;
  };

  // Helper functions for aggregation
  const aggregateBasicMetrics = (history) => {
    // Aggregate basic metrics from history entries
    const latest = history[history.length - 1];
    return latest?.data?.basicMetrics || [];
  };

  const aggregateAdvancedMetrics = (history) => {
    const latest = history[history.length - 1];
    return latest?.data?.advancedMetrics || {};
  };

  const aggregatePlatformRevenue = (history) => {
    const latest = history[history.length - 1];
    return latest?.data?.platformRevenue || [];
  };

  const aggregateTerritoryRevenue = (history) => {
    const latest = history[history.length - 1];
    return latest?.data?.territoryRevenue || [];
  };

  // Apply custom date range
  const applyCustomDateRange = () => {
    if (customStartDate && customEndDate) {
      setDateFilter('custom');
    }
  };

  // Fetch subscription status
  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      if (!user) return;
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        
        if (!token) {
          setSubscriptionLoading(false);
          return;
        }

        const response = await fetch('/api/user/subscription-status', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const result = await response.json();
        
        if (result.success) {
          setSubscriptionStatus(result.data);
          // Auto-set tab to advanced for Pro users (hide basic tab)
          if (result.data?.isPro) {
            setActiveTab('advanced');
          }
        } else {
          setSubscriptionStatus({
            status: 'none',
            planName: 'No Subscription',
            hasSubscription: false,
            isPro: false,
            isStarter: false
          });
        }
      } catch (error) {
        console.error('Failed to fetch subscription status:', error);
        setSubscriptionStatus({
          status: 'none',
          planName: 'No Subscription',
          hasSubscription: false,
          isPro: false,
          isStarter: false
        });
      } finally {
        setSubscriptionLoading(false);
      }
    };

    fetchSubscriptionStatus();
  }, [user]);

  // Load earnings data from manual system
  useEffect(() => {
    const loadEarningsData = async () => {
      if (!user) return;

      try {
        const response = await fetch('/api/artist/earnings-data');
        const result = await response.json();

        if (result.success) {
          console.log('📊 Loaded manual earnings data:', result.data);
          setEarningsData(result.data);
        } else {
          console.error('Error loading earnings data:', result.error);
        }
      } catch (error) {
        console.error('Error loading earnings data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadEarningsData();
  }, [user]);

  // Filter earnings data when filter changes
  useEffect(() => {
    if (earningsData) {
      const filtered = filterEarningsByDate(earningsData, dateFilter);
      setFilteredEarningsData(filtered);
    }
  }, [earningsData, dateFilter, customStartDate, customEndDate]);

  if (isLoading || subscriptionLoading || loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading earnings...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-gray-600">Please log in to view your earnings.</p>
        </div>
      </Layout>
    );
  }

  // Chart configurations
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: { size: 12, weight: '500' }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#FFFFFF',
        bodyColor: '#FFFFFF',
        borderColor: '#10B981',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        callbacks: {
          label: function(context) {
            return `${context.label}: ${formatCurrency(context.parsed || context.raw, selectedCurrency)}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0, 0, 0, 0.1)' },
        ticks: {
          callback: function(value) {
            return formatCurrency(value, selectedCurrency);
          }
        }
      }
    }
  };

  // Platform Revenue Chart Data
  const platformChartData = {
    labels: earningsData?.platformRevenue?.map(p => p.platform) || ['No Data'],
    datasets: [{
      label: 'Platform Revenue',
      data: earningsData?.platformRevenue?.map(p => p.revenue) || [0],
      backgroundColor: earningsData?.platformRevenue?.map(p => {
        const colorMap = {
          'bg-blue-500': '#10B981',
          'bg-blue-500': '#3B82F6',
          'bg-red-500': '#EF4444',
          'bg-purple-500': '#8B5CF6',
          'bg-orange-500': '#F97316',
          'bg-pink-500': '#EC4899',
          'bg-yellow-500': '#EAB308',
          'bg-gray-500': '#6B7280'
        };
        return colorMap[p.color] || '#10B981';
      }) || ['#10B981'],
      borderWidth: 2,
      borderColor: '#FFFFFF'
    }]
  };

  // Territory Revenue Chart Data  
  const territoryChartData = {
    labels: earningsData?.territoryRevenue?.map(t => t.country.replace(/[\u{1F1E6}-\u{1F1FF}]/gu, '').trim()) || ['No Data'],
    datasets: [{
      label: 'Territory Revenue',
      data: earningsData?.territoryRevenue?.map(t => t.revenue) || [0],
      backgroundColor: [
        '#10B981', '#3B82F6', '#EF4444', '#8B5CF6', '#F97316',
        '#EC4899', '#EAB308', '#6B7280', '#14B8A6', '#F59E0B'
      ],
      borderWidth: 2,
      borderColor: '#FFFFFF'
    }]
  };

  const renderBasicEarnings = () => {
    // Handle both array (new) and object (old) formats
    let basicMetricsArray = [];
    
    if (earningsData?.basicMetrics) {
      if (Array.isArray(earningsData.basicMetrics)) {
        basicMetricsArray = earningsData.basicMetrics;
      } else {
        // Convert object format to array for backwards compatibility
        basicMetricsArray = Object.entries(earningsData.basicMetrics).map(([key, metric], index) => ({
          id: index + 1,
          label: metric.label,
          value: metric.value,
          change: metric.change,
          isPercentage: metric.isPercentage || false
        }));
      }
    } else {
      // Default metrics if no data
      basicMetricsArray = [
        { id: 1, label: 'Total Earnings', value: 0, change: '0%' },
        { id: 2, label: 'This Month', value: 0, change: '0%' },
        { id: 3, label: 'Available', value: 0, change: '0%' },
        { id: 4, label: 'Growth', value: 0, change: '0%', isPercentage: true }
      ];
    }

    return (
      <div className="space-y-8">
        {/* Basic Earnings Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {basicMetricsArray.map((metric, index) => {
            const isPositive = metric.change?.startsWith?.('+') || parseFloat(metric.change) > 0;
            const isNegative = metric.change?.startsWith?.('-') || parseFloat(metric.change) < 0;
            
            // Assign colors based on index for visual variety
            const colorClasses = [
              'bg-green-100', 'bg-blue-100', 'bg-purple-100', 'bg-orange-100', 
              'bg-pink-100', 'bg-indigo-100', 'bg-teal-100', 'bg-yellow-100'
            ];
            const iconColorClasses = [
              'text-blue-600', 'text-blue-600', 'text-purple-600', 'text-orange-600',
              'text-pink-600', 'text-indigo-600', 'text-teal-600', 'text-yellow-600'
            ];
            
            return (
              <div key={metric.id} className="rounded-2xl shadow-lg border border-slate-200" style={{background: 'linear-gradient(145deg, #ffffff 0%, #f9fafb 100%)', border: '1px solid rgba(31, 41, 55, 0.08)'}} className=" p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[index % colorClasses.length]}`}>
                    <DollarSign className={`w-6 h-6 ${iconColorClasses[index % iconColorClasses.length]}`} />
                  </div>
                  {metric.change && (
                    <div className={`flex items-center text-sm font-medium ${
                      isPositive ? 'text-blue-600' : isNegative ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {isPositive && <ArrowUp className="w-4 h-4 mr-1" />}
                      {isNegative && <ArrowDown className="w-4 h-4 mr-1" />}
                      {metric.change}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 uppercase tracking-wide mb-2">
                    {metric.label}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {metric.isPercentage ? 
                      `${metric.value}%` : 
                      formatCurrency(metric.value, selectedCurrency)
                    }
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent Transactions */}
        <div className="rounded-2xl shadow-lg border border-slate-200" style={{background: 'linear-gradient(145deg, #ffffff 0%, #f9fafb 100%)', border: '1px solid rgba(31, 41, 55, 0.08)'}} className=" p-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Transactions</h3>
          <div className="text-center py-12">
            <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No transactions yet</p>
            <p className="text-gray-400 text-sm mt-2">Your earnings and payouts will appear here</p>
          </div>
        </div>

        {/* Payout Section */}
        <div className="rounded-2xl shadow-lg border border-slate-200" style={{background: 'linear-gradient(145deg, #ffffff 0%, #f9fafb 100%)', border: '1px solid rgba(31, 41, 55, 0.08)'}} className=" p-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Request Payout</h3>
            <span className="text-sm text-gray-500">Minimum: {formatCurrency(100, selectedCurrency)}</span>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-6 text-center">
            <p className="text-gray-600 mb-4">
              You need at least {formatCurrency(100, selectedCurrency)} to request a payout
            </p>
            <button 
              disabled={!basicMetricsArray.find(m => m.label.toLowerCase().includes('available'))?.value || 
                       basicMetricsArray.find(m => m.label.toLowerCase().includes('available'))?.value < 100}
              className={`font-medium py-3 px-6 rounded-lg transition-colors ${
                basicMetricsArray.find(m => m.label.toLowerCase().includes('available'))?.value >= 100
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {basicMetricsArray.find(m => m.label.toLowerCase().includes('available'))?.value >= 100 
                ? 'Request Payout' : 'Insufficient Balance'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderAdvancedEarnings = () => {
    const displayData = filteredEarningsData || earningsData;
    const advancedMetrics = displayData?.advancedMetrics || {
      totalEarnings: { value: 0, label: 'Total Earnings' },
      streamingRevenue: { value: 0, label: 'Streaming Revenue' },
      syncRevenue: { value: 0, label: 'Sync Revenue' },
      growthRate: { value: 0, label: 'Growth Rate' },
      pending: { value: 0, label: 'Pending' }
    };

    return (
      <div className="space-y-8">

        {/* Advanced Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {Object.entries(advancedMetrics).map(([key, metric]) => (
            <div key={key} className="rounded-2xl shadow-lg border border-slate-200" style={{background: 'linear-gradient(145deg, #ffffff 0%, #f9fafb 100%)', border: '1px solid rgba(31, 41, 55, 0.08)'}} className=" p-6 text-center hover:shadow-xl transition-shadow">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3 ${
                key === 'totalEarnings' ? 'bg-green-100' :
                key === 'streamingRevenue' ? 'bg-blue-100' :
                key === 'syncRevenue' ? 'bg-purple-100' :
                key === 'growthRate' ? 'bg-orange-100' : 'bg-indigo-100'
              }`}>
                {key === 'totalEarnings' ? <DollarSign className="w-6 h-6 text-blue-600" /> :
                 key === 'streamingRevenue' ? <BarChart3 className="w-6 h-6 text-blue-600" /> :
                 key === 'syncRevenue' ? <PieChart className="w-6 h-6 text-purple-600" /> :
                 key === 'growthRate' ? <TrendingUp className="w-6 h-6 text-orange-600" /> :
                 <CreditCard className="w-6 h-6 text-indigo-600" />}
              </div>
              <p className="text-xl font-bold text-gray-900 mb-1">
                {key === 'growthRate' && metric.isPercentage ? 
                  `${metric.value}%` : 
                  formatCurrency(metric.value, selectedCurrency)
                }
              </p>
              <p className="text-sm text-gray-600">{metric.label}</p>
            </div>
          ))}
        </div>

        {/* Earnings Overview Chart */}
        <div className="rounded-2xl shadow-lg border border-slate-200" style={{background: 'linear-gradient(145deg, #ffffff 0%, #f9fafb 100%)', border: '1px solid rgba(31, 41, 55, 0.08)'}} className=" p-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Earnings Overview</h3>
          <div className="h-80">
            {displayData?.monthlyBreakdown?.length > 0 ? (
              <Line 
                data={{
                  labels: displayData.monthlyBreakdown.map(month => month.month || 'Month'),
                  datasets: [{
                    label: 'Monthly Earnings',
                    data: displayData.monthlyBreakdown.map(month => parseFloat(month.earnings) || 0),
                    borderColor: '#10B981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#10B981',
                    pointBorderColor: '#FFFFFF',
                    pointBorderWidth: 2,
                    pointRadius: 6
                  }]
                }} 
                options={chartOptions} 
              />
            ) : (
              <div className="h-full flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
                <div className="text-center">
                  <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No earnings data yet</p>
                  <p className="text-gray-400 text-sm mt-2">Your earnings chart will appear as you start earning</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Platform & Territory Revenue */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Platform Revenue */}
          <div className="rounded-2xl shadow-lg border border-slate-200" style={{background: 'linear-gradient(145deg, #ffffff 0%, #f9fafb 100%)', border: '1px solid rgba(31, 41, 55, 0.08)'}} className=" p-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Revenue by Platform</h3>
            {displayData?.platformRevenue?.length > 0 ? (
              <div className="space-y-6">
                <div className="h-64">
                  <Doughnut data={platformChartData} options={{
                    ...chartOptions,
                    scales: undefined,
                    plugins: {
                      ...chartOptions.plugins,
                      legend: { position: 'right' }
                    }
                  }} />
                </div>
                <div className="space-y-3">
                  {displayData.platformRevenue.map((platform, index) => (
                    <div key={platform.id} className="flex items-center justify-between py-2">
                      <div className="flex items-center">
                        <div className={`w-4 h-4 rounded-full mr-3 ${platform.color}`}></div>
                        <span className="font-medium text-gray-900">{platform.platform}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">{formatCurrency(platform.revenue, selectedCurrency)}</p>
                        <p className="text-xs text-gray-500">{platform.percentage}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
                <div className="text-center">
                  <PieChart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No platform data available</p>
                </div>
              </div>
            )}
          </div>

          {/* Territory Revenue */}
          <div className="rounded-2xl shadow-lg border border-slate-200" style={{background: 'linear-gradient(145deg, #ffffff 0%, #f9fafb 100%)', border: '1px solid rgba(31, 41, 55, 0.08)'}} className=" p-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Revenue by Territory</h3>
            {displayData?.territoryRevenue?.length > 0 ? (
              <div className="space-y-6">
                <div className="h-64">
                  <Bar data={{
                    labels: displayData.territoryRevenue.map(t => t.country.replace(/[\u{1F1E6}-\u{1F1FF}]/gu, '').trim().slice(0, 10)),
                    datasets: [{
                      label: 'Territory Revenue',
                      data: displayData.territoryRevenue.map(t => t.revenue),
                      backgroundColor: '#10B981',
                      borderColor: '#059669',
                      borderWidth: 1,
                      borderRadius: 4
                    }]
                  }} options={{
                    ...chartOptions,
                    plugins: {
                      ...chartOptions.plugins,
                      legend: { display: false }
                    }
                  }} />
                </div>
                <div className="space-y-3 max-h-32 overflow-y-auto">
                  {displayData.territoryRevenue.map((territory, index) => (
                    <div key={territory.id} className="flex items-center justify-between py-2">
                      <span className="font-medium text-gray-900 text-sm">{territory.country}</span>
                      <div className="text-right">
                        <p className="font-medium text-gray-900 text-sm">{formatCurrency(territory.revenue, selectedCurrency)}</p>
                        <p className="text-xs text-gray-500">{territory.percentage}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
                <div className="text-center">
                  <Globe className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No territory data available</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Detailed Transaction History */}
        <div className="rounded-2xl shadow-lg border border-slate-200" style={{background: 'linear-gradient(145deg, #ffffff 0%, #f9fafb 100%)', border: '1px solid rgba(31, 41, 55, 0.08)'}} className=" p-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Detailed Transaction History</h3>
            <button className="flex items-center text-blue-600 hover:text-blue-700 font-medium">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Platform</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Track</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Territory</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">Streams</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">Revenue</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan="6" className="text-center py-12 text-gray-500">
                    <CreditCard className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg">No transaction history available</p>
                    <p className="text-sm mt-2">Detailed earnings data will appear here once configured</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  return (
    <SubscriptionGate 
      requiredFor="earnings tracking and analytics"
      showFeaturePreview={true}
      userRole="artist"
    >
      <Layout>
        <div className="min-h-screen" style={{background: 'linear-gradient(180deg, #f9fafb 0%, #ffffff 100%)'}}>
          {/* Header */}
          <div className="text-white" style={{background: 'linear-gradient(135deg, #0f172a 0%, #1f2937 50%, #374151 100%)'}}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="mb-6 md:mb-0">
                  <h1 className="text-4xl font-bold mb-4">
                    Your Earnings
                  </h1>
                  <p className="text-xl text-white max-w-3xl" style={{color: '#ffffff'}}>
                    Track your revenue, monitor performance, and manage payouts across all platforms
                  </p>
                </div>
                <div className="flex items-center space-x-4">
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
            
            {/* Advanced Date Range Selector */}
            <div className="rounded-2xl shadow-lg border border-slate-200" style={{background: 'linear-gradient(145deg, #ffffff 0%, #f9fafb 100%)', border: '1px solid rgba(31, 41, 55, 0.08)'}} className=" p-6 mb-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                
                {/* Left Side - Title & Description */}
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)'}}>
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">Earnings Period</h3>
                    <p className="text-sm text-slate-600">
                      Filter your earnings by time period to analyze performance trends
                    </p>
                  </div>
                </div>

                {/* Right Side - Date Controls */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                  
                  {/* Quick Period Buttons */}
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: 'all', label: 'All Time' },
                      { value: '7d', label: '7 Days' },
                      { value: '30d', label: '30 Days' },
                      { value: '90d', label: '3 Months' },
                      { value: '1y', label: '1 Year' }
                    ].map((period) => (
                      <button
                        key={period.value}
                        onClick={() => setDateFilter(period.value)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          dateFilter === period.value
                            ? 'text-white shadow-md'
                            : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                        style={dateFilter === period.value ? {background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)'} : {}}
                      >
                        {period.label}
                      </button>
                    ))}
                  </div>

                  {/* Custom Date Range */}
                  <div className="flex items-center space-x-2 pl-4 border-l border-slate-200">
                    <span className="text-sm text-slate-600 font-medium">Custom:</span>
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Start"
                    />
                    <span className="text-slate-400">to</span>
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="End"
                    />
                    <button
                      onClick={() => applyCustomDateRange()}
                      disabled={!customStartDate || !customEndDate}
                      className="px-4 py-2 text-white rounded-lg text-sm font-medium disabled:bg-slate-300 disabled:cursor-not-allowed transition-all"
                      style={!customStartDate || !customEndDate ? {} : {background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)'}}
                      onMouseEnter={(e) => {
                        if (customStartDate && customEndDate) {
                          e.target.style.background = 'linear-gradient(135deg, #374151 0%, #4b5563 100%)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (customStartDate && customEndDate) {
                          e.target.style.background = 'linear-gradient(135deg, #1f2937 0%, #374151 100%)';
                        }
                      }}
                    >
                      Apply
                    </button>
                  </div>
                  
                </div>
              </div>
              
              {/* Period Info Display */}
              {(filteredEarningsData || earningsData) && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <div className="flex flex-wrap items-center justify-between text-sm">
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full" style={{backgroundColor: '#1f2937'}}></div>
                        <span className="text-slate-600">Showing:</span>
                        <span className="font-medium text-slate-900">
                          {dateFilter === 'all' ? 'All Time Earnings' :
                           dateFilter === '7d' ? 'Last 7 Days' :
                           dateFilter === '30d' ? 'Last 30 Days' : 
                           dateFilter === '90d' ? 'Last 3 Months' :
                           dateFilter === '1y' ? 'Last Year' :
                           dateFilter === 'custom' ? `${customStartDate} to ${customEndDate}` : 'All Time'}
                        </span>
                      </div>
                      {(filteredEarningsData?.history?.length || earningsData?.history?.length) > 0 && (
                        <div className="flex items-center space-x-2">
                          <TrendingUp className="w-4 h-4 text-blue-500" />
                          <span className="text-slate-600">
                            {filteredEarningsData?.history?.length || earningsData?.history?.length} earnings 
                            {(filteredEarningsData?.history?.length || earningsData?.history?.length) === 1 ? ' update' : ' updates'}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="text-slate-500">
                      Last updated: {new Date((filteredEarningsData || earningsData)?.lastUpdated || Date.now()).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Tab Navigation */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex space-x-1 bg-white p-1 rounded-xl shadow-sm border border-slate-200">
                {/* Hide Basic tab for Pro users - they only see Advanced */}
                {!hasProAccess && (
                  <button
                    onClick={() => setActiveTab('basic')}
                    className={`px-6 py-3 rounded-lg text-sm font-medium transition-all ${
                      activeTab === 'basic'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <span className="flex items-center">
                      <DollarSign className="w-4 h-4 mr-2" />
                      Basic Earnings
                      <span className="ml-2 text-xs opacity-75">Included</span>
                    </span>
                  </button>
                )}
                <button
                  onClick={() => setActiveTab('advanced')}
                  className={`px-6 py-3 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'advanced'
                      ? 'bg-blue-600 text-white shadow-md'
                      : hasProAccess 
                        ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        : 'text-slate-400 cursor-not-allowed'
                  }`}
                  disabled={!hasProAccess}
                >
                  <span className="flex items-center">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Advanced Earnings
                    {hasProAccess ? (
                      <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-1 rounded-full opacity-90 flex items-center">
                        <Crown className="w-3 h-3 mr-1" />
                        Pro
                      </span>
                    ) : (
                      <Lock className="w-3 h-3 ml-2" />
                    )}
                  </span>
                </button>
              </div>

              {earningsData?.lastUpdated && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-slate-600">Last updated:</span>
                  <span className="text-sm font-medium text-slate-900">
                    {new Date(earningsData.lastUpdated).toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            {/* Tab Content */}
            {activeTab === 'basic' && renderBasicEarnings()}
            {activeTab === 'advanced' && hasProAccess && renderAdvancedEarnings()}
            
            {/* Pro Upgrade Prompt */}
            {activeTab === 'advanced' && !hasProAccess && (
              <div className="rounded-2xl shadow-lg border border-slate-200" style={{background: 'linear-gradient(145deg, #ffffff 0%, #f9fafb 100%)', border: '1px solid rgba(31, 41, 55, 0.08)'}} className=" p-12 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Crown className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Unlock Advanced Earnings</h2>
                <p className="text-slate-600 mb-8 max-w-2xl mx-auto">
                  Get detailed platform breakdowns, territory analysis, comprehensive charts, 
                  transaction history, and advanced financial insights with Pro.
                </p>
                <div className="flex items-center justify-center space-x-4 mb-8">
                  <div className="flex items-center text-blue-600">
                    <BarChart3 className="w-5 h-5 mr-2" />
                    <span className="text-sm font-medium">Platform Analytics</span>
                  </div>
                  <div className="flex items-center text-blue-600">
                    <Globe className="w-5 h-5 mr-2" />
                    <span className="text-sm font-medium">Territory Breakdown</span>
                  </div>
                  <div className="flex items-center text-blue-600">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    <span className="text-sm font-medium">Growth Charts</span>
                  </div>
                </div>
                <Link href="/artist/subscription">
                  <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-4 px-8 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all transform hover:scale-105">
                    Upgrade to Pro
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </Layout>
    </SubscriptionGate>
  );
}
