// Quick Admin Setup Script
// Run this with: node quick-admin-setup.js

const { createClient } = require('@supabase/supabase-js');

// Your Supabase credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'YOUR_SERVICE_ROLE_KEY';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupAdminUsers() {
  console.log('🔧 Setting up admin users...');

  try {
    // Create Super Admin user
    const { data: superAdminAuth, error: superAdminError } = await supabase.auth.admin.createUser({
      email: 'superadmin@mscandco.com',
      password: 'TempPassword123!',
      email_confirm: true,
      user_metadata: {
        first_name: 'Super',
        last_name: 'Admin'
      }
    });

    if (superAdminError) {
      console.log('Super Admin might already exist:', superAdminError.message);
    } else {
      console.log('✅ Super Admin auth user created:', superAdminAuth.user.id);
    }

    // Create Company Admin user
    const { data: companyAdminAuth, error: companyAdminError } = await supabase.auth.admin.createUser({
      email: 'companyadmin@mscandco.com', 
      password: 'TempPassword123!',
      email_confirm: true,
      user_metadata: {
        first_name: 'Company',
        last_name: 'Admin'
      }
    });

    if (companyAdminError) {
      console.log('Company Admin might already exist:', companyAdminError.message);
    } else {
      console.log('✅ Company Admin auth user created:', companyAdminAuth.user.id);
    }

    // Get existing users to update profiles
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      console.error('❌ Error fetching users:', usersError);
      return;
    }

    // Find and update Super Admin profile
    const superAdmin = users.users.find(u => u.email === 'superadmin@mscandco.com');
    if (superAdmin) {
      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          id: superAdmin.id,
          email: superAdmin.email,
          first_name: 'Super',
          last_name: 'Admin',
          user_role: 'super_admin',
          subscription_type: 'enterprise',
          subscription_status: 'active',
          brand_id: 'msc_co'
        });
      
      if (profileError) {
        console.error('❌ Error creating Super Admin profile:', profileError);
      } else {
        console.log('✅ Super Admin profile created/updated');
      }
    }

    // Find and update Company Admin profile
    const companyAdmin = users.users.find(u => u.email === 'companyadmin@mscandco.com');
    if (companyAdmin) {
      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          id: companyAdmin.id,
          email: companyAdmin.email,
          first_name: 'Company', 
          last_name: 'Admin',
          user_role: 'company_admin',
          subscription_type: 'enterprise',
          subscription_status: 'active',
          brand_id: 'msc_co'
        });
      
      if (profileError) {
        console.error('❌ Error creating Company Admin profile:', profileError);
      } else {
        console.log('✅ Company Admin profile created/updated');
      }
    }

    // Verify setup
    const { data: adminProfiles, error: verifyError } = await supabase
      .from('user_profiles')
      .select('email, first_name, last_name, user_role, subscription_type')
      .in('user_role', ['super_admin', 'company_admin']);

    if (verifyError) {
      console.error('❌ Error verifying setup:', verifyError);
    } else {
      console.log('\n🎉 Admin users setup complete!');
      console.table(adminProfiles);
    }

  } catch (error) {
    console.error('❌ Setup failed:', error);
  }
}

// Run the setup
setupAdminUsers();
