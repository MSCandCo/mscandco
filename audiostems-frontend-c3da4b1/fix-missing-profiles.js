const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase with service role key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function fixMissingProfiles() {
  try {
    console.log('🔍 Checking for users missing profiles...\n');

    // Get all Auth users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) {
      console.error('❌ Error fetching auth users:', authError);
      return;
    }

    console.log(`📧 Found ${authUsers.users.length} Auth users:`);
    authUsers.users.forEach(user => {
      console.log(`  - ${user.email} (ID: ${user.id})`);
    });

    // Get all profile users
    const { data: profileUsers, error: profileError } = await supabase
      .from('user_profiles')
      .select('id, email');
    
    if (profileError) {
      console.error('❌ Error fetching profile users:', profileError);
      return;
    }

    console.log(`\n👤 Found ${profileUsers.length} Profile users:`);
    profileUsers.forEach(user => {
      console.log(`  - ${user.email} (ID: ${user.id})`);
    });

    // Find missing profiles
    const profileIds = new Set(profileUsers.map(p => p.id));
    const missingProfiles = authUsers.users.filter(user => !profileIds.has(user.id));

    console.log(`\n⚠️  Users missing profiles: ${missingProfiles.length}`);

    if (missingProfiles.length === 0) {
      console.log('✅ All users have profiles!');
      return;
    }

    // Create missing profiles
    for (const user of missingProfiles) {
      console.log(`\n🔧 Creating profile for: ${user.email}`);

      // Create user_profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: user.id,
          email: user.email,
          role: 'artist',
          subscription_status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (profileError) {
        console.error(`❌ Error creating profile for ${user.email}:`, profileError);
        continue;
      }

      // Create artist record
      const { error: artistError } = await supabase
        .from('artists')
        .insert({
          user_id: user.id,
          stage_name: user.email.split('@')[0], // Use email prefix as stage name
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (artistError) {
        console.error(`❌ Error creating artist for ${user.email}:`, artistError);
      } else {
        console.log(`✅ Created profile and artist for ${user.email}`);
      }
    }

    console.log('\n🎉 Profile sync complete!');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

fixMissingProfiles();
