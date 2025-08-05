import { stripe } from '@/lib/stripe';
import { buffer } from 'micro';

// Disable body parsing, need raw body for webhook signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('⚠️ STRIPE_WEBHOOK_SECRET not configured');
    return res.status(500).json({ error: 'Webhook secret not configured' });
  }

  let event;

  try {
    // Get raw body
    const buf = await buffer(req);
    
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
    console.log('✅ Webhook signature verified:', event.type);
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'customer.created':
        await handleCustomerCreated(event.data.object);
        break;
        
      case 'customer.updated':
        await handleCustomerUpdated(event.data.object);
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
        console.log(`🔔 Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('❌ Error processing webhook:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
}

// Webhook event handlers
async function handleCustomerCreated(customer) {
  console.log('🆕 Customer created:', customer.id);
  
  // TODO: Update your database with new customer info
  // Example: Save customer ID to user profile
  try {
    // Add your database logic here
    // await updateUserStripeCustomerId(customer.metadata?.user_id, customer.id);
    
    console.log('✅ Customer created successfully processed');
  } catch (error) {
    console.error('❌ Error handling customer created:', error);
  }
}

async function handleCustomerUpdated(customer) {
  console.log('📝 Customer updated:', customer.id);
  
  // TODO: Update customer information in your database
  try {
    // Add your database logic here
    
    console.log('✅ Customer updated successfully processed');
  } catch (error) {
    console.error('❌ Error handling customer updated:', error);
  }
}

async function handleSubscriptionCreated(subscription) {
  console.log('🎉 Subscription created:', subscription.id);
  
  // TODO: Update user's subscription status in your database
  try {
    const customerId = subscription.customer;
    const priceId = subscription.items.data[0]?.price?.id;
    
    // Determine plan type based on price ID
    let planType = 'unknown';
    if (priceId === process.env.STRIPE_ARTIST_STARTER_MONTHLY_PRICE_ID || 
        priceId === process.env.STRIPE_ARTIST_STARTER_YEARLY_PRICE_ID) {
      planType = 'artist_starter';
    } else if (priceId === process.env.STRIPE_ARTIST_PRO_MONTHLY_PRICE_ID || 
               priceId === process.env.STRIPE_ARTIST_PRO_YEARLY_PRICE_ID) {
      planType = 'artist_pro';
    } else if (priceId === process.env.STRIPE_LABEL_ADMIN_STARTER_MONTHLY_PRICE_ID || 
               priceId === process.env.STRIPE_LABEL_ADMIN_STARTER_YEARLY_PRICE_ID) {
      planType = 'label_admin_starter';
    } else if (priceId === process.env.STRIPE_LABEL_ADMIN_PRO_MONTHLY_PRICE_ID || 
               priceId === process.env.STRIPE_LABEL_ADMIN_PRO_YEARLY_PRICE_ID) {
      planType = 'label_admin_pro';
    }
    
    console.log(`📋 Plan type detected: ${planType} for customer: ${customerId}`);
    
    // Add your database logic here
    // await updateUserSubscription(customerId, subscription.id, planType, 'active');
    
    console.log('✅ Subscription created successfully processed');
  } catch (error) {
    console.error('❌ Error handling subscription created:', error);
  }
}

async function handleSubscriptionUpdated(subscription) {
  console.log('🔄 Subscription updated:', subscription.id);
  
  // TODO: Update subscription status in your database
  try {
    const customerId = subscription.customer;
    const status = subscription.status; // active, past_due, canceled, etc.
    
    // Add your database logic here
    // await updateUserSubscriptionStatus(customerId, subscription.id, status);
    
    console.log(`✅ Subscription updated: ${subscription.id} -> ${status}`);
  } catch (error) {
    console.error('❌ Error handling subscription updated:', error);
  }
}

async function handleSubscriptionDeleted(subscription) {
  console.log('❌ Subscription deleted:', subscription.id);
  
  // TODO: Handle subscription cancellation in your database
  try {
    const customerId = subscription.customer;
    
    // Add your database logic here
    // await updateUserSubscriptionStatus(customerId, subscription.id, 'canceled');
    // await resetUserToFreePlan(customerId);
    
    console.log('✅ Subscription deletion successfully processed');
  } catch (error) {
    console.error('❌ Error handling subscription deleted:', error);
  }
}

async function handlePaymentSucceeded(invoice) {
  console.log('💰 Payment succeeded:', invoice.id);
  
  // TODO: Update payment history in your database
  try {
    const customerId = invoice.customer;
    const amount = invoice.amount_paid;
    const currency = invoice.currency;
    
    // Add your database logic here
    // await recordSuccessfulPayment(customerId, invoice.id, amount, currency);
    
    console.log(`✅ Payment recorded: ${amount/100} ${currency.toUpperCase()}`);
  } catch (error) {
    console.error('❌ Error handling payment succeeded:', error);
  }
}

async function handlePaymentFailed(invoice) {
  console.log('💳 Payment failed:', invoice.id);
  
  // TODO: Handle failed payment in your database
  try {
    const customerId = invoice.customer;
    
    // Add your database logic here
    // await handleFailedPayment(customerId, invoice.id);
    // await sendPaymentFailureNotification(customerId);
    
    console.log('✅ Payment failure successfully processed');
  } catch (error) {
    console.error('❌ Error handling payment failed:', error);
  }
}

async function handleTrialWillEnd(subscription) {
  console.log('⏰ Trial will end:', subscription.id);
  
  // TODO: Send trial ending notification
  try {
    const customerId = subscription.customer;
    const trialEnd = new Date(subscription.trial_end * 1000);
    
    // Add your notification logic here
    // await sendTrialEndingNotification(customerId, trialEnd);
    
    console.log(`✅ Trial ending notification sent for: ${customerId}`);
  } catch (error) {
    console.error('❌ Error handling trial will end:', error);
  }
}