const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runMigration() {
  console.log('🚀 Running distribution :access permissions migration...\n');

  try {
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'database', 'migrations', 'add_distribution_access_permissions.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql }).catch(async () => {
      // If exec_sql doesn't exist, try direct query
      return await supabase.from('_migration').insert([{ sql }]).select();
    });

    if (error) {
      // Try alternative: execute via pg connection
      console.log('⚠️  RPC not available, trying direct SQL execution...');

      // Split SQL into individual statements
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s && !s.startsWith('--'));

      for (const statement of statements) {
        if (statement) {
          const { error: execError } = await supabase.rpc('exec', { sql: statement });
          if (execError && execError.code !== '42P07') { // Ignore "already exists" errors
            console.error(`❌ Error executing statement:`, execError);
            throw execError;
          }
        }
      }
    }

    console.log('✅ Migration completed successfully!\n');

    // Verify the permissions were created
    const { data: permissions, error: permError } = await supabase
      .from('permissions')
      .select('name, description')
      .like('name', 'distribution:%:access');

    if (permError) {
      console.error('❌ Error verifying permissions:', permError);
    } else {
      console.log('📋 Distribution :access permissions in database:');
      permissions.forEach(p => {
        console.log(`   ✓ ${p.name} - ${p.description}`);
      });
    }

    // Check distribution_partner role permissions
    const { data: rolePerms, error: roleError } = await supabase
      .from('role_permissions')
      .select(`
        permission_id,
        permissions (name, description),
        roles (name)
      `)
      .eq('roles.name', 'distribution_partner')
      .like('permissions.name', 'distribution:%:access');

    if (roleError) {
      console.error('❌ Error checking role permissions:', roleError);
    } else {
      console.log('\n✅ Distribution Partner role permissions:');
      rolePerms.forEach(rp => {
        console.log(`   ✓ ${rp.permissions.name}`);
      });
    }

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();
