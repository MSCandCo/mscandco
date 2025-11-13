const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

async function checkBackupTable() {
  console.log('🔍 Checking role_permissions_backup table...\n')

  // Check if table exists and get sample data
  const { data: backupData, error: backupError } = await supabase
    .from('role_permissions_backup')
    .select('*')
    .limit(10)

  if (backupError) {
    console.error('❌ Error querying role_permissions_backup:', backupError)
    console.log('\nTable might not exist or have RLS enabled.')
  } else {
    console.log('✅ role_permissions_backup table exists')
    console.log(`Total sample records: ${backupData.length}`)
    console.log('\nSample data:')
    console.log(backupData)
  }

  console.log('\n' + '='.repeat(80) + '\n')

  // Check for artist role specifically
  const { data: roles, error: rolesError } = await supabase
    .from('roles')
    .select('id, name')

  if (rolesError) {
    console.error('❌ Error fetching roles:', rolesError)
  } else {
    console.log('📋 Available roles:')
    roles.forEach(role => {
      console.log(`  - ${role.name} (${role.id})`)
    })

    // Check backup data for each role
    console.log('\n📊 Backup permissions count per role:')
    for (const role of roles) {
      const { data: backupPerms, error } = await supabase
        .from('role_permissions_backup')
        .select('permission_id')
        .eq('role_id', role.id)

      if (error) {
        console.log(`  ❌ ${role.name}: Error - ${error.message}`)
      } else {
        console.log(`  ✓ ${role.name}: ${backupPerms?.length || 0} permissions`)
      }
    }
  }

  console.log('\n' + '='.repeat(80) + '\n')

  // Check current role_permissions table
  console.log('📋 Current role_permissions count per role:')
  if (roles && !rolesError) {
    for (const role of roles) {
      const { data: currentPerms, error } = await supabase
        .from('role_permissions')
        .select('permission_id')
        .eq('role_id', role.id)

      if (error) {
        console.log(`  ❌ ${role.name}: Error - ${error.message}`)
      } else {
        console.log(`  ✓ ${role.name}: ${currentPerms?.length || 0} permissions`)
      }
    }
  }
}

checkBackupTable()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Fatal error:', err)
    process.exit(1)
  })
