import { createClient } from '@supabase/supabase-js';
import revolutAPI from '@/lib/revolut-real';

// Use service role for database operations
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

    // Get user from Supabase session using regular client
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

    // Get or create user subscription record using admin client
    let { data: subscription, error: subError } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single();

    let customerId = subscription?.revolut_customer_id;
    let currentBalance = parseFloat(subscription?.wallet_balance || 0);

    // If no subscription record exists, create one
    if (!subscription) {
      try {
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
        const newBalance = parseFloat(amount);
        
        // Create new subscription record
        const { data: newSub, error: insertError } = await supabaseAdmin
          .from('subscriptions')
          .insert({
            user_id: user.id,
            revolut_customer_id: customerId,
            tier: 'artist_starter',
            status: 'inactive',
            wallet_balance: newBalance,
            wallet_currency: currency,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (insertError) {
          console.error('Error creating subscription record:', insertError);
          return res.status(500).json({ error: 'Failed to create subscription record' });
        }

        currentBalance = newBalance;
      } catch (customerError) {
        console.error('Error creating Revolut customer:', customerError);
        return res.status(500).json({ error: 'Failed to create customer account' });
      }
    } else {
      // Update existing wallet balance
      const newBalance = currentBalance + parseFloat(amount);
      
      const { error: updateError } = await supabaseAdmin
        .from('subscriptions')
        .update({
          wallet_balance: newBalance,
          wallet_currency: currency,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Error updating wallet balance:', updateError);
        return res.status(500).json({ error: 'Failed to update wallet balance' });
      }

      currentBalance = newBalance;
    }

    // Create payment with Revolut (simulated for sandbox)
    try {
      const payment = await revolutAPI.createPayment({
        amount: amount,
        currency: currency,
        customer_id: customerId,
        description: `Wallet top-up - ${currency}${amount}`,
        metadata: {
          user_id: user.id,
          type: 'wallet_topup'
        }
      });

      res.status(200).json({
        success: true,
        payment: payment,
        new_balance: currentBalance,
        currency: currency,
        message: `Successfully added ${currency === 'GBP' ? '£' : currency}${amount} to your wallet`
      });

    } catch (paymentError) {
      console.error('Revolut payment error:', paymentError);
      return res.status(500).json({ 
        error: 'Payment processing failed',
        details: paymentError.message 
      });
    }

  } catch (error) {
    console.error('Add wallet funds error:', error);
    res.status(500).json({ 
      error: 'Failed to add funds to wallet',
      details: error.message 
    });
  }
}