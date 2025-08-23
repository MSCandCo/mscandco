// Wallet Funding via Revolut - Real Money Gateway
// This is the ONLY place that touches real money

import { createClient } from '@supabase/supabase-js';
import revolutAPI from '@/lib/revolut-real';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Get user
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const { amount, currency = 'GBP' } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }

    // Get or create Revolut customer
    let { data: subscription } = await supabaseAdmin
      .from('subscriptions')
      .select('revolut_customer_id, wallet_balance')
      .eq('user_id', user.id)
      .single();

    let customerId = subscription?.revolut_customer_id;

    if (!customerId) {
      // Create Revolut customer
      const customer = await revolutAPI.createCustomer({
        email: user.email,
        name: `${user.user_metadata?.firstName || 'User'} ${user.user_metadata?.lastName || ''}`.trim() || user.email.split('@')[0],
        phone: user.user_metadata?.phone || null,
        address: {
          street_line_1: user.user_metadata?.address || '',
          city: user.user_metadata?.city || '',
          country: user.user_metadata?.country || 'GB',
          postcode: user.user_metadata?.postcode || ''
        }
      });
      
      customerId = customer.id;
      
      // Save customer ID
      await supabaseAdmin
        .from('subscriptions')
        .upsert({
          user_id: user.id,
          revolut_customer_id: customerId,
          wallet_balance: 0,
          wallet_currency: currency,
          tier: 'none',
          status: 'inactive',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
    }

    // Process payment through Revolut
    const payment = await revolutAPI.createPayment({
      amount: amount,
      currency: currency,
      customer_id: customerId,
      description: `Wallet funding - ${currency}${amount}`,
      metadata: {
        user_id: user.id,
        type: 'wallet_funding'
      }
    });

    // Add funds to wallet balance
    const currentBalance = parseFloat(subscription?.wallet_balance || 0);
    const newBalance = currentBalance + parseFloat(amount);

    await supabaseAdmin
      .from('subscriptions')
      .update({
        wallet_balance: newBalance,
        wallet_currency: currency,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    // Record transaction
    await supabaseAdmin
      .from('wallet_transactions')
      .insert({
        user_id: user.id,
        type: 'credit',
        amount: parseFloat(amount),
        currency: currency,
        description: 'Wallet funding via Revolut',
        revolut_payment_id: payment.id,
        status: 'completed',
        created_at: new Date().toISOString()
      });

    res.status(200).json({
      success: true,
      payment_id: payment.id,
      new_balance: newBalance,
      currency: currency,
      message: `Successfully added ${currency}${amount} to your wallet`
    });

  } catch (error) {
    console.error('Wallet funding error:', error);
    res.status(500).json({ 
      error: 'Failed to add funds to wallet',
      details: error.message 
    });
  }
}
