/**
 * Setup Test Users for Permission Testing
 * Creates test accounts with known passwords for automated testing
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

const TEST_USERS = [
  {
    email: 'artist1@test.com',
    password: 'Test1234!',
    role: 'artist',
    first_name: 'Test',
    last_name: 'Artist',
    artist_name: 'Test Artist 1'
  },
  {
    email: 'labeladmin1@test.com',
    password: 'Test1234!',
    role: 'label_admin',
    first_name: 'Test',
    last_name: 'Label',
    label_name: 'Test Label 1'
  }
];

async function createTestUser(userData) {
  try {
    console.log(`\n📝 Creating test user: ${userData.email}`);

    // Check if user already exists
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('id, email')
      .eq('email', userData.email)
      .single();

    if (existingProfile) {
      console.log(`  ✅ User already exists: ${userData.email}`);
      return existingProfile;
    }

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true,
      user_metadata: {
        role: userData.role
      }
    });

    if (authError) {
      console.error(`  ❌ Error creating auth user:`, authError.message);
      return null;
    }

    console.log(`  ✅ Created auth user: ${authData.user.id}`);

    // Create user profile
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        id: authData.user.id,
        email: userData.email,
        role: userData.role,
        first_name: userData.first_name,
        last_name: userData.last_name,
        artist_name: userData.artist_name || null,
        label_name: userData.label_name || null,
        display_name: `${userData.first_name} ${userData.last_name}`,
        company_name: userData.label_name || 'Test Company'
      })
      .select()
      .single();

    if (profileError) {
      console.error(`  ❌ Error creating profile:`, profileError.message);
      return null;
    }

    console.log(`  ✅ Created user profile`);

    // Assign default role
    const { data: roleData } = await supabase
      .from('roles')
      .select('id')
      .eq('name', userData.role)
      .single();

    if (roleData) {
      await supabase
        .from('user_roles')
        .insert({
          user_id: authData.user.id,
          role_id: roleData.id
        });
      console.log(`  ✅ Assigned role: ${userData.role}`);
    }

    console.log(`  🎉 Successfully created test user: ${userData.email}`);
    return profileData;

  } catch (error) {
    console.error(`  ❌ Error creating test user:`, error.message);
    return null;
  }
}

async function main() {
  console.log('\n' + '='.repeat(80));
  console.log('🔧 SETTING UP TEST USERS FOR PERMISSION TESTING');
  console.log('='.repeat(80));

  for (const userData of TEST_USERS) {
    await createTestUser(userData);
  }

  console.log('\n' + '='.repeat(80));
  console.log('✅ Test user setup complete!');
  console.log('='.repeat(80) + '\n');

  console.log('Test Users:');
  TEST_USERS.forEach(user => {
    console.log(`  - ${user.email} (${user.role}) - Password: ${user.password}`);
  });

  console.log('\n💡 You can now run: node test-all-permissions-playwright.js\n');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
