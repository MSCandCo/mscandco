/**
 * Script to add accessibility:use permission to ALL users
 * Run with: node scripts/add-accessibility-to-all-users.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function addAccessibilityToAllUsers() {
  console.log('🚀 Starting to add accessibility:use permission to all users...\n');

  // Get the accessibility:use permission
  const { data: permission, error: permError } = await supabase
    .from('permissions')
    .select('id')
    .eq('name', 'accessibility:use')
    .single();

  if (permError || !permission) {
    console.error('❌ Permission not found:', permError);
    return;
  }

  console.log(`✅ Found permission: ${permission.id}\n`);

  // Get all users
  const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
  if (userError) {
    console.error('❌ Error fetching users:', userError);
    return;
  }

  console.log(`📋 Found ${userData.users.length} users\n`);

  let successCount = 0;
  let alreadyHasCount = 0;
  let errorCount = 0;

  // Add permission to each user
  for (const user of userData.users) {
    console.log(`Processing: ${user.email}`);

    // Check if user already has this permission
    const { data: existing } = await supabase
      .from('user_permissions')
      .select('*')
      .eq('user_id', user.id)
      .eq('permission_id', permission.id)
      .maybeSingle();

    if (existing) {
      console.log(`  ℹ️  Already has permission`);
      alreadyHasCount++;
      continue;
    }

    // Add permission
    const { error: insertError } = await supabase
      .from('user_permissions')
      .insert({
        user_id: user.id,
        permission_id: permission.id
      });

    if (insertError) {
      console.error(`  ❌ Error:`, insertError.message);
      errorCount++;
    } else {
      console.log(`  ✅ Added permission`);
      successCount++;
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 Summary:');
  console.log(`  ✅ Successfully added: ${successCount}`);
  console.log(`  ℹ️  Already had permission: ${alreadyHasCount}`);
  console.log(`  ❌ Errors: ${errorCount}`);
  console.log(`  📋 Total users: ${userData.users.length}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  if (successCount > 0) {
    console.log('🎉 All users now have the accessibility:use permission!');
    console.log('💡 They still need to enable "Accessibility Features" in their settings.');
  }
}

addAccessibilityToAllUsers().catch(console.error);
