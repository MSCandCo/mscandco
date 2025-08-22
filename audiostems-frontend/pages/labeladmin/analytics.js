import { useUser } from '@/components/providers/SupabaseProvider';
import { useState } from 'react';
import Layout from '../../components/layouts/mainLayout';
import { Calendar, TrendingUp, Users, Play, DollarSign, Crown, Lock, Music, BarChart3 } from 'lucide-react';
import CustomDateRangePicker from '../../components/shared/CustomDateRangePicker';

export default function LabelAdminAnalytics() {
  const { user, isLoading } = useUser();
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [activeTab, setActiveTab] = useState('basic');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Mock user plan - in real app, this would come from label subscription data
  const [labelPlan] = useState('starter'); // 'starter' or 'pro'
  const hasProAccess = labelPlan === 'pro';

  // Handle date range changes
  const handleDateRangeChange = (start, end) => {
    setStartDate(start);
    setEndDate(end);
    // Here you would typically refetch data with the new date range
    console.log('Date range changed:', { start, end });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading analytics...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-gray-600">Please log in to view analytics.</p>
        </div>
      </Layout>
    );
  }

  const renderBasicAnalytics = () => (
    <div className="space-y-8">
      {/* Label Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Total Artists</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
              <p className="text-sm text-gray-500 mt-1">Under label</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Total Streams</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
              <p className="text-sm text-gray-500 mt-1">All releases</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Play className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Label Revenue</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">£0.00</p>
              <p className="text-sm text-gray-500 mt-1">Total earnings</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Active Releases</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
              <p className="text-sm text-gray-500 mt-1">This month</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Music className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Performance Overview */}
      <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Label Performance Overview</h3>
        <div className="h-80 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
          <div className="text-center">
            <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Label performance charts will appear here</p>
            <p className="text-gray-400 text-sm mt-2">Sign artists to your label to see performance data</p>
          </div>
        </div>
      </div>

      {/* Top Artists */}
      <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Top Performing Artists</h3>
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No artists signed yet</p>
          <p className="text-gray-400 text-sm mt-2">Your top performing artists will appear here</p>
        </div>
      </div>

      {/* Upgrade CTA for Basic Users */}
      {!hasProAccess && (
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-8 border border-purple-100 text-center">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Crown className="w-8 h-8 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Unlock Advanced Label Analytics</h3>
          <p className="text-gray-600 mb-6">
            Get detailed artist breakdowns, territory analysis, A&R insights, and comprehensive label performance metrics.
          </p>
          <button className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-6 rounded-lg transition-colors">
            Upgrade to Pro
          </button>
        </div>
      )}
    </div>
  );

  const renderAdvancedAnalytics = () => (
    <div className="space-y-12">
      {/* Advanced Label Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">0</p>
            <p className="text-sm text-gray-600">Total Artists</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Play className="w-6 h-6 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">0</p>
            <p className="text-sm text-gray-600">Total Streams</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">£0.00</p>
            <p className="text-sm text-gray-600">Label Revenue</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Music className="w-6 h-6 text-orange-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">0</p>
            <p className="text-sm text-gray-600">Active Releases</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="text-center">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-6 h-6 text-indigo-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">0%</p>
            <p className="text-sm text-gray-600">Growth Rate</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="text-center">
            <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Crown className="w-6 h-6 text-pink-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">0</p>
            <p className="text-sm text-gray-600">A&R Score</p>
          </div>
        </div>
      </div>

      {/* Advanced Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Artist Performance Breakdown */}
        <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Artist Performance Breakdown</h3>
          <div className="space-y-4">
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No artists signed yet</p>
              <p className="text-sm text-gray-400 mt-2">Artist performance data will appear here</p>
            </div>
          </div>
        </div>

        {/* Revenue by Artist */}
        <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Revenue by Artist</h3>
          <div className="space-y-4">
            <div className="text-center py-8">
              <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No revenue data yet</p>
              <p className="text-sm text-gray-400 mt-2">Artist revenue breakdown will appear here</p>
            </div>
          </div>
        </div>

        {/* Territory Analysis */}
        <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Territory Performance</h3>
          <div className="space-y-4">
            <div className="text-center py-8">
              <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No territory data yet</p>
              <p className="text-sm text-gray-400 mt-2">Geographic performance will appear here</p>
            </div>
          </div>
        </div>

        {/* A&R Insights */}
        <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">A&R Insights</h3>
          <div className="space-y-4">
            <div className="text-center py-8">
              <Crown className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No A&R data yet</p>
              <p className="text-sm text-gray-400 mt-2">Artist development insights will appear here</p>
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
                <h1 className="text-4xl font-bold text-gray-900">Label Analytics</h1>
                <p className="mt-2 text-lg text-gray-600">Track your label's performance and artist insights</p>
              </div>
              
              {/* Custom Date Range Picker */}
              <div className="w-64">
                <CustomDateRangePicker
                  startDate={startDate}
                  endDate={endDate}
                  onDateRangeChange={handleDateRangeChange}
                  placeholder="Select date range for analytics"
                />
              </div>
            </div>

            {/* Analytics Tabs */}
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
                  Basic Analytics
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
                  Advanced Analytics
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
          {activeTab === 'basic' && renderBasicAnalytics()}
          
          {activeTab === 'advanced' && hasProAccess && renderAdvancedAnalytics()}
          
          {activeTab === 'advanced' && !hasProAccess && (
            <div className="bg-white rounded-xl shadow-sm p-16 border border-gray-100 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Crown className="w-10 h-10 text-purple-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Unlock Advanced Label Analytics</h2>
                <p className="text-gray-600 mb-8">
                  Get detailed artist performance breakdowns, A&R insights, territory analysis, 
                  and comprehensive label management analytics.
                </p>
                
                {/* Pro Features List */}
                <div className="text-left mb-8 space-y-3">
                  <div className="flex items-center text-gray-700">
                    <Users className="w-5 h-5 text-purple-600 mr-3" />
                    <span>Artist performance comparison</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <Crown className="w-5 h-5 text-purple-600 mr-3" />
                    <span>A&R insights and recommendations</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <TrendingUp className="w-5 h-5 text-purple-600 mr-3" />
                    <span>Territory and demographic analysis</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <BarChart3 className="w-5 h-5 text-purple-600 mr-3" />
                    <span>Advanced reporting and exports</span>
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
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Start Building Your Label</h2>
              <p className="text-lg text-gray-600 mb-8">
                Sign artists to your label and start releasing music to see comprehensive analytics and insights.
              </p>
              <a 
                href="/labeladmin/artists" 
                className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-lg transition-colors"
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