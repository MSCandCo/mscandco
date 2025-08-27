import { useUser } from '@/components/providers/SupabaseProvider';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import Layout from '../../components/layouts/mainLayout';
import { Calendar, TrendingUp, Users, Play, DollarSign, Crown, Lock } from 'lucide-react';
import SocialFootprintIntegration from '../../components/analytics/SocialFootprintIntegration';
import CustomDateRangePicker from '../../components/shared/CustomDateRangePicker';

export default function ArtistAnalytics() {
  const { user, isLoading } = useUser();
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [activeTab, setActiveTab] = useState('basic');
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
          console.log('📋 Analytics subscription status loaded:', result.data);
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
    console.log('Artist analytics date range changed:', { start, end });
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
          <p className="text-gray-600">Please log in to view your analytics.</p>
        </div>
      </Layout>
    );
  }

  const renderBasicAnalytics = () => (
    <div className="space-y-8">
      {/* Key Metrics - Clean and Spacious */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Total Streams</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
              <p className="text-sm text-gray-500 mt-1">All platforms</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Play className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">£0.00</p>
              <p className="text-sm text-gray-500 mt-1">Net earnings</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Total Followers</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
              <p className="text-sm text-gray-500 mt-1">Across platforms</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Growth Rate</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">0%</p>
              <p className="text-sm text-gray-500 mt-1">This period</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* Left Column - Charts */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Performance Chart */}
          <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Performance Overview</h3>
            <div className="h-80 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
              <div className="text-center">
                <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">Performance charts will appear here</p>
                <p className="text-gray-400 text-sm mt-2">Connect your streaming platforms to see detailed analytics</p>
              </div>
            </div>
          </div>

          {/* Platform Breakdown */}
          <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Platform Breakdown</h3>
            <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
              <div className="text-center">
                <Play className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">Platform distribution charts will appear here</p>
                <p className="text-gray-400 text-sm mt-2">See which platforms drive the most streams</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Insights */}
        <div className="space-y-8">
          
          {/* Top Tracks */}
          <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Top Tracks</h3>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mr-4">
                      <Play className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Track {i}</p>
                      <p className="text-sm text-gray-500">0 streams</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">0</p>
                    <p className="text-xs text-gray-500">plays</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">Release your first track to see performance data</p>
            </div>
          </div>

          {/* Upgrade CTA for Basic Users */}
          {!hasProAccess && (
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-8 border border-purple-100">
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Crown className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Unlock Advanced Analytics</h3>
                <p className="text-gray-600 mb-6">
                  Get detailed platform breakdowns, audience insights, career snapshots, and social footprint analysis.
                </p>
                <Link href="/billing">
                  <button className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-6 rounded-lg transition-colors">
                    Upgrade to Pro
                  </button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Call to Action */}
      <div className="mt-16 bg-white rounded-xl shadow-sm p-12 border border-gray-100 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to See Your Analytics?</h2>
          <p className="text-lg text-gray-600 mb-8">
            Release your first track to start tracking streams, revenue, and audience engagement across all platforms.
          </p>
          <a 
            href="/artist/releases" 
            className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-lg transition-colors"
          >
            <Play className="w-5 h-5 mr-2" />
            Create Your First Release
          </a>
        </div>
      </div>
    </div>
  );

  const renderAdvancedAnalytics = () => (
    <div className="space-y-12">
      {/* Advanced Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Play className="w-6 h-6 text-blue-600" />
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
            <p className="text-sm text-gray-600">Total Revenue</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">0</p>
            <p className="text-sm text-gray-600">Social Footprint</p>
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
              <Crown className="w-6 h-6 text-indigo-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">Mainstream</p>
            <p className="text-sm text-gray-600">Career Stage</p>
          </div>
        </div>
      </div>

      {/* Advanced Analytics Content */}
      <SocialFootprintIntegration />
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
                <h1 className="text-4xl font-bold text-gray-900">Analytics</h1>
                <p className="mt-2 text-lg text-gray-600">Track your music performance and audience insights</p>
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
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Unlock Advanced Analytics</h2>
                <p className="text-gray-600 mb-8">
                  Get access to comprehensive platform breakdowns, career snapshots, audience demographics, 
                  social footprint analysis, and detailed performance insights.
                </p>
                
                {/* Pro Features List */}
                <div className="text-left mb-8 space-y-3">
                  <div className="flex items-center text-gray-700">
                    <Crown className="w-5 h-5 text-purple-600 mr-3" />
                    <span>Career stage and momentum tracking</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <Users className="w-5 h-5 text-purple-600 mr-3" />
                    <span>Detailed audience demographics</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <TrendingUp className="w-5 h-5 text-purple-600 mr-3" />
                    <span>Platform-specific analytics</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <Play className="w-5 h-5 text-purple-600 mr-3" />
                    <span>Social media footprint analysis</span>
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
        </div>
      </div>
    </Layout>
  );
}