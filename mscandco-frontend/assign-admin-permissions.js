require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Complete list of AdminHeader permissions
const ADMIN_HEADER_PERMISSIONS = [
  // Navigation - User & Access
  'analytics:requests:read',
  'users_access:user_management:read',
  'users_access:permissions_roles:read',
  'user:impersonate',
  
  // Navigation - Analytics
  'analytics:analytics_management:read',
  'analytics:platform_analytics:read',
  
  // Navigation - Finance
  'finance:earnings_management:read',
  'finance:wallet_management:read',
  'finance:split_configuration:read',
  
  // Navigation - Content
  'content:asset_library:read',
  'users_access:master_roster:read',
  
  // Navigation - Distribution
  'distribution:read:any',
  'revenue:read',
  
  // User Dropdown
  'platform_messages:read',
  'messages:read',
  'settings:read',
  
  // Icons
  'notifications:read'
];

// Roles that should have AdminHeader (excluding artist and label_admin)
const ADMIN_ROLES = [
  'super_admin',
  'company_admin',
  'analytics_admin',
  'distribution_partner',
  'requests_admin',
  'labeladmin' // This is the old labeladmin role (not label_admin)
];

async function assignAdminPermissions() {
  console.log('🔧 Assigning AdminHeader permissions to admin roles...\n');

  // 1. Get all permissions
  const { data: allPermissions, error: permError } = await supabase
    .from('permissions')
    .select('id, name');

  if (permError) {
    console.error('❌ Error fetching permissions:', permError);
    return;
  }

  console.log(`📋 Found ${allPermissions.length} total permissions in database\n`);

  // 2. Check which AdminHeader permissions exist
  const existingPermissions = [];
  const missingPermissions = [];

  ADMIN_HEADER_PERMISSIONS.forEach(permName => {
    const found = allPermissions.find(p => p.name === permName);
    if (found) {
      existingPermissions.push(found);
    } else {
      missingPermissions.push(permName);
    }
  });

  console.log(`✅ Existing permissions: ${existingPermissions.length}/${ADMIN_HEADER_PERMISSIONS.length}`);
  if (missingPermissions.length > 0) {
    console.log(`⚠️  Missing permissions (need to be created):`);
    missingPermissions.forEach(p => console.log(`   - ${p}`));
    console.log('');
  }

  // 3. Get all admin roles
  const { data: roles, error: roleError } = await supabase
    .from('roles')
    .select('id, name')
    .in('name', ADMIN_ROLES);

  if (roleError) {
    console.error('❌ Error fetching roles:', roleError);
    return;
  }

  console.log(`📋 Found ${roles.length} admin roles:\n`);
  roles.forEach(r => console.log(`   - ${r.name}`));
  console.log('');

  // 4. For each admin role, assign all existing permissions
  for (const role of roles) {
    console.log(`\n🔧 Processing role: ${role.name}`);

    // Get current permissions for this role
    const { data: currentPerms, error: currentError } = await supabase
      .from('role_permissions')
      .select('permission_id, permissions(name)')
      .eq('role_id', role.id);

    if (currentError) {
      console.error(`   ❌ Error fetching current permissions:`, currentError);
      continue;
    }

    const currentPermNames = currentPerms.map(cp => cp.permissions.name);
    console.log(`   Current permissions: ${currentPermNames.length}`);

    // Determine which permissions to add
    const permsToAdd = existingPermissions.filter(p => 
      !currentPermNames.includes(p.name)
    );

    if (permsToAdd.length === 0) {
      console.log(`   ✅ Already has all available AdminHeader permissions`);
      continue;
    }

    console.log(`   📝 Adding ${permsToAdd.length} new permissions...`);

    // Add missing permissions
    const inserts = permsToAdd.map(p => ({
      role_id: role.id,
      permission_id: p.id
    }));

    const { error: insertError } = await supabase
      .from('role_permissions')
      .insert(inserts);

    if (insertError) {
      console.error(`   ❌ Error inserting permissions:`, insertError);
    } else {
      console.log(`   ✅ Successfully added ${permsToAdd.length} permissions`);
      permsToAdd.forEach(p => console.log(`      + ${p.name}`));
    }
  }

  console.log('\n\n📊 SUMMARY:');
  console.log(`   Total AdminHeader permissions: ${ADMIN_HEADER_PERMISSIONS.length}`);
  console.log(`   Existing in database: ${existingPermissions.length}`);
  console.log(`   Missing from database: ${missingPermissions.length}`);
  console.log(`   Admin roles updated: ${roles.length}`);

  if (missingPermissions.length > 0) {
    console.log('\n⚠️  ACTION REQUIRED:');
    console.log('   The following permissions need to be created in the database:');
    missingPermissions.forEach(p => console.log(`   - ${p}`));
    console.log('\n   Run the SQL script to create them, then run this script again.');
  }

  console.log('\n✅ Permission assignment complete\n');
}

assignAdminPermissions();

