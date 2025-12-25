/**
 * Manually confirm/activate a user's email
 *
 * Usage: node scripts/confirm-user.js <user-email>
 * Example: node scripts/confirm-user.js labeladmin@mscandco.com
 */

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase with service role
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function confirmUser(email) {
  try {
    console.log(`🔍 Looking for user: ${email}...`);

    // Get all users and find by email
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
      throw listError;
    }

    const user = users.find(u => u.email === email);

    if (!user) {
      console.error(`❌ User not found: ${email}`);
      process.exit(1);
    }

    console.log(`📋 User found:`);
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Current status: ${user.email_confirmed_at ? 'ACTIVE ✅' : 'PENDING ⏳'}`);

    if (user.email_confirmed_at) {
      console.log(`✅ User is already confirmed!`);
      process.exit(0);
    }

    console.log(`\n🔧 Confirming user email...`);

    // Update user to confirm email
    const { data: updatedUser, error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      { email_confirm: true }
    );

    if (updateError) {
      throw updateError;
    }

    console.log(`✅ User email confirmed successfully!`);
    console.log(`📋 Updated user:`);
    console.log(`   ID: ${updatedUser.user.id}`);
    console.log(`   Email: ${updatedUser.user.email}`);
    console.log(`   Status: ACTIVE ✅`);
    console.log(`   Confirmed at: ${updatedUser.user.email_confirmed_at}`);

  } catch (error) {
    console.error('❌ Error confirming user:', error.message);
    process.exit(1);
  }
}

// Get email from command line arguments
const email = process.argv[2];

if (!email) {
  console.error('❌ Please provide a user email');
  console.log('Usage: node scripts/confirm-user.js <user-email>');
  console.log('Example: node scripts/confirm-user.js labeladmin@mscandco.com');
  process.exit(1);
}

confirmUser(email);
