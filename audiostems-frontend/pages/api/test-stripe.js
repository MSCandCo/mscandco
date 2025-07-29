import { STRIPE_CONFIG, getPriceId } from '../../lib/stripe';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Test Stripe configuration
    const config = {
      isConfigured: STRIPE_CONFIG.isConfigured,
      hasPublishableKey: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      hasSecretKey: !!process.env.STRIPE_SECRET_KEY,
      hasWebhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
    };

    // Test price IDs
    const priceIds = {
      artist_starter_monthly: getPriceId('Artist Starter', 'monthly'),
      artist_starter_yearly: getPriceId('Artist Starter', 'yearly'),
      artist_pro_monthly: getPriceId('Artist Pro', 'monthly'),
      artist_pro_yearly: getPriceId('Artist Pro', 'yearly'),
      label_admin_monthly: getPriceId('Label Admin', 'monthly'),
      label_admin_yearly: getPriceId('Label Admin', 'yearly'),
    };

    res.status(200).json({
      success: true,
      config,
      priceIds,
      message: 'Stripe configuration test completed'
    });
  } catch (error) {
    console.error('Error testing Stripe configuration:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Error testing Stripe configuration' 
    });
  }
} 