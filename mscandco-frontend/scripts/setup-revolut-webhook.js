#!/usr/bin/env node

/**
 * Revolut Webhook Setup Script
 * 
 * This script registers a webhook endpoint with Revolut Merchant API v2.0
 * to receive payment notifications for ORDER_COMPLETED, ORDER_AUTHORISED, and ORDER_CANCELLED events.
 * 
 * Usage: node scripts/setup-revolut-webhook.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

const REVOLUT_API_SECRET = process.env.REVOLUT_API_SECRET;
const REVOLUT_WEBHOOK_URL = process.env.REVOLUT_WEBHOOK_URL;
const REVOLUT_BASE_URL = process.env.REVOLUT_BASE_URL || 'https://sandbox-merchant.revolut.com';

if (!REVOLUT_API_SECRET) {
  console.error('❌ REVOLUT_API_SECRET environment variable is required');
  process.exit(1);
}

if (!REVOLUT_WEBHOOK_URL) {
  console.error('❌ REVOLUT_WEBHOOK_URL environment variable is required');
  process.exit(1);
}

console.log('🚀 Setting up Revolut webhook...');
console.log(`📡 Webhook URL: ${REVOLUT_WEBHOOK_URL}`);
console.log(`🌐 API Base URL: ${REVOLUT_BASE_URL}`);

/**
 * Create webhook registration with Revolut
 */
async function createWebhook() {
  const webhookData = {
    url: REVOLUT_WEBHOOK_URL,
    events: [
      'ORDER_COMPLETED',
      'ORDER_AUTHORISED', 
      'ORDER_CANCELLED'
    ]
  };

  const postData = JSON.stringify(webhookData);
  
  const options = {
    hostname: REVOLUT_BASE_URL.replace('https://', ''),
    port: 443,
    path: '/api/webhooks',
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
            console.log('✅ Webhook created successfully!');
            console.log(`📋 Webhook ID: ${response.id}`);
            console.log(`🔐 Signing Secret: ${response.signing_secret}`);
            
            // Save webhook details to file for reference
            const webhookInfo = {
              id: response.id,
              signing_secret: response.signing_secret,
              url: REVOLUT_WEBHOOK_URL,
              events: webhookData.events,
              created_at: new Date().toISOString()
            };
            
            const webhookInfoPath = path.join(__dirname, '..', 'webhook-info.json');
            fs.writeFileSync(webhookInfoPath, JSON.stringify(webhookInfo, null, 2));
            console.log(`💾 Webhook info saved to: ${webhookInfoPath}`);
            
            console.log('\n🔧 Add this to your .env.local file:');
            console.log(`REVOLUT_WEBHOOK_SECRET=${response.signing_secret}`);
            console.log(`REVOLUT_WEBHOOK_ID=${response.id}`);
            
            resolve(response);
          } else {
            console.error('❌ Failed to create webhook');
            console.error(`Status: ${res.statusCode}`);
            console.error('Response:', response);
            reject(new Error(`HTTP ${res.statusCode}: ${response.message || 'Unknown error'}`));
          }
        } catch (error) {
          console.error('❌ Failed to parse response:', error);
          console.error('Raw response:', data);
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
 * List existing webhooks
 */
async function listWebhooks() {
  const options = {
    hostname: REVOLUT_BASE_URL.replace('https://', ''),
    port: 443,
    path: '/api/webhooks',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${REVOLUT_API_SECRET}`,
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
            console.log('\n📋 Existing webhooks:');
            if (response.length === 0) {
              console.log('   No webhooks found');
            } else {
              response.forEach((webhook, index) => {
                console.log(`   ${index + 1}. ID: ${webhook.id}`);
                console.log(`      URL: ${webhook.url}`);
                console.log(`      Events: ${webhook.events.join(', ')}`);
                console.log('');
              });
            }
            resolve(response);
          } else {
            console.error('❌ Failed to list webhooks');
            console.error(`Status: ${res.statusCode}`);
            reject(new Error(`HTTP ${res.statusCode}`));
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

    req.end();
  });
}

/**
 * Main execution
 */
async function main() {
  try {
    // First, list existing webhooks
    await listWebhooks();
    
    // Create new webhook
    await createWebhook();
    
    console.log('\n🎉 Webhook setup complete!');
    console.log('\n📝 Next steps:');
    console.log('1. Add the REVOLUT_WEBHOOK_SECRET to your .env.local file');
    console.log('2. Restart your Next.js development server');
    console.log('3. Test the payment flow');
    console.log('4. Check webhook logs at /api/webhooks/revolut');
    
  } catch (error) {
    console.error('\n💥 Setup failed:', error.message);
    process.exit(1);
  }
}

// Run the script
main();
