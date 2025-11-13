const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

(async () => {
  console.log('🔍 Searching ALL users in database...\n');

  const { data: users, error } = await supabase
    .from('user_profiles')
    .select('id, email, role, first_name, last_name, artist_name, label_name')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log(`Found ${users.length} total users:\n`);

  // Group by role
  const byRole = {};
  users.forEach(u => {
    if (!byRole[u.role]) byRole[u.role] = [];
    byRole[u.role].push(u);
  });

  Object.keys(byRole).sort().forEach(role => {
    console.log(`${role.toUpperCase()} (${byRole[role].length}):`);
    byRole[role].forEach(u => {
      const name = u.artist_name || u.label_name || `${u.first_name || ''} ${u.last_name || ''}`.trim();
      console.log(`  - ${u.email} ${name ? '(' + name + ')' : ''}`);
    });
    console.log('');
  });

  console.log('\nAll users have password: TestPass123!\n');
})();
