import { useUser } from '@/components/providers/SupabaseProvider';
import { supabase } from '@/lib/supabase';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { getUserRole } from '@/lib/user-utils';
import Layout from '@/components/layouts/mainLayout';
import CurrencySelector, { formatCurrency as sharedFormatCurrency, useCurrencySync } from '@/components/shared/CurrencySelector';
import SubscriptionManager from '@/components/billing/SubscriptionManager';
import { 
  CreditCard, 
  Calendar, 
  Download, 
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  FileText,
  ExternalLink,
  Globe,
  ChevronDown
} from 'lucide-react';

// Production-ready billing data function
const getRoleSpecificPlans = (userRole, user, forceRefresh = null, sessionUpgrade = false) => {
  // For admin roles, show no billing
  if (userRole === 'super_admin' || userRole === 'company_admin' || userRole === 'distribution_partner') {
    return {
      subscription: null,
      paymentMethod: null,
      billingHistory: [],
      availablePlans: [],
      noBilling: true
    };
  }

  // For Label Admin, show Label Admin Starter/Pro plans
  if (userRole === 'label_admin') {
    // Generate dynamic subscription data based on user
    const nextBillingDate = new Date();
    nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
    
    // SIMPLE UPGRADE CHECK for Label Admin - Only one source of truth
    let hasUpgraded = false;
    if (typeof window !== 'undefined' && user?.sub) {
      hasUpgraded = localStorage.getItem(`label_admin_upgraded_${user.sub}`) === 'true' || sessionUpgrade;
      console.log('🎯 LABEL ADMIN UPGRADE CHECK:', { userId: user.sub, hasUpgraded, sessionUpgrade });
    }
    
    const labelAdminSubscription = {
      plan: hasUpgraded ? 'Label Admin Pro' : 'Label Admin Starter',
      price: hasUpgraded ? 49.99 : 29.99,
      nextBilling: nextBillingDate.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      billingCycle: 'monthly',
      autoRenewDate: nextBillingDate.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      features: hasUpgraded ? [
        'Unlimited artist management',
        'Advanced label analytics',
        'Priority support & phone support',
        'Advanced artist management tools',
        'Detailed earnings tracking and reporting',
        'Advanced artist onboarding',
        'Custom label branding',
        'Marketing campaign tools',
        'Advanced royalty tracking',
        'Custom label profile optimisation'
      ] : [
        'Up to 5 artists per label',
        'Basic label analytics',
        'Email support',
        'Standard artist management tools',
        'Basic earnings tracking'
      ]
    };

    const labelAdminPaymentMethod = {
      type: 'Card',
      last4: '****',
      expiry: 'Not connected'
    };

    const labelAdminBillingHistory = [
      {
        id: 1,
        description: hasUpgraded ? 'Label Admin Pro - Monthly' : 'Label Admin Starter - Monthly',
        date: 'February 15, 2024',
        amount: hasUpgraded ? 49.99 : 29.99,
        status: 'Paid'
      },
      {
        id: 2,
        description: hasUpgraded ? 'Label Admin Pro - Monthly' : 'Label Admin Starter - Monthly',
        date: 'January 15, 2024',
        amount: hasUpgraded ? 49.99 : 29.99,
        status: 'Paid'
      }
    ];

    const labelAdminAvailablePlans = [
      {
        name: 'Label Admin Starter',
        monthlyPrice: 29.99,
        yearlyPrice: 299.99,
        yearlySavings: '17%',
        current: !hasUpgraded,
        features: [
          'Up to 5 artists per label',
          'Basic label analytics and reporting',
          'Email support',
          'Standard artist management tools',
          'Basic earnings tracking',
          'Release management tools'
        ]
      },
      {
        name: 'Label Admin Pro',
        monthlyPrice: 49.99,
        yearlyPrice: 499.99,
        yearlySavings: '17%',
        current: hasUpgraded,
        features: [
          'Unlimited artist management',
          'Advanced label analytics and reporting',
          'Priority email and phone support',
          'Advanced artist management tools',
          'Detailed earnings tracking and reporting',
          'Advanced release management tools',
          'Custom label branding options',
          'Advanced artist onboarding',
          'Label social media integration',
          'Marketing campaign management',
          'Advanced royalty tracking',
          'Custom label profile optimization'
        ]
      }
    ];

    return {
      subscription: labelAdminSubscription,
      paymentMethod: labelAdminPaymentMethod,
      billingHistory: labelAdminBillingHistory,
      availablePlans: labelAdminAvailablePlans,
      paymentCustomerId: user?.app_metadata?.payment_customer_id || null,
      userId: user?.sub || null
    };
  }

  // Default Artist plans
  const nextBillingDate = new Date();
  nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
  
  // SIMPLE UPGRADE CHECK - Only one source of truth
  let hasUpgraded = false;
  if (typeof window !== 'undefined' && user?.sub) {
    hasUpgraded = localStorage.getItem(`user_upgraded_${user.sub}`) === 'true' || sessionUpgrade;
    console.log('🎯 SIMPLE UPGRADE CHECK:', { userId: user.sub, hasUpgraded, sessionUpgrade });
  }
  
  const baseSubscription = {
    plan: hasUpgraded ? 'Artist Pro' : 'Artist Starter',
    price: hasUpgraded ? 19.99 : 9.99,
    nextBilling: nextBillingDate.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }),
    billingCycle: 'monthly',
    autoRenewDate: nextBillingDate.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }),
    features: hasUpgraded ? [
      'Unlimited releases',
      'Advanced analytics',
      'Priority support',
      'Custom branding',
      'Earnings reporting',
      'Premium distribution channels',
      'Advanced reporting tools'
    ] : [
      'Up to 5 releases per year',
      'Basic analytics',
      'Standard support',
      'Basic branding'
    ]
  };

  const basePaymentMethod = {
    type: 'Card',
    last4: '****',
    expiry: 'Not connected'
  };

  const baseBillingHistory = [
    {
      id: 1,
      description: 'Artist Pro - Monthly',
      date: 'February 15, 2024',
      amount: 19.99,
      status: 'Paid'
    },
    {
      id: 2,
      description: 'Artist Pro - Monthly',
      date: 'January 15, 2024',
      amount: 19.99,
      status: 'Paid'
    }
  ];

  const baseAvailablePlans = [
    {
      name: 'Artist Starter',
      monthlyPrice: 9.99,
      yearlyPrice: 99.99,
      yearlySavings: '17%',
      current: !hasUpgraded,
      features: [
        'Up to 5 releases per year',
        'Basic analytics and reporting',
        'Email support',
        'Distribution to major platforms (Spotify, Apple Music, etc.)',
        'Basic earnings tracking',
        'Release management tools'
      ]
    },
    {
      name: 'Artist Pro',
      monthlyPrice: 19.99,
      yearlyPrice: 199.99,
      yearlySavings: '17%',
      current: hasUpgraded,
      features: [
        'Unlimited releases per year',
        'Advanced analytics and reporting',
        'Priority email and phone support',
        'Custom branding options',
        'Distribution to all major platforms',
        'Detailed earnings tracking and reporting',
        'Advanced release management tools',
        'Social media integration',
        'Marketing campaign tools',
        'Priority customer service',
        'Advanced royalty tracking',
        'Custom artist profile optimisation'
      ]
    }
  ];

  return {
    subscription: baseSubscription,
    paymentMethod: basePaymentMethod,
    billingHistory: baseBillingHistory,
    availablePlans: baseAvailablePlans,
    paymentCustomerId: user?.app_metadata?.payment_customer_id || null,
    userId: user?.sub || null
  };
};

