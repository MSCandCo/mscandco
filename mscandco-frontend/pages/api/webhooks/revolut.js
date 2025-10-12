/**
 * Revolut Webhook Handler
 * 
 * Processes Revolut payment webhooks with signature verification,
 * updates Supabase subscription status, and handles all payment events.
 */

import { createClient } from '@supabase/supabase-js';
import { validateWebhookSignature } from '../../../lib/revolut-payment';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Webhook event types we handle
 */
const HANDLED_EVENTS = [
  'ORDER_COMPLETED',
  'ORDER_AUTHORISED', 
  'ORDER_CANCELLED',
  'ORDER_PAYMENT_DECLINED',
  'ORDER_PAYMENT_FAILED'
];

/**
 * Map Revolut order states to our subscription statuses
 */
const ORDER_STATE_MAPPING = {
  'COMPLETED': 'active',
  'AUTHORISED': 'active',
  'CANCELLED': 'cancelled',
  'FAILED': 'failed',
  'DECLINED': 'failed'
};

/**
 * Get raw body from request
 */
function getRawBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    
    req.on('data', chunk => {
      data += chunk;
    });
    
    req.on('end', () => {
      resolve(data);
    });
    
    req.on('error', err => {
      reject(err);
    });
  });
}

/**
 * Process subscription activation
 */
async function processSubscription(orderData) {
  try {
    const { metadata } = orderData;
    const { userId, planId, billing, originalAmount } = metadata || {};
    
    if (!userId || !planId) {
      console.log('⚠️ No subscription data in order metadata, skipping subscription processing');
      return { success: true, message: 'No subscription to process' };
    }
    
    console.log('💳 Processing subscription:', {
      userId: userId.substring(0, 8) + '...',
      planId,
      billing,
      amount: originalAmount
    });
    
    // Map plan ID to tier
    const tierMapping = {
      'artist-starter': 'artist_starter',
      'artist-pro': 'artist_pro',
      'label-starter': 'label_starter',
      'label-pro': 'label_pro',
      'distribution-partner': 'distribution_partner',
      'company-admin': 'company_admin'
    };
    
    const tier = tierMapping[planId] || planId;
    
    // Calculate subscription period
    const now = new Date();
    const periodEnd = new Date(now);
    if (billing === 'yearly') {
      periodEnd.setFullYear(now.getFullYear() + 1);
    } else {
      periodEnd.setMonth(now.getMonth() + 1);
    }
    
    // Check if subscription already exists
    const { data: existingSubscription, error: checkError } = await supabase
      .from('subscriptions')
      .select('id, status')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Error checking existing subscription:', checkError);
      throw checkError;
    }
    
    if (existingSubscription) {
      // Update existing subscription
      const { data: updatedSub, error: updateError } = await supabase
        .from('subscriptions')
        .update({
          tier,
          billing_cycle: billing,
          amount: parseFloat(originalAmount),
          currency: 'GBP',
          current_period_end: periodEnd.toISOString(),
          updated_at: now.toISOString()
        })
        .eq('id', existingSubscription.id)
        .select()
        .single();
      
      if (updateError) {
        console.error('❌ Error updating subscription:', updateError);
        throw updateError;
      }
      
      console.log('✅ Subscription updated:', updatedSub.id);
      return { success: true, subscription: updatedSub, action: 'updated' };
      
    } else {
      // Create new subscription
      const { data: newSub, error: insertError } = await supabase
        .from('subscriptions')
        .insert({
          user_id: userId,
          tier,
          status: 'active',
          billing_cycle: billing,
          amount: parseFloat(originalAmount),
          currency: 'GBP',
          current_period_start: now.toISOString(),
          current_period_end: periodEnd.toISOString(),
          created_at: now.toISOString(),
          updated_at: now.toISOString()
        })
        .select()
        .single();
      
      if (insertError) {
        console.error('❌ Error creating subscription:', insertError);
        throw insertError;
      }
      
      console.log('✅ Subscription created:', newSub.id);
      return { success: true, subscription: newSub, action: 'created' };
    }
    
  } catch (error) {
    console.error('💥 Subscription processing failed:', error);
    throw error;
  }
}

