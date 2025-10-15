const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runConsolidation() {
  console.log('🚀 Running comprehensive permission consolidation...\n');

  try {
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'database', 'migrations', 'create_consolidated_permissions.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Split into individual INSERT statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--') && s.toLowerCase().includes('insert'));

    console.log(`📝 Executing ${statements.length} SQL statements...\n`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      console.log(`[${i + 1}/${statements.length}] Executing statement...`);

      // Parse the statement to create permissions via API
      if (statement.includes('INSERT INTO permissions')) {
        await createPermissionsFromSQL(statement);
      } else if (statement.includes('INSERT INTO role_permissions')) {
        await assignPermissionsFromSQL(statement);
      }
    }

    console.log('\n✅ Migration completed!\n');

    // Verify results
    await verifyMigration();

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

async function createPermissionsFromSQL(statement) {
  // Extract permission data from INSERT statement
  const valuesMatch = statement.match(/VALUES\s*\n([\s\S]+?)(?:ON CONFLICT|$)/i);
  if (!valuesMatch) return;

  const valuesText = valuesMatch[1];
  const rows = valuesText.split(/\),\s*\n\s*\(/);

  for (const row of rows) {
    const cleanRow = row.replace(/^\(|\)$/g, '').trim();
    const matches = cleanRow.match(/'([^']+)'/g);

    if (matches && matches.length >= 5) {
      const name = matches[0].replace(/'/g, '');
      const description = matches[1].replace(/'/g, '');
      const resource = matches[2].replace(/'/g, '');
      const action = matches[3].replace(/'/g, '');
      const scope = matches[4].replace(/'/g, '');

      const { error } = await supabase
        .from('permissions')
        .upsert({
          name,
          description,
          resource,
          action,
          scope
        }, { onConflict: 'name' });

      if (error && error.code !== '23505') {
        console.error(`  ❌ Error creating ${name}:`, error.message);
      } else {
        console.log(`  ✅ ${name}`);
      }
    }
  }
}

async function assignPermissionsFromSQL(statement) {
  // Extract role name from WHERE clause
  const roleMatch = statement.match(/r\.name = '([^']+)'/);
  if (!roleMatch) return;

  const roleName = roleMatch[1];
  console.log(`\n📌 Assigning permissions to ${roleName} role...`);

  // Get role ID
  const { data: role, error: roleError } = await supabase
    .from('roles')
    .select('id, name')
    .eq('name', roleName)
    .single();

  if (roleError) {
    console.error(`  ❌ Error finding ${roleName} role:`, roleError.message);
    return;
  }

  // Extract permission names
  const permNamesMatch = statement.match(/p\.name IN \(([\s\S]+?)\)/);
  if (!permNamesMatch) return;

  const permNames = permNamesMatch[1]
    .split(',')
    .map(p => p.trim().replace(/'/g, ''))
    .filter(p => p && !p.startsWith('--'));

  // Get permission IDs
  const { data: permissions, error: permError } = await supabase
    .from('permissions')
    .select('id, name')
    .in('name', permNames);

  if (permError) {
    console.error(`  ❌ Error getting permissions:`, permError.message);
    return;
  }

  console.log(`  Found ${permissions.length} permissions to assign`);

  // Assign each permission
  for (const perm of permissions) {
    const { error: assignError } = await supabase
      .from('role_permissions')
      .upsert({
        role_id: role.id,
        permission_id: perm.id
      }, {
        onConflict: 'role_id,permission_id'
      });

    if (assignError && assignError.code !== '23505') {
      console.error(`  ❌ ${perm.name}:`, assignError.message);
    } else {
      console.log(`  ✅ ${perm.name}`);
    }
  }
}

async function verifyMigration() {
  console.log('🔍 Verifying migration results...\n');

  // Count new permissions by scope
  const scopes = ['universal', 'messages', 'settings', 'analytics'];

  for (const scope of scopes) {
    const { data, error } = await supabase
      .from('permissions')
      .select('name')
      .eq('scope', scope);

    if (!error) {
      console.log(`✅ ${scope}: ${data.length} permissions`);
    }
  }

  // Check role permissions
  console.log('\n📊 Role Permission Counts:');

  const roles = ['artist', 'labeladmin', 'distribution_partner'];

  for (const roleName of roles) {
    const { data: role } = await supabase
      .from('roles')
      .select('id')
      .eq('name', roleName)
      .single();

    if (role) {
      const { data: perms } = await supabase
        .from('role_permissions')
        .select('permission_id')
        .eq('role_id', role.id);

      console.log(`  ${roleName}: ${perms?.length || 0} permissions`);
    }
  }
}

runConsolidation();
