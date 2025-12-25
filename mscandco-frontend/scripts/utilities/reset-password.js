/**
 * Reset password for a user
 *
 * Usage: node scripts/reset-password.js <email> <new-password>
 * Example: node scripts/reset-password.js superadmin@mscandco.com NewPass123!
 */

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase with service role
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function resetPassword(email, newPassword) {
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

    console.log(`\n🔧 Resetting password...`);

    // Update user password
    const { data: updatedUser, error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      { password: newPassword }
    );

    if (updateError) {
      throw updateError;
    }

    console.log(`✅ Password reset successfully!`);
    console.log(`📋 Updated user:`);
    console.log(`   ID: ${updatedUser.user.id}`);
    console.log(`   Email: ${updatedUser.user.email}`);
    console.log(`   Status: ACTIVE ✅`);

  } catch (error) {
    console.error('❌ Error resetting password:', error.message);
    process.exit(1);
  }
}

// Get email and password from command line arguments
const email = process.argv[2];
const newPassword = process.argv[3];

if (!email || !newPassword) {
  console.error('❌ Please provide both email and new password');
  console.log('Usage: node scripts/reset-password.js <email> <new-password>');
  console.log('Example: node scripts/reset-password.js superadmin@mscandco.com NewPass123!');
  process.exit(1);
}

resetPassword(email, newPassword);
