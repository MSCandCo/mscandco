import { useUser } from '@/components/providers/SupabaseProvider';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import Layout from '../../components/layouts/mainLayout';
import SubscriptionGate from '../../components/auth/SubscriptionGate';
import AdminAnalyticsInterface from '../../components/analytics/AdminAnalyticsInterface';
import SocialFootprintIntegration from '../../components/analytics/SocialFootprintIntegration';
import BeautifulChartmetricDisplay from '../../components/analytics/BeautifulChartmetricDisplay';
import CustomDateRangePicker from '../../components/shared/CustomDateRangePicker';
import { 
  Calendar, 
  TrendingUp, 
  Users, 
  Play, 
  DollarSign, 
  Crown, 
  Lock,
  Music,
  Headphones,
  BarChart3,
  Globe,
  Award
} from 'lucide-react';

export default function ArtistAnalytics() {
  const { user, isLoading } = useUser();
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [selectedRange, setSelectedRange] = useState('30D');
  const [activeTab, setActiveTab] = useState('basic');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [linkedArtist, setLinkedArtist] = useState(null);
  
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
          console.log('Analytics subscription status loaded:', result.data);
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

  // Load manual analytics data from database
  const loadAnalyticsData = async (forceRefresh = false) => {
    if (!user || !hasProAccess || (analyticsLoading && !forceRefresh)) return;
    
    console.log('📊 Loading manual analytics data...', forceRefresh ? '(Force refresh)' : '');
    setAnalyticsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      if (!token) return;

      const response = await fetch(`/api/artist/analytics-data`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const result = await response.json();
      
      if (result.success) {
        setAnalyticsData(result.data);
        setLinkedArtist({ name: user.user_metadata?.full_name || 'Artist', id: user.id });
        console.log('Manual analytics loaded:', result.data);
      } else {
        console.log('No analytics data available yet');
        setLinkedArtist({ name: user.user_metadata?.full_name || 'Artist', id: user.id });
        setAnalyticsData(null);
      }
    } catch (error) {
      console.error('Error loading analytics data:', error);
      // Set basic artist info even if no analytics data
      setLinkedArtist({ name: user.user_metadata?.full_name || 'Artist', id: user.id });
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const handleDataUpdated = () => {
    console.log('🎯 Analytics data updated by admin');
    loadAnalyticsData(true); // Force refresh
  };

  // Load analytics data when user and subscription are ready
  useEffect(() => {
    if (user && hasProAccess && !analyticsLoading) {
      console.log('🔄 Auto-loading manual analytics for user:', user.user_metadata?.full_name);
      // Set artist as "linked" immediately for manual system
      setLinkedArtist({ name: user.user_metadata?.full_name || 'Artist', id: user.id });
      loadAnalyticsData();
    }
  }, [user, hasProAccess]);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your analytics...</p>
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
      {/* Show Latest Release Performance if artist is linked */}
      {linkedArtist && analyticsData && (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
          <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
            <TrendingUp className="w-6 h-6 text-green-600 mr-3" />
            Latest Release Performance
          </h3>
          
          {/* Latest Release Header */}
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Music className="w-8 h-8 text-white" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900">Latest Single</h4>
                <p className="text-slate-600">Released: Recent</p>
                <p className="text-sm text-slate-500">Single • Cross-platform performance</p>
              </div>
            </div>
          </div>

          {/* Platform Performance Summary - Basic View */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { platform: 'Spotify', streams: '2.4M', change: '+12.5%', color: 'green' },
              { platform: 'Apple Music', streams: '1.8M', change: '+8.3%', color: 'blue' },
              { platform: 'YouTube Music', streams: '3.1M', change: '+15.7%', color: 'red' },
              { platform: 'Total', streams: '10.8M', change: '+8.2%', color: 'purple' }
            ].map((platform, index) => (
              <div key={index} className="p-4 bg-slate-50 rounded-xl text-center">
                <h4 className="font-semibold text-slate-900 mb-1">{platform.platform}</h4>
                <p className="text-xl font-bold text-slate-900">{platform.streams}</p>
                <p className={`text-xs font-medium text-${platform.color}-600`}>{platform.change}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Show Recent Milestones if artist is linked */}
      {linkedArtist && analyticsData && (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-900 flex items-center">
              <Award className="w-6 h-6 text-yellow-600 mr-3" />
              Recent Milestones
            </h3>
          </div>
          <div className="space-y-4">
            {[
              {
                title: '1M Streams Milestone',
                description: 'Your latest single reached 1 million streams across all platforms',
                date: '2 days ago',
                impact: '+25% growth'
              },
              {
                title: 'Top 50 Chart Entry',
                description: 'Entered the Top 50 Gospel charts in Nigeria',
                date: '1 week ago',
                impact: 'Chart success'
              },
              {
                title: 'Viral on TikTok',
                description: 'Your track was featured in 10K+ TikTok videos',
                date: '2 weeks ago',
                impact: 'Social boost'
              }
            ].map((milestone, index) => (
              <div key={index} className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl">
                <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                  <Award className="w-5 h-5 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-slate-900">{milestone.title}</h4>
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                      {milestone.impact}
                    </span>
                  </div>
                  <p className="text-slate-600 text-sm mb-1">{milestone.description}</p>
                  <p className="text-slate-500 text-xs">{milestone.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Show message if no artist is linked */}
      {!linkedArtist && (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-16 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Music className="w-10 h-10 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Link Your Artist Profile</h2>
            <p className="text-slate-600 mb-8">
              Connect your artist profile above to see your latest release performance and recent milestones.
            </p>
          </div>
        </div>
      )}

      {/* Beautiful Upgrade Prompt */}
      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-8 border border-purple-100">
        <div className="text-center">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Crown className="w-8 h-8 text-purple-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Unlock Advanced Analytics</h3>
          <p className="text-slate-600 mb-6">
            Get detailed platform breakdowns, audience insights, career snapshots, and social footprint analysis.
          </p>
          <Link href="/billing">
            <button className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 px-8 rounded-lg transition-colors">
              Upgrade to Pro Plan
            </button>
          </Link>
        </div>
      </div>
    </div>
  );

  const renderAdvancedAnalytics = () => (
    <div className="space-y-8">
      {/* Show beautiful analytics if artist is linked */}
      {linkedArtist && (
        <BeautifulChartmetricDisplay 
          data={analyticsData} 
          loading={analyticsLoading}
          linkedArtist={linkedArtist}
          onRefresh={loadAnalyticsData}
        />
      )}
      
      {/* Show message if no artist is linked */}
      {!linkedArtist && (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-16 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Crown className="w-10 h-10 text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Link Your Artist Profile</h2>
            <p className="text-slate-600 mb-8">
              Connect your artist profile above to access comprehensive analytics including platform breakdowns, 
              audience insights, career snapshots, and detailed performance metrics.
            </p>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <SubscriptionGate 
      requiredFor="analytics and insights"
      showFeaturePreview={true}
      userRole="artist"
    >
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
          {/* Beautiful Header */}
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="text-center">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                  Artist Analytics
                </h1>
                <p className="text-xl text-blue-100 max-w-3xl mx-auto">
                  Track your music performance and audience insights with real-time data from all major streaming platforms
                </p>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            
            {/* Admin Analytics Interface - Above Both Basic and Advanced */}
            <div className="mb-8">
              <AdminAnalyticsInterface onDataUpdated={handleDataUpdated} />
            </div>
            
            {/* Beautiful Tab Navigation */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 mb-8">
              <div className="border-b border-slate-200">
                <nav className="-mb-px flex space-x-8 px-6">
                  <button
                    onClick={() => setActiveTab('basic')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === 'basic'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
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
                        ? 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                        : 'border-transparent text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    Advanced Analytics
                    {hasProAccess ? (
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        <Crown className="w-3 h-3 mr-1" />
                        Pro
                      </span>
                    ) : (
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500">
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
              <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-16 text-center">
                <div className="max-w-md mx-auto">
                  <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Crown className="w-10 h-10 text-purple-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">Unlock Advanced Analytics</h2>
                  <p className="text-slate-600 mb-8">
                    Get access to comprehensive platform breakdowns, career snapshots, audience demographics, 
                    social footprint analysis, and detailed performance insights.
                  </p>
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
    </SubscriptionGate>
  );
}
