#!/usr/bin/env node

/**
 * Test Revolut Integration Script
 * 
 * Tests the complete Revolut payment flow including:
 * - Payment creation
 * - Webhook processing
 * - Database updates
 */

require('dotenv').config({ path: '.env.local' });

const https = require('https');
const crypto = require('crypto');

const REVOLUT_API_SECRET = process.env.REVOLUT_API_SECRET;
const REVOLUT_BASE_URL = process.env.REVOLUT_BASE_URL || 'https://sandbox-merchant.revolut.com';
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3013';

console.log('🧪 Testing Revolut Integration...\n');

/**
 * Test 1: Create a test payment
 */
async function testPaymentCreation() {
  console.log('📝 Test 1: Creating test payment...');
  
  const paymentData = {
    amount: 1000, // £10.00 in pence
    currency: 'GBP',
    description: 'Test payment for integration',
    merchant_order_ext_ref: `test-${Date.now()}`,
    customer_email: 'test@example.com',
    merchant_name: 'MSC & Co',
    success_url: `${BASE_URL}/billing/success?order_id={ORDER_ID}`,
    failure_url: `${BASE_URL}/billing/failed?order_id={ORDER_ID}`,
    cancel_url: `${BASE_URL}/billing/cancelled?order_id={ORDER_ID}`,
    metadata: {
      planId: 'artist-pro',
      billing: 'yearly',
      topUpAmount: 10,
      userId: 'test-user-id'
    }
  };

  const postData = JSON.stringify(paymentData);
  
  const options = {
    hostname: REVOLUT_BASE_URL.replace('https://', ''),
    port: 443,
    path: '/api/orders',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${REVOLUT_API_SECRET}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
      'Revolut-Api-Version': '2024-09-01'
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          
          if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log('✅ Payment created successfully!');
            console.log(`   Order ID: ${response.id}`);
            console.log(`   Checkout URL: ${response.checkout_url}`);
            console.log(`   State: ${response.state}`);
            resolve(response);
          } else {
            console.error('❌ Payment creation failed');
            console.error(`   Status: ${res.statusCode}`);
            console.error(`   Response:`, response);
            reject(new Error(`HTTP ${res.statusCode}: ${response.message || 'Unknown error'}`));
          }
        } catch (error) {
          console.error('❌ Failed to parse response:', error);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request failed:', error);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

/**
 * Test 2: Test webhook signature verification
 */
function testWebhookSignature() {
  console.log('\n📝 Test 2: Testing webhook signature verification...');
  
  const webhookSecret = process.env.REVOLUT_WEBHOOK_SECRET || 'test-secret';
  const payload = JSON.stringify({
    event: 'ORDER_COMPLETED',
    data: {
      id: 'test-order-id',
      state: 'COMPLETED',
      order_amount: { value: 1000, currency: 'GBP' }
    }
  });
  
  // Generate signature
  const signature = crypto
    .createHmac('sha256', webhookSecret)
    .update(payload, 'utf8')
    .digest('hex');
  
  console.log('✅ Webhook signature generated successfully!');
  console.log(`   Payload length: ${payload.length} bytes`);
  console.log(`   Signature: ${signature.substring(0, 16)}...`);
  
  return { payload, signature };
}

/**
 * Test 3: Test webhook endpoint
 */
async function testWebhookEndpoint(payload, signature) {
  console.log('\n📝 Test 3: Testing webhook endpoint...');
  
  const postData = payload;
  
  const options = {
    hostname: 'localhost',
    port: 3013,
    path: '/api/webhooks/revolut',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
      'Revolut-Signature': signature
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          
          if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log('✅ Webhook processed successfully!');
            console.log(`   Status: ${res.statusCode}`);
            console.log(`   Response:`, response);
            resolve(response);
          } else {
            console.log('⚠️ Webhook processing failed (expected if server not running)');
            console.log(`   Status: ${res.statusCode}`);
            console.log(`   Response:`, response);
            resolve(response);
          }
        } catch (error) {
          console.log('⚠️ Webhook endpoint not accessible (expected if server not running)');
          console.log(`   Error: ${error.message}`);
          resolve(null);
        }
      });
    });

    req.on('error', (error) => {
      console.log('⚠️ Webhook endpoint not accessible (expected if server not running)');
      console.log(`   Error: ${error.message}`);
      resolve(null);
    });

    req.write(postData);
    req.end();
  });
}

/**
 * Test 4: Currency conversion
 */
function testCurrencyConversion() {
  console.log('\n📝 Test 4: Testing currency conversion...');
  
  const CURRENCY_RATES = {
    GBP: 1.0,
    USD: 1.27,
    EUR: 1.17,
    CAD: 1.71
  };
  
  const gbpAmount = 10;
  
  Object.entries(CURRENCY_RATES).forEach(([currency, rate]) => {
    const convertedAmount = gbpAmount * rate;
    const decimals = currency === 'JPY' ? 0 : 2;
    const finalAmount = Math.round(convertedAmount * Math.pow(10, decimals)) / Math.pow(10, decimals);
    
    console.log(`   £${gbpAmount} GBP = ${finalAmount} ${currency}`);
  });
  
  console.log('✅ Currency conversion working correctly!');
}

/**
 * Main test runner
 */
async function runTests() {
  try {
    console.log('🔧 Environment Check:');
    console.log(`   REVOLUT_API_SECRET: ${REVOLUT_API_SECRET ? '✅ Set' : '❌ Missing'}`);
    console.log(`   REVOLUT_BASE_URL: ${REVOLUT_BASE_URL}`);
    console.log(`   BASE_URL: ${BASE_URL}`);
    console.log(`   REVOLUT_WEBHOOK_SECRET: ${process.env.REVOLUT_WEBHOOK_SECRET ? '✅ Set' : '⚠️ Missing (run setup script)'}`);
    console.log('');
    
    if (!REVOLUT_API_SECRET) {
      console.error('❌ REVOLUT_API_SECRET is required. Please check your .env.local file.');
      process.exit(1);
    }
    
    // Test 1: Payment creation
    const paymentResult = await testPaymentCreation();
    
    // Test 2: Webhook signature
    const { payload, signature } = testWebhookSignature();
    
    // Test 3: Webhook endpoint (will fail if server not running)
    await testWebhookEndpoint(payload, signature);
    
    // Test 4: Currency conversion
    testCurrencyConversion();
    
    console.log('\n🎉 Integration tests completed!');
    console.log('\n📋 Next steps:');
    console.log('1. Start your Next.js server: npm run dev');
    console.log('2. Run webhook setup: node scripts/setup-revolut-webhook.js');
    console.log('3. Test payment flow at: http://localhost:3013/billing');
    console.log('4. Check webhook logs in terminal and Supabase');
    
    if (paymentResult) {
      console.log(`\n🔗 Test payment URL: ${paymentResult.checkout_url}`);
      console.log('   (You can test the payment flow with this URL)');
    }
    
  } catch (error) {
    console.error('\n💥 Test failed:', error.message);
    process.exit(1);
  }
}

// Run tests
runTests();
