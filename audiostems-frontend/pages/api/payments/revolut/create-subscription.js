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

    const { plan_id, billing_cycle = 'monthly', currency = 'GBP', amount, customer_data } = req.body;

    if (!plan_id) {
      return res.status(400).json({ error: 'Plan ID is required' });
    }

    // Extract base plan ID (remove billing cycle suffix if present)
    const basePlanId = plan_id.replace(/_monthly|_yearly/, '');
    
    // Get subscription plans
    const plans = revolutAPI.getSubscriptionPlans();
    const selectedPlan = plans[basePlanId];
    
    if (!selectedPlan) {
      return res.status(400).json({ error: 'Invalid plan ID' });
    }

    // Create or get customer with real Revolut API
    let customer;
    try {
      const customerData = customer_data || {
        email: user.email,
        name: `${user.user_metadata?.firstName || 'User'} ${user.user_metadata?.lastName || ''}`.trim() || user.email.split('@')[0],
        phone: user.user_metadata?.phone || null,
        address: {
          street_line_1: user.user_metadata?.address || '',
          city: user.user_metadata?.city || '',
          country: user.user_metadata?.country || 'GB',
          postcode: user.user_metadata?.postcode || ''
        }
      };
      
      customer = await revolutAPI.createCustomer(customerData);
    } catch (error) {
      console.error('Error creating customer:', error);
      return res.status(500).json({ error: 'Failed to create customer' });
    }

    // Check wallet balance and auto top-up if needed
    const subscriptionPrice = amount || selectedPlan.amount;
    
    // Get current wallet balance
    const { data: currentSub } = await supabaseAdmin
      .from('subscriptions')
      .select('wallet_balance, wallet_currency')
      .eq('user_id', user.id)
      .single();
    
    let walletBalance = parseFloat(currentSub?.wallet_balance || 0);
    let autoTopupAmount = 0;
    
    // Auto top-up if insufficient funds
    if (walletBalance < subscriptionPrice) {
      autoTopupAmount = subscriptionPrice - walletBalance;
      
      // Create payment for auto top-up
      const topupPayment = await revolutAPI.createPayment({
        amount: autoTopupAmount,
        currency: currency,
        customer_id: customer.id,
        description: `Auto top-up for ${selectedPlan.name} subscription`,
        metadata: {
          user_id: user.id,
          type: 'auto_topup_for_subscription'
        }
      });
      
      // Update wallet balance
      walletBalance += autoTopupAmount;
      
      // Record auto top-up transaction
      await supabaseAdmin
        .from('wallet_transactions')
        .insert({
          user_id: user.id,
          type: 'credit',
          amount: autoTopupAmount,
          currency: currency,
          description: `Auto top-up for subscription (${selectedPlan.name})`,
          revolut_payment_id: topupPayment.id,
          status: 'completed',
          created_at: new Date().toISOString()
        });
    }

    // Create subscription (this is now just for tracking, payment comes from wallet)
    const subscriptionData = {
      customer_id: customer.id,
      plan_id: plan_id,
      amount: subscriptionPrice,
      currency: currency,
      interval: selectedPlan.interval,
      metadata: {
        user_id: user.id,
        user_email: user.email,
        plan_name: selectedPlan.name
      }
    };

    const revolutSubscription = await revolutAPI.createSubscription(subscriptionData);

    // Calculate period end based on billing cycle
    const periodLength = billing_cycle === 'yearly' ? 365 : 30;
    const periodEnd = new Date(Date.now() + periodLength * 24 * 60 * 60 * 1000);

    // Deduct subscription amount from wallet
    const newWalletBalance = walletBalance - subscriptionPrice;
    
    // Record subscription payment transaction
    await supabaseAdmin
      .from('wallet_transactions')
      .insert({
        user_id: user.id,
        type: 'debit',
        amount: subscriptionPrice,
        currency: currency,
        description: `${selectedPlan.name} subscription (${billing_cycle})`,
        subscription_id: revolutSubscription.id,
        status: 'completed',
        created_at: new Date().toISOString()
      });

    // Update user subscription in Supabase using admin client
    const subscriptionRecord = {
      user_id: user.id,
      tier: basePlanId,
      billing_cycle: billing_cycle,
      status: 'active',
      revolut_subscription_id: revolutSubscription.id,
      revolut_customer_id: customer.id,
      started_at: revolutSubscription.created_at || new Date().toISOString(),
      current_period_end: revolutSubscription.current_period_end || periodEnd.toISOString(),
      amount: subscriptionPrice,
      currency: currency,
      wallet_balance: newWalletBalance,
      wallet_currency: currency,
      updated_at: new Date().toISOString()
    };

    // Check if subscription exists, if so update, otherwise insert
    const { data: existingSub } = await supabaseAdmin
      .from('subscriptions')
      .select('id')
      .eq('user_id', user.id)
      .single();

    let dbResult;
    if (existingSub) {
      // Update existing subscription
      dbResult = await supabaseAdmin
        .from('subscriptions')
        .update(subscriptionRecord)
        .eq('user_id', user.id)
        .select()
        .single();
    } else {
      // Insert new subscription
      dbResult = await supabaseAdmin
        .from('subscriptions')
        .insert({
          ...subscriptionRecord,
          created_at: new Date().toISOString()
        })
        .select()
        .single();
    }

    if (dbResult.error) {
      console.error('Error updating subscription in database:', dbResult.error);
      // Continue anyway - the Revolut subscription was created successfully
    }

    res.status(200).json({
      success: true,
      subscription: dbResult.data,
      plan: selectedPlan,
      amount_charged: subscriptionPrice,
      new_wallet_balance: newWalletBalance,
      auto_topup_amount: autoTopupAmount,
      message: 'Subscription created successfully'
    });

  } catch (error) {
    console.error('Create subscription error:', error);
    res.status(500).json({ 
      error: 'Failed to create subscription',
      details: error.message 
    });
  }
}