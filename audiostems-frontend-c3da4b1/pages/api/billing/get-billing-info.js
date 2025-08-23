import { stripe, STRIPE_CONFIG } from '../../../lib/stripe';
import { getUserRole } from '../../../lib/user-utils';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { user } = req.query;

    if (!user) {
      return res.status(400).json({ message: 'User information is required' });
    }

    // Check if Stripe is configured
    if (!STRIPE_CONFIG.isConfigured) {
      return res.status(500).json({ 
        error: 'Stripe is not configured. Please contact support to set up billing.' 
      });
    }

    const parsedUser = JSON.parse(user);
    const userRole = getUserRole(parsedUser);

    // For admin roles, return no billing required
    if (userRole === 'super_admin' || userRole === 'company_admin' || userRole === 'distribution_partner') {
      return res.status(200).json({
        subscription: null,
        paymentMethod: null,
        billingHistory: [],
        availablePlans: [],
        noBilling: true
      });
    }

    // Get Stripe customer ID from user metadata
    const stripeCustomerId = parsedUser?.app_metadata?.stripe_customer_id;

    if (!stripeCustomerId) {
      // No Stripe customer yet - return empty billing data
      return res.status(200).json({
        subscription: null,
        paymentMethod: null,
        billingHistory: [],
        availablePlans: getRoleSpecificPlans(userRole),
        stripeCustomerId: null,
        userId: parsedUser?.sub
      });
    }

    // Fetch real billing data from Stripe
    const [customer, subscriptions, invoices] = await Promise.all([
      stripe.customers.retrieve(stripeCustomerId),
      stripe.subscriptions.list({ customer: stripeCustomerId, status: 'active' }),
      stripe.invoices.list({ customer: stripeCustomerId, limit: 10 })
    ]);

    // Parse subscription data
    const activeSubscription = subscriptions.data[0];
    let subscriptionData = null;
    
    if (activeSubscription) {
      const price = activeSubscription.items.data[0].price;
      subscriptionData = {
        id: activeSubscription.id,
        plan: price.nickname || `${price.unit_amount / 100} ${price.currency.toUpperCase()}`,
        price: price.unit_amount / 100,
        currency: price.currency,
        nextBilling: new Date(activeSubscription.current_period_end * 1000).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        billingCycle: price.recurring.interval,
        autoRenewDate: new Date(activeSubscription.current_period_end * 1000).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        status: activeSubscription.status,
        features: getRoleSpecificFeatures(userRole)
      };
    }

    // Parse payment method data
    let paymentMethodData = null;
    if (customer.invoice_settings?.default_payment_method) {
      const paymentMethod = await stripe.paymentMethods.retrieve(
        customer.invoice_settings.default_payment_method
      );
      
      paymentMethodData = {
        type: paymentMethod.card.brand.charAt(0).toUpperCase() + paymentMethod.card.brand.slice(1),
        last4: paymentMethod.card.last4,
        expiry: `${paymentMethod.card.exp_month}/${paymentMethod.card.exp_year.toString().slice(-2)}`
      };
    }

    // Parse billing history
    const billingHistory = invoices.data.map(invoice => ({
      id: invoice.id,
      description: invoice.description || `${subscriptionData?.plan || 'Subscription'} - ${subscriptionData?.billingCycle || 'Monthly'}`,
      date: new Date(invoice.created * 1000).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      amount: invoice.amount_paid / 100,
      currency: invoice.currency,
      status: invoice.status === 'paid' ? 'Paid' : 'Pending',
      downloadUrl: invoice.hosted_invoice_url
    }));

    return res.status(200).json({
      subscription: subscriptionData,
      paymentMethod: paymentMethodData,
      billingHistory,
      availablePlans: getRoleSpecificPlans(userRole),
      stripeCustomerId,
      userId: parsedUser?.sub
    });

  } catch (error) {
    console.error('Error fetching billing data:', error);
    return res.status(500).json({ 
      error: error.message || 'Error fetching billing data' 
    });
  }
}

function getRoleSpecificPlans(userRole) {
  if (userRole === 'label_admin') {
    return [
      {
        name: 'Label Admin',
        monthlyPrice: 29.99,
        yearlyPrice: 299.99,
        yearlySavings: '17%',
        current: true,
        features: getRoleSpecificFeatures(userRole)
      }
    ];
  }

  // Default Artist plans
  return [
    {
      name: 'Artist Starter',
      monthlyPrice: 9.99,
      yearlyPrice: 99.99,
      yearlySavings: '17%',
      current: false,
      features: [
        'Up to 10 releases per year',
        'Basic analytics and reporting',
        'Email support',
        'Distribution to major platforms',
        'Basic earnings tracking',
        'Release management tools'
      ]
    },
    {
      name: 'Artist Pro',
      monthlyPrice: 19.99,
      yearlyPrice: 199.99,
      yearlySavings: '17%',
      current: true,
      features: getRoleSpecificFeatures(userRole)
    }
  ];
}

function getRoleSpecificFeatures(userRole) {
  if (userRole === 'label_admin') {
    return [
      'Manage unlimited artists',
      'Label-wide analytics dashboard',
      'Priority support',
      'Artist management tools',
      'Combined earnings reporting',
      'Label branding options',
      'Advanced release management',
      'Artist onboarding tools',
      'Label social media integration',
      'Marketing campaign management',
      'Royalty tracking for all artists',
      'Label profile optimization'
    ];
  }

  // Default Artist features
  return [
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
    'Custom artist profile optimization'
  ];
}