// 🚀 Revolut Webhook Handler
// Process payment confirmations and update subscriptions

import { createClient } from '@supabase/supabase-js';
import { processRevolutWebhook } from '../../../lib/revolut';

// Initialize Supabase with service key for webhook operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Disable default body parsing for webhook signature verification
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log('📥 Revolut webhook received');

    // Get raw body for signature verification
    const body = req.body;
    const signature = req.headers['revolut-signature'] || req.headers['x-revolut-signature'];

    // Verify webhook signature (placeholder - will implement based on Revolut docs)
    // if (!verifyRevolutSignature(body, signature)) {
    //   console.error('❌ Invalid Revolut webhook signature');
    //   return res.status(401).json({ message: 'Invalid signature' });
    // }

    // Process the webhook event
    const result = await processRevolutWebhook(body);

    if (result.status === 'processed') {
      // Update user subscription in Supabase
      await updateUserSubscription(result);
      console.log('✅ Subscription updated for user:', result.customerId);
    }

    // Always respond with 200 to acknowledge receipt
    res.status(200).json({ received: true, status: result.status });

  } catch (error) {
    console.error('❌ Revolut webhook error:', error);
    res.status(500).json({ 
      error: 'Webhook processing failed',
      message: error.message 
    });
  }
}

// Update user subscription in Supabase
async function updateUserSubscription(paymentResult) {
  const { customerId, customerEmail, amount, currency } = paymentResult;

  try {
    // Find the user profile
    const { data: userProfile, error: findError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', customerId)
      .single();

    if (findError || !userProfile) {
      console.error('User profile not found for:', customerId);
      
      // Create user profile if it doesn't exist
      const { error: createError } = await supabase
        .from('user_profiles')
        .insert({
          id: customerId,
          email: customerEmail,
          role: 'artist', // Default role
          subscription_status: 'active',
          subscription_type: getSubscriptionTypeFromAmount(amount),
          billing_interval: getBillingIntervalFromAmount(amount),
          revolut_customer_id: `revolut_${customerId}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (createError) {
        console.error('Error creating user profile:', createError);
        throw createError;
      }

      console.log('✅ Created new user profile for Revolut customer');
      return;
    }

    // Update existing user profile with subscription details
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({
        subscription_status: 'active',
        subscription_type: getSubscriptionTypeFromAmount(amount),
        billing_interval: getBillingIntervalFromAmount(amount),
        revolut_customer_id: `revolut_${customerId}`,
        updated_at: new Date().toISOString()
      })
      .eq('id', customerId);

    if (updateError) {
      console.error('Error updating user subscription:', updateError);
      throw updateError;
    }

    console.log('✅ Updated user subscription via Revolut webhook');

  } catch (error) {
    console.error('Error updating user subscription:', error);
    throw error;
  }
}

// Map payment amount to subscription type
function getSubscriptionTypeFromAmount(amount) {
  const amountMap = {
    9.99: 'artist_starter',
    99.99: 'artist_starter',
    19.99: 'artist_pro', 
    199.99: 'artist_pro',
    29.99: 'label_admin_starter',
    299.99: 'label_admin_starter',
    49.99: 'label_admin_pro',
    499.99: 'label_admin_pro'
  };
  
  return amountMap[amount] || 'artist_starter';
}

// Map payment amount to billing interval
function getBillingIntervalFromAmount(amount) {
  const yearlyAmounts = [99.99, 199.99, 299.99, 499.99];
  return yearlyAmounts.includes(amount) ? 'yearly' : 'monthly';
}

// Log webhook event for debugging
function logWebhookEvent(event) {
  console.log('📊 Revolut Webhook Event:', {
    type: event.type,
    id: event.data?.id,
    amount: event.data?.amount,
    currency: event.data?.currency,
    timestamp: new Date().toISOString()
  });
}
