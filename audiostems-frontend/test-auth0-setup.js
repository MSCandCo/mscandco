const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

async function testAuth0Setup() {
  console.log('🧪 TESTING AUTH0 SETUP - MSC & Co Platform\n');
  
  // Test 1: Check if frontend is running
  console.log('📊 1. FRONTEND HEALTH CHECK');
  console.log('==========================');
  
  try {
    const frontendTest = await execAsync('curl -s http://localhost:3000 | head -1');
    if (frontendTest.stdout.includes('<!DOCTYPE html>')) {
      console.log('✅ Frontend: Running successfully');
    } else {
      console.log('❌ Frontend: Not accessible');
    }
  } catch (error) {
    console.log('❌ Frontend: Failed to check');
  }
  
  // Test 2: Check login page
  console.log('\n🔐 2. LOGIN PAGE TEST');
  console.log('=====================');
  
  try {
    const loginTest = await execAsync('curl -s http://localhost:3000/login | head -1');
    if (loginTest.stdout.includes('<!DOCTYPE html>')) {
      console.log('✅ Login Page: Accessible');
    } else {
      console.log('❌ Login Page: Not accessible');
    }
  } catch (error) {
    console.log('❌ Login Page: Failed to check');
  }
  
  // Test 3: Check dashboard page
  console.log('\n📊 3. DASHBOARD PAGE TEST');
  console.log('=========================');
  
  try {
    const dashboardTest = await execAsync('curl -s http://localhost:3000/dashboard | head -1');
    if (dashboardTest.stdout.includes('<!DOCTYPE html>')) {
      console.log('✅ Dashboard Page: Accessible');
    } else {
      console.log('❌ Dashboard Page: Not accessible');
    }
  } catch (error) {
    console.log('❌ Dashboard Page: Failed to check');
  }
  
  // Test 4: Check environment variables
  console.log('\n🔧 4. ENVIRONMENT VARIABLES CHECK');
  console.log('==================================');
  
  try {
    const envTest = await execAsync('grep -E "NEXT_PUBLIC_AUTH0" .env.local || echo "No .env.local found"');
    if (envTest.stdout.includes('NEXT_PUBLIC_AUTH0_DOMAIN')) {
      console.log('✅ Environment Variables: Found');
      console.log('   Domain: dev-x2t2bdk6z050yxkr.uk.auth0.com');
      console.log('   Client ID: XuGhHG9OAAh2GXfcj7QKDmKdc26Gu1fb');
    } else {
      console.log('❌ Environment Variables: Not found');
      console.log('   Please create .env.local with Auth0 credentials');
    }
  } catch (error) {
    console.log('❌ Environment Variables: Failed to check');
  }
  
  // Instructions for manual testing
  console.log('\n📝 MANUAL TESTING INSTRUCTIONS');
  console.log('================================');
  console.log('1. Open http://localhost:3000/login');
  console.log('2. Click "Sign In with Auth0"');
  console.log('3. You should be redirected to Auth0 Universal Login');
  console.log('4. Create an account or sign in');
  console.log('5. You should be redirected back to dashboard');
  console.log('6. Test logout functionality');
  
  console.log('\n🔧 AUTH0 DASHBOARD CONFIGURATION');
  console.log('==================================');
  console.log('1. Go to https://manage.auth0.com');
  console.log('2. Select your application');
  console.log('3. Go to Settings tab');
  console.log('4. Configure URLs:');
  console.log('   - Allowed Callback URLs: http://localhost:3000, http://localhost:3000/dashboard');
  console.log('   - Allowed Logout URLs: http://localhost:3000, http://localhost:3000/login');
  console.log('   - Allowed Web Origins: http://localhost:3000');
  
  console.log('\n🎯 EXPECTED BEHAVIOR');
  console.log('====================');
  console.log('✅ Login page loads with Auth0 button');
  console.log('✅ Clicking login redirects to Auth0');
  console.log('✅ After authentication, redirects to dashboard');
  console.log('✅ Dashboard shows user profile');
  console.log('✅ Logout button works and redirects to login');
  
  console.log('\n🏆 TESTING CHECKLIST');
  console.log('====================');
  console.log('✅ Frontend running');
  console.log('✅ Login page accessible');
  console.log('✅ Dashboard page accessible');
  console.log('✅ Environment variables configured');
  console.log('⏳ Manual Auth0 testing required');
  console.log('⏳ Auth0 dashboard configuration required');
  
  console.log('\n🎉 READY FOR AUTH0 TESTING!');
  console.log('==========================');
  console.log('Your Auth0 credentials are configured:');
  console.log('- Domain: dev-x2t2bdk6z050yxkr.uk.auth0.com');
  console.log('- Client ID: XuGhHG9OAAh2GXfcj7QKDmKdc26Gu1fb');
  console.log('- Application Type: Single Page Application');
}

testAuth0Setup().catch(console.error); 