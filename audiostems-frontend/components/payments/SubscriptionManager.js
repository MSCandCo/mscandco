import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { CreditCard, Zap, Star, Crown, Loader, CheckCircle, XCircle } from 'lucide-react';

const SubscriptionManager = ({ user, currentSubscription, onSubscriptionChange }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [processMessage, setProcessMessage] = useState('');

  // Subscription plans
  const plans = {
    artist_starter: {
      id: 'artist_starter',
      name: 'Artist Starter',
      price: '£9.99',
      interval: 'monthly',
      features: [
        '5 releases maximum',
        'Basic analytics dashboard',
        'Standard customer support',
        'Basic distribution network'
      ],
      icon: <Zap className="w-6 h-6" />,
      color: 'blue',
      popular: false
    },
    artist_pro: {
      id: 'artist_pro',
      name: 'Artist Pro',
      price: '£29.99',
      interval: 'monthly',
      features: [
        'Unlimited releases',
        'Advanced analytics & insights',
        'Priority customer support',
        'Premium distribution network',
        'Custom branding options',
        'Revenue optimization tools'
      ],
      icon: <Crown className="w-6 h-6" />,
      color: 'purple',
      popular: true
    },
    label_admin_starter: {
      id: 'label_admin_starter',
      name: 'Label Admin Starter',
      price: '£19.99',
      interval: 'monthly',
      features: [
        'Manage up to 4 artists',
        '8 releases maximum',
        'Basic analytics dashboard',
        'Standard customer support'
      ],
      icon: <Star className="w-6 h-6" />,
      color: 'green',
      popular: false
    },
    label_admin_pro: {
      id: 'label_admin_pro',
      name: 'Label Admin Pro',
      price: '£49.99',
      interval: 'monthly',
      features: [
        'Unlimited artists',
        'Unlimited releases',
        'Advanced analytics & insights',
        'Priority customer support',
        'Custom branding options',
        'Revenue optimization tools'
      ],
      icon: <Crown className="w-6 h-6" />,
      color: 'indigo',
      popular: true
    }
  };

  const handleUpgrade = async (planId) => {
    setIsLoading(true);
    setProcessMessage('Processing subscription change...');
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const response = await fetch('/api/payments/revolut/create-subscription', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          plan_id: planId,
          customer_data: {
            email: user.email,
            name: `${user.user_metadata?.firstName || ''} ${user.user_metadata?.lastName || ''}`.trim()
          }
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setProcessMessage('Subscription updated successfully!');
        setShowUpgradeModal(false);
        
        // Call the callback to refresh subscription data
        if (onSubscriptionChange) {
          onSubscriptionChange(result.subscription);
        }
        
        setTimeout(() => {
          setProcessMessage('');
        }, 3000);
      } else {
        throw new Error(result.error || 'Failed to update subscription');
      }
    } catch (error) {
      console.error('Subscription update error:', error);
      setProcessMessage('Failed to update subscription. Please try again.');
      
      setTimeout(() => {
        setProcessMessage('');
      }, 5000);
    } finally {
      setIsLoading(false);
    }
  };

  const getPlanColor = (color) => {
    const colors = {
      blue: 'border-blue-200 bg-blue-50',
      purple: 'border-purple-200 bg-purple-50',
      green: 'border-green-200 bg-green-50',
      indigo: 'border-indigo-200 bg-indigo-50'
    };
    return colors[color] || colors.blue;
  };

  const getButtonColor = (color) => {
    const colors = {
      blue: 'bg-blue-600 hover:bg-blue-700',
      purple: 'bg-purple-600 hover:bg-purple-700',
      green: 'bg-green-600 hover:bg-green-700',
      indigo: 'bg-indigo-600 hover:bg-indigo-700'
    };
    return colors[color] || colors.blue;
  };

  const isCurrentPlan = (planId) => {
    return currentSubscription?.tier === planId;
  };

  const canUpgradeTo = (planId) => {
    if (!currentSubscription) return true;
    
    const currentTier = currentSubscription.tier;
    
    // Define upgrade paths
    const upgradePaths = {
      'artist_starter': ['artist_pro'],
      'artist_pro': [],
      'label_admin_starter': ['label_admin_pro'],
      'label_admin_pro': []
    };
    
    return upgradePaths[currentTier]?.includes(planId) || false;
  };

  return (
    <div className="space-y-6">
      {/* Process Message */}
      {processMessage && (
        <div className={`p-4 rounded-lg flex items-center space-x-3 ${
          processMessage.includes('successfully') || processMessage.includes('Successfully')
            ? 'bg-green-50 text-green-800 border border-green-200'
            : processMessage.includes('Failed') || processMessage.includes('error')
            ? 'bg-red-50 text-red-800 border border-red-200'
            : 'bg-blue-50 text-blue-800 border border-blue-200'
        }`}>
          {processMessage.includes('Processing') ? (
            <Loader className="w-5 h-5 animate-spin" />
          ) : processMessage.includes('successfully') || processMessage.includes('Successfully') ? (
            <CheckCircle className="w-5 h-5" />
          ) : processMessage.includes('Failed') || processMessage.includes('error') ? (
            <XCircle className="w-5 h-5" />
          ) : (
            <CreditCard className="w-5 h-5" />
          )}
          <span>{processMessage}</span>
        </div>
      )}

      {/* Current Subscription Status */}
      {currentSubscription && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Subscription</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {plans[currentSubscription.tier]?.icon}
              <div>
                <p className="font-medium text-gray-900">
                  {plans[currentSubscription.tier]?.name || currentSubscription.tier}
                </p>
                <p className="text-sm text-gray-600">
                  Status: <span className="capitalize font-medium">{currentSubscription.status}</span>
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-gray-900">
                {plans[currentSubscription.tier]?.price || 'Custom'}
              </p>
              <p className="text-sm text-gray-600">per month</p>
            </div>
          </div>
        </div>
      )}

      {/* Available Plans */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          {currentSubscription ? 'Available Upgrades' : 'Choose Your Plan'}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.values(plans).map((plan) => {
            const isCurrent = isCurrentPlan(plan.id);
            const canUpgrade = canUpgradeTo(plan.id);
            const showPlan = !currentSubscription || canUpgrade || isCurrent;
            
            if (!showPlan) return null;

            return (
              <div
                key={plan.id}
                className={`relative border-2 rounded-lg p-6 ${getPlanColor(plan.color)} ${
                  isCurrent ? 'ring-2 ring-offset-2 ring-blue-500' : ''
                } ${plan.popular ? 'ring-1 ring-purple-500' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-purple-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {plan.icon}
                    <h4 className="text-lg font-semibold text-gray-900">{plan.name}</h4>
                  </div>
                  {isCurrent && (
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                      Current
                    </span>
                  )}
                </div>
                
                <div className="mb-4">
                  <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-600 ml-1">/{plan.interval}</span>
                </div>
                
                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <button
                  onClick={() => isCurrent ? null : handleUpgrade(plan.id)}
                  disabled={isCurrent || isLoading}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                    isCurrent
                      ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                      : `${getButtonColor(plan.color)} text-white hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`
                  }`}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <Loader className="w-4 h-4 animate-spin" />
                      <span>Processing...</span>
                    </div>
                  ) : isCurrent ? (
                    'Current Plan'
                  ) : (
                    `Upgrade to ${plan.name}`
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Payment Method Info */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <CreditCard className="w-5 h-5 text-gray-600" />
          <div>
            <p className="text-sm font-medium text-gray-900">Secure Payment Processing</p>
            <p className="text-xs text-gray-600">
              Powered by Revolut Business API (Mock Mode for Development)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionManager;
