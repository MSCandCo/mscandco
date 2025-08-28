import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { planId, billing = 'monthly' } = req.body;

    if (!planId) {
      return res.status(400).json({ 
        error: 'Missing required field: planId' 
      });
    }

    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Authorization token required' });
    }

    let userInfo;
    try {
      userInfo = jwt.decode(token);
    } catch (jwtError) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const userId = userInfo?.sub;
    const userEmail = userInfo?.email?.toLowerCase() || '';

    if (!userId) {
      return res.status(401).json({ error: 'Invalid user token' });
    }

    const planPricing = {
      'artist-starter': { monthly: 9.99, yearly: 99.99 },
      'artist-pro': { monthly: 19.99, yearly: 199.99 },
      'label-starter': { monthly: 49.99, yearly: 499.99 },
      'label-pro': { monthly: 99.99, yearly: 999.99 }
    };

    if (!planPricing[planId]) {
      return res.status(400).json({ error: 'Invalid plan ID' });
    }

    const planCost = planPricing[planId][billing];
    const planName = planId.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());

    console.log('Wallet subscription payment:', {
      userEmail,
      planId,
      billing,
      cost: planCost
    });

    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('wallet_balance')
      .eq('id', userId)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error fetching user profile:', profileError);
      return res.status(500).json({ 
        error: 'Failed to fetch wallet balance',
        details: profileError.message 
      });
    }

    const currentBalance = profile?.wallet_balance || 0;

    if (currentBalance < planCost) {
      return res.status(400).json({
        error: 'Insufficient wallet balance',
        required: planCost,
        available: currentBalance,
        shortfall: planCost - currentBalance
      });
    }

    const newBalance = currentBalance - planCost;

    const { error: walletError } = await supabase
      .from('user_profiles')
      .update({
        wallet_balance: newBalance,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (walletError) {
      console.error('Error updating wallet balance:', walletError);
      return res.status(500).json({ 
        error: 'Failed to deduct from wallet',
        details: walletError.message 
      });
    }

    const { error: transactionError } = await supabase
      .from('wallet_transactions')
      .insert({
        user_id: userId,
        transaction_type: 'commission', // Use existing enum value
        amount: -planCost, // Negative for debit
        currency: 'GBP',
        description: `Subscription payment: ${planName} (${billing})`,
        balance_before: currentBalance,
        balance_after: newBalance,
        source_type: 'subscription',
        platform: 'wallet',
        processed: true,
        processed_at: new Date().toISOString(),
        processed_by_user_id: userId,
        metadata: {
          plan_id: planId,
          billing_cycle: billing,
          subscription_payment: true
        },
        notes: `Wallet payment for ${planName} subscription`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    const tierMapping = {
      'artist-starter': 'artist_starter',
      'artist-pro': 'artist_pro',
      'label-starter': 'label_starter',
      'label-pro': 'label_pro'
    };

    const tier = tierMapping[planId] || planId;

    const now = new Date();
    const periodEnd = new Date(now);
    const nextRenewalDate = new Date(now);
    
    if (billing === 'yearly') {
      periodEnd.setFullYear(now.getFullYear() + 1);
      nextRenewalDate.setFullYear(now.getFullYear() + 1);
    } else {
      periodEnd.setMonth(now.getMonth() + 1);
      nextRenewalDate.setMonth(now.getMonth() + 1);
    }

    const { data: existingSubscription, error: checkError } = await supabase
      .from('subscriptions')
      .select('id, status')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing subscription:', checkError);
      return res.status(500).json({ 
        error: 'Failed to check existing subscription',
        details: checkError.message 
      });
    }

    let subscriptionResult;

    if (existingSubscription) {
      const { data: updatedSub, error: updateError } = await supabase
        .from('subscriptions')
        .update({
          tier,
          billing_cycle: billing,
          amount: planCost,
          currency: 'GBP',
          current_period_end: periodEnd.toISOString(),
          next_renewal_date: nextRenewalDate.toISOString(),
          auto_renew: true,
          updated_at: now.toISOString()
        })
        .eq('id', existingSubscription.id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating subscription:', updateError);
        return res.status(500).json({ 
          error: 'Failed to update subscription',
          details: updateError.message 
        });
      }

      subscriptionResult = { ...updatedSub, action: 'updated' };
    } else {
      const { data: newSub, error: insertError } = await supabase
        .from('subscriptions')
        .insert({
          user_id: userId,
          tier,
          status: 'active',
          billing_cycle: billing,
          amount: planCost,
          currency: 'GBP',
          current_period_start: now.toISOString(),
          current_period_end: periodEnd.toISOString(),
          next_renewal_date: nextRenewalDate.toISOString(),
          auto_renew: true,
          created_at: now.toISOString(),
          updated_at: now.toISOString()
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error creating subscription:', insertError);
        return res.status(500).json({ 
          error: 'Failed to create subscription',
          details: insertError.message 
        });
      }

      subscriptionResult = { ...newSub, action: 'created' };
    }

    console.log('Wallet subscription payment successful:', {
      userEmail,
      planName,
      cost: planCost,
      previousBalance: currentBalance,
      newBalance,
      subscriptionAction: subscriptionResult.action
    });

    res.json({
      success: true,
      message: `Subscription ${subscriptionResult.action} successfully using wallet balance`,
      subscription: {
        id: subscriptionResult.id,
        tier: subscriptionResult.tier,
        planName,
        billing,
        amount: planCost,
        currency: 'GBP',
        status: 'active',
        expiresAt: subscriptionResult.current_period_end,
        action: subscriptionResult.action
      },
      wallet: {
        previousBalance: currentBalance,
        newBalance,
        amountDeducted: planCost
      }
    });

  } catch (error) {
    console.error('Wallet subscription payment failed:', error);
    res.status(500).json({ 
      error: 'Wallet subscription payment failed', 
      details: error.message 
    });
  }
}
