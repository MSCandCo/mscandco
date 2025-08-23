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

    // Create subscription
    const subscriptionData = {
      customer_id: customer.id,
      plan_id: plan_id,
      amount: selectedPlan.amount,
      currency: selectedPlan.currency,
      interval: selectedPlan.interval,
      metadata: {
        user_id: user.id,
        user_email: user.email,
        plan_name: selectedPlan.name
      }
    };

    const subscription = await revolutAPI.createSubscription(subscriptionData);

    // Calculate period end based on billing cycle
    const periodLength = billing_cycle === 'yearly' ? 365 : 30;
    const periodEnd = new Date(Date.now() + periodLength * 24 * 60 * 60 * 1000);

    // Update user subscription in Supabase
    const { error: updateError } = await supabase
      .from('subscriptions')
      .upsert({
        user_id: user.id,
        tier: basePlanId,
        billing_cycle: billing_cycle,
        status: 'active',
        revolut_subscription_id: subscription.id,
        revolut_customer_id: customer.id,
        started_at: subscription.created_at || new Date().toISOString(),
        current_period_end: subscription.current_period_end || periodEnd.toISOString(),
        amount: amount,
        currency: currency,
        updated_at: new Date().toISOString()
      });

    if (updateError) {
      console.error('Error updating subscription in database:', updateError);
      // Continue anyway - the Revolut subscription was created successfully
    }

    res.status(200).json({
      success: true,
      subscription: subscription,
      customer: customer,
      plan: selectedPlan,
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
