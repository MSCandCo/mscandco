import { createClient } from '@supabase/supabase-js';
import { createRevolutPayment } from '../../../lib/revolut-payment';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { amount, currency = 'GBP', description, planId, billing } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }

    // Get user from authorization token
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Authorization token required' });
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      console.error('User authentication error:', userError);
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

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