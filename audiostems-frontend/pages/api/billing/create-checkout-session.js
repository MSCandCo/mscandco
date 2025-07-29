import { createCheckoutSession, getPriceId, STRIPE_CONFIG } from '../../../lib/stripe';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { plan, billingCycle = 'monthly', customerId } = req.body;

    if (!plan) {
      return res.status(400).json({ message: 'Plan is required' });
    }

    // Check if Stripe is configured
    if (!STRIPE_CONFIG.isConfigured) {
      return res.status(500).json({ 
        error: 'Stripe is not configured. Please contact support to set up billing.' 
      });
    }

    const priceId = getPriceId(plan, billingCycle);
    
    if (!priceId) {
      return res.status(400).json({ message: 'Invalid plan or billing cycle' });
    }

    const session = await createCheckoutSession(
      priceId,
      customerId, // Can be null for new customers
      `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'}/billing?success=true`,
      `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'}/billing?canceled=true`
    );

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ 
      error: error.message || 'Error creating checkout session' 
    });
  }
} 