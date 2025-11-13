require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkAdminUsers() {
  console.log('🔍 Checking all users and their roles...\n');

  // Get all users from user_profiles
  const { data: profiles, error: profileError } = await supabase
    .from('user_profiles')
    .select(`
      id,
      email,
      first_name,
      last_name,
      roles (
        name
      )
    `)
    .order('email');

  if (profileError) {
    console.error('❌ Error fetching profiles:', profileError);
    return;
  }

  console.log(`Found ${profiles.length} users:\n`);

  // Group by role
  const usersByRole = {
    super_admin: [],
    company_admin: [],
    label_admin: [],
    artist: [],
    other: []
  };

  profiles.forEach(profile => {
    const roleName = profile.roles?.name || 'no_role';
    const userInfo = {
      id: profile.id,
      email: profile.email,
      name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'No name',
      role: roleName
    };

    if (roleName === 'super_admin') {
      usersByRole.super_admin.push(userInfo);
    } else if (roleName === 'company_admin') {
      usersByRole.company_admin.push(userInfo);
    } else if (roleName === 'label_admin') {
      usersByRole.label_admin.push(userInfo);
    } else if (roleName === 'artist') {
      usersByRole.artist.push(userInfo);
    } else {
      usersByRole.other.push(userInfo);
    }
  });

  // Display results
  console.log('👑 SUPER ADMINS (will use AdminHeader):');
  if (usersByRole.super_admin.length === 0) {
    console.log('   None found');
  } else {
    usersByRole.super_admin.forEach(u => {
      console.log(`   - ${u.email} (${u.name})`);
    });
  }

  console.log('\n🏢 COMPANY ADMINS (will use AdminHeader):');
  if (usersByRole.company_admin.length === 0) {
    console.log('   None found');
  } else {
    usersByRole.company_admin.forEach(u => {
      console.log(`   - ${u.email} (${u.name})`);
    });
  }

  console.log('\n🎵 ARTISTS (will use Standard Header):');
  if (usersByRole.artist.length === 0) {
    console.log('   None found');
  } else {
    usersByRole.artist.forEach(u => {
      console.log(`   - ${u.email} (${u.name})`);
    });
  }

  console.log('\n🏷️  LABEL ADMINS (will use Standard Header):');
  if (usersByRole.label_admin.length === 0) {
    console.log('   None found');
  } else {
    usersByRole.label_admin.forEach(u => {
      console.log(`   - ${u.email} (${u.name})`);
    });
  }

  console.log('\n❓ OTHER ROLES:');
  if (usersByRole.other.length === 0) {
    console.log('   None found');
  } else {
    usersByRole.other.forEach(u => {
      console.log(`   - ${u.email} (${u.name}) - Role: ${u.role}`);
    });
  }

  console.log('\n📊 SUMMARY:');
  console.log(`   AdminHeader users: ${usersByRole.super_admin.length + usersByRole.company_admin.length}`);
  console.log(`   Standard Header users: ${usersByRole.artist.length + usersByRole.label_admin.length}`);
  console.log(`   Other: ${usersByRole.other.length}`);
  console.log(`   Total: ${profiles.length}`);

  console.log('\n✅ Check complete\n');
}

checkAdminUsers();

