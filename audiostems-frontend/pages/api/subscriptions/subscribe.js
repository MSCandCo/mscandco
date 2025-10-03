// Internal Subscription System - Uses Wallet Balance Only
// No external payments, just deducts from user's wallet

import { createClient } from '@supabase/supabase-js';
import { requireAuth } from '@/lib/rbac/middleware';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Subscription plans with pricing
const SUBSCRIPTION_PLANS = {
  artist_starter: {
    id: 'artist_starter',
    name: 'Artist Starter',
    monthly_price: 7.99,
    yearly_price: 79.99,
    features: ['5 releases maximum', 'Basic analytics dashboard', 'Standard customer support', 'Basic distribution network']
  },
  artist_pro: {
    id: 'artist_pro',
    name: 'Artist Pro',
    monthly_price: 24.99,
    yearly_price: 249.99,
    features: ['Unlimited releases', 'Advanced analytics & insights', 'Priority customer support', 'Premium distribution network', 'Custom branding options', 'Revenue optimization tools']
  },
  label_admin_starter: {
    id: 'label_admin_starter',
    name: 'Label Admin Starter',
    monthly_price: 49.99,
    yearly_price: 499.99,
    features: ['Max 4 artists', 'Max 8 releases', 'Basic label analytics', 'Artist management tools', 'Standard support']
  },
  label_admin_pro: {
    id: 'label_admin_pro',
    name: 'Label Admin Pro',
    monthly_price: 99.99,
    yearly_price: 999.99,
    features: ['Unlimited artists', 'Unlimited releases', 'Advanced label analytics', 'Full artist management suite', 'Priority support', 'Revenue split management']
  }
};

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // req.user and req.userRole are automatically attached by middleware
    const user = req.user;

    const { plan_id, billing_cycle = 'monthly', currency = 'GBP' } = req.body;

    if (!plan_id || !SUBSCRIPTION_PLANS[plan_id]) {
      return res.status(400).json({ error: 'Invalid plan ID' });
    }

    const plan = SUBSCRIPTION_PLANS[plan_id];
    const price = billing_cycle === 'yearly' ? plan.yearly_price : plan.monthly_price;

    // Get current wallet balance
    const { data: currentSub, error: subError } = await supabaseAdmin
      .from('subscriptions')
      .select('wallet_balance, wallet_currency, tier, status')
      .eq('user_id', user.id)
      .single();

    if (subError && subError.code !== 'PGRST116') {
      throw new Error('Failed to get wallet balance');
    }

    let walletBalance = parseFloat(currentSub?.wallet_balance || 0);

    // Auto top-up wallet if insufficient funds
    if (walletBalance < price) {
      const shortfall = price - walletBalance;
      
      try {
        // Get or create Revolut customer
        let customerId = currentSub?.revolut_customer_id;
        
        if (!customerId) {
          const revolutAPI = (await import('@/lib/revolut-real')).default;
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
        }
        
        // Auto-charge the shortfall via Revolut
        const revolutAPI = (await import('@/lib/revolut-real')).default;
        const payment = await revolutAPI.createPayment({
          amount: shortfall,
          currency: currency,
          customer_id: customerId,
          description: `Auto top-up for ${plan.name} subscription`,
          metadata: {
            user_id: user.id,
            type: 'auto_topup_for_subscription',
            subscription_plan: plan_id
          }
        });
        
        // Update wallet balance with auto top-up
        walletBalance += shortfall;
        
        // Record the auto top-up transaction
        await supabaseAdmin
          .from('wallet_transactions')
          .insert({
            user_id: user.id,
            type: 'credit',
            amount: shortfall,
            currency: currency,
            description: `Auto top-up for subscription (${plan.name})`,
            revolut_payment_id: payment.id,
            status: 'completed',
            created_at: now.toISOString()
          });
          
      } catch (topupError) {
        console.error('Auto top-up failed:', topupError);
        return res.status(400).json({ 
          error: 'Payment failed - unable to process subscription',
          details: topupError.message,
          required: price,
          available: walletBalance,
          shortfall: shortfall
        });
      }
    }

    // Calculate subscription period
    const now = new Date();
    const periodEnd = new Date(now);
    if (billing_cycle === 'yearly') {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    } else {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    }

    // Deduct from wallet and activate subscription
    const newWalletBalance = walletBalance - price;

    const subscriptionData = {
      user_id: user.id,
      tier: plan_id,
      status: 'active',
      billing_cycle: billing_cycle,
      amount: price,
      currency: currency,
      started_at: now.toISOString(),
      current_period_end: periodEnd.toISOString(),
      wallet_balance: newWalletBalance,
      wallet_currency: currency,
      updated_at: now.toISOString()
    };

    // Update or create subscription
    const { data: updatedSub, error: updateError } = await supabaseAdmin
      .from('subscriptions')
      .upsert({
        ...subscriptionData,
        created_at: currentSub ? undefined : now.toISOString()
      })
      .select()
      .single();

    if (updateError) {
      throw new Error('Failed to update subscription');
    }

    // Record wallet transaction
    await supabaseAdmin
      .from('wallet_transactions')
      .insert({
        user_id: user.id,
        type: 'debit',
        amount: price,
        currency: currency,
        description: `${plan.name} subscription (${billing_cycle})`,
        subscription_id: updatedSub.id,
        status: 'completed',
        created_at: now.toISOString()
      });

    res.status(200).json({
      success: true,
      subscription: updatedSub,
      plan: plan,
      amount_charged: price,
      new_wallet_balance: newWalletBalance,
      auto_topup_amount: walletBalance > (currentSub?.wallet_balance || 0) ? walletBalance - (currentSub?.wallet_balance || 0) : 0,
      message: `Successfully subscribed to ${plan.name}!`
    });

  } catch (error) {
    console.error('Subscription error:', error);
    res.status(500).json({ 
      error: 'Failed to process subscription',
      details: error.message
    });
  }
}

export default requireAuth()(handler);
