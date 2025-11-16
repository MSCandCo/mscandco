/**
 * Script to fix the denied field for accessibility:use permissions
 * Run with: node scripts/fix-accessibility-denied-field.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixAccessibilityDeniedField() {
  console.log('🔧 Fixing denied field for accessibility:use permissions...\n');

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

  // Update all user_permissions records with null denied to false
  const { error: updateError, count } = await supabase
    .from('user_permissions')
    .update({ denied: false })
    .eq('permission_id', permission.id)
    .is('denied', null);

  if (updateError) {
    console.error('❌ Error updating records:', updateError);
    return;
  }

  console.log(`✅ Updated ${count || 0} records with denied: false\n`);
  console.log('🎉 All accessibility:use permissions now have denied: false!');
}

fixAccessibilityDeniedField().catch(console.error);
