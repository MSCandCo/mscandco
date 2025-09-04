import { useUser } from '@/components/providers/SupabaseProvider';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import Layout from '../../components/layouts/mainLayout';
import SubscriptionGate from '../../components/auth/SubscriptionGate';
import { Calendar, DollarSign, TrendingUp, Download, Crown, Lock, CreditCard, PieChart, BarChart3 } from 'lucide-react';
import CurrencySelector, { formatCurrency, useCurrencySync } from '../../components/shared/CurrencySelector';
import CustomDateRangePicker from '../../components/shared/CustomDateRangePicker';

export default function ArtistEarnings() {
  const { user, isLoading } = useUser();
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [activeTab, setActiveTab] = useState('basic');
  const [selectedCurrency, updateCurrency] = useCurrencySync('GBP');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  
  const hasProAccess = subscriptionStatus?.isPro || false;

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
          console.log('📋 Earnings subscription status loaded:', result.data);
        } else {
          // Set default no subscription status
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
        // Set default no subscription status
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

  // Handle date range changes
  const handleDateRangeChange = (start, end) => {
    setStartDate(start);
    setEndDate(end);
    console.log('Artist earnings date range changed:', { start, end });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
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

  const renderBasicEarnings = () => (
    <div className="space-y-8">
      {/* Key Earnings Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Total Earnings</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{formatCurrency(0, selectedCurrency)}</p>
              <p className="text-sm text-gray-500 mt-1">All time</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">This Month</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{formatCurrency(0, selectedCurrency)}</p>
              <p className="text-sm text-gray-500 mt-1">Current period</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Available</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{formatCurrency(0, selectedCurrency)}</p>
              <p className="text-sm text-gray-500 mt-1">Ready for payout</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Growth</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">0%</p>
              <p className="text-sm text-gray-500 mt-1">vs last month</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Earnings Chart */}
      <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Earnings Overview</h3>
        <div className="h-80 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
          <div className="text-center">
            <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Earnings chart will appear here</p>
            <p className="text-gray-400 text-sm mt-2">Release your first track to start earning</p>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Recent Transactions</h3>
        <div className="text-center py-12">
          <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No transactions yet</p>
          <p className="text-gray-400 text-sm mt-2">Your earnings and payouts will appear here</p>
        </div>
      </div>

      {/* Payout Section */}
      <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Request Payout</h3>
          <span className="text-sm text-gray-500">Minimum: {formatCurrency(100, selectedCurrency)}</span>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-6 text-center">
          <p className="text-gray-600 mb-4">You need at least {formatCurrency(100, selectedCurrency)} to request a payout</p>
          <button 
            disabled 
            className="bg-gray-300 text-gray-500 font-medium py-3 px-6 rounded-lg cursor-not-allowed"
          >
            Request Payout
          </button>
        </div>
      </div>
    </div>
  );

  const renderAdvancedEarnings = () => (
    <div className="space-y-12">
      {/* Advanced Earnings Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(0, selectedCurrency)}</p>
            <p className="text-sm text-gray-600">Total Earnings</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(0, selectedCurrency)}</p>
            <p className="text-sm text-gray-600">Streaming Revenue</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <PieChart className="w-6 h-6 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(0, selectedCurrency)}</p>
            <p className="text-sm text-gray-600">Sync Revenue</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">0%</p>
            <p className="text-sm text-gray-600">Growth Rate</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="text-center">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <CreditCard className="w-6 h-6 text-indigo-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(0, selectedCurrency)}</p>
            <p className="text-sm text-gray-600">Pending</p>
          </div>
        </div>
      </div>

      {/* Platform Revenue Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Revenue by Platform</h3>
          <div className="space-y-4">
            {[
              { platform: 'Spotify', revenue: 0, percentage: 0, color: 'bg-green-500' },
              { platform: 'Apple Music', revenue: 0, percentage: 0, color: 'bg-gray-800' },
              { platform: 'YouTube Music', revenue: 0, percentage: 0, color: 'bg-red-500' },
              { platform: 'Amazon Music', revenue: 0, percentage: 0, color: 'bg-blue-500' },
              { platform: 'Deezer', revenue: 0, percentage: 0, color: 'bg-purple-500' },
              { platform: 'Tidal', revenue: 0, percentage: 0, color: 'bg-black' },
              { platform: 'SoundCloud', revenue: 0, percentage: 0, color: 'bg-orange-500' },
              { platform: 'Pandora', revenue: 0, percentage: 0, color: 'bg-blue-600' },
              { platform: 'iHeartRadio', revenue: 0, percentage: 0, color: 'bg-red-600' },
              { platform: 'Shazam', revenue: 0, percentage: 0, color: 'bg-blue-400' },
              { platform: 'TikTok', revenue: 0, percentage: 0, color: 'bg-pink-500' },
              { platform: 'Instagram', revenue: 0, percentage: 0, color: 'bg-gradient-to-r from-purple-500 to-pink-500' },
              { platform: 'Facebook', revenue: 0, percentage: 0, color: 'bg-blue-700' },
              { platform: 'Napster', revenue: 0, percentage: 0, color: 'bg-green-600' },
              { platform: 'Audiomack', revenue: 0, percentage: 0, color: 'bg-yellow-500' },
              { platform: 'Other', revenue: 0, percentage: 0, color: 'bg-gray-400' }
            ].map((platform, index) => (
              <div key={index} className="flex items-center justify-between py-3">
                <div className="flex items-center">
                  <div className={`w-4 h-4 rounded-full ${platform.color} mr-3`}></div>
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

        <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Revenue by Territory</h3>
          <div className="space-y-4">
            {[
              { country: '🇺🇸 United States', revenue: 0, percentage: 0 },
              { country: '🇬🇧 United Kingdom', revenue: 0, percentage: 0 },
              { country: '🇩🇪 Germany', revenue: 0, percentage: 0 },
              { country: '🇫🇷 France', revenue: 0, percentage: 0 },
              { country: '🇨🇦 Canada', revenue: 0, percentage: 0 },
              { country: '🇦🇺 Australia', revenue: 0, percentage: 0 },
              { country: '🇯🇵 Japan', revenue: 0, percentage: 0 },
              { country: '🇧🇷 Brazil', revenue: 0, percentage: 0 },
              { country: '🇮🇹 Italy', revenue: 0, percentage: 0 },
              { country: '🇪🇸 Spain', revenue: 0, percentage: 0 },
              { country: '🇳🇱 Netherlands', revenue: 0, percentage: 0 },
              { country: '🇸🇪 Sweden', revenue: 0, percentage: 0 },
              { country: '🇳🇴 Norway', revenue: 0, percentage: 0 },
              { country: '🇲🇽 Mexico', revenue: 0, percentage: 0 },
              { country: '🇮🇳 India', revenue: 0, percentage: 0 },
              { country: '🌍 Other', revenue: 0, percentage: 0 }
            ].map((territory, index) => (
              <div key={index} className="flex items-center justify-between py-3">
                <span className="font-medium text-gray-900">{territory.country}</span>
                <div className="text-right">
                  <p className="font-medium text-gray-900">{formatCurrency(territory.revenue, selectedCurrency)}</p>
                  <p className="text-xs text-gray-500">{territory.percentage}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Advanced Transaction History */}
      <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Detailed Transaction History</h3>
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
                  <p>No transactions yet</p>
                  <p className="text-sm mt-2">Detailed transaction data will appear here once you start earning</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Advanced Payout Management */}
      <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Advanced Payout Management</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h4 className="font-medium text-gray-900 mb-4">Automatic Payouts</h4>
            <div className="space-y-3">
              <label className="flex items-center">
                <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span className="ml-3 text-sm text-gray-700">Enable automatic payouts</span>
              </label>
              <div className="ml-6">
                <label className="block text-sm text-gray-600 mb-1">Minimum threshold</label>
                <select className="border border-gray-300 rounded-md px-3 py-2 text-sm">
                  <option>{formatCurrency(100, selectedCurrency)}</option>
                  <option>{formatCurrency(250, selectedCurrency)}</option>
                  <option>{formatCurrency(500, selectedCurrency)}</option>
                </select>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-4">Payment Schedule</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Next payout date:</span>
                <span className="text-sm font-medium text-gray-900">Not scheduled</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Payout frequency:</span>
                <span className="text-sm font-medium text-gray-900">Monthly</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Processing time:</span>
                <span className="text-sm font-medium text-gray-900">3-5 business days</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <SubscriptionGate 
      requiredFor="earnings and revenue tracking"
      showFeaturePreview={true}
      userRole="artist"
    >
      <Layout>
        <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          
          {/* Header with Tabs */}
          <div className="mb-12">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Earnings</h1>
                <p className="mt-2 text-lg text-gray-600">Track your revenue and manage payouts</p>
              </div>
              
              {/* Currency and Date Range Selector */}
              <div className="flex items-center space-x-4">
                <CurrencySelector 
                  selectedCurrency={selectedCurrency}
                  onCurrencyChange={updateCurrency}
                />
                <div className="w-64">
                  <CustomDateRangePicker
                    startDate={startDate}
                    endDate={endDate}
                    onDateRangeChange={handleDateRangeChange}
                    placeholder="Select date range for earnings"
                  />
                </div>
              </div>
            </div>

            {/* Earnings Tabs */}
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('basic')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'basic'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Basic Earnings
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Included
                  </span>
                </button>
                
                <button
                  onClick={() => hasProAccess ? setActiveTab('advanced') : null}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center ${
                    activeTab === 'advanced' && hasProAccess
                      ? 'border-purple-500 text-purple-600'
                      : hasProAccess
                      ? 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      : 'border-transparent text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Advanced Earnings
                  {hasProAccess ? (
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      <Crown className="w-3 h-3 mr-1" />
                      Pro
                    </span>
                  ) : (
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                      <Lock className="w-3 h-3 mr-1" />
                      Pro Only
                    </span>
                  )}
                </button>
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'basic' && renderBasicEarnings()}
          
          {activeTab === 'advanced' && hasProAccess && renderAdvancedEarnings()}
          
          {activeTab === 'advanced' && !hasProAccess && (
            <div className="bg-white rounded-xl shadow-sm p-16 border border-gray-100 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Crown className="w-10 h-10 text-purple-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Unlock Advanced Earnings</h2>
                <p className="text-gray-600 mb-8">
                  Get detailed platform breakdowns, territory analysis, advanced payout management, 
                  and comprehensive revenue insights.
                </p>
                
                {/* Pro Features List */}
                <div className="text-left mb-8 space-y-3">
                  <div className="flex items-center text-gray-700">
                    <PieChart className="w-5 h-5 text-purple-600 mr-3" />
                    <span>Platform-specific revenue breakdown</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <BarChart3 className="w-5 h-5 text-purple-600 mr-3" />
                    <span>Territory and demographic earnings</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <Download className="w-5 h-5 text-purple-600 mr-3" />
                    <span>Advanced export and reporting</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <CreditCard className="w-5 h-5 text-purple-600 mr-3" />
                    <span>Automatic payout management</span>
                  </div>
                </div>

                <Link href="/billing">
                  <button className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 px-8 rounded-lg transition-colors">
                    Upgrade to Pro Plan
                  </button>
                </Link>
              </div>
            </div>
          )}

          {/* Call to Action */}
          <div className="mt-16 bg-white rounded-xl shadow-sm p-12 border border-gray-100 text-center">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Start Earning From Your Music</h2>
              <p className="text-lg text-gray-600 mb-8">
                Release your music to start generating revenue from streams, downloads, and licensing across all major platforms.
              </p>
              <a 
                href="/artist/releases" 
                className="inline-flex items-center bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-8 rounded-lg transition-colors"
              >
                <DollarSign className="w-5 h-5 mr-2" />
                Create Your First Release
              </a>
            </div>
          </div>
        </div>
      </div>
    </Layout>
    </SubscriptionGate>
  );
}