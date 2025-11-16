/**
 * Script to add accessibility:use permission to artist role
 * Run with: node scripts/add-accessibility-to-artist-role.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function addAccessibilityToArtistRole() {
  console.log('🚀 Adding accessibility:use permission to artist role...\n');

  // Get the artist role
  const { data: role, error: roleError } = await supabase
    .from('roles')
    .select('id, name')
    .eq('name', 'artist')
    .single();

  if (roleError || !role) {
    console.error('❌ Artist role not found:', roleError);
    return;
  }

  console.log(`✅ Found role: ${role.name} (${role.id})\n`);

  // Get the accessibility:use permission
  const { data: permission, error: permError } = await supabase
    .from('permissions')
    .select('id, name')
    .eq('name', 'accessibility:use')
    .single();

  if (permError || !permission) {
    console.error('❌ Permission not found:', permError);
    return;
  }

  console.log(`✅ Found permission: ${permission.name} (${permission.id})\n`);

  // Check if role already has this permission
  const { data: existing } = await supabase
    .from('role_permissions')
    .select('*')
    .eq('role_id', role.id)
    .eq('permission_id', permission.id)
    .maybeSingle();

  if (existing) {
    console.log('ℹ️  Role already has this permission');
    return;
  }

  // Add permission to role
  const { error: insertError } = await supabase
    .from('role_permissions')
    .insert({
      role_id: role.id,
      permission_id: permission.id
    });

  if (insertError) {
    console.error('❌ Error adding permission:', insertError);
    return;
  }

  console.log('✅ Successfully added accessibility:use permission to artist role!');
  console.log('🎉 All artists will now have the accessibility:use permission automatically.');
}

addAccessibilityToArtistRole().catch(console.error);
