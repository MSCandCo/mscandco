import { useUser } from '@/components/providers/SupabaseProvider';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import Layout from '../../components/layouts/mainLayout';
import SubscriptionGate from '../../components/auth/SubscriptionGate';
import ArtistLinking from '../../components/analytics/ChartmetricArtistLinking';
import SocialFootprintIntegration from '../../components/analytics/SocialFootprintIntegration';
import BeautifulAnalyticsDisplay from '../../components/analytics/BeautifulChartmetricDisplay';
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
  Globe
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

  // Load analytics data
  const loadAnalyticsData = async () => {
    if (!user || !hasProAccess || analyticsLoading) return;
    
    console.log('📊 Loading analytics data...');
    setAnalyticsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      if (!token) return;

      const response = await fetch(`/api/chartmetric/artist-analytics?dateRange=${selectedPeriod}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const result = await response.json();
      
      if (result.success) {
        setAnalyticsData(result.data);
        setLinkedArtist(result.data.userContext?.linkedArtist);
        console.log('Analytics loaded:', result.data);
      } else if (result.requiresLinking) {
        setLinkedArtist(null);
        console.log('Artist linking required');
      }
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const handleArtistLinked = (artist) => {
    console.log('🎯 Artist linked callback:', artist);
    setLinkedArtist(artist);
    loadAnalyticsData();
  };

  // Load analytics data when linked artist is found (prevent infinite loop)
  useEffect(() => {
    if (linkedArtist && hasProAccess && !analyticsLoading && !analyticsData) {
      console.log('🔄 Auto-loading analytics for linked artist:', linkedArtist.name);
      loadAnalyticsData();
    }
  }, [linkedArtist, hasProAccess]);

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
      {/* Beautiful Basic Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          {
            title: 'Total Streams',
            value: '0',
            subtitle: 'All platforms',
            icon: Play,
            color: 'bg-blue-50',
            iconColor: 'text-blue-600'
          },
          {
            title: 'Monthly Listeners', 
            value: '0',
            subtitle: 'This month',
            icon: Headphones,
            color: 'bg-green-50',
            iconColor: 'text-green-600'
          },
          {
            title: 'Total Followers',
            value: '0', 
            subtitle: 'Across platforms',
            icon: Users,
            color: 'bg-purple-50',
            iconColor: 'text-purple-600'
          },
          {
            title: 'Growth Rate',
            value: '0%',
            subtitle: 'This period', 
            icon: TrendingUp,
            color: 'bg-orange-50',
            iconColor: 'text-orange-600'
          }
        ].map((metric, index) => (
          <div key={index} className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 uppercase tracking-wide">{metric.title}</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{metric.value}</p>
                <p className="text-sm text-slate-500 mt-1">{metric.subtitle}</p>
              </div>
              <div className={`w-12 h-12 ${metric.color} rounded-xl flex items-center justify-center`}>
                <metric.icon className={`w-6 h-6 ${metric.iconColor}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

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
      {/* Artist Linking - Always show for linking/unlinking */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
        <ChartmetricArtistLinking onLinked={handleArtistLinked} />
      </div>
      
      {/* Show beautiful analytics if artist is linked */}
      {linkedArtist && (
        <BeautifulChartmetricDisplay 
          data={analyticsData} 
          loading={analyticsLoading}
          linkedArtist={linkedArtist}
        />
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
