const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkSuperAdminRole() {
  try {
    console.log('\n=== Checking Super Admin Role ===\n');

    // Find superadmin user
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('id, email, role')
      .eq('email', 'superadmin@mscandco.com')
      .single();

    console.log('Super Admin Profile:', profile);

    if (profile) {
      // Test get_user_role
      const { data: roleData } = await supabase
        .rpc('get_user_role', { input_user_id: profile.id });

      console.log('get_user_role() result:', roleData);

      // Check what roles are allowed in RLS
      console.log('\n--- Checking allowed roles in RLS policies ---');
      console.log('Current policies should allow these roles:');
      console.log('- super_admin');
      console.log('- admin');
      console.log('- company_admin');
      console.log('- requests_admin');

      console.log('\nSuper admin actual role:', profile.role);
      console.log('Does it match allowed roles?', ['super_admin', 'admin', 'company_admin', 'requests_admin'].includes(profile.role));
    }

    // Also check all users and their roles
    console.log('\n--- All User Roles ---');
    const { data: allProfiles } = await supabase
      .from('user_profiles')
      .select('email, role')
      .order('email');

    allProfiles.forEach(p => {
      console.log(`${p.email}: ${p.role}`);
    });

  } catch (err) {
    console.error('Error:', err.message);
  }
}

checkSuperAdminRole();
