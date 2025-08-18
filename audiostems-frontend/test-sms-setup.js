// Test SMS Configuration Script
// Run this to verify your Supabase SMS setup is working

import { supabase } from './lib/supabase.js';

async function testSMSSetup() {
  console.log('🧪 Testing Supabase SMS Configuration...\n');

  // Test phone number (use your real number for testing)
  const testPhoneNumber = '+1234567890'; // Replace with your phone number
  
  try {
    console.log(`📱 Sending SMS to: ${testPhoneNumber}`);
    
    // Send SMS OTP
    const { data, error } = await supabase.auth.signInWithOtp({
      phone: testPhoneNumber
    });

    if (error) {
      console.error('❌ SMS Test Failed:');
      console.error('Error:', error.message);
      
      // Common error solutions
      if (error.message.includes('SMS not configured')) {
        console.log('\n💡 Solution: Configure SMS provider in Supabase Dashboard');
        console.log('   → Go to Authentication → Settings → Phone Auth');
        console.log('   → Enable phone confirmations');
        console.log('   → Add Twilio credentials');
      }
      
      if (error.message.includes('Invalid phone number')) {
        console.log('\n💡 Solution: Use proper phone number format');
        console.log('   → Include country code: +1234567890');
        console.log('   → Use E.164 format');
      }
      
      if (error.message.includes('Rate limit')) {
        console.log('\n💡 Solution: Wait before trying again');
        console.log('   → Rate limits protect against spam');
        console.log('   → Try again in a few minutes');
      }
      
      return false;
    }

    console.log('✅ SMS sent successfully!');
    console.log('📲 Check your phone for the verification code');
    console.log('\nNext steps:');
    console.log('1. Enter the 6-digit code you received');
    console.log('2. Use supabase.auth.verifyOtp() to verify the code');
    console.log('3. Your SMS setup is working! 🎉');
    
    return true;

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return false;
  }
}

// Verify SMS code (run this after receiving SMS)
async function verifySMSCode(phoneNumber, code) {
  console.log(`🔍 Verifying code: ${code} for ${phoneNumber}`);
  
  try {
    const { data, error } = await supabase.auth.verifyOtp({
      phone: phoneNumber,
      token: code,
      type: 'sms'
    });

    if (error) {
      console.error('❌ Verification failed:', error.message);
      return false;
    }

    console.log('✅ SMS verification successful!');
    console.log('🎉 Your SMS setup is fully working!');
    return true;

  } catch (error) {
    console.error('❌ Verification error:', error);
    return false;
  }
}

// Export functions for manual testing
export { testSMSSetup, verifySMSCode };

// Auto-run test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testSMSSetup();
}
