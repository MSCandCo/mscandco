/**
 * Script to add accessibility:use permission to a user
 * Run with: node scripts/add-accessibility-permission.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function addAccessibilityPermission() {
  const userEmail = 'info@htay.co.uk';

  console.log(`🔍 Finding user: ${userEmail}`);

  // Get user
  const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
  if (userError) {
    console.error('❌ Error fetching users:', userError);
    return;
  }

  const user = userData.users.find(u => u.email === userEmail);
  if (!user) {
    console.error(`❌ User not found: ${userEmail}`);
    return;
  }

  console.log(`✅ Found user: ${user.id}`);

  // Get the accessibility:use permission
  let { data: permission, error: permError } = await supabase
    .from('permissions')
    .select('id')
    .eq('name', 'accessibility:use')
    .single();

  if (permError || !permission) {
    console.error('❌ Permission not found:', permError);
    console.log('📝 Creating accessibility:use permission...');

    const { data: newPerm, error: createError} = await supabase
      .from('permissions')
      .insert({
        name: 'accessibility:use',
        description: 'Access and use accessibility features',
        resource: 'accessibility',
        action: 'use',
        scope: 'own'
      })
      .select()
      .single();

    if (createError) {
      console.error('❌ Error creating permission:', createError);
      return;
    }

    console.log('✅ Permission created:', newPerm.id);
    permission = newPerm;
  }

  console.log(`✅ Permission found: ${permission.id}`);

  // Check if user already has this permission
  const { data: existing, error: existError } = await supabase
    .from('user_permissions')
    .select('*')
    .eq('user_id', user.id)
    .eq('permission_id', permission.id)
    .maybeSingle();

  if (existing) {
    console.log('ℹ️  User already has this permission');
    return;
  }

  // Add permission to user
  const { error: insertError } = await supabase
    .from('user_permissions')
    .insert({
      user_id: user.id,
      permission_id: permission.id
    });

  if (insertError) {
    console.error('❌ Error adding permission:', insertError);
    return;
  }

  console.log('✅ Successfully added accessibility:use permission to user!');
  console.log('🎉 The accessibility link should now appear in the header after refreshing.');
}

addAccessibilityPermission().catch(console.error);
