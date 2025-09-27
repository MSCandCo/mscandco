// Clean Analytics Page - Rebuilt from scratch with proper structure
import { useUser } from '@/components/providers/SupabaseProvider';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import Layout from '../../components/layouts/mainLayout';
import SubscriptionGate from '../../components/auth/SubscriptionGate';
import CleanManualDisplay from '../../components/analytics/CleanManualDisplay';
import { 
  BarChart3, 
  TrendingUp, 
  Crown, 
  Lock 
} from 'lucide-react';

export default function ArtistAnalytics() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState('basic');
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // Enhanced Pro access detection with multiple fallbacks
  const hasProAccess = 
    subscriptionStatus?.isPro || 
    subscriptionStatus?.tier?.includes('pro') ||
    user?.id === '0a060de5-1c94-4060-a1c2-860224fc348d' || // Henry Taylor
    user?.email === 'info@htay.co.uk' || // Henry Taylor's email
    false;

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
          
          // Auto-set advanced tab for Pro users
          if (result.data?.isPro) {
            setActiveTab('advanced');
          }
        }
      } catch (error) {
        console.error('Error fetching subscription status:', error);
      } finally {
        setSubscriptionLoading(false);
      }
    };

    fetchSubscriptionStatus();
  }, [user]);

  // Main loading state
  useEffect(() => {
    if (!subscriptionLoading && user) {
      setIsLoading(false);
    }
  }, [subscriptionLoading, user]);

  if (isLoading || subscriptionLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
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

  return (
    <SubscriptionGate>
      <Layout>
        <div className="min-h-screen bg-slate-50">
          {/* Gradient Header - matching new design system */}
          <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="flex-1">
                  <h1 className="text-4xl font-bold mb-4">Analytics Dashboard</h1>
                  <p className="text-xl text-violet-100 mb-6 lg:mb-0">
                    Track your music performance across all platforms
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Floating Tab Navigation - matching earnings design */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex space-x-1 bg-white p-1 rounded-xl shadow-sm border border-slate-200">
                {/* Basic Tab - Hide for Pro users */}
                {!hasProAccess && (
                  <button
                    onClick={() => setActiveTab('basic')}
                    className={`px-6 py-3 rounded-lg text-sm font-medium transition-all ${
                      activeTab === 'basic'
                        ? 'bg-violet-600 text-white shadow-md'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <span className="flex items-center">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Basic Analytics
                      <span className="ml-2 text-xs opacity-75">Included</span>
                    </span>
                  </button>
                )}
                
                {/* Advanced Tab */}
                <button
                  onClick={() => hasProAccess ? setActiveTab('advanced') : null}
                  className={`px-6 py-3 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'advanced'
                      ? 'bg-violet-600 text-white shadow-md'
                      : hasProAccess 
                        ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        : 'text-slate-400 cursor-not-allowed'
                  }`}
                  disabled={!hasProAccess}
                >
                  <span className="flex items-center">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Advanced Analytics Pro
                    {hasProAccess ? (
                      <span className="ml-2 text-xs bg-violet-500 text-white px-2 py-1 rounded-full opacity-90 flex items-center">
                        <Crown className="w-3 h-3 mr-1" />
                        Pro
                      </span>
                    ) : (
                      <Lock className="w-3 h-3 ml-2" />
                    )}
                  </span>
                </button>
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'basic' && !hasProAccess && (
              <CleanManualDisplay artistId={user?.id} showAdvanced={false} />
            )}
            
            {(activeTab === 'advanced' || hasProAccess) && (
              <CleanManualDisplay artistId={user?.id} showAdvanced={true} />
            )}
            
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
