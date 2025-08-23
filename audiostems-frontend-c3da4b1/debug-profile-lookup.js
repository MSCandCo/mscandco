const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function debugProfileLookup() {
  console.log('🔍 Debugging profile lookup issue...\n');
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // Get the latest user from auth
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      console.log('❌ Error getting users:', usersError);
      return;
    }
    
    const latestUser = users[users.length - 1]; // Get the most recent user
    console.log('👤 Latest user:', {
      id: latestUser.id,
      email: latestUser.email,
      created_at: latestUser.created_at
    });
    
    // Try to find their profile
    console.log('\n🔍 Looking for profile with id:', latestUser.id);
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', latestUser.id)
      .single();
    
    if (profileError) {
      console.log('❌ Profile lookup error:', profileError);
      
      // Try to see all profiles
      const { data: allProfiles, error: allError } = await supabase
        .from('user_profiles')
        .select('id, email, first_name, last_name')
        .limit(5);
      
      if (!allError) {
        console.log('\n📋 All profiles in database:');
        allProfiles.forEach(p => {
          console.log(`  - ID: ${p.id}, Email: ${p.email}, Name: ${p.first_name} ${p.last_name}`);
        });
      }
    } else {
      console.log('✅ Profile found:', {
        id: profile.id,
        email: profile.email,
        name: `${profile.first_name} ${profile.last_name}`,
        role: profile.role
      });
    }
    
    // Check artists table too
    console.log('\n🎨 Checking artists table...');
    const { data: artists, error: artistError } = await supabase
      .from('artists')
      .select('*')
      .limit(5);
    
    if (artistError) {
      console.log('❌ Artists table error:', artistError);
    } else {
      console.log('📋 Artists in database:');
      artists.forEach(a => {
        console.log(`  - User ID: ${a.user_id}, Stage Name: ${a.stage_name}`);
      });
    }
    
  } catch (err) {
    console.log('❌ Error:', err.message);
  }
}

debugProfileLookup();
