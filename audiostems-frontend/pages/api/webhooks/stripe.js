import { stripe } from '@/lib/stripe';
import { buffer } from 'micro';
// Note: Mock database imports removed for production deployment
// In production, integrate with your real database or backend API

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
      // Customer Events
      case 'customer.created':
        await handleCustomerCreated(event.data.object);
        break;
      case 'customer.updated':
        await handleCustomerUpdated(event.data.object);
        break;
      case 'customer.deleted':
        await handleCustomerDeleted(event.data.object);
        break;
        
      // Subscription Events
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
      case 'customer.subscription.trial_will_end':
        await handleTrialWillEnd(event.data.object);
        break;
      case 'customer.subscription.paused':
        await handleSubscriptionPaused(event.data.object);
        break;
      case 'customer.subscription.resumed':
        await handleSubscriptionResumed(event.data.object);
        break;
      case 'customer.subscription.pending_update_applied':
        await handleSubscriptionPendingUpdateApplied(event.data.object);
        break;
        
      // Invoice Events
      case 'invoice.created':
        await handleInvoiceCreated(event.data.object);
        break;
      case 'invoice.finalized':
        await handleInvoiceFinalized(event.data.object);
        break;
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
        
      // Payment Intent Events
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object);
        break;
        
      // Payment Method Events
      case 'customer.source.created':
      case 'customer.card.created':
      case 'customer.bank_account.created':
        await handlePaymentMethodAdded(event.data.object, event.type);
        break;
      case 'customer.source.deleted':
      case 'customer.card.deleted':
      case 'customer.bank_account.deleted':
        await handlePaymentMethodRemoved(event.data.object, event.type);
        break;
        
      // Dispute Events
      case 'charge.dispute.created':
        await handleDisputeCreated(event.data.object);
        break;
        
      // Fraud Prevention Events
      case 'radar.early_fraud_warning.created':
        await handleEarlyFraudWarning(event.data.object);
        break;
      case 'review.opened':
        await handleReviewOpened(event.data.object);
        break;
        
      default:
        console.log(`🔔 Unhandled event type: ${event.type}`);
        console.log(`📋 Event data:`, JSON.stringify(event.data.object, null, 2));
    }

    res.status(200).json({ 
      received: true, 
      event_type: event.type,
      event_id: event.id,
      processed_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error processing webhook:', error);
    console.error('📋 Event details:', { type: event.type, id: event.id });
    res.status(500).json({ 
      error: 'Webhook processing failed',
      event_type: event.type,
      event_id: event.id
    });
  }
}

// Helper function to find user by Stripe customer ID or email
async function findUserByStripeData(customerId, email) {
  const users = getUsers();
  
  // First try to find by Stripe customer ID
  let user = users.find(u => u.stripeCustomerId === customerId);
  
  // If not found, try to find by email
  if (!user && email) {
    user = users.find(u => u.email === email);
  }
  
  return user;
}

// Helper function to determine plan type from price ID
function determinePlanType(priceId) {
  const priceMapping = {
    [process.env.STRIPE_ARTIST_STARTER_MONTHLY_PRICE_ID]: 'artist_starter',
    [process.env.STRIPE_ARTIST_STARTER_YEARLY_PRICE_ID]: 'artist_starter',
    [process.env.STRIPE_ARTIST_PRO_MONTHLY_PRICE_ID]: 'artist_pro',
    [process.env.STRIPE_ARTIST_PRO_YEARLY_PRICE_ID]: 'artist_pro',
    [process.env.STRIPE_LABEL_ADMIN_STARTER_MONTHLY_PRICE_ID]: 'label_admin_starter',
    [process.env.STRIPE_LABEL_ADMIN_STARTER_YEARLY_PRICE_ID]: 'label_admin_starter',
    [process.env.STRIPE_LABEL_ADMIN_PRO_MONTHLY_PRICE_ID]: 'label_admin_pro',
    [process.env.STRIPE_LABEL_ADMIN_PRO_YEARLY_PRICE_ID]: 'label_admin_pro',
  };
  
  return priceMapping[priceId] || 'unknown';
}

// Helper function to determine user role from plan type
function getUserRoleFromPlan(planType) {
  if (planType.startsWith('artist_')) return 'artist';
  if (planType.startsWith('label_admin_')) return 'label_admin';
  return null;
}

// Helper function to update user plan status in localStorage simulation
function updateUserPlanStatus(userId, planType, isUpgraded) {
  // This would normally update a database, but for localStorage simulation:
  const storageKey = planType.startsWith('artist_') 
    ? `user_upgraded_${userId}` 
    : `label_admin_upgraded_${userId}`;
  
  console.log(`📝 Plan status update: ${storageKey} = ${isUpgraded}`);
  // Note: In a real app, this would update the database
  // For now, we log the action that would be taken
}

