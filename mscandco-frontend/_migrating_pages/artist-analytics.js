// Clean Analytics Page - Rebuilt from scratch with proper structure
import { useUser } from '@/components/providers/SupabaseProvider';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { requirePermission } from '@/lib/serverSidePermissions';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Layout from '../../components/layouts/mainLayout';
import SubscriptionGate from '../../components/auth/SubscriptionGate';
import CleanManualDisplay from '../../components/analytics/CleanManualDisplay';
import {
  BarChart3,
  TrendingUp,
  Crown,
  Lock
} from 'lucide-react';


// Server-side permission check BEFORE page renders
export async function getServerSideProps(context) {
  const auth = await requirePermission(context, 'analytics:access');

  if (auth.redirect) {
    return { redirect: auth.redirect };
  }

  return { props: { user: auth.user } };
}

export default function ArtistAnalytics() {
  const router = useRouter();
  const { user } = useUser();
    const [activeTab, setActiveTab] = useState('basic');
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // Permission check - redirect if no access
  
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
        <div className="min-h-screen" style={{background: 'linear-gradient(180deg, #f9fafb 0%, #ffffff 100%)'}}>
          {/* MSC Brand Hero Header */}
          <div className="text-white" style={{background: 'linear-gradient(135deg, #0f172a 0%, #1f2937 50%, #374151 100%)'}}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="flex-1">
                  <h1 className="text-4xl font-bold mb-4">Analytics Dashboard</h1>
                  <p className="text-xl text-white mb-6 lg:mb-0">
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
                        ? 'text-white shadow-md'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                    style={activeTab === 'basic' ? {background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)'} : {}}
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
                      ? 'text-white shadow-md'
                      : hasProAccess 
                        ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        : 'text-slate-400 cursor-not-allowed'
                  }`}
                  style={activeTab === 'advanced' ? {background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)'} : {}}
                  disabled={!hasProAccess}
                >
                  <span className="flex items-center">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Advanced Analytics Pro
                    {hasProAccess ? (
                      <span className="ml-2 text-xs text-white px-2 py-1 rounded-full opacity-90 flex items-center" style={{background: '#1f2937'}}>
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
              <div className="rounded-2xl shadow-lg p-16 text-center" style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(20px) saturate(180%)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
              }}>
                <div className="max-w-md mx-auto">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{background: 'linear-gradient(145deg, #1f2937 0%, #0f172a 100%)'}}>
                    <Crown className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold mb-4" style={{color: '#1f2937'}}>Unlock Advanced Analytics</h2>
                  <p className="mb-8" style={{color: '#64748b'}}>
                    Get access to comprehensive platform breakdowns, career snapshots, audience demographics, 
                    social footprint analysis, and detailed performance insights.
                  </p>
                  <Link href="/billing">
                    <button className="text-white font-semibold py-4 px-8 rounded-lg transition-all" style={{background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)'}}>
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
