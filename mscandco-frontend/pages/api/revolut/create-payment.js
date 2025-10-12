import { createClient } from '@supabase/supabase-js';
import { createRevolutPayment } from '../../../lib/revolut-payment';
import { requireAuth } from '@/lib/rbac/middleware';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { amount, currency = 'GBP', description, planId, billing } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }

    // req.user and req.userRole are automatically attached by middleware
    const user = req.user;
    const userId = user.id;
    const userEmail = user.email;

    // Use the new Revolut payment helper with proper redirect URLs
    const paymentResult = await createRevolutPayment({
      amount,
      currency,
      description,
      planId,
      billing,
      userId,
      userEmail,
      baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3013'
    });

    if (!paymentResult.success) {
      throw new Error('Payment creation failed');
    }

    res.json({
      success: true,
      paymentUrl: paymentResult.checkoutUrl,
      orderId: paymentResult.orderId,
      amount: paymentResult.amount,
      currency: paymentResult.currency,
      originalAmount: paymentResult.originalAmount
    });

  } catch (error) {
    console.error('Revolut payment creation failed:', error);
    
    if (error.message.includes('not configured')) {
      return res.status(500).json({ 
        error: 'Revolut API not configured', 
        details: error.message
      });
    }

    res.status(500).json({ 
      error: 'Payment creation failed', 
      details: error.message
    });
  }
}

export default requireAuth()(handler);