// Webhook event handlers with MSC & Co business logic
async function handleCustomerCreated(customer) {
  console.log('🆕 Customer created:', customer.id);
  console.log('📧 Customer email:', customer.email);
  
  try {
    const user = await findUserByStripeData(customer.id, customer.email);
    
    if (user) {
      // Update user with Stripe customer ID
      const updatedUser = {
        ...user,
        stripeCustomerId: customer.id,
        paymentMethodConnected: false,
        subscriptionStatus: 'no_subscription',
        lastUpdated: new Date().toISOString()
      };
      
      updateUser(user.id, updatedUser);
      console.log(`✅ User ${user.id} linked to Stripe customer ${customer.id}`);
    } else {
      console.log(`⚠️ No user found for customer ${customer.id} with email ${customer.email}`);
    }
  } catch (error) {
    console.error('❌ Error handling customer created:', error);
  }
}

async function handleCustomerUpdated(customer) {
  console.log('📝 Customer updated:', customer.id);
  
  try {
    const user = await findUserByStripeData(customer.id, customer.email);
    
    if (user) {
      const updatedUser = {
        ...user,
        email: customer.email,
        name: customer.name || user.name,
        lastUpdated: new Date().toISOString()
      };
      
      updateUser(user.id, updatedUser);
      console.log(`✅ User ${user.id} information updated`);
    }
  } catch (error) {
    console.error('❌ Error handling customer updated:', error);
  }
}

async function handleCustomerDeleted(customer) {
  console.log('🗑️ Customer deleted:', customer.id);
  
  try {
    const user = await findUserByStripeData(customer.id, customer.email);
    
    if (user) {
      const updatedUser = {
        ...user,
        stripeCustomerId: null,
        subscriptionStatus: 'no_subscription',
        planType: null,
        paymentMethodConnected: false,
        lastUpdated: new Date().toISOString()
      };
      
      updateUser(user.id, updatedUser);
      console.log(`✅ User ${user.id} Stripe data cleared`);
    }
  } catch (error) {
    console.error('❌ Error handling customer deleted:', error);
  }
}

async function handleSubscriptionCreated(subscription) {
  console.log('🎉 Subscription created:', subscription.id);
  console.log('👤 Customer:', subscription.customer);
  
  try {
    const customerId = subscription.customer;
    const priceId = subscription.items.data[0]?.price?.id;
    const planType = determinePlanType(priceId);
    const userRole = getUserRoleFromPlan(planType);
    
    console.log(`📋 Plan detected: ${planType} for customer: ${customerId}`);
    
    const user = await findUserByStripeData(customerId);
    
    if (user) {
      // Determine if this is an upgrade (Pro plan)
      const isUpgraded = planType.includes('_pro');
      
      const updatedUser = {
        ...user,
        subscriptionId: subscription.id,
        subscriptionStatus: subscription.status,
        planType: planType,
        billingCycle: subscription.items.data[0]?.price?.recurring?.interval || 'monthly',
        currentPeriodStart: new Date(subscription.current_period_start * 1000).toISOString(),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
        trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
        lastUpdated: new Date().toISOString()
      };
      
      updateUser(user.id, updatedUser);
      
      // Update plan status for frontend localStorage simulation
      updateUserPlanStatus(user.sub || user.id, planType, isUpgraded);
      
      console.log(`✅ Subscription created for user ${user.id}: ${planType}`);
      
      // Role-specific business logic
      if (userRole === 'artist') {
        console.log(`🎵 Artist subscription activated: ${isUpgraded ? 'Pro (unlimited releases)' : 'Starter (5 releases/year)'}`);
      } else if (userRole === 'label_admin') {
        console.log(`🏷️ Label Admin subscription activated: ${isUpgraded ? 'Pro (unlimited artists)' : 'Starter (5 artists)'}`);
      }
    }
  } catch (error) {
    console.error('❌ Error handling subscription created:', error);
  }
}

async function handleSubscriptionUpdated(subscription) {
  console.log('🔄 Subscription updated:', subscription.id);
  console.log('📊 Status:', subscription.status);
  
  try {
    const customerId = subscription.customer;
    const priceId = subscription.items.data[0]?.price?.id;
    const planType = determinePlanType(priceId);
    
    const user = await findUserByStripeData(customerId);
    
    if (user) {
      const isUpgraded = planType.includes('_pro');
      
      const updatedUser = {
        ...user,
        subscriptionStatus: subscription.status,
        planType: planType,
        currentPeriodStart: new Date(subscription.current_period_start * 1000).toISOString(),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
        lastUpdated: new Date().toISOString()
      };
      
      updateUser(user.id, updatedUser);
      
      // Update plan status for frontend
      updateUserPlanStatus(user.sub || user.id, planType, isUpgraded);
      
      console.log(`✅ Subscription updated for user ${user.id}: ${planType} (${subscription.status})`);
      
      // Handle status changes
      if (subscription.status === 'past_due') {
        console.log(`⚠️ Payment past due for user ${user.id}`);
      } else if (subscription.status === 'canceled') {
        console.log(`❌ Subscription canceled for user ${user.id}`);
      }
    }
  } catch (error) {
    console.error('❌ Error handling subscription updated:', error);
  }
}

