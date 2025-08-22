import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '@/components/providers/SupabaseProvider';
import { supabase } from '@/lib/supabase';
import { getUserRoleSync } from '@/lib/user-utils';
import RoleBasedNavigation from '@/components/auth/RoleBasedNavigation';
import SubscriptionManager from '@/components/payments/SubscriptionManager';
import WalletManager from '@/components/payments/WalletManager';
import { CreditCard, Wallet, Settings, RefreshCw } from 'lucide-react';

export default function BillingPage() {
  const router = useRouter();
  const { user, isLoading } = useUser();
  const [activeTab, setActiveTab] = useState('subscription');
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && user) {
      const userRole = getUserRoleSync(user);
      if (!['artist', 'label_admin'].includes(userRole)) {
        router.push('/dashboard');
        return;
      }
      loadSubscriptionData();
    }
  }, [user, isLoading, router]);

  const loadSubscriptionData = async () => {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error loading subscription:', error);
      } else if (data) {
        setCurrentSubscription(data);
      }
    } catch (error) {
      console.error('Error loading subscription data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscriptionChange = (newSubscription) => {
    // Refresh subscription data after change
    loadSubscriptionData();
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <RoleBasedNavigation />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  const userRole = getUserRoleSync(user);
  const isArtist = userRole === 'artist';
  const isLabelAdmin = userRole === 'label_admin';

  return (
    <div className="min-h-screen bg-gray-50">
      <RoleBasedNavigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Billing & Payments
              </h1>
              <p className="text-gray-600 mt-2">
                Manage your subscription and wallet
              </p>
            </div>
            <button
              onClick={loadSubscriptionData}
              className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('subscription')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'subscription'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <CreditCard className="w-4 h-4" />
                  <span>Subscription</span>
                </div>
              </button>
              
              <button
                onClick={() => setActiveTab('wallet')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'wallet'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Wallet className="w-4 h-4" />
                  <span>Wallet</span>
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {activeTab === 'subscription' && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Subscription Management
                </h2>
                <p className="text-gray-600">
                  {isArtist 
                    ? 'Choose the perfect plan for your music career. Upgrade anytime to unlock more features.'
                    : 'Manage multiple artists and releases with our Label Admin plans.'
                  }
                </p>
              </div>
              
              <SubscriptionManager
                user={user}
                currentSubscription={currentSubscription}
                onSubscriptionChange={handleSubscriptionChange}
              />
            </div>
          )}

          {activeTab === 'wallet' && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Wallet Management
                </h2>
                <p className="text-gray-600">
                  Add funds to your wallet for subscription payments and other platform services.
                  You can also enable negative balance for approved accounts.
                </p>
              </div>
              
              <WalletManager user={user} />
            </div>
          )}
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <Settings className="w-6 h-6 text-blue-600 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Need Help?
              </h3>
              <p className="text-blue-800 mb-4">
                Our billing system is powered by Revolut Business API for secure, reliable payments. 
                Currently running in development mode with mock transactions.
              </p>
              <div className="space-y-2 text-sm text-blue-700">
                <p>• <strong>Subscription Changes:</strong> Upgrades take effect immediately</p>
                <p>• <strong>Wallet Funds:</strong> Available for subscription payments and platform services</p>
                <p>• <strong>Payment Security:</strong> All transactions are encrypted and secure</p>
                <p>• <strong>Support:</strong> Contact support@mscandco.com for billing questions</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
