/**
 * TEST Stripe Webhook Endpoint (No Signature Verification)
 * This is for testing webhook logic without proper signature verification
 * DO NOT USE IN PRODUCTION
 */

import { getUsers, updateUser } from '@/lib/mockDatabase';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  console.log('🧪 TEST WEBHOOK RECEIVED (No signature verification)');
  console.log('📋 Event type:', req.body?.type);
  console.log('🔍 Event data:', JSON.stringify(req.body, null, 2));

  // Mock event for testing
  const event = req.body || {
    id: 'evt_test_123',
    type: 'customer.created',
    data: {
      object: {
        id: 'cus_test_123',
        email: 'test@audiostems.com',
        name: 'Test User'
      }
    }
  };

  try {
    switch (event.type) {
      case 'customer.created':
        console.log('🆕 Processing customer.created event');
        console.log('👤 Customer ID:', event.data.object.id);
        console.log('📧 Customer Email:', event.data.object.email);
        break;
        
      case 'customer.subscription.created':
        console.log('🎉 Processing subscription.created event');
        console.log('💳 Subscription ID:', event.data.object.id);
        console.log('👤 Customer ID:', event.data.object.customer);
        break;
        
      case 'invoice.payment_succeeded':
        console.log('💰 Processing payment_succeeded event');
        console.log('🧾 Invoice ID:', event.data.object.id);
        console.log('💵 Amount:', event.data.object.amount_paid / 100);
        break;
        
      default:
        console.log(`🔔 Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ 
      received: true, 
      test_mode: true,
      event_type: event.type,
      event_id: event.id,
      processed_at: new Date().toISOString(),
      message: 'Test webhook processed successfully (no signature verification)'
    });
  } catch (error) {
    console.error('❌ Error processing test webhook:', error);
    res.status(500).json({ 
      error: 'Test webhook processing failed',
      event_type: event.type,
      event_id: event.id
    });
  }
}