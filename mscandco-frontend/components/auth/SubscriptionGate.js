'use client'

import { useState, useEffect } from 'react';
import { useUser } from '@/components/providers/SupabaseProvider';
import { Lock, CreditCard, Music, BarChart3, DollarSign, Users, ArrowRight, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function SubscriptionGate({ 
  children, 
  requiredFor = "this feature",
  showFeaturePreview = false,
  userRole = null 
}) {
  const { user, supabase } = useUser();
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSubscription = async () => {
      if (!user || !supabase) {
        setLoading(false);
        return;
      }

      // Distribution Partners (Code Group) should have full access without subscription
      const userEmail = user.email?.toLowerCase() || '';
      const userRoleFromMetadata = user.user_metadata?.role || user.app_metadata?.role;
      
      // Check if user should bypass subscription (Distribution Partner, Company Admin, Super Admin)
      const isDistributionPartner = (
        userRoleFromMetadata === 'distribution_partner' ||
        userRole === 'distribution_partner' ||
        userEmail === 'codegroup@mscandco.com' ||
        userEmail.includes('codegroup') ||
        userEmail.includes('code-group')
      );

      const isCompanyAdmin = (
        userRoleFromMetadata === 'company_admin' ||
        userRole === 'company_admin' ||
        userEmail === 'companyadmin@mscandco.com'
      );

      const isSuperAdmin = (
        userRoleFromMetadata === 'super_admin' ||
        userRole === 'super_admin' ||
        userEmail === 'superadmin@mscandco.com'
      );

      const isLabelAdmin = (
        userRoleFromMetadata === 'label_admin' ||
        userRole === 'label_admin'
      );

      // TEMPORARY: Bypass subscription for all artists during development
      const isArtist = (
        userRoleFromMetadata === 'artist' ||
        userRole === 'artist'
      );

      if (isDistributionPartner) {
        console.log('🎯 Distribution Partner detected - bypassing subscription check', {
          userEmail,
          userRoleFromMetadata,
          userRole
        });
        setSubscriptionStatus({ 
          hasSubscription: true, 
          planName: 'Distribution Partner',
          status: 'distribution_partner',
          isPro: true,
          bypassReason: 'Distribution Partner Access'
        });
        setLoading(false);
        return;
      }

      if (isCompanyAdmin) {
        console.log('🎯 Company Admin detected - bypassing subscription check', {
          userEmail,
          userRoleFromMetadata,
          userRole
        });
        setSubscriptionStatus({ 
          hasSubscription: true, 
          planName: 'Company Admin',
          status: 'company_admin',
          isPro: true,
          bypassReason: 'Company Admin Access'
        });
        setLoading(false);
        return;
      }

      if (isSuperAdmin) {
        console.log('🎯 Super Admin detected - bypassing subscription check', {
          userEmail,
          userRoleFromMetadata,
          userRole
        });
        setSubscriptionStatus({ 
          hasSubscription: true, 
          planName: 'Super Admin',
          status: 'super_admin',
          isPro: true,
          bypassReason: 'Super Admin Access'
        });
        setLoading(false);
        return;
      }

      if (isLabelAdmin) {
        console.log('🎯 Label Admin detected - bypassing subscription check', {
          userEmail,
          userRoleFromMetadata,
          userRole
        });
        setSubscriptionStatus({ 
          hasSubscription: true, 
          planName: 'Label Admin',
          status: 'label_admin',
          isPro: true,
          bypassReason: 'Label Admin Access'
        });
        setLoading(false);
        return;
      }

      if (isArtist) {
        console.log('🎯 Artist detected - bypassing subscription check (TEMPORARY)', {
          userEmail,
          userRoleFromMetadata,
          userRole
        });
        setSubscriptionStatus({ 
          hasSubscription: true, 
          planName: 'Artist (Development)',
          status: 'artist',
          isPro: true,
          bypassReason: 'Development Mode - All Artists Bypass'
        });
        setLoading(false);
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;

        if (!token) {
          setLoading(false);
          return;
        }

        const response = await fetch('/api/user/subscription-status', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        const result = await response.json();
        
        if (result.success) {
          setSubscriptionStatus(result.data);
        } else {
          setSubscriptionStatus({ hasSubscription: false });
        }
      } catch (error) {
        console.error('Failed to check subscription status:', error);
        setSubscriptionStatus({ hasSubscription: false });
      } finally {
        setLoading(false);
      }
    };

    checkSubscription();
  }, [user, userRole, supabase]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking subscription status...</p>
        </div>
      </div>
    );
  }

  // Allow access if user has active subscription
  if (subscriptionStatus?.hasSubscription) {
    return children;
  }

  // Get user role specific messaging
  const getRoleSpecificContent = () => {
    const isArtist = userRole === 'artist' || user?.user_metadata?.role === 'artist';
    const isLabel = userRole === 'label_admin' || user?.user_metadata?.role === 'label_admin';

    if (isArtist) {
      return {
        title: "Artist Subscription Required",
        subtitle: "Unlock your music career potential",
        description: "Access professional music distribution, analytics, and earnings tracking.",
        features: [
          "Distribute music to all major platforms",
          "Real-time streaming analytics",
          "Revenue tracking and reporting",
          "Release management tools",
          "Artist profile optimization"
        ],
        plans: [
          { name: "Artist Starter", price: "£9.99/month", releases: "5 releases/year", popular: false },
          { name: "Artist Pro", price: "£19.99/month", releases: "Unlimited releases", popular: true }
        ]
      };
    }

    if (isLabel) {
      return {
        title: "Label Subscription Required",
        subtitle: "Professional label management platform",
        description: "Manage your artists, releases, and revenue with comprehensive label tools.",
        features: [
          "Multi-artist management",
          "Label-wide analytics dashboard",
          "Revenue split management",
          "Artist roster tools",
          "Comprehensive reporting"
        ],
        plans: [
          { name: "Label Starter", price: "£29.99/month", releases: "20 releases/year", popular: false },
          { name: "Label Pro", price: "£49.99/month", releases: "Unlimited releases", popular: true }
        ]
      };
    }

    // Default content
    return {
      title: "Subscription Required",
      subtitle: "Access professional music tools",
      description: "Subscribe to access all platform features and grow your music business.",
      features: [
        "Music distribution",
        "Analytics and insights",
        "Revenue tracking",
        "Professional tools",
        "Priority support"
      ],
      plans: [
        { name: "Starter Plan", price: "£9.99/month", releases: "5 releases/year", popular: false },
        { name: "Pro Plan", price: "£19.99/month", releases: "Unlimited releases", popular: true }
      ]
    };
  };

  const content = getRoleSpecificContent();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
            <Lock className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{content.title}</h1>
          <p className="text-xl text-gray-600 mb-2">{content.subtitle}</p>
          <p className="text-gray-500 max-w-2xl mx-auto">{content.description}</p>
        </div>

        {/* Important Notice for Existing Releases */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
          <div className="flex items-start space-x-3">
            <Music className="w-6 h-6 text-yellow-600 mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                Have Existing Releases?
              </h3>
              <p className="text-yellow-700 mb-3">
                If you have releases on the platform, please subscribe to ensure they remain active and continue generating revenue. 
                Unsubscribed accounts may have their releases paused or removed.
              </p>
              <Link 
                href="/billing"
                className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
              >
                Subscribe Now to Protect Your Releases
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Features List */}
          <div className="bg-white rounded-xl shadow-sm border p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">What You'll Get</h3>
            <ul className="space-y-4">
              {content.features.map((feature, index) => (
                <li key={index} className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Pricing Plans */}
          <div className="bg-white rounded-xl shadow-sm border p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Choose Your Plan</h3>
            <div className="space-y-4">
              {content.plans.map((plan, index) => (
                <div 
                  key={index}
                  className={`border rounded-lg p-4 ${
                    plan.popular 
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' 
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className={`font-semibold ${plan.popular ? 'text-blue-900' : 'text-gray-900'}`}>
                        {plan.name}
                        {plan.popular && (
                          <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Popular
                          </span>
                        )}
                      </h4>
                      <p className="text-sm text-gray-600">{plan.releases}</p>
                    </div>
                    <div className={`text-right ${plan.popular ? 'text-blue-900' : 'text-gray-900'}`}>
                      <div className="text-lg font-bold">{plan.price}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Link 
            href="/billing"
            className="inline-flex items-center px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
          >
            <CreditCard className="w-5 h-5 mr-3" />
            Subscribe Now to Get Started
            <ArrowRight className="w-5 h-5 ml-3" />
          </Link>
          <p className="text-gray-500 mt-4">
            Already have a subscription? 
            <Link href="/billing" className="text-blue-600 hover:text-blue-700 ml-1">
              Check your billing status
            </Link>
          </p>
        </div>

        {/* Feature Preview (Optional) */}
        {showFeaturePreview && (
          <div className="mt-12 bg-white rounded-xl shadow-sm border p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Feature Preview</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <BarChart3 className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Analytics</p>
              </div>
              <div className="text-center">
                <Music className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Releases</p>
              </div>
              <div className="text-center">
                <DollarSign className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Earnings</p>
              </div>
              <div className="text-center">
                <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Management</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Higher-order component to wrap pages with subscription gate
export function withSubscriptionGate(WrappedComponent, options = {}) {
  return function SubscriptionGatedComponent(props) {
    const { requiredFor = "this page", showFeaturePreview = false } = options;
    
    return (
      <SubscriptionGate 
        requiredFor={requiredFor}
        showFeaturePreview={showFeaturePreview}
        userRole={props.userRole}
      >
        <WrappedComponent {...props} />
      </SubscriptionGate>
    );
  };
}
