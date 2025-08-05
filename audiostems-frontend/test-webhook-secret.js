#!/usr/bin/env node

/**
 * Test Stripe Webhook Secret Configuration
 */

require('dotenv').config({ path: '.env.local' });
const crypto = require('crypto');

function testWebhookSecret() {
  console.log('🔍 STRIPE WEBHOOK SECRET TEST');
  console.log('================================');
  
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  
  console.log('✅ Secret exists:', !!secret);
  console.log('📏 Secret length:', secret?.length || 0);
  console.log('🔤 Secret format:', secret?.substring(0, 15) + '...');
  console.log('🏷️  Starts with "whsec_":', secret?.startsWith('whsec_'));
  console.log('🏷️  Starts with "we_":', secret?.startsWith('we_'));
  
  console.log('\n🧪 WEBHOOK SECRET ANALYSIS:');
  
  if (!secret) {
    console.log('❌ No webhook secret found in .env.local');
    return false;
  }
  
  if (secret.startsWith('we_')) {
    console.log('⚠️  WARNING: This looks like a webhook ENDPOINT ID, not a signing secret!');
    console.log('💡 You need the webhook SIGNING SECRET from Stripe Dashboard');
    console.log('📍 Go to: Stripe Dashboard → Developers → Webhooks → [Your Endpoint] → Signing Secret');
    console.log('🔑 The secret should start with "whsec_" and be much longer');
    return false;
  }
  
  if (secret.startsWith('whsec_')) {
    console.log('✅ Correct format: This looks like a valid webhook signing secret');
    
    // Test webhook signature generation
    try {
      const payload = JSON.stringify({ test: 'webhook' });
      const timestamp = Math.floor(Date.now() / 1000);
      const signature = crypto
        .createHmac('sha256', secret)
        .update(timestamp + '.' + payload)
        .digest('hex');
      
      console.log('✅ Signature generation test: PASSED');
      console.log('🔐 Test signature:', `v1=${signature}`);
      return true;
    } catch (error) {
      console.log('❌ Signature generation test: FAILED');
      console.log('🔥 Error:', error.message);
      return false;
    }
  }
  
  console.log('❓ Unknown secret format - should start with "whsec_"');
  return false;
}

function createTestWebhookPayload() {
  console.log('\n🎯 TEST WEBHOOK PAYLOAD:');
  
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  
  if (!secret || !secret.startsWith('whsec_')) {
    console.log('❌ Cannot create test payload - invalid secret');
    return;
  }
  
  const payload = JSON.stringify({
    id: 'evt_test_webhook',
    object: 'event',
    created: Math.floor(Date.now() / 1000),
    type: 'customer.created',
    data: {
      object: {
        id: 'cus_test123',
        email: 'test@audiostems.com',
        created: Math.floor(Date.now() / 1000)
      }
    }
  });
  
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = crypto
    .createHmac('sha256', secret)
    .update(timestamp + '.' + payload)
    .digest('hex');
  
  console.log('📦 Payload:', payload);
  console.log('⏰ Timestamp:', timestamp);
  console.log('🔐 Signature:', `t=${timestamp},v1=${signature}`);
  
  console.log('\n🌐 TEST CURL COMMAND:');
  console.log(`curl -X POST http://localhost:3001/api/webhooks/stripe \\`);
  console.log(`  -H "Content-Type: application/json" \\`);
  console.log(`  -H "stripe-signature: t=${timestamp},v1=${signature}" \\`);
  console.log(`  -d '${payload}'`);
}

// Run tests
const secretValid = testWebhookSecret();

if (secretValid) {
  createTestWebhookPayload();
} else {
  console.log('\n🛠️  HOW TO FIX:');
  console.log('1. Go to Stripe Dashboard → Developers → Webhooks');
  console.log('2. Click on your webhook endpoint');
  console.log('3. Click "Reveal" on the Signing Secret');
  console.log('4. Copy the secret (starts with "whsec_")');
  console.log('5. Update your .env.local file:');
  console.log('   STRIPE_WEBHOOK_SECRET=whsec_your_actual_secret_here');
}

console.log('\n' + '='.repeat(50));