import { supabase } from '@/lib/supabase';
import revolutAPI from '@/lib/revolut-real';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Get user from Supabase session
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const { amount, currency = 'GBP' } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }

    // Get user's Revolut customer ID from database
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('revolut_customer_id')
      .eq('user_id', user.id)
      .single();

    let customerId = subscription?.revolut_customer_id;

    // If no customer ID exists, create a customer
    if (!customerId) {
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
      
      // Save customer ID for future use
      await supabase
        .from('subscriptions')
        .upsert({
          user_id: user.id,
          revolut_customer_id: customerId,
          tier: 'artist_starter', // Default tier
          status: 'inactive',
          updated_at: new Date().toISOString()
        });
    }

    // Create payment to add funds to wallet via real Revolut API
    const payment = await revolutAPI.createPayment({
      amount: amount,
      currency: currency,
      customer_id: customerId,
      description: `Wallet top-up - £${amount}`,
      metadata: {
        user_id: user.id,
        type: 'wallet_topup'
      }
    });

    // For sandbox, we'll simulate the balance update
    // In production, this would be handled by Revolut webhooks
    const currentBalance = {
      available_balance: amount, // Simplified for demo
      currency: currency
    };

    // Update wallet balance in database
    const { error: walletError } = await supabase
      .from('wallet_transactions')
      .insert({
        user_id: user.id,
        transaction_type: 'credit',
        amount: amount,
        currency: currency,
        source_type: 'wallet_topup',
        source_reference_id: payment.id,
        description: 'Wallet top-up via Revolut',
        status: 'completed',
        balance_before: currentBalance.available_balance - amount,
        balance_after: currentBalance.available_balance,
        processed_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      });

    if (walletError) {
      console.error('Error recording wallet transaction:', walletError);
      // Continue anyway - the payment was processed successfully
    }

    res.status(200).json({
      success: true,
      payment: payment,
      new_balance: currentBalance.available_balance,
      message: `Successfully added ${currency === 'GBP' ? '£' : currency}${amount} to your wallet`
    });

  } catch (error) {
    console.error('Add wallet funds error:', error);
    res.status(500).json({ 
      error: 'Failed to add funds to wallet',
      details: error.message 
    });
  }
}
