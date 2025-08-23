import { stripe } from '../../../lib/stripe';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service key for server-side operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Disable default body parsing to get raw body for Stripe webhook signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper function to get raw body
const getRawBody = (req) => {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    // Get raw body for signature verification
    const rawBody = await getRawBody(req);
    event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ message: 'Webhook signature verification failed' });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
        break;
        
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;
      
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
      
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;
      
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
      
      case 'customer.subscription.trial_will_end':
        await handleTrialWillEnd(event.data.object);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ 
      message: 'Error processing webhook',
      error: error.message 
    });
  }
}

async function handleCheckoutCompleted(session) {
  console.log('🎯 Checkout session completed:', session.id);
  console.log('🎯 Session metadata:', session.metadata);
  console.log('🎯 Session customer:', session.customer);
  
  // Link the Stripe customer to the user profile using our enterprise schema
  if (session.metadata?.userId && session.customer) {
    try {
      // Update by id (primary key that references auth.users(id))
      const { error } = await supabase
        .from('user_profiles')
        .update({ 
          stripe_customer_id: session.customer,
          updated_at: new Date().toISOString()
        })
        .eq('id', session.metadata.userId); // Use 'id' not 'user_id'
        
      if (error) {
        console.error('❌ Error linking Stripe customer to user:', error);
        
        // Try to create the user profile if it doesn't exist
        console.log('🔄 Attempting to create user profile...');
        const { error: insertError } = await supabase
          .from('user_profiles')
          .insert({ 
            id: session.metadata.userId,
            email: session.metadata.userEmail || session.customer_details?.email,
            stripe_customer_id: session.customer,
            role: 'artist', // Default role
            subscription_tier: 'starter', // Default tier
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
          
        if (insertError) {
          console.error('❌ Error creating user profile:', insertError);
        } else {
          console.log('✅ Successfully created user profile with Stripe customer link');
        }
      } else {
        console.log('✅ Successfully linked Stripe customer', session.customer, 'to user', session.metadata.userId);
      }
    } catch (error) {
      console.error('💥 Unexpected error updating user profile with Stripe customer ID:', error);
    }
  } else {
    console.error('❌ Missing userId or customer in checkout session');
  }
}

async function handleSubscriptionCreated(subscription) {
  console.log('Subscription created:', subscription.id);
  await updateUserSubscription(subscription.customer, subscription, 'created');
}

async function handleSubscriptionUpdated(subscription) {
  console.log('Subscription updated:', subscription.id);
  await updateUserSubscription(subscription.customer, subscription, 'updated');
}

async function handleSubscriptionDeleted(subscription) {
  console.log('Subscription deleted:', subscription.id);
  await updateUserSubscription(subscription.customer, subscription, 'deleted');
}

async function handlePaymentSucceeded(invoice) {
  console.log('Payment succeeded:', invoice.id);
  // Update payment status in your database
  // await updatePaymentStatus(invoice.customer, invoice);
}

async function handlePaymentFailed(invoice) {
  console.log('Payment failed:', invoice.id);
  // Update payment status and notify user
  // await updatePaymentStatus(invoice.customer, invoice);
  // await notifyUserOfPaymentFailure(invoice.customer);
}

async function handleTrialWillEnd(subscription) {
  console.log('Trial will end:', subscription.id);
  // Notify user that trial is ending
  // await notifyUserOfTrialEnd(subscription.customer);
}

// Helper function to map Stripe price ID to subscription plan
function getSubscriptionPlan(priceId) {
  const pricePlans = {
    'price_1Rsf8jEbz7hJzxJVL4PddB68': { type: 'artist_starter', interval: 'monthly' },
    'price_1Rsf95Ebz7hJzxJVdsKFDu6v': { type: 'artist_starter', interval: 'yearly' },
    'price_1RsfC6Ebz7hJzxJVunfzoZUD': { type: 'artist_pro', interval: 'monthly' },
    'price_1RsfCLEbz7hJzxJV1LnfFIcS': { type: 'artist_pro', interval: 'yearly' },
    'price_1RsfCvEbz7hJzxJV5Ev8mZk6': { type: 'label_admin_starter', interval: 'monthly' },
    'price_1RsfD7Ebz7hJzxJVmS7BGMGH': { type: 'label_admin_starter', interval: 'yearly' },
    'price_1Rsph0Ebz7hJzxJVEHqJ8sye': { type: 'label_admin_pro', interval: 'monthly' },
    'price_1RsphDEbz7hJzxJVk4smCHyg': { type: 'label_admin_pro', interval: 'yearly' }
  };
  
  return pricePlans[priceId] || { type: 'unknown', interval: 'monthly' };
}

// Main function to update user subscription in Supabase
async function updateUserSubscription(stripeCustomerId, subscription, action) {
  try {
    console.log(`Processing subscription ${action} for customer:`, stripeCustomerId);
    
    // Get the first subscription item (assuming single product subscriptions)
    const priceId = subscription.items?.data?.[0]?.price?.id;
    if (!priceId) {
      console.error('No price ID found in subscription');
      return;
    }
    
    const plan = getSubscriptionPlan(priceId);
    console.log('Mapped subscription plan:', plan);
    
    // First, find the user by stripe_customer_id
    const { data: userProfiles, error: findError } = await supabase
      .from('user_profiles')
      .select('id, email') // Use 'id' and 'email' from enterprise schema
      .eq('stripe_customer_id', stripeCustomerId)
      .single();
      
    if (findError || !userProfiles) {
      console.error('User not found for Stripe customer:', stripeCustomerId, findError);
      return;
    }
    
    console.log('Found user profile:', userProfiles.id);
    
    if (action === 'deleted') {
      // Cancel subscription
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ 
          subscription_type: null,
          billing_interval: null,
          subscription_status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', userProfiles.id);
        
      if (updateError) {
        console.error('Error cancelling subscription:', updateError);
      } else {
        console.log('Successfully cancelled subscription for user:', userProfiles.id);
      }
    } else {
      // Create or update subscription
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ 
          subscription_type: plan.type,
          billing_interval: plan.interval,
          subscription_status: subscription.status,
          stripe_subscription_id: subscription.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', userProfiles.id);
        
      if (updateError) {
        console.error('Error updating subscription:', updateError);
      } else {
        console.log(`Successfully ${action} subscription for user:`, userProfiles.id, 'Plan:', plan.type);
      }
    }
    
  } catch (error) {
    console.error('Error updating user subscription:', error);
  }
} 