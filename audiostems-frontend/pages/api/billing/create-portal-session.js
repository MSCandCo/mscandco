import { createCustomerPortalSession, STRIPE_CONFIG } from '../../../lib/stripe';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { customerId } = req.body;

    // Check if Stripe is configured
    if (!STRIPE_CONFIG.isConfigured) {
      return res.status(500).json({ 
        error: 'Stripe is not configured. Please contact support to set up billing.' 
      });
    }

    // For new customers without a customer ID, redirect to checkout instead
    if (!customerId) {
      return res.status(400).json({ 
        error: 'Please subscribe to a plan first to access billing management.' 
      });
    }

    const session = await createCustomerPortalSession(
      customerId,
      `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'}/billing`
    );

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Error creating portal session:', error);
    res.status(500).json({ 
      error: error.message || 'Error creating portal session' 
    });
  }
} 