async function handleSubscriptionDeleted(subscription) {
  console.log('❌ Subscription deleted:', subscription.id);
  
  try {
    const customerId = subscription.customer;
    const user = await findUserByStripeData(customerId);
    
    if (user) {
      const userRole = user.role;
      
      const updatedUser = {
        ...user,
        subscriptionId: null,
        subscriptionStatus: 'canceled',
        planType: userRole === 'artist' ? 'artist_starter' : userRole === 'label_admin' ? 'label_admin_starter' : null,
        lastUpdated: new Date().toISOString()
      };
      
      updateUser(user.id, updatedUser);
      
      // Reset to starter plan
      updateUserPlanStatus(user.sub || user.id, updatedUser.planType, false);
      
      console.log(`✅ User ${user.id} reset to starter plan after subscription cancellation`);
      
      // Role-specific reset logic
      if (userRole === 'artist') {
        console.log(`🎵 Artist reverted to Starter: 5 releases/year limit restored`);
      } else if (userRole === 'label_admin') {
        console.log(`🏷️ Label Admin reverted to Starter: 5 artists limit restored`);
      }
    }
  } catch (error) {
    console.error('❌ Error handling subscription deleted:', error);
  }
}

async function handleSubscriptionPaused(subscription) {
  console.log('⏸️ Subscription paused:', subscription.id);
  
  try {
    const user = await findUserByStripeData(subscription.customer);
    if (user) {
      const updatedUser = { ...user, subscriptionStatus: 'paused', lastUpdated: new Date().toISOString() };
      updateUser(user.id, updatedUser);
      console.log(`✅ Subscription paused for user ${user.id}`);
    }
  } catch (error) {
    console.error('❌ Error handling subscription paused:', error);
  }
}

async function handleSubscriptionResumed(subscription) {
  console.log('▶️ Subscription resumed:', subscription.id);
  
  try {
    const user = await findUserByStripeData(subscription.customer);
    if (user) {
      const updatedUser = { ...user, subscriptionStatus: 'active', lastUpdated: new Date().toISOString() };
      updateUser(user.id, updatedUser);
      console.log(`✅ Subscription resumed for user ${user.id}`);
    }
  } catch (error) {
    console.error('❌ Error handling subscription resumed:', error);
  }
}

async function handleSubscriptionPendingUpdateApplied(subscription) {
  console.log('🔄 Subscription pending update applied:', subscription.id);
  await handleSubscriptionUpdated(subscription);
}

async function handleInvoiceCreated(invoice) {
  console.log('📄 Invoice created:', invoice.id);
  
  try {
    const user = await findUserByStripeData(invoice.customer);
    if (user) {
      console.log(`📋 Invoice created for user ${user.id}: ${(invoice.amount_due / 100).toFixed(2)} ${invoice.currency.toUpperCase()}`);
    }
  } catch (error) {
    console.error('❌ Error handling invoice created:', error);
  }
}

async function handleInvoiceFinalized(invoice) {
  console.log('✅ Invoice finalized:', invoice.id);
  
  try {
    const user = await findUserByStripeData(invoice.customer);
    if (user) {
      console.log(`📋 Invoice finalized for user ${user.id}: ${(invoice.amount_due / 100).toFixed(2)} ${invoice.currency.toUpperCase()}`);
    }
  } catch (error) {
    console.error('❌ Error handling invoice finalized:', error);
  }
}

async function handlePaymentSucceeded(invoice) {
  console.log('💰 Payment succeeded:', invoice.id);
  console.log(`💵 Amount: ${(invoice.amount_paid / 100).toFixed(2)} ${invoice.currency.toUpperCase()}`);
  
  try {
    const user = await findUserByStripeData(invoice.customer);
    
    if (user) {
      const paymentRecord = {
        invoiceId: invoice.id,
        amount: invoice.amount_paid,
        currency: invoice.currency,
        date: new Date(invoice.status_transitions.paid_at * 1000).toISOString(),
        status: 'paid'
      };
      
      // Add payment to user's billing history
      const updatedUser = {
        ...user,
        billingHistory: [...(user.billingHistory || []), paymentRecord],
        lastPaymentDate: paymentRecord.date,
        subscriptionStatus: 'active',
        lastUpdated: new Date().toISOString()
      };
      
      updateUser(user.id, updatedUser);
      console.log(`✅ Payment recorded for user ${user.id}: ${(invoice.amount_paid / 100).toFixed(2)} ${invoice.currency.toUpperCase()}`);
    }
  } catch (error) {
    console.error('❌ Error handling payment succeeded:', error);
  }
}

