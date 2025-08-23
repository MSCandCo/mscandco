const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🚀 Creating Test Users for MSC & Co Platform');
console.log('=============================================');

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('💡 You need both NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

// Create admin client for user creation
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const testUsers = [
  {
    email: 'info@htay.co.uk',
    password: 'password123',
    role: 'artist',
    firstName: 'YHWH',
    lastName: 'MSC',
    displayName: 'YHWH MSC',
    artistName: 'YHWH MSC'
  },
  {
    email: 'artist@mscandco.com',
    password: 'password123',
    role: 'artist',
    firstName: 'Test',
    lastName: 'Artist',
    displayName: 'Test Artist',
    artistName: 'Test Artist'
  },
  {
    email: 'label@mscandco.com',
    password: 'password123',
    role: 'label_admin',
    firstName: 'Label',
    lastName: 'Admin',
    displayName: 'Label Admin',
    labelName: 'MSC Records'
  },
  {
    email: 'company@mscandco.com',
    password: 'password123',
    role: 'company_admin',
    firstName: 'Company',
    lastName: 'Admin',
    displayName: 'Company Admin',
    companyName: 'MSC & Co'
  },
  {
    email: 'distribution@mscandco.com',
    password: 'password123',
    role: 'distribution_partner',
    firstName: 'Distribution',
    lastName: 'Partner',
    displayName: 'Distribution Partner',
    companyName: 'MSC Distribution'
  },
  {
    email: 'admin@mscandco.com',
    password: 'password123',
    role: 'super_admin',
    firstName: 'Super',
    lastName: 'Admin',
    displayName: 'Super Admin'
  }
];

async function createTestUser(userData) {
  try {
    console.log(`\n👤 Creating user: ${userData.email} (${userData.role})`);
    
    // 1. Create auth user
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true // Auto-confirm email
    });

    if (authError) {
      if (authError.message.includes('already been registered')) {
        console.log(`⚠️  User already exists: ${userData.email}`);
        
        // Try to find existing user and update profile
        const { data: existingUsers } = await supabase.auth.admin.listUsers();
        const existingUser = existingUsers.users.find(u => u.email === userData.email);
        
        if (existingUser) {
          await updateUserProfile(existingUser.id, userData);
        }
        return;
      } else {
        throw authError;
      }
    }

    console.log(`✅ Auth user created: ${authUser.user.id}`);

    // 2. Create user profile
    await updateUserProfile(authUser.user.id, userData);

  } catch (error) {
    console.error(`❌ Failed to create user ${userData.email}:`, error.message);
  }
}

async function updateUserProfile(userId, userData) {
  try {
    // Create comprehensive user profile
    const profileData = {
      id: userId,
      email: userData.email,
      role: userData.role,
      first_name: userData.firstName,
      last_name: userData.lastName,
      display_name: userData.displayName,
      subscription_status: 'active',
      approval_status: 'approved',
      plan: userData.role === 'artist' ? 'Artist Pro' : 'Admin',
      registration_completed: true,
      profile_completed: true,
      email_verified: true,
      phone_verified: false,
      wallet_enabled: true,
      wallet_balance: userData.role === 'artist' ? 1247.53 : 0,
      negative_balance_allowed: userData.role === 'artist',
      wallet_credit_limit: userData.role === 'artist' ? 500 : 0,
      auto_pay_from_wallet: false,
      preferred_payment_method: 'revolut',
      revolut_subscription_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Add role-specific fields
    if (userData.labelName) profileData.label_name = userData.labelName;
    if (userData.companyName) profileData.company_name = userData.companyName;
    if (userData.artistName) profileData.bio = `Professional recording artist and performer.`;

    const { error: profileError } = await supabase
      .from('user_profiles')
      .upsert(profileData);

    if (profileError) {
      throw profileError;
    }

    console.log(`✅ Profile created for: ${userData.email}`);

    // 3. Create artist record if needed
    if (userData.role === 'artist') {
      const artistData = {
        user_id: userId,
        stage_name: userData.artistName,
        real_name: `${userData.firstName} ${userData.lastName}`,
        bio: 'Professional recording artist and performer.',
        genre: 'Hip Hop',
        artist_type: 'Solo Artist',
        years_active: '5 years',
        record_label: 'MSC Records',
        publisher: 'MSC Publishing',
        artist_revenue_percentage: 70.00,
        label_revenue_percentage: 20.00,
        company_revenue_percentage: 10.00,
        custom_split_enabled: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { error: artistError } = await supabase
        .from('artists')
        .upsert(artistData);

      if (artistError) {
        console.log(`⚠️  Artist record creation failed: ${artistError.message}`);
      } else {
        console.log(`✅ Artist record created for: ${userData.artistName}`);
      }
    }

  } catch (error) {
    console.error(`❌ Failed to create profile for ${userData.email}:`, error.message);
  }
}

async function createAllTestUsers() {
  console.log(`\n📝 Creating ${testUsers.length} test users...`);
  
  for (const userData of testUsers) {
    await createTestUser(userData);
  }

  console.log('\n🎉 Test Users Creation Complete!');
  console.log('===================================');
  console.log('You can now log in with any of these accounts:');
  console.log('');
  
  testUsers.forEach(user => {
    console.log(`📧 ${user.email} (${user.role})`);
    console.log(`🔐 Password: ${user.password}`);
    console.log('');
  });

  console.log('🚀 Try logging in at: http://localhost:3003/login');
}

// Run the creation process
createAllTestUsers().catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});
