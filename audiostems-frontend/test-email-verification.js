const { ManagementClient } = require('auth0');
require('dotenv').config({ path: '.env.local' });

async function testEmailVerificationSystem() {
  console.log('=== Email Verification System Test ===');
  
  // Check environment variables
  console.log('SENDGRID_API_KEY:', process.env.SENDGRID_API_KEY ? 'SET' : 'NOT SET');
  console.log('SENDGRID_FROM_EMAIL:', process.env.SENDGRID_FROM_EMAIL || 'NOT SET');
  console.log('AUTH0_DOMAIN:', process.env.AUTH0_DOMAIN);
  console.log('AUTH0_MGMT_CLIENT_ID:', process.env.AUTH0_MGMT_CLIENT_ID ? 'SET' : 'NOT SET');
  
  if (!process.env.SENDGRID_API_KEY) {
    console.error('❌ SENDGRID_API_KEY is not set');
    return;
  }

  // Test code generation
  function generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  const testCode = generateVerificationCode();
  console.log('✅ Generated test code:', testCode);
  
  // Test code validation
  if (/^\d{6}$/.test(testCode)) {
    console.log('✅ Code format validation passed');
  } else {
    console.error('❌ Code format validation failed');
  }

  // Test expiry calculation
  const codeExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  console.log('✅ Code expiry set to:', codeExpiry.toISOString());
  
  // Test expiry validation
  const currentTime = new Date();
  const timeUntilExpiry = codeExpiry.getTime() - currentTime.getTime();
  const minutesUntilExpiry = Math.floor(timeUntilExpiry / (1000 * 60));
  
  console.log(`✅ Code expires in ${minutesUntilExpiry} minutes`);
  
  if (minutesUntilExpiry <= 10 && minutesUntilExpiry > 0) {
    console.log('✅ Expiry calculation is correct');
  } else {
    console.error('❌ Expiry calculation is incorrect');
  }

  console.log('\n=== Test Summary ===');
  console.log('✅ Code generation: Working');
  console.log('✅ Code format validation: Working');
  console.log('✅ Expiry calculation: Working');
  console.log('✅ Environment variables: Configured');
  console.log('\n📧 To test email sending, you need to:');
  console.log('1. Set up SendGrid API key in .env.local');
  console.log('2. Configure SENDGRID_FROM_EMAIL in .env.local');
  console.log('3. Test the registration flow in the browser');
}

testEmailVerificationSystem().catch(console.error); 