async function handlePaymentFailed(invoice) {
  console.log('💳 Payment failed:', invoice.id);
  console.log(`💸 Amount: ${(invoice.amount_due / 100).toFixed(2)} ${invoice.currency.toUpperCase()}`);
  
  try {
    const user = await findUserByStripeData(invoice.customer);
    
    if (user) {
      const updatedUser = {
        ...user,
        subscriptionStatus: 'past_due',
        lastFailedPayment: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };
      
      updateUser(user.id, updatedUser);
      console.log(`⚠️ Payment failed for user ${user.id} - subscription marked past due`);
      
      // Role-specific failed payment handling
      if (user.role === 'artist') {
        console.log(`🎵 Artist ${user.id} may lose access to Pro features if payment not resolved`);
      } else if (user.role === 'label_admin') {
        console.log(`🏷️ Label Admin ${user.id} may lose access to Pro features if payment not resolved`);
      }
    }
  } catch (error) {
    console.error('❌ Error handling payment failed:', error);
  }
}

async function handlePaymentIntentSucceeded(paymentIntent) {
  console.log('💳 Payment intent succeeded:', paymentIntent.id);
  console.log(`💰 Amount: ${(paymentIntent.amount / 100).toFixed(2)} ${paymentIntent.currency.toUpperCase()}`);
}

async function handlePaymentIntentFailed(paymentIntent) {
  console.log('❌ Payment intent failed:', paymentIntent.id);
  console.log(`💸 Amount: ${(paymentIntent.amount / 100).toFixed(2)} ${paymentIntent.currency.toUpperCase()}`);
  console.log('🔍 Failure reason:', paymentIntent.last_payment_error?.message);
}

async function handlePaymentMethodAdded(paymentMethod, eventType) {
  console.log(`💳 Payment method added (${eventType}):`, paymentMethod.id);
  
  try {
    if (paymentMethod.customer) {
      const user = await findUserByStripeData(paymentMethod.customer);
      if (user) {
        const updatedUser = {
          ...user,
          paymentMethodConnected: true,
          lastUpdated: new Date().toISOString()
        };
        updateUser(user.id, updatedUser);
        console.log(`✅ Payment method connected for user ${user.id}`);
      }
    }
  } catch (error) {
    console.error('❌ Error handling payment method added:', error);
  }
}

async function handlePaymentMethodRemoved(paymentMethod, eventType) {
  console.log(`🗑️ Payment method removed (${eventType}):`, paymentMethod.id);
  
  try {
    if (paymentMethod.customer) {
      const user = await findUserByStripeData(paymentMethod.customer);
      if (user) {
        const updatedUser = {
          ...user,
          paymentMethodConnected: false,
          lastUpdated: new Date().toISOString()
        };
        updateUser(user.id, updatedUser);
        console.log(`⚠️ Payment method removed for user ${user.id}`);
      }
    }
  } catch (error) {
    console.error('❌ Error handling payment method removed:', error);
  }
}

async function handleDisputeCreated(charge) {
  console.log('⚖️ Dispute created for charge:', charge.id);
  console.log(`💸 Disputed amount: ${(charge.amount / 100).toFixed(2)} ${charge.currency.toUpperCase()}`);
  
  try {
    if (charge.customer) {
      const user = await findUserByStripeData(charge.customer);
      if (user) {
        console.log(`🚨 DISPUTE ALERT: User ${user.id} (${user.email}) has a disputed charge`);
        console.log(`📧 Consider reaching out to resolve: ${user.email}`);
      }
    }
  } catch (error) {
    console.error('❌ Error handling dispute created:', error);
  }
}

async function handleEarlyFraudWarning(earlyFraudWarning) {
  console.log('🚨 Early fraud warning:', earlyFraudWarning.id);
  console.log('⚠️ Charge flagged for potential fraud:', earlyFraudWarning.charge);
}

async function handleReviewOpened(review) {
  console.log('🔍 Review opened:', review.id);
  console.log('📋 Reason:', review.reason);
  console.log('💳 Payment intent:', review.payment_intent);
}

async function handleTrialWillEnd(subscription) {
  console.log('⏰ Trial will end:', subscription.id);
  console.log('📅 Trial end date:', new Date(subscription.trial_end * 1000).toLocaleDateString());
  
  try {
    const user = await findUserByStripeData(subscription.customer);
    if (user) {
      console.log(`📧 TRIAL ENDING: User ${user.id} (${user.email}) trial ends soon`);
      console.log(`💡 Consider sending upgrade reminder to: ${user.email}`);
    }
  } catch (error) {
    console.error('❌ Error handling trial will end:', error);
  }
}