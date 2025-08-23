const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables:');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
  console.error('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);
  console.error('\n📝 Add these to your .env.local file:');
  console.error('NEXT_PUBLIC_SUPABASE_URL=your-supabase-url');
  console.error('SUPABASE_SERVICE_ROLE_KEY=your-service-role-key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const testUsers = [
  { email: 'artist@test.com', role: 'artist', name: 'Test Artist' },
  { email: 'label@test.com', role: 'label_admin', name: 'Label Admin' },
  { email: 'company@test.com', role: 'company_admin', name: 'Company Admin' },
  { email: 'distribution@test.com', role: 'distribution_partner', name: 'Distribution Partner' },
  { email: 'superadmin@test.com', role: 'super_admin', name: 'Super Admin' }
];

async function createTestUsers() {
  console.log('🚀 Creating test users...\n');
  
  for (const user of testUsers) {
    try {
      console.log(`📝 Creating ${user.role}: ${user.email}`);
      
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: 'password123',
        email_confirm: true,
        user_metadata: {
          role: user.role,
          name: user.name
        }
      });

      if (authError) {
        console.error(`❌ Auth error for ${user.email}:`, authError.message);
        continue;
      }

      console.log(`✅ Auth user created: ${authData.user.id}`);

      // Create profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: authData.user.id,
          email: user.email,
          role: user.role,
          display_name: user.name,
          first_name: user.name.split(' ')[0],
          last_name: user.name.split(' ')[1] || '',
          registration_completed: true,
          profile_completed: true
        });

      if (profileError) {
        console.error(`❌ Profile error for ${user.email}:`, profileError.message);
      } else {
        console.log(`✅ Profile created for ${user.email}`);
      }
      
      console.log('');
    } catch (error) {
      console.error(`❌ Error creating ${user.email}:`, error.message);
    }
  }

  // Verify users
  console.log('🔍 Verifying created users...');
  const { data: profiles, error } = await supabase
    .from('user_profiles')
    .select('email, role, display_name')
    .order('role');

  if (error) {
    console.error('❌ Error fetching profiles:', error);
  } else {
    console.log('\n✅ Created users:');
    profiles.forEach(profile => {
      console.log(`  📧 ${profile.email} - ${profile.role} (${profile.display_name})`);
    });
  }

  console.log('\n🎯 Test these credentials:');
  console.log('  Email: artist@test.com');
  console.log('  Password: password123');
  console.log('\n🚀 Ready to test login at http://localhost:3003/login');
}

createTestUsers().catch(console.error);
