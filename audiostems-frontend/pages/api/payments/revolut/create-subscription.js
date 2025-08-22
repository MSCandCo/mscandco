import { supabase } from '@/lib/supabase';
import mockRevolutAPI from '@/lib/revolut-mock';

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

    const { plan_id, customer_data } = req.body;

    if (!plan_id) {
      return res.status(400).json({ error: 'Plan ID is required' });
    }

    // Get subscription plans
    const plans = mockRevolutAPI.getSubscriptionPlans();
    const selectedPlan = plans[plan_id];
    
    if (!selectedPlan) {
      return res.status(400).json({ error: 'Invalid plan ID' });
    }

    // Authenticate with mock Revolut API
    await mockRevolutAPI.authenticate();

    // Create or get customer
    let customer;
    try {
      // Try to get existing customer first (in real app, we'd store customer_id in database)
      const existingCustomerData = customer_data || {
        email: user.email,
        name: `${user.user_metadata?.firstName || 'User'} ${user.user_metadata?.lastName || ''}`.trim() || user.email.split('@')[0]
      };
      
      customer = await mockRevolutAPI.createCustomer(existingCustomerData);
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

    const subscription = await mockRevolutAPI.createSubscription(subscriptionData);

    // Update user subscription in Supabase
    const { error: updateError } = await supabase
      .from('subscriptions')
      .upsert({
        user_id: user.id,
        tier: plan_id,
        status: 'active',
        revolut_subscription_id: subscription.id,
        revolut_customer_id: customer.id,
        started_at: subscription.created_at,
        current_period_end: subscription.current_period_end,
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
