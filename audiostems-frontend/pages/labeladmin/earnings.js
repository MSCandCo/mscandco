import { useUser } from '@/components/providers/SupabaseProvider';
import { useState } from 'react';
import Layout from '../../components/layouts/mainLayout';
import { Calendar, DollarSign, TrendingUp, Download, Crown, Lock, CreditCard, PieChart, BarChart3, Users, Percent } from 'lucide-react';
import CurrencySelector, { formatCurrency, useCurrencySync } from '../../components/shared/CurrencySelector';
import CustomDateRangePicker from '../../components/shared/CustomDateRangePicker';

export default function LabelAdminEarnings() {
  const { user, isLoading } = useUser();
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [activeTab, setActiveTab] = useState('basic');
  const [selectedCurrency, updateCurrency] = useCurrencySync('GBP');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Mock user plan - in real app, this would come from label subscription data
  const [labelPlan] = useState('starter'); // 'starter' or 'pro'
  const hasProAccess = labelPlan === 'pro';

  // Handle date range changes
  const handleDateRangeChange = (start, end) => {
    setStartDate(start);
    setEndDate(end);
    // Here you would typically refetch earnings data with the new date range
    console.log('Earnings date range changed:', { start, end });
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
          <p className="text-gray-600">Please log in to view earnings.</p>
        </div>
      </Layout>
    );
  }

  const renderBasicEarnings = () => (
    <div className="space-y-8">
      {/* Label Earnings Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Total Label Revenue</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{formatCurrency(0, selectedCurrency)}</p>
              <p className="text-sm text-gray-500 mt-1">All artists</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Label Share</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{formatCurrency(0, selectedCurrency)}</p>
              <p className="text-sm text-gray-500 mt-1">Your earnings</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Percent className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Artist Payouts</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{formatCurrency(0, selectedCurrency)}</p>
              <p className="text-sm text-gray-500 mt-1">Paid to artists</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
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

      {/* Label Revenue Chart */}
      <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Label Revenue Overview</h3>
        <div className="h-80 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
          <div className="text-center">
            <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Revenue chart will appear here</p>
            <p className="text-gray-400 text-sm mt-2">Sign artists and release music to start earning</p>
          </div>
        </div>
      </div>

      {/* Artist Revenue Summary */}
      <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Artist Revenue Summary</h3>
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No artist revenue yet</p>
          <p className="text-gray-400 text-sm mt-2">Artist earnings breakdown will appear here</p>
        </div>
      </div>
    </div>
  );

  const renderAdvancedEarnings = () => (
    <div className="space-y-12">
      {/* Advanced Label Earnings Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(0, selectedCurrency)}</p>
            <p className="text-sm text-gray-600">Total Revenue</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Percent className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(0, selectedCurrency)}</p>
            <p className="text-sm text-gray-600">Label Share</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(0, selectedCurrency)}</p>
            <p className="text-sm text-gray-600">Artist Payouts</p>
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

      {/* Advanced Revenue Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Revenue by Artist</h3>
          <div className="space-y-4">
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No artists signed yet</p>
              <p className="text-sm text-gray-400 mt-2">Artist revenue breakdown will appear here</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Revenue by Platform</h3>
          <div className="space-y-4">
            {[
              { platform: 'Spotify', revenue: 0, percentage: 0, color: 'bg-green-500' },
              { platform: 'Apple Music', revenue: 0, percentage: 0, color: 'bg-gray-800' },
              { platform: 'YouTube Music', revenue: 0, percentage: 0, color: 'bg-red-500' },
              { platform: 'Amazon Music', revenue: 0, percentage: 0, color: 'bg-blue-500' },
              { platform: 'Deezer', revenue: 0, percentage: 0, color: 'bg-purple-500' }
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
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Label Split Configuration</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="font-medium text-gray-900">Default Label Share</span>
              <span className="text-lg font-bold text-blue-600">20%</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="font-medium text-gray-900">Default Artist Share</span>
              <span className="text-lg font-bold text-green-600">80%</span>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              Configure individual artist splits in their contracts
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Payout Schedule</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3">
              <span className="text-sm text-gray-600">Next artist payouts:</span>
              <span className="text-sm font-medium text-gray-900">Not scheduled</span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-sm text-gray-600">Label payout frequency:</span>
              <span className="text-sm font-medium text-gray-900">Monthly</span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-sm text-gray-600">Processing time:</span>
              <span className="text-sm font-medium text-gray-900">3-5 business days</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          
          {/* Header with Tabs */}
          <div className="mb-12">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Label Earnings</h1>
                <p className="mt-2 text-lg text-gray-600">Track label revenue and manage artist payouts</p>
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
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Unlock Advanced Label Earnings</h2>
                <p className="text-gray-600 mb-8">
                  Get detailed artist revenue breakdowns, advanced payout management, 
                  territory analysis, and comprehensive label financial insights.
                </p>
                
                {/* Pro Features List */}
                <div className="text-left mb-8 space-y-3">
                  <div className="flex items-center text-gray-700">
                    <Users className="w-5 h-5 text-purple-600 mr-3" />
                    <span>Artist-specific revenue breakdown</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <PieChart className="w-5 h-5 text-purple-600 mr-3" />
                    <span>Platform and territory analysis</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <CreditCard className="w-5 h-5 text-purple-600 mr-3" />
                    <span>Advanced payout management</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <Download className="w-5 h-5 text-purple-600 mr-3" />
                    <span>Detailed financial reporting</span>
                  </div>
                </div>

                <button className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 px-8 rounded-lg transition-colors">
                  Upgrade to Pro Plan
                </button>
              </div>
            </div>
          )}

          {/* Call to Action */}
          <div className="mt-16 bg-white rounded-xl shadow-sm p-12 border border-gray-100 text-center">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Start Earning With Your Label</h2>
              <p className="text-lg text-gray-600 mb-8">
                Sign artists to your label and start releasing music to generate revenue and build your catalog.
              </p>
              <a 
                href="/labeladmin/artists" 
                className="inline-flex items-center bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-8 rounded-lg transition-colors"
              >
                <Users className="w-5 h-5 mr-2" />
                Manage Artists
              </a>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}