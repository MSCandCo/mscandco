import { createCheckoutSession, getPriceId, STRIPE_CONFIG } from '../../../lib/stripe';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { plan, priceId, billingCycle = 'monthly', customerId, successUrl, cancelUrl } = req.body;

    // Check if Stripe is configured
    if (!STRIPE_CONFIG.isConfigured) {
      return res.status(500).json({ 
        error: 'Stripe is not configured. Please contact support to set up billing.' 
      });
    }

    // Support both priceId (direct) and plan (lookup) approaches
    let finalPriceId;
    
    if (priceId) {
      // If priceId is provided directly, use the lookup function
      finalPriceId = getPriceId(priceId, billingCycle);
    } else if (plan) {
      // Legacy support for plan parameter
      finalPriceId = getPriceId(plan, billingCycle);
    } else {
      return res.status(400).json({ message: 'Plan or priceId is required' });
    }
    
    if (!finalPriceId) {
      return res.status(400).json({ message: 'Invalid plan or billing cycle' });
    }

    const session = await createCheckoutSession(
      finalPriceId,
      customerId, // Can be null for new customers
      successUrl || `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'}/billing?success=true`,
      cancelUrl || `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'}/billing?canceled=true`
    );

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ 
      error: error.message || 'Error creating checkout session' 
    });
  }
} 