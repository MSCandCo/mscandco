const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkRoleAssignment() {
  try {
    // Get current auth users
    const { data: { users } } = await supabase.auth.admin.listUsers();

    console.log('\n=== Checking User Role Assignments ===\n');

    for (const user of users.slice(0, 5)) {
      console.log(`User: ${user.email}`);
      console.log(`Auth ID: ${user.id}`);
      const metaRole = user.user_metadata && user.user_metadata.role ? user.user_metadata.role : 'not set';
      console.log(`Auth Metadata Role: ${metaRole}`);

      // Check user_role_assignments
      const { data: roleAssignments } = await supabase
        .from('user_role_assignments')
        .select('*')
        .eq('user_id', user.id);

      console.log(`Role Assignments:`, roleAssignments);

      // Check user_profiles
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      const profileRole = profile && profile.role ? profile.role : 'not set';
      console.log(`Profile Role: ${profileRole}`);
      console.log('---\n');
    }

  } catch (err) {
    console.error('Error:', err.message);
  }
}

checkRoleAssignment();
