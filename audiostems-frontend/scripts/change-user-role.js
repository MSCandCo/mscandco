// Simple script to change a user's role in the database
// Usage: node scripts/change-user-role.js <email> <new_role>
// Example: node scripts/change-user-role.js labeladmin@mscandco.com company_admin

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const validRoles = [
  'artist',
  'label_admin',
  'company_admin',
  'super_admin',
  'distribution_partner',
  'financial_admin',
  'requests_admin',
  'custom_admin'
];

async function changeUserRole(email, newRole) {
  try {
    console.log(`\n🔄 Changing role for ${email} to ${newRole}...\n`);

    // Validate role
    if (!validRoles.includes(newRole)) {
      console.error(`❌ Invalid role: ${newRole}`);
      console.log(`\nValid roles are: ${validRoles.join(', ')}\n`);
      process.exit(1);
    }

    // Check if user exists
    const { data: user, error: userError } = await supabase
      .from('user_profiles')
      .select('email, role, first_name, last_name')
      .eq('email', email)
      .single();

    if (userError || !user) {
      console.error(`❌ User not found: ${email}`);
      process.exit(1);
    }

    console.log(`📋 Current user details:`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.first_name} ${user.last_name}`);
    console.log(`   Current Role: ${user.role}`);
    console.log(`   New Role: ${newRole}\n`);

    // Update the role
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ role: newRole })
      .eq('email', email);

    if (updateError) {
      console.error('❌ Error updating role:', updateError.message);
      process.exit(1);
    }

    console.log(`✅ Successfully changed role to ${newRole}`);
    console.log(`\n💡 User needs to logout and login again to see the new role badge\n`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Get command line arguments
const args = process.argv.slice(2);

if (args.length !== 2) {
  console.log('\n📝 Usage: node scripts/change-user-role.js <email> <new_role>\n');
  console.log('Available roles:');
  validRoles.forEach(role => {
    console.log(`  - ${role}`);
  });
  console.log('\nExample:');
  console.log('  node scripts/change-user-role.js labeladmin@mscandco.com company_admin\n');
  process.exit(1);
}

const [email, newRole] = args;
changeUserRole(email, newRole);