/**
 * Process wallet top-up
 */
async function processWalletTopUp(orderData) {
  try {
    const { metadata } = orderData;
    const { userId, topUpAmount } = metadata || {};
    
    if (!userId || !topUpAmount) {
      console.log('⚠️ No wallet top-up data in order metadata');
      return { success: true, message: 'No wallet top-up to process' };
    }
    
    console.log('💰 Processing wallet top-up:', {
      userId: userId.substring(0, 8) + '...',
      amount: topUpAmount
    });
    
    // Get current wallet balance
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('wallet_balance')
      .eq('user_id', userId)
      .single();
    
    if (profileError && profileError.code !== 'PGRST116') {
      console.error('❌ Error fetching user profile:', profileError);
      throw profileError;
    }
    
    const currentBalance = profile?.wallet_balance || 0;
    const newBalance = currentBalance + parseFloat(topUpAmount);
    
    // Update wallet balance
    const { data: updatedProfile, error: updateError } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: userId,
        wallet_balance: newBalance,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (updateError) {
      console.error('❌ Error updating wallet balance:', updateError);
      throw updateError;
    }
    
    // Log transaction
    const { error: transactionError } = await supabase
      .from('wallet_transactions')
      .insert({
        user_id: userId,
        type: 'credit',
        amount: parseFloat(topUpAmount),
        description: `Wallet top-up via Revolut`,
        order_reference: orderData.id,
        created_at: new Date().toISOString()
      });
    
    if (transactionError) {
      console.error('⚠️ Error logging wallet transaction:', transactionError);
      // Don't throw here, wallet update succeeded
    }
    
    console.log('✅ Wallet topped up:', {
      userId: userId.substring(0, 8) + '...',
      previousBalance: currentBalance,
      newBalance: newBalance,
      topUpAmount: topUpAmount
    });
    
    return { 
      success: true, 
      walletBalance: newBalance, 
      topUpAmount: parseFloat(topUpAmount),
      action: 'topped_up'
    };
    
  } catch (error) {
    console.error('💥 Wallet top-up processing failed:', error);
    throw error;
  }
}

/**
 * Log webhook event
 */
async function logWebhookEvent(eventType, orderId, status, data = {}) {
  try {
    await supabase
      .from('webhook_logs')
      .insert({
        provider: 'revolut',
        event_type: eventType,
        order_id: orderId,
        status,
        data: data,
        created_at: new Date().toISOString()
      });
  } catch (error) {
    console.error('⚠️ Failed to log webhook event:', error);
    // Don't throw, this is just logging
  }
}

/**
 * Main webhook handler
 */