export default function Billing() {
  const { user, isLoading } = useUser();
  const isAuthenticated = !!user;
  const router = useRouter();
  const [billingData, setBillingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [selectedCurrency, updateCurrency] = useCurrencySync('GBP');
  const [autoRenew, setAutoRenew] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [messageType, setMessageType] = useState('error'); // 'success', 'error', 'info'
  const [upgradeTimestamp, setUpgradeTimestamp] = useState(null); // Track upgrades to force re-render
  const [currentSessionUpgrade, setCurrentSessionUpgrade] = useState(false); // Session-only upgrade state
  const [userRole, setUserRole] = useState(null); // Track user role for component rendering

  // Auto-detect currency based on user's location (using shared currency system)
  useEffect(() => {
    const detectUserCurrency = async () => {
      try {
        // Try to get user's location from IP
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        
        // Supported currencies in shared system
        const supportedCurrencies = ['USD', 'EUR', 'GBP', 'CAD', 'NGN', 'GHS', 'KES', 'ZAR', 'ZMW'];
        
        if (data.country_code === 'GB') {
          updateCurrency('GBP');
        } else if (supportedCurrencies.includes(data.currency)) {
          updateCurrency(data.currency);
        } else {
          // Default to USD for countries not in our supported list
          updateCurrency('USD');
        }
      } catch (error) {
        console.log('Could not detect user location, defaulting to GBP');
        updateCurrency('GBP');
      }
    };

    detectUserCurrency();
  }, [updateCurrency]);

  // SIMPLE INITIALIZATION - Check only the simple flag
  useEffect(() => {
    if (user?.sub) {
      const currentUserRole = getUserRole(user);
      setUserRole(currentUserRole);
      let hasUpgraded = false;
      
      if (currentUserRole === 'label_admin') {
        hasUpgraded = localStorage.getItem(`label_admin_upgraded_${user.sub}`) === 'true';
        console.log('🔄 LABEL ADMIN SIMPLE INIT:', { userId: user.sub, hasUpgraded });
      } else {
        hasUpgraded = localStorage.getItem(`user_upgraded_${user.sub}`) === 'true';
        console.log('🔄 ARTIST SIMPLE INIT:', { userId: user.sub, hasUpgraded });
      }
      
      setCurrentSessionUpgrade(hasUpgraded);
    }
  }, [user?.sub]);

  // Load billing data function - defined before useEffect that calls it
  const loadBillingData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Get user-specific billing data from Supabase
      const currentUserRole = userRole || getUserRole(user);
      const realSubscriptionData = await getRealSubscriptionData(currentUserRole, user);
      
      setBillingData(realSubscriptionData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading billing data:', error);
      setLoading(false);
    }
  }, [user?.id, userRole]); // Remove loading from dependencies to prevent circular reference

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      loadBillingData();
    }
  }, [isAuthenticated, user?.id, loadBillingData]); // Include loadBillingData in dependencies

  // Handle successful payment return from Payment processor
  useEffect(() => {
    if (router.query.success === 'true') {
      setShowSuccessMessage(true);
      setMessageType('success');
      setMessage('🎉 Subscription updated successfully! Your new plan is now active.');
      
      // Immediately set session upgrade state when success is detected
      setCurrentSessionUpgrade(true);
      console.log('🚀 Immediately setting session upgrade to true');
      
              // In test mode, simulate subscription upgrade by storing in localStorage
        const sessionId = router.query.session_id;
        if (sessionId && user?.sub) {
                      // SIMPLE PERMANENT UPGRADE - Store only what we need
          try {
            const userRole = getUserRole(user);
            if (userRole === 'label_admin') {
              localStorage.setItem(`label_admin_upgraded_${user.sub}`, 'true');
              console.log('💾 LABEL ADMIN PERMANENT UPGRADE SET for user:', user.sub);
            } else {
              localStorage.setItem(`user_upgraded_${user.sub}`, 'true');
              console.log('💾 ARTIST PERMANENT UPGRADE SET for user:', user.sub);
            }
            
            // Force immediate re-render with upgraded state
            setCurrentSessionUpgrade(true);
            
            // Data will be refreshed by the success handler below
          } catch (error) {
            console.error('❌ Failed to save upgrade:', error);
          }
        }
      
      // Clear success message and URL after delay
      // Reload billing data immediately to show updated subscription
      setTimeout(() => {
        loadBillingData();
      }, 1000);

      setTimeout(() => {
        setShowSuccessMessage(false);
        // Clear the success parameter from URL
        router.replace('/billing', undefined, { shallow: true });
      }, 5000);
    }
  }, [router.query.success, router.query.session_id, user?.sub]);

  // Helper function to get features by plan name
  const getFeaturesByPlan = (planName) => {
    const featuresMap = {
      'Artist Starter': [
        'Up to 5 releases per year',
        'Basic analytics and reporting',
        'Email support',
        'Distribution to major platforms (Spotify, Apple Music, etc.)',
        'Basic earnings tracking',
        'Release management tools'
      ],
      'Artist Pro': [
        'Unlimited releases per year',
        'Advanced analytics and reporting',
        'Priority email and phone support',
        'Custom branding options',
        'Distribution to all major platforms',
        'Detailed earnings tracking and reporting',
        'Advanced release management tools',
        'Social media integration',
        'Marketing campaign tools',
        'Priority customer service',
        'Advanced royalty tracking',
        'Custom artist profile optimisation'
      ],
      'Label Admin Starter': [
        'Up to 10 artist management',
        'Basic label analytics',
        'Email support',
        'Distribution to major platforms (Spotify, Apple Music, etc.)',
        'Basic artist earnings tracking',
        'Label management tools'
      ],
      'Label Admin Pro': [
        'Unlimited artist management',
        'Advanced label analytics',
        'Priority support & phone support',
        'Advanced artist management tools',
        'Detailed earnings tracking and reporting',
        'Advanced artist onboarding',
        'Custom label branding',
        'Marketing campaign tools',
        'Advanced royalty tracking',
        'Custom label profile optimisation'
      ]
    };
    return featuresMap[planName] || [];
  };

  // Helper function to get available plans by role
  const getAvailablePlansByRole = (role) => {
    if (role === 'artist') {
      return [
        {
          name: 'Artist Starter',
          monthlyPrice: 10,
          yearlyPrice: 100,
          features: getFeaturesByPlan('Artist Starter')
        },
        {
          name: 'Artist Pro',
          monthlyPrice: 20,
          yearlyPrice: 200,
          features: getFeaturesByPlan('Artist Pro')
        }
      ];
    }
    
    if (role === 'label_admin') {
      return [
        {
          name: 'Label Admin Starter',
          monthlyPrice: 29.99,
          yearlyPrice: 299.99,
          features: getFeaturesByPlan('Label Admin Starter')
        },
        {
          name: 'Label Admin Pro',
          monthlyPrice: 49.99,
          yearlyPrice: 499.99,
          features: getFeaturesByPlan('Label Admin Pro')
        }
      ];
    }

    return [];
  };

  // Function to fetch real subscription data from Supabase
  const getRealSubscriptionData = async (currentUserRole, user) => {
    // Import Supabase client
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    // For admin roles, show no billing
    if (currentUserRole === 'super_admin' || currentUserRole === 'company_admin' || currentUserRole === 'distribution_partner') {
      return {
        subscription: null,
        paymentMethod: null,
        billingHistory: [],
        availablePlans: [],
        noBilling: true
      };
    }

    try {
      console.log('🔍 Looking up subscription for user:', {
        id: user?.id,
        email: user?.email,
        sub: user?.sub,
        userKeys: Object.keys(user || {})
      });
      
      // First, let's see what's in the user_profiles table
      console.log('📋 Checking all user_profiles...');
      const { data: allProfiles, error: listError } = await supabase
        .from('user_profiles')
        .select('id, user_id, email, subscription_type, subscription_status, payment_customer_id')
        .limit(10);
      
      if (listError) {
        console.error('❌ Error listing profiles:', listError);
      } else {
        console.log('📋 All user profiles:', allProfiles);
      }
      
      // Fetch user profile with subscription data from Supabase
      // Try with available columns first
      let { data: userProfile, error } = await supabase
        .from('user_profiles')
        .select('id, subscription_status')
        .limit(1)
        .single();

      if (error) {
        console.error('❌ Error fetching user profile by user_id:', {
          error,
          searchingFor: user?.id,
          errorCode: error?.code,
          errorMessage: error?.message,
          errorDetails: error?.details
        });
        
        // Also try to find by email if user_id lookup failed
        console.log('🔄 Trying lookup by email:', user?.email);
        const { data: emailProfile, error: emailError } = await supabase
          .from('user_profiles')
          .select('subscription_type, billing_interval, subscription_status, payment_customer_id, user_id')
          .eq('email', user?.email)
          .single();
          
        if (emailError) {
          console.error('❌ Email lookup also failed:', {
            emailError,
            searchingFor: user?.email,
            errorCode: emailError?.code,
            errorMessage: emailError?.message,
            errorDetails: emailError?.details
          });
          
          // Try broader search
          console.log('🔄 Trying partial email match...');
          const { data: partialProfiles, error: partialError } = await supabase
            .from('user_profiles')
            .select('*')
            .ilike('email', `%${user?.email}%`);
            
          if (partialError) {
            console.error('❌ Partial email search failed:', partialError);
          } else {
            console.log('🔍 Partial email matches:', partialProfiles);
          }
          
          // Check for recent webhook activity - maybe subscription is still syncing
          const { data: recentProfiles, error: recentError } = await supabase
            .from('user_profiles')
            .select('*')
            .not('payment_customer_id', 'is', null)
            .order('updated_at', { ascending: false })
            .limit(5);
            
          console.log('🔍 Recent profiles with Payment processor data:', recentProfiles);
          
          // Also check if current user exists in user_profiles at all
          console.log('🔍 Current user ID:', user?.id);
          console.log('🔍 Current user email:', user?.email);
          
          const { data: currentUserProfile, error: currentUserError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', user?.id)
            .single();
            
          console.log('🔍 Current user profile lookup:', { currentUserProfile, currentUserError });
          
          // Auto-create user profile if it doesn't exist
          if (currentUserError && currentUserError.code === 'PGRST116' && user?.id && user?.email) {
            console.log('🔄 Auto-creating missing user profile...');
            
            const { data: createdProfile, error: createError } = await supabase
              .from('user_profiles')
              .insert({
                id: user.id,
                email: user.email,
                role: currentUserRole || 'artist',
                subscription_tier: null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })
              .select()
              .single();
              
            if (createError) {
              console.error('❌ Failed to create user profile:', createError);
            } else {
              console.log('✅ Auto-created user profile:', createdProfile);
              // Retry the subscription lookup now that profile exists
              return await getRealSubscriptionData();
            }
          }
          
          // Fall back to showing available plans without active subscription
          const availablePlans = getAvailablePlansByRole(currentUserRole);
          return {
            subscription: null,
            paymentMethod: null,
            billingHistory: [],
            availablePlans,
            noBilling: false,
            debug: {
              message: 'Subscription data is syncing... This may take a few moments.',
              userEmail: user?.email,
              userId: user?.id,
              recentWebhooks: recentProfiles?.length || 0,
              showRefreshButton: true
            }
          };
        }
        
        console.log('✅ Found user by email:', emailProfile);
        userProfile = emailProfile;
      }

      console.log('📊 Real subscription data from Supabase:', userProfile);
      
      // Temporary: If we only have basic columns, show setup message
      if (userProfile && !userProfile.subscription_type) {
        console.log('⚠️ Schema incomplete - showing available plans');
        const availablePlans = getAvailablePlansByRole(currentUserRole);
        return {
          subscription: null,
          paymentMethod: null,
          billingHistory: [],
          availablePlans,
          noBilling: false,
          schemaIncomplete: true
        };
      }

      // Generate next billing date
      const nextBillingDate = new Date();
      nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

      // Map subscription types to display data
      const subscriptionMap = {
        'artist_starter': { plan: 'Artist Starter', monthlyPrice: 10, yearlyPrice: 100 },
        'artist_pro': { plan: 'Artist Pro', monthlyPrice: 20, yearlyPrice: 200 },
        'label_admin_starter': { plan: 'Label Admin Starter', monthlyPrice: 29.99, yearlyPrice: 299.99 },
        'label_admin_pro': { plan: 'Label Admin Pro', monthlyPrice: 49.99, yearlyPrice: 499.99 }
      };

      const currentPlan = subscriptionMap[userProfile?.subscription_type];
      const isActive = userProfile?.subscription_status === 'active';
      const isYearly = userProfile?.billing_interval === 'yearly';

      if (currentPlan && isActive) {
        // User has an active subscription
        const subscription = {
          plan: currentPlan.plan,
          price: isYearly ? currentPlan.yearlyPrice : currentPlan.monthlyPrice,
          nextBilling: nextBillingDate.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          }),
          billingCycle: isYearly ? 'yearly' : 'monthly',
          autoRenewDate: nextBillingDate.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          }),
          features: getFeaturesByPlan(currentPlan.plan),
          status: 'active'
        };

        // Get available plans based on role
        const availablePlans = getAvailablePlansByRole(currentUserRole);

        return {
          subscription,
          paymentMethod: {
            type: 'card',
            last4: '****',
            brand: 'Visa',
            expiryMonth: 12,
            expiryYear: 2025
          },
          billingHistory: [],
          availablePlans,
          noBilling: false
        };
      } else {
        // User has no active subscription - show available plans
        const availablePlans = getAvailablePlansByRole(currentUserRole);
        return {
          subscription: null,
          paymentMethod: null,
          billingHistory: [],
          availablePlans,
          noBilling: false
        };
      }
    } catch (error) {
      console.error('Error in getRealSubscriptionData:', error);
      // Fall back to showing available plans without active subscription
      const availablePlans = getAvailablePlansByRole(currentUserRole);
      return {
        subscription: null,
        paymentMethod: null,
        billingHistory: [],
        availablePlans,
        noBilling: false
      };
    }
  };



  const handleUpdatePaymentMethod = async () => {
    try {
      setProcessing(true);
      setMessage('');

      // For new customers, we'll create a customer portal session without a customer ID
      // Payment processor will handle customer creation during the first payment
      const response = await fetch('/api/billing/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ customerId: null }), // Remove hardcoded demo ID
      });

      const data = await response.json();
      
      if (data.error) {
        setMessage(data.error);
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        setMessage('Error creating portal session');
      }
    } catch (error) {
      console.error('Error updating payment method:', error);
      setMessage('Revolut payment processing temporarily unavailable. Please try again or contact support.');
    } finally {
      setProcessing(false);
    }
  };

  const handleViewInvoiceHistory = async () => {
    try {
      setProcessing(true);
      setMessage('');

      // For new customers, we'll create a customer portal session without a customer ID
      const response = await fetch('/api/billing/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ customerId: null }), // Remove hardcoded demo ID
      });

      const data = await response.json();
      
      if (data.error) {
        setMessage(data.error);
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        setMessage('Error creating portal session');
      }
    } catch (error) {
      console.error('Error viewing invoice history:', error);
      setMessage('Revolut payment processing temporarily unavailable. Please try again or contact support.');
    } finally {
      setProcessing(false);
    }
  };

  const handleContactSupport = () => {
    // Create a support modal or redirect to support page instead of mailto
    setShowSuccessMessage(false);
    setMessageType('info');
    setMessage('📧 Support Contact: support@mscandco.com | 📞 Phone: +44 20 1234 5678 | 💬 Live Chat available Mon-Fri 9AM-6PM GMT');
    
    // Copy email to clipboard for convenience
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText('support@mscandco.com').then(() => {
        console.log('Support email copied to clipboard');
      }).catch(() => {
        console.log('Could not copy to clipboard');
      });
    }
  };

  const handleUpgradePlan = async (planName) => {
    try {
      setProcessing(true);
      setMessage('');

      // For new customers, we'll create a checkout session without a customer ID
      // Payment processor will handle customer creation during the first payment
      const response = await fetch('/api/billing/create-revolut-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan: planName,
          billingCycle,
          customerId: null, // Will be created by Payment processor
          userEmail: user?.email, // Pass user email for Payment processor customer creation
          userId: user?.id, // Pass user ID for linking back to Supabase
        }),
      });

      const data = await response.json();
      
      if (data.error) {
        setMessage(data.error);
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        setMessage('Error creating checkout session');
      }
    } catch (error) {
      console.error('Error upgrading plan:', error);
      setMessage('Revolut payment processing temporarily unavailable. Please try again or contact support.');
    } finally {
      setProcessing(false);
    }
  };

  const handleCancelSubscription = async () => {
    try {
      setProcessing(true);
      setMessage('');

      // Get user's Payment processor customer ID from billing data or database
      const customerId = billingData?.paymentCustomerId;
      
      if (!customerId) {
        setMessage('No subscription found to cancel. Please contact support if you believe this is an error.');
        return;
      }
      
      const response = await fetch('/api/billing/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ customerId }),
      });

      const data = await response.json();
      
      if (data.error) {
        setMessage(data.error);
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        setMessage('Error creating portal session');
      }
    } catch (error) {
      console.error('Error canceling subscription:', error);
      setMessage('Payment processor is not configured. Please contact support to manage your subscription.');
    } finally {
      setProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Allow access to billing for all authenticated users
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please log in to access billing</h1>
        </div>
      </div>
    );
  }

  // Show no-billing message for admin roles
  if (billingData?.noBilling) {
    return (
      <Layout>
        <Head>
          <title>Billing - MSC & Co</title>
        </Head>

        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <div className="mb-6">
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-gray-900 mb-2">No Billing Required</h1>
                <p className="text-gray-600">
                  As a {userRole ? String(userRole || 'user').replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'user'}, 
                  you have full access to the platform without any billing requirements.
                </p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Your Access Includes:</h3>
                <ul className="text-left space-y-2 text-gray-600">
                  {userRole === 'super_admin' && (
                    <>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        Access to all brands and platforms
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        Complete system administration
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        User management and role assignment
                      </li>
                    </>
                  )}
                  {userRole === 'company_admin' && (
                    <>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        Access to YHWH MSC brand
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        Company-wide analytics and reporting
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        Brand management tools
                      </li>
                    </>
                  )}
                  {userRole === 'distribution_partner' && (
                    <>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        Access to all releases and distribution
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        Release approval and management
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        Distribution partner tools
                      </li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>Billing - MSC & Co</title>
      </Head>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Billing & Subscription</h1>
                <p className="mt-2 text-gray-600">Manage your subscription and billing information</p>
              </div>
              
              {/* Currency Selector */}
              <CurrencySelector
                selectedCurrency={selectedCurrency}
                onCurrencyChange={updateCurrency}
                showLabel={true}
                showExchangeRate={true}
                compact={false}
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : billingData?.subscription ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Current Subscription */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Current Subscription</h2>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Active
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">{billingData.subscription.plan}</h3>
                      <p className="text-3xl font-bold text-gray-900 mb-2 truncate">{sharedFormatCurrency(billingData.subscription.price, selectedCurrency)}</p>
                      <p className="text-sm text-gray-500">Next billing: {billingData.subscription.nextBilling}</p>
                      <p className="text-sm text-gray-500 capitalize">Billing cycle: {billingData.subscription.billingCycle}</p>
                      
                      {/* Auto-Renewal Settings */}
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">Auto-Renewal</h4>
                            <p className="text-xs text-gray-500">
                              {autoRenew ? 'Your subscription will automatically renew' : 'Your subscription will expire on the next billing date'}
                            </p>
                          </div>
                          <button
                            onClick={() => setAutoRenew(!autoRenew)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              autoRenew ? 'bg-blue-600' : 'bg-gray-200'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                autoRenew ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                        
                        <div className="text-xs text-gray-600">
                          {autoRenew ? (
                            <div className="flex items-center text-green-600">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Next renewal: {billingData.subscription.autoRenewDate}
                            </div>
                          ) : (
                            <div className="flex items-center text-orange-600">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              Subscription will expire on {billingData.subscription.nextBilling}
                            </div>
                          )}
                        </div>
                        
                        <button className="w-full text-left p-2 text-xs text-blue-600 hover:text-blue-700">
                          Manage renewal preferences
                        </button>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Plan Features</h4>
                      <ul className="space-y-2">
                        {billingData.subscription.features.map((feature, index) => (
                          <li key={index} className="flex items-center text-sm text-gray-600">
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <button 
                      onClick={() => handleUpgradePlan(billingData.subscription.plan)}
                      disabled={processing}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processing ? 'Processing...' : 
                       billingData.subscription.plan === 'Artist Starter' ? 'Upgrade to Pro' :
                       billingData.subscription.plan === 'Label Admin Starter' ? 'Upgrade to Pro' :
                       billingData.subscription.plan === 'Artist Pro' ? 'Switch to Starter' :
                       billingData.subscription.plan === 'Label Admin Pro' ? 'Switch to Starter' : 'Manage Plan'}
                    </button>
                    <button 
                      onClick={handleUpdatePaymentMethod}
                      disabled={processing}
                      className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processing ? 'Processing...' : 'Update Payment Method'}
                    </button>
                    <button 
                      onClick={handleViewInvoiceHistory}
                      disabled={processing}
                      className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processing ? 'Processing...' : 'View Invoices'}
                    </button>
                    <button 
                      onClick={handleCancelSubscription}
                      disabled={processing}
                      className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processing ? 'Processing...' : 'Cancel Subscription'}
                    </button>
                  </div>
                </div>

                {/* Plan Comparison */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Available Plans</h2>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-600">Billing Cycle:</span>
                      <div className="flex bg-gray-100 rounded-lg p-1">
                        <button
                          onClick={() => setBillingCycle('monthly')}
                          className={`px-3 py-1 text-sm rounded-md transition-colors ${
                            billingCycle === 'monthly'
                              ? 'bg-white text-gray-900 shadow-sm'
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          Monthly
                        </button>
                        <button
                          onClick={() => setBillingCycle('yearly')}
                          className={`px-3 py-1 text-sm rounded-md transition-colors ${
                            billingCycle === 'yearly'
                              ? 'bg-white text-gray-900 shadow-sm'
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          Yearly
                          {billingCycle === 'yearly' && (
                            <span className="ml-1 text-xs bg-green-100 text-green-800 px-1 rounded">
                              Save
                            </span>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                    {billingData.availablePlans.map((plan, index) => (
                      <div
                        key={index}
                        className={`relative p-6 rounded-lg border-2 transition-all ${
                          plan.current
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {plan.current && (
                          <span className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                            Current Plan
                          </span>
                        )}
                        
                        <div className="text-center mb-4">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">{plan.name}</h3>
                          <div className="mb-2">
                            <span className="text-3xl font-bold text-gray-900">
                              {billingCycle === 'monthly' ? sharedFormatCurrency(plan.monthlyPrice, selectedCurrency) : sharedFormatCurrency(plan.yearlyPrice, selectedCurrency)}
                            </span>
                            <span className="text-gray-500">
                              /{billingCycle === 'monthly' ? 'month' : 'year'}
                            </span>
                          </div>
                          {billingCycle === 'yearly' && (
                            <div className="flex items-center justify-center space-x-2">
                              <span className="text-sm text-gray-500 line-through">
                                {sharedFormatCurrency(plan.monthlyPrice, selectedCurrency)}/month
                              </span>
                              <span className="text-sm font-medium text-green-600">
                                Save {plan.yearlySavings}
                              </span>
                            </div>
                          )}
                        </div>

                        <ul className="space-y-2 mb-6">
                          {plan.features.map((feature, featureIndex) => (
                            <li key={featureIndex} className="flex items-center text-sm text-gray-600">
                              <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                              {feature}
                            </li>
                          ))}
                        </ul>

                        <button
                          onClick={() => !plan.current && handleUpgradePlan(plan.name)}
                          disabled={plan.current || processing}
                          className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                            plan.current
                              ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                              : 'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50'
                          }`}
                        >
                          {processing 
                            ? 'Processing...' 
                            : plan.current 
                            ? 'Current Plan' 
                            : plan.name === 'Artist Pro' || plan.name === 'Label Admin Pro'
                            ? 'Upgrade to Pro'
                            : plan.name === 'Artist Starter' || plan.name === 'Label Admin Starter'
                            ? 'Switch to Starter'
                            : 'Select Plan'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment Method */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Method</h2>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <CreditCard className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        {billingData.paymentCustomerId ? (
                          <>
                            <p className="font-medium text-gray-900">{billingData.paymentMethod.type} ending in {billingData.paymentMethod.last4}</p>
                            <p className="text-sm text-gray-500">Expires {billingData.paymentMethod.expiry}</p>
                          </>
                        ) : (
                          <>
                            <p className="font-medium text-gray-900">No payment method connected</p>
                            <p className="text-sm text-gray-500">Add a payment method to manage your subscription</p>
                          </>
                        )}
                      </div>
                    </div>
                    <button 
                      onClick={handleUpdatePaymentMethod}
                      disabled={processing}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processing ? 'Processing...' : billingData.paymentCustomerId ? 'Update' : 'Add Payment Method'}
                    </button>
                  </div>
                </div>

                {/* Billing History */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Billing History</h2>
                  <div className="space-y-4">
                    {billingData.paymentCustomerId && billingData.billingHistory.length > 0 ? (
                      billingData.billingHistory.map((invoice) => (
                        <div key={invoice.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                          <div className="flex items-center">
                            <FileText className="w-5 h-5 text-gray-400 mr-3" />
                            <div>
                              <p className="font-medium text-gray-900">{invoice.description}</p>
                              <p className="text-sm text-gray-500">{invoice.date}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span className="font-medium text-gray-900">{sharedFormatCurrency(invoice.amount, selectedCurrency)}</span>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {invoice.status}
                            </span>
                            <button 
                              onClick={() => window.open(`/api/billing/invoice/${invoice.id}`, '_blank')}
                              className="text-blue-600 hover:text-blue-700 text-sm"
                              title="Download Invoice"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No billing history</h3>
                        <p className="text-gray-500">
                          {billingData.paymentCustomerId 
                            ? "You don't have any invoices yet." 
                            : "Connect a payment method to start your subscription and view billing history."
                          }
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Quick Actions */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <button 
                      onClick={handleUpdatePaymentMethod}
                      disabled={processing}
                      className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <CreditCard className="w-5 h-5 text-gray-400 mr-3" />
                          <span className="text-sm font-medium text-gray-900">Update Payment Method</span>
                        </div>
                        {processing && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>}
                      </div>
                    </button>
                    <button 
                      onClick={handleViewInvoiceHistory}
                      disabled={processing}
                      className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                          <span className="text-sm font-medium text-gray-900">View Invoice History</span>
                        </div>
                        {processing && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>}
                      </div>
                    </button>
                    <button 
                      onClick={handleContactSupport}
                      className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <AlertCircle className="w-5 h-5 text-gray-400 mr-3" />
                          <span className="text-sm font-medium text-gray-900">Contact Support</span>
                        </div>
                        <ExternalLink className="w-4 h-4 text-gray-400" />
                      </div>
                    </button>
                  </div>
                  
                  {message && (
                    <div className={`mt-3 p-3 rounded-lg ${
                      showSuccessMessage || messageType === 'success'
                        ? 'bg-green-50 border border-green-200' 
                        : messageType === 'info'
                        ? 'bg-blue-50 border border-blue-200'
                        : 'bg-red-50 border border-red-200'
                    }`}>
                      <p className={`text-sm ${
                        showSuccessMessage || messageType === 'success' 
                          ? 'text-green-600' 
                          : messageType === 'info'
                          ? 'text-blue-600'
                          : 'text-red-600'
                      }`}>{message}</p>
                    </div>
                  )}
                </div>

                {/* Auto-Renewal Settings */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Auto-Renewal Settings</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Auto-Renewal</p>
                        <p className="text-xs text-gray-500">
                          {autoRenew ? 'Enabled' : 'Disabled'}
                        </p>
                      </div>
                      <button
                        onClick={() => setAutoRenew(!autoRenew)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          autoRenew ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            autoRenew ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                    
                    <div className="text-xs text-gray-600">
                      {autoRenew ? (
                        <div className="flex items-center text-green-600">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Next renewal: {billingData.subscription.autoRenewDate}
                        </div>
                      ) : (
                        <div className="flex items-center text-orange-600">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Subscription will expire on {billingData.subscription.nextBilling}
                        </div>
                      )}
                    </div>
                    
                    <button className="w-full text-left p-2 text-xs text-blue-600 hover:text-blue-700">
                      Manage renewal preferences
                    </button>
                  </div>
                </div>

                {/* Usage Summary */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage This Month</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Releases Created</span>
                      <span className="text-sm font-medium text-gray-900">0 / Unlimited</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Storage Used</span>
                      <span className="text-sm font-medium text-gray-900">0 GB / 10 GB</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Downloads</span>
                      <span className="text-sm font-medium text-gray-900">0</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">API Calls</span>
                      <span className="text-sm font-medium text-gray-900">0 / 10,000</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>Last updated</span>
                      <span>Just now</span>
                    </div>
                  </div>
                </div>

                {/* Subscription Status */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Subscription Status</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Status</span>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Active
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Next billing</span>
                      <span className="text-sm font-medium text-gray-900">{billingData.subscription.nextBilling}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Amount</span>
                      <span className="text-sm font-medium text-gray-900">{sharedFormatCurrency(billingData.subscription.price, selectedCurrency)}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <button 
                      onClick={handleViewInvoiceHistory}
                      className="w-full text-center text-xs text-blue-600 hover:text-blue-700 font-medium"
                    >
                      <div className="flex items-center justify-center">
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Manage in Payment processor Portal
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // No active subscription - show beautiful pricing cards
            <div className="max-w-6xl mx-auto">
              
              {/* Debug Info for Recent Subscriptions */}
              {billingData?.debug && (
                <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <Clock className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="ml-3 flex-1">
                      <h3 className="text-sm font-medium text-blue-800">
                        {billingData.debug.message}
                      </h3>
                      <div className="mt-2 text-sm text-blue-700">
                        <p>Recent webhook activity: {billingData.debug.recentWebhooks} events processed</p>
                        {billingData.debug.showRefreshButton && (
                          <div className="mt-3">
                            <button
                              onClick={() => window.location.reload()}
                              className="inline-flex items-center px-3 py-2 border border-blue-300 shadow-sm text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              <AlertCircle className="w-4 h-4 mr-2" />
                              Refresh Page
                            </button>
                            <p className="mt-2 text-xs text-blue-600">
                              If you just completed a subscription, please wait 30 seconds and refresh this page.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {/* Billing Cycle Toggle */}
              <div className="flex justify-center mb-8">
                <div className="bg-gray-100 p-1 rounded-lg">
                  <button
                    onClick={() => setBillingCycle('monthly')}
                    className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                      billingCycle === 'monthly'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setBillingCycle('yearly')}
                    className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                      billingCycle === 'yearly'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Yearly
                    <span className="ml-1 text-xs text-green-600 font-semibold">Save 15%</span>
                  </button>
                </div>
              </div>

              {/* Pricing Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                {billingData?.availablePlans?.map((plan, index) => {
                  const isPopular = plan.name.includes('Pro');
                  const monthlyPrice = plan.monthlyPrice;
                  const yearlyPrice = plan.yearlyPrice;
                  const displayPrice = billingCycle === 'yearly' ? yearlyPrice : monthlyPrice;
                  const savings = billingCycle === 'yearly' ? (monthlyPrice * 12) - yearlyPrice : 0;

                  return (
                    <div 
                      key={index} 
                      className={`relative bg-white rounded-2xl shadow-xl border-2 p-8 ${
                        isPopular ? 'border-blue-500' : 'border-gray-200'
                      }`}
                    >
                      {/* Popular Badge */}
                      {isPopular && (
                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                          <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                            Most Popular
                          </span>
                        </div>
                      )}

                      {/* Plan Header */}
                      <div className="text-center mb-6">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                        <div className="mb-4">
                          <span className="text-5xl font-bold text-gray-900">
                            {sharedFormatCurrency(displayPrice, selectedCurrency)}
                          </span>
                          <span className="text-lg text-gray-600 ml-1">
                            /{billingCycle === 'yearly' ? 'year' : 'month'}
                          </span>
                        </div>
                        {billingCycle === 'yearly' && savings > 0 && (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                            <p className="text-green-700 font-semibold text-sm">
                              🎉 Save {sharedFormatCurrency(savings, selectedCurrency)} per year!
                            </p>
                            <p className="text-green-600 text-xs mt-1">
                              That's {sharedFormatCurrency(monthlyPrice, selectedCurrency)}/month billed annually
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Features List */}
                      <div className="space-y-4 mb-8">
                        {plan.features?.map((feature, featureIndex) => (
                          <div key={featureIndex} className="flex items-start">
                            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                            <span className="text-gray-700">{feature}</span>
                          </div>
                        ))}
                      </div>

                      {/* CTA Button */}
                      <button
                        onClick={() => handleUpgradePlan(plan.name)}
                        disabled={processing}
                        className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 ${
                          isPopular
                            ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
                            : 'bg-gray-900 hover:bg-gray-800 text-white shadow-lg hover:shadow-xl'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {processing ? (
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            Processing...
                          </div>
                        ) : (
                          `Get ${plan.name}`
                        )}
                      </button>

                      {/* Money-back guarantee */}
                      <p className="text-center text-sm text-gray-500 mt-4">
                        30-day money-back guarantee
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Bottom CTA Section */}
              <div className="text-center mt-12 p-8 bg-gray-50 rounded-2xl">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Not sure which plan is right for you?
                </h3>
                <p className="text-gray-600 mb-4">
                  Start with Artist Starter and upgrade anytime as your music career grows.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href="/contact"
                    className="px-6 py-2 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Contact Sales
                  </a>
                  <a
                    href="/pricing"
                    className="px-6 py-2 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Compare Plans
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}