import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return handleGetSubscription(req, res);
  } else if (req.method === 'POST') {
    return handleUpdateSubscription(req, res);
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

// Get user's current subscription
async function handleGetSubscription(req, res) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No authorization token provided' });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Get user's subscription
    const { data: subscription, error } = await supabase
      .from('user_subscriptions')
      .select(`
        *,
        user_profiles!inner(releases_count, wallet_balance, storage_used_mb)
      `)
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching subscription:', error);
      return res.status(500).json({ error: 'Failed to fetch subscription' });
    }

    // If no subscription, return default starter
    if (!subscription) {
      return res.status(200).json({
        subscription: {
          plan: 'artist_starter',
          status: 'inactive',
          max_releases: 5,
          advanced_analytics: false,
          priority_support: false,
          custom_branding: false,
          amount: 29.99,
          currency: 'GBP',
          billing_cycle: 'monthly',
          releases_used: 0,
          storage_used_mb: 0,
          wallet_balance: 0,
          pay_from_wallet: false,
          next_payment_due: null
        },
        plan_features: {
          starter: {
            max_releases: 5,
            advanced_analytics: false,
            chartmetric_access: false,
            acceber_ai_basic: true,
            priority_support: false,
            custom_branding: false,
            price: 29.99
          },
          pro: {
            max_releases: -1, // Unlimited
            advanced_analytics: true,
            chartmetric_access: true,
            acceber_ai_premium: true,
            priority_support: true,
            custom_branding: true,
            price: 99.99
          }
        }
      });
    }

    return res.status(200).json({
      subscription: {
        id: subscription.id,
        plan: subscription.plan,
        status: subscription.status,
        max_releases: subscription.max_releases,
        advanced_analytics: subscription.advanced_analytics,
        priority_support: subscription.priority_support,
        custom_branding: subscription.custom_branding,
        amount: subscription.amount,
        currency: subscription.currency,
        billing_cycle: subscription.billing_cycle,
        releases_used: subscription.user_profiles.releases_count || 0,
        storage_used_mb: subscription.user_profiles.storage_used_mb || 0,
        wallet_balance: subscription.user_profiles.wallet_balance || 0,
        pay_from_wallet: subscription.pay_from_wallet,
        auto_pay_enabled: subscription.auto_pay_enabled,
        current_period_start: subscription.current_period_start,
        current_period_end: subscription.current_period_end,
        next_payment_due: subscription.current_period_end,
        revolut_subscription_id: subscription.revolut_subscription_id
      },
      plan_features: {
        starter: {
          max_releases: 5,
          advanced_analytics: false,
          chartmetric_access: false,
          acceber_ai_basic: true,
          priority_support: false,
          custom_branding: false,
          price: 29.99
        },
        pro: {
          max_releases: -1, // Unlimited
          advanced_analytics: true,
          chartmetric_access: true,
          acceber_ai_premium: true,
          priority_support: true,
          custom_branding: true,
          price: 99.99
        }
      }
    });

  } catch (error) {
    console.error('Error in subscription GET:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Update subscription (switch between Starter ↔ Pro)
async function handleUpdateSubscription(req, res) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No authorization token provided' });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const { newPlan, paymentMethod } = req.body;

    // Validate plan
    if (!['artist_starter', 'artist_pro'].includes(newPlan)) {
      return res.status(400).json({ error: 'Invalid subscription plan' });
    }

    // Get current subscription
    const { data: currentSub } = await supabase
      .from('user_subscriptions')
      .select('*, user_profiles!inner(wallet_balance, releases_count)')
      .eq('user_id', user.id)
      .single();

    // Plan configuration
    const planConfig = {
      artist_starter: {
        max_releases: 5,
        advanced_analytics: false,
        chartmetric_access: false,
        acceber_ai_basic: true,
        acceber_ai_premium: false,
        priority_support: false,
        custom_branding: false,
        amount: 29.99
      },
      artist_pro: {
        max_releases: -1, // Unlimited
        advanced_analytics: true,
        chartmetric_access: true,
        acceber_ai_basic: true,
        acceber_ai_premium: true,
        priority_support: true,
        custom_branding: true,
        amount: 99.99
      }
    };

    const newConfig = planConfig[newPlan];

    // Check if switching from Pro to Starter with too many releases
    if (newPlan === 'artist_starter' && currentSub?.user_profiles?.releases_count > 5) {
      return res.status(400).json({ 
        error: 'Cannot switch to Starter plan - you have more than 5 releases. Please archive some releases first.' 
      });
    }

    // Check wallet balance if paying from wallet
    if (paymentMethod === 'wallet') {
      const walletBalance = currentSub?.user_profiles?.wallet_balance || 0;
      if (walletBalance < newConfig.amount) {
        return res.status(400).json({ 
          error: `Insufficient wallet balance. Required: £${newConfig.amount}, Available: £${walletBalance}` 
        });
      }
    }

    // Calculate new period dates
    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    // Update or create subscription
    const subscriptionData = {
      user_id: user.id,
      user_email: user.email,
      plan: newPlan,
      status: 'active',
      max_releases: newConfig.max_releases,
      advanced_analytics: newConfig.advanced_analytics,
      priority_support: newConfig.priority_support,
      custom_branding: newConfig.custom_branding,
      amount: newConfig.amount,
      currency: 'GBP',
      billing_cycle: 'monthly',
      pay_from_wallet: paymentMethod === 'wallet',
      auto_pay_enabled: true,
      current_period_start: now.toISOString(),
      current_period_end: periodEnd.toISOString(),
      updated_at: now.toISOString()
    };

    const { data: updatedSub, error: updateError } = await supabase
      .from('user_subscriptions')
      .upsert(subscriptionData)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating subscription:', updateError);
      return res.status(500).json({ error: 'Failed to update subscription' });
    }

    // If paying from wallet, create transaction
    if (paymentMethod === 'wallet') {
      const { error: transactionError } = await supabase
        .from('wallet_transactions')
        .insert({
          user_id: user.id,
          transaction_type: 'subscription_payment',
          amount: -newConfig.amount, // Negative for payment
          currency: 'GBP',
          description: `${newPlan === 'artist_starter' ? 'Artist Starter' : 'Artist Pro'} Monthly Subscription`,
          balance_before: currentSub?.user_profiles?.wallet_balance || 0,
          balance_after: (currentSub?.user_profiles?.wallet_balance || 0) - newConfig.amount,
          source_type: 'subscription',
          source_reference_id: updatedSub.id,
          processed: true,
          processed_at: now.toISOString()
        });

      if (transactionError) {
        console.error('Error creating wallet transaction:', transactionError);
        // Don't fail the subscription update, but log the error
      }
    }

    // TODO: Integrate with Revolut for payment processing
    // TODO: Send confirmation email
    // TODO: Update Chartmetric access permissions
    // TODO: Update Acceber AI access level

    return res.status(200).json({
      success: true,
      message: `Successfully switched to ${newPlan === 'artist_starter' ? 'Artist Starter' : 'Artist Pro'}`,
      subscription: updatedSub,
      features_unlocked: newConfig
    });

  } catch (error) {
    console.error('Error in subscription POST:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}