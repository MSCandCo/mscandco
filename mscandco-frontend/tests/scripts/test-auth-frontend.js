// Test authentication from frontend perspective
import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testFrontendAuth() {
  console.log('🧪 Testing frontend authentication flow...');
  
  try {
    // Try to get current session (this would normally be from a logged-in user)
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      console.log('❌ No active session found');
      console.log('This is expected if no user is logged in');
      
      // Try to sign in with a test user (if you have one)
      console.log('🔐 Attempting to sign in...');
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: 'test@example.com', // Replace with actual test user
        password: 'testpassword'    // Replace with actual test password
      });
      
      if (signInError) {
        console.log('❌ Sign in failed:', signInError.message);
        console.log('This is expected if test user doesn\'t exist');
        return;
      }
      
      console.log('✅ Signed in successfully');
      session = signInData.session;
    }
    
    if (session) {
      console.log('✅ Session found, testing API call...');
      console.log('User ID:', session.user.id);
      console.log('Access token (first 20 chars):', session.access_token.substring(0, 20) + '...');
      
      // Test the API endpoint
      const response = await fetch('http://localhost:3013/api/test-upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('API Response status:', response.status);
      const responseData = await response.json();
      console.log('API Response data:', responseData);
      
    } else {
      console.log('❌ No session available for testing');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testFrontendAuth();


