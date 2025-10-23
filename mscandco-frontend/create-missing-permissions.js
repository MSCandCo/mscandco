require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const MISSING_PERMISSIONS = [
  {
    name: 'user:impersonate',
    description: 'Ability to impersonate other users (Ghost Login)',
    resource: 'user',
    action: 'impersonate',
    scope: '*'
  },
  {
    name: 'distribution:read:any',
    description: 'View distribution hub and manage distributions',
    resource: 'distribution',
    action: 'read',
    scope: 'any'
  },
  {
    name: 'revenue:read',
    description: 'View revenue reports and analytics',
    resource: 'revenue',
    action: 'read',
    scope: '*'
  },
  {
    name: 'messages:read',
    description: 'View and read messages',
    resource: 'messages',
    action: 'read',
    scope: '*'
  },
  {
    name: 'notifications:read',
    description: 'View notifications',
    resource: 'notifications',
    action: 'read',
    scope: '*'
  }
];

async function createMissingPermissions() {
  console.log('🔧 Creating missing AdminHeader permissions...\n');

  let created = 0;
  let alreadyExists = 0;
  let errors = 0;

  for (const perm of MISSING_PERMISSIONS) {
    console.log(`📝 Creating: ${perm.name}`);

    // Check if it already exists
    const { data: existing, error: checkError } = await supabase
      .from('permissions')
      .select('id, name')
      .eq('name', perm.name)
      .single();

    if (existing) {
      console.log(`   ✅ Already exists (ID: ${existing.id})`);
      alreadyExists++;
      continue;
    }

    // Create the permission
    const { data, error } = await supabase
      .from('permissions')
      .insert({
        name: perm.name,
        description: perm.description,
        resource: perm.resource,
        action: perm.action,
        scope: perm.scope
      })
      .select()
      .single();

    if (error) {
      console.error(`   ❌ Error creating permission:`, error.message);
      errors++;
    } else {
      console.log(`   ✅ Created successfully (ID: ${data.id})`);
      created++;
    }
  }

  console.log('\n📊 SUMMARY:');
  console.log(`   Created: ${created}`);
  console.log(`   Already existed: ${alreadyExists}`);
  console.log(`   Errors: ${errors}`);
  console.log(`   Total: ${MISSING_PERMISSIONS.length}`);

  if (created > 0 || alreadyExists === MISSING_PERMISSIONS.length) {
    console.log('\n✅ All permissions are now in the database!');
    console.log('\n🔄 Next step: Run the assignment script to assign these permissions to admin roles:');
    console.log('   node assign-admin-permissions.js');
  } else {
    console.log('\n⚠️  Some permissions could not be created. Check the errors above.');
  }

  console.log('');
}

createMissingPermissions();

