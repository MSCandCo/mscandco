import { supabase } from '@/lib/supabase';
import { validateWebhookSignature } from '@/lib/revolut-payment';

// Disable body parsing so we can verify raw body signature
export const config = {
  api: {
    bodyParser: false,
  },
};

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
    });
    req.on('end', () => {
      resolve(data);
    });
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get raw body for signature verification
    const rawBody = await getRawBody(req);

    // SECURITY: Verify webhook signature
    const signature = req.headers['revolut-signature'];
    const webhookSecret = process.env.REVOLUT_WEBHOOK_SECRET;

    if (!signature) {
      console.error('❌ Missing Revolut signature header');
      return res.status(401).json({ error: 'Missing signature' });
    }

    if (!webhookSecret) {
      console.error('❌ Webhook secret not configured');
      return res.status(500).json({ error: 'Webhook configuration error' });
    }

    const isValidSignature = validateWebhookSignature(rawBody, signature, webhookSecret);

    if (!isValidSignature) {
      console.error('❌ Invalid webhook signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    console.log('✅ Webhook signature verified');

    // Parse the body after signature verification
    const event = JSON.parse(rawBody);

    console.log('🔔 Revolut Webhook received:', event.type, event.data);

    switch (event.type) {
      case 'subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;
        
      case 'subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
        
      case 'subscription.cancelled':
        await handleSubscriptionCancelled(event.data.object);
        break;
        
      case 'payment.succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;
        
      case 'payment.failed':
        await handlePaymentFailed(event.data.object);
        break;
        
      case 'wallet.credited':
        await handleWalletCredited(event.data.object);
        break;
        
      default:
        console.log(`Unhandled webhook event: ${event.type}`);
    }

    res.status(200).json({ received: true });

  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
}

async function handleSubscriptionCreated(subscription) {
  console.log('Processing subscription created:', subscription.id);
  
  // Update subscription status in database
  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: 'active',
      revolut_subscription_id: subscription.id,
      current_period_start: subscription.current_period_start,
      current_period_end: subscription.current_period_end,
      updated_at: new Date().toISOString()
    })
    .eq('revolut_subscription_id', subscription.id);

  if (error) {
    console.error('Error updating subscription in database:', error);
  }
}

async function handleSubscriptionUpdated(subscription) {
  console.log('Processing subscription updated:', subscription.id);
  
  // Map Revolut status to our status
  let dbStatus = subscription.status;
  if (subscription.status === 'cancelled') {
    dbStatus = 'cancelled';
  } else if (subscription.status === 'active') {
    dbStatus = 'active';
  }
  
  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: dbStatus,
      current_period_start: subscription.current_period_start,
      current_period_end: subscription.current_period_end,
      updated_at: new Date().toISOString()
    })
    .eq('revolut_subscription_id', subscription.id);

  if (error) {
    console.error('Error updating subscription in database:', error);
  }
}

async function handleSubscriptionCancelled(subscription) {
  console.log('Processing subscription cancelled:', subscription.id);
  
  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: 'cancelled',
      cancelled_at: subscription.cancelled_at,
      updated_at: new Date().toISOString()
    })
    .eq('revolut_subscription_id', subscription.id);

  if (error) {
    console.error('Error updating cancelled subscription in database:', error);
  }
}

async function handlePaymentSucceeded(payment) {
  console.log('Processing payment succeeded:', payment.id);
  
  // Create wallet transaction record
  if (payment.subscription_id) {
    // This is a subscription payment
    const { error } = await supabase
      .from('wallet_transactions')
      .insert({
        user_id: payment.metadata?.user_id,
        transaction_type: 'debit',
        amount: payment.amount / 100, // Convert pence to pounds
        currency: payment.currency,
        source_type: 'subscription',
        source_reference_id: payment.subscription_id,
        description: `Subscription payment - ${payment.metadata?.plan_name || 'Plan'}`,
        status: 'completed',
        processed_at: payment.processed_at,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error recording subscription payment:', error);
    }
  } else {
    // This might be a wallet top-up
    const { error } = await supabase
      .from('wallet_transactions')
      .insert({
        user_id: payment.metadata?.user_id,
        transaction_type: 'credit',
        amount: payment.amount / 100,
        currency: payment.currency,
        source_type: 'payment',
        source_reference_id: payment.id,
        description: 'Wallet top-up',
        status: 'completed',
        processed_at: payment.processed_at,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error recording wallet payment:', error);
    }
  }
}

async function handlePaymentFailed(payment) {
  console.log('Processing payment failed:', payment.id);
  
  // Record failed payment
  const { error } = await supabase
    .from('wallet_transactions')
    .insert({
      user_id: payment.metadata?.user_id,
      transaction_type: payment.subscription_id ? 'debit' : 'credit',
      amount: payment.amount / 100,
      currency: payment.currency,
      source_type: payment.subscription_id ? 'subscription' : 'payment',
      source_reference_id: payment.subscription_id || payment.id,
      description: `Failed payment - ${payment.failure_reason}`,
      status: 'failed',
      created_at: new Date().toISOString()
    });

  if (error) {
    console.error('Error recording failed payment:', error);
  }
}

async function handleWalletCredited(transaction) {
  console.log('Processing wallet credited:', transaction.id);
  
  // Record wallet credit
  const { error } = await supabase
    .from('wallet_transactions')
    .insert({
      user_id: transaction.customer_id, // This would need to be mapped from customer_id to user_id
      transaction_type: 'credit',
      amount: transaction.amount,
      currency: transaction.currency,
      source_type: 'wallet_topup',
      source_reference_id: transaction.id,
      description: transaction.description || 'Wallet top-up',
      status: 'completed',
      processed_at: transaction.processed_at,
      created_at: new Date().toISOString()
    });

  if (error) {
    console.error('Error recording wallet credit:', error);
  }
}
