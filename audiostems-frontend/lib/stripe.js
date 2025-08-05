import Stripe from 'stripe';
import { loadStripe } from '@stripe/stripe-js';

// Check if Stripe keys are configured
const isStripeConfigured = () => {
  return process.env.STRIPE_SECRET_KEY && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
};

// Server-side Stripe instance with error handling
export const stripe = isStripeConfigured() 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    })
  : null;

// Client-side Stripe instance with error handling
export const getStripe = () => {
  if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    console.warn('Stripe publishable key not configured');
    return null;
  }
  return loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
};

// Stripe configuration
export const STRIPE_CONFIG = {
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  secretKey: process.env.STRIPE_SECRET_KEY,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  isConfigured: isStripeConfigured(),
};

// Product IDs for different plans
export const STRIPE_PRODUCTS = {
  artist_starter: {
    monthly: process.env.STRIPE_ARTIST_STARTER_MONTHLY_PRICE_ID,
    yearly: process.env.STRIPE_ARTIST_STARTER_YEARLY_PRICE_ID,
  },
  artist_pro: {
    monthly: process.env.STRIPE_ARTIST_PRO_MONTHLY_PRICE_ID,
    yearly: process.env.STRIPE_ARTIST_PRO_YEARLY_PRICE_ID,
  },
  company_admin: {
    monthly: process.env.STRIPE_COMPANY_ADMIN_MONTHLY_PRICE_ID,
    yearly: process.env.STRIPE_COMPANY_ADMIN_YEARLY_PRICE_ID,
  },
  label_admin_starter: {
    monthly: process.env.STRIPE_LABEL_ADMIN_STARTER_MONTHLY_PRICE_ID,
    yearly: process.env.STRIPE_LABEL_ADMIN_STARTER_YEARLY_PRICE_ID,
  },
  label_admin_pro: {
    monthly: process.env.STRIPE_LABEL_ADMIN_PRO_MONTHLY_PRICE_ID,
    yearly: process.env.STRIPE_LABEL_ADMIN_PRO_YEARLY_PRICE_ID,
  },
  distribution_partner: {
    monthly: process.env.STRIPE_DISTRIBUTION_PARTNER_MONTHLY_PRICE_ID,
    yearly: process.env.STRIPE_DISTRIBUTION_PARTNER_YEARLY_PRICE_ID,
  },
};

// Helper function to get price ID based on plan and billing cycle
export const getPriceId = (plan, billingCycle = 'monthly') => {
  const productKey = plan.toLowerCase().replace(/\s+/g, '_');
  return STRIPE_PRODUCTS[productKey]?.[billingCycle];
};

// Helper function to create customer portal session
export const createCustomerPortalSession = async (customerId, returnUrl) => {
  if (!stripe) {
    throw new Error('Stripe is not configured. Please set up your Stripe environment variables.');
  }
  
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
    return session;
  } catch (error) {
    console.error('Error creating customer portal session:', error);
    throw error;
  }
};

// Helper function to create checkout session
export const createCheckoutSession = async (priceId, customerId, successUrl, cancelUrl) => {
  if (!stripe) {
    throw new Error('Stripe is not configured. Please set up your Stripe environment variables.');
  }
  
  try {
    const sessionConfig = {
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      allow_promotion_codes: true,
    };

    // Only add customer if provided (for new customers, Stripe will create one automatically)
    if (customerId) {
      sessionConfig.customer = customerId;
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);
    return session;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
}; 