export default async function handler(req, res) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  let rawBody;
  let webhookData;
  
  try {
    // Get raw body for signature verification
    rawBody = await getRawBody(req);
    
    if (!rawBody) {
      console.error('❌ Empty webhook body received');
      return res.status(400).json({ error: 'Empty request body' });
    }
    
    // Parse webhook data
    try {
      webhookData = JSON.parse(rawBody);
    } catch (parseError) {
      console.error('❌ Invalid JSON in webhook body:', parseError);
      return res.status(400).json({ error: 'Invalid JSON' });
    }
    
    console.log('📨 Revolut webhook received:', {
      event: webhookData.event,
      orderId: webhookData.data?.id,
      timestamp: new Date().toISOString()
    });
    
    // Verify webhook signature
    const signature = req.headers['revolut-signature'];
    const webhookSecret = process.env.REVOLUT_WEBHOOK_SECRET;
    
    if (!signature) {
      console.error('❌ Missing Revolut signature header');
      await logWebhookEvent(webhookData.event, webhookData.data?.id, 'failed', { error: 'Missing signature' });
      return res.status(401).json({ error: 'Missing signature' });
    }
    
    if (!webhookSecret) {
      console.error('❌ REVOLUT_WEBHOOK_SECRET not configured');
      await logWebhookEvent(webhookData.event, webhookData.data?.id, 'failed', { error: 'Webhook secret not configured' });
      return res.status(500).json({ error: 'Webhook secret not configured' });
    }
    
    // Validate signature
    const isValidSignature = validateWebhookSignature(rawBody, signature, webhookSecret);
    
    if (!isValidSignature) {
      console.error('❌ Invalid webhook signature');
      await logWebhookEvent(webhookData.event, webhookData.data?.id, 'failed', { error: 'Invalid signature' });
      return res.status(401).json({ error: 'Invalid signature' });
    }
    
    console.log('✅ Webhook signature verified');
    
    // Extract event data
    const { event, data: orderData } = webhookData;
    const orderId = orderData?.id;
    
    if (!orderId) {
      console.error('❌ No order ID in webhook data');
      await logWebhookEvent(event, null, 'failed', { error: 'No order ID' });
      return res.status(400).json({ error: 'No order ID in webhook data' });
    }
    
    // Check if we handle this event type
    if (!HANDLED_EVENTS.includes(event)) {
      console.log(`ℹ️ Ignoring unhandled event type: ${event}`);
      await logWebhookEvent(event, orderId, 'ignored', { reason: 'Unhandled event type' });
      return res.status(200).json({ message: 'Event ignored' });
    }
    
    console.log('🔄 Processing webhook event:', {
      event,
      orderId,
      state: orderData.state,
      amount: orderData.order_amount?.value,
      currency: orderData.order_amount?.currency
    });
    
    let processingResult = { success: true };
    
    // Process based on event type
    switch (event) {
      case 'ORDER_COMPLETED':
      case 'ORDER_AUTHORISED':
        // Process successful payment
        try {
          const metadata = orderData.metadata || {};
          
          // Process subscription if planId exists
          if (metadata.planId) {
            const subscriptionResult = await processSubscription(orderData);
            processingResult.subscription = subscriptionResult;
          }
          
          // Process wallet top-up if topUpAmount exists
          if (metadata.topUpAmount && !metadata.planId) {
            const walletResult = await processWalletTopUp(orderData);
            processingResult.wallet = walletResult;
          }
          
          await logWebhookEvent(event, orderId, 'processed', {
            orderState: orderData.state,
            processingResult
          });
          
          console.log('✅ Payment processed successfully:', {
            orderId,
            event,
            subscription: processingResult.subscription?.action,
            wallet: processingResult.wallet?.action
          });
          
        } catch (processingError) {
          console.error('💥 Payment processing failed:', processingError);
          await logWebhookEvent(event, orderId, 'failed', { 
            error: processingError.message,
            orderState: orderData.state
          });
          
          // Return 200 to prevent Revolut retries, but log the error
          return res.status(200).json({ 
            message: 'Webhook received but processing failed',
            error: processingError.message 
          });
        }
        break;
        
      case 'ORDER_CANCELLED':
      case 'ORDER_PAYMENT_DECLINED':
      case 'ORDER_PAYMENT_FAILED':
        // Handle failed/cancelled payments
        console.log(`⚠️ Payment ${event.toLowerCase()}:`, {
          orderId,
          state: orderData.state,
          reason: orderData.failure_reason
        });
        
        await logWebhookEvent(event, orderId, 'processed', {
          orderState: orderData.state,
          failureReason: orderData.failure_reason
        });
        break;
        
      default:
        console.log(`ℹ️ Unhandled event: ${event}`);
        await logWebhookEvent(event, orderId, 'ignored', { reason: 'Unhandled event' });
    }
    
    // Return success response
    res.status(200).json({
      message: 'Webhook processed successfully',
      event,
      orderId,
      processed: processingResult.success
    });
    
  } catch (error) {
    console.error('💥 Webhook processing error:', error);
    
    // Log the error
    await logWebhookEvent(
      webhookData?.event || 'unknown',
      webhookData?.data?.id || 'unknown',
      'error',
      { error: error.message, stack: error.stack }
    );
    
    // Return 500 to trigger Revolut retry
    res.status(500).json({
      error: 'Webhook processing failed',
      message: error.message
    });
  }
}

// Disable body parser to get raw body for signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};
