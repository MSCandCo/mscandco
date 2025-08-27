#!/usr/bin/env node

/**
 * Test Revenue Flow Script
 * 
 * Tests the complete revenue reporting and wallet system:
 * 1. Distribution partner reports revenue
 * 2. Admin approves revenue
 * 3. Artist wallet is credited
 * 4. Artist uses wallet to subscribe
 */

require('dotenv').config({ path: '.env.local' });

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3013';

console.log('🧪 Testing Revenue Flow...\n');

/**
 * Test 1: Distribution Partner Reports Revenue
 */
async function testRevenueReport() {
  console.log('📝 Test 1: Distribution Partner Reports Revenue...');
  
  const reportData = {
    artistEmail: 'info@htay.co.uk', // Use your test artist email
    amount: 50.00,
    currency: 'GBP',
    description: 'Streaming revenue for December 2024',
    releaseTitle: 'Test Song - Artist Name',
    period: 'December 2024'
  };

  console.log('   Report Data:', reportData);
  console.log('   📋 To test this:');
  console.log('   1. Login as a distribution partner');
  console.log('   2. POST to /api/revenue/report with the above data');
  console.log('   3. Check that report is created with status "pending_approval"');
  console.log('');
}

/**
 * Test 2: Admin Approves Revenue
 */
async function testRevenueApproval() {
  console.log('📝 Test 2: Admin Approves Revenue...');
  
  const approvalData = {
    reportId: 'report-id-from-step-1',
    action: 'approve',
    notes: 'Revenue verified and approved'
  };

  console.log('   Approval Data:', approvalData);
  console.log('   📋 To test this:');
  console.log('   1. Login as Company Admin (info@htay.co.uk)');
  console.log('   2. GET /api/revenue/list?status=pending_approval');
  console.log('   3. POST to /api/revenue/approve with reportId and action');
  console.log('   4. Check that artist wallet is credited automatically');
  console.log('');
}

/**
 * Test 3: Artist Checks Wallet Balance
 */
async function testWalletBalance() {
  console.log('📝 Test 3: Artist Checks Wallet Balance...');
  
  console.log('   📋 To test this:');
  console.log('   1. Login as the artist (info@htay.co.uk)');
  console.log('   2. GET /api/wallet/balance');
  console.log('   3. Check that balance shows £50.00');
  console.log('   4. Check that transactions show the revenue credit');
  console.log('');
}

/**
 * Test 4: Artist Uses Wallet for Subscription
 */
async function testWalletSubscription() {
  console.log('📝 Test 4: Artist Uses Wallet for Subscription...');
  
  const subscriptionData = {
    planId: 'artist-pro',
    billing: 'monthly'
  };

  console.log('   Subscription Data:', subscriptionData);
  console.log('   📋 To test this:');
  console.log('   1. Login as the artist (info@htay.co.uk)');
  console.log('   2. POST to /api/wallet/pay-subscription with planId and billing');
  console.log('   3. Check that subscription is activated');
  console.log('   4. Check that wallet balance is reduced by £19.99');
  console.log('   5. Check that remaining balance is £30.01');
  console.log('');
}

/**
 * API Testing Examples
 */
function showAPIExamples() {
  console.log('🔧 API Testing Examples:\n');
  
  console.log('1. Report Revenue (Distribution Partner):');
  console.log(`curl -X POST ${BASE_URL}/api/revenue/report \\`);
  console.log(`  -H "Content-Type: application/json" \\`);
  console.log(`  -H "Authorization: Bearer YOUR_DISTRIBUTION_PARTNER_TOKEN" \\`);
  console.log(`  -d '{
    "artistEmail": "info@htay.co.uk",
    "amount": 50.00,
    "description": "Streaming revenue for December 2024",
    "releaseTitle": "Test Song",
    "period": "December 2024"
  }'\n`);

  console.log('2. List Pending Reports (Admin):');
  console.log(`curl -X GET "${BASE_URL}/api/revenue/list?status=pending_approval" \\`);
  console.log(`  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"\n`);

  console.log('3. Approve Revenue (Admin):');
  console.log(`curl -X POST ${BASE_URL}/api/revenue/approve \\`);
  console.log(`  -H "Content-Type: application/json" \\`);
  console.log(`  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \\`);
  console.log(`  -d '{
    "reportId": "REPORT_ID_FROM_STEP_1",
    "action": "approve",
    "notes": "Revenue verified and approved"
  }'\n`);

  console.log('4. Check Wallet Balance (Artist):');
  console.log(`curl -X GET ${BASE_URL}/api/wallet/balance \\`);
  console.log(`  -H "Authorization: Bearer YOUR_ARTIST_TOKEN"\n`);

  console.log('5. Pay with Wallet (Artist):');
  console.log(`curl -X POST ${BASE_URL}/api/wallet/pay-subscription \\`);
  console.log(`  -H "Content-Type: application/json" \\`);
  console.log(`  -H "Authorization: Bearer YOUR_ARTIST_TOKEN" \\`);
  console.log(`  -d '{
    "planId": "artist-pro",
    "billing": "monthly"
  }'\n`);
}

/**
 * Main test runner
 */
async function runTests() {
  try {
    console.log('🔧 Environment Check:');
    console.log(`   BASE_URL: ${BASE_URL}`);
    console.log('');
    
    await testRevenueReport();
    await testRevenueApproval();
    await testWalletBalance();
    await testWalletSubscription();
    
    showAPIExamples();
    
    console.log('🎉 Revenue Flow Test Guide Complete!');
    console.log('\n📋 Next Steps:');
    console.log('1. Run the SQL to create revenue_reports table');
    console.log('2. Start your Next.js server: npm run dev');
    console.log('3. Test each step using the curl commands above');
    console.log('4. Check the terminal logs for detailed output');
    console.log('5. Verify database changes in Supabase dashboard');
    
  } catch (error) {
    console.error('\n💥 Test setup failed:', error.message);
    process.exit(1);
  }
}

// Run tests
runTests();
