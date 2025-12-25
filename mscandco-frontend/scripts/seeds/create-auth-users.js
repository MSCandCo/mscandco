/**
 * Create auth users for profiles that don't have auth accounts
 *
 * Usage: node scripts/create-auth-users.js
 */

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase with service role
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const usersToCreate = [
  {
    email: 'requests@mscandco.com',
    password: 'TempPassword123!',
    user_metadata: {
      first_name: 'Request',
      last_name: 'Manager'
    }
  },
  {
    email: 'analytics@mscandco.com',
    password: 'TempPassword123!',
    user_metadata: {
      first_name: 'Analytics',
      last_name: 'Manager'
    }
  }
];

async function createAuthUsers() {
  console.log('🔧 Creating auth accounts...\n');

  for (const userData of usersToCreate) {
    try {
      console.log(`📧 Creating auth user for: ${userData.email}`);

      // Create the auth user
      const { data, error } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true, // Auto-confirm email
        user_metadata: userData.user_metadata
      });

      if (error) {
        console.error(`❌ Error creating ${userData.email}:`, error.message);
        console.error('Full error:', JSON.stringify(error, null, 2));
        continue;
      }

      console.log(`✅ Auth user created: ${data.user.email}`);
      console.log(`   ID: ${data.user.id}`);
      console.log(`   Status: ${data.user.email_confirmed_at ? 'ACTIVE ✅' : 'PENDING ⏳'}`);

      // Update user_profiles with the correct auth ID
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .update({ id: data.user.id })
        .eq('email', userData.email)
        .select()
        .single();

      if (profileError) {
        console.error(`❌ Error updating profile ID:`, profileError.message);
      } else {
        console.log(`✅ Updated user_profiles ID to match auth ID`);
      }

      console.log('');
    } catch (error) {
      console.error(`❌ Unexpected error for ${userData.email}:`, error.message);
    }
  }

  console.log('✅ Done!');
}

createAuthUsers();
