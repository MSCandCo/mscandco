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

async function addRolesRLSPolicy() {
  console.log('🔧 Adding RLS policy to allow reading roles table...\n')

  // SQL to create RLS policy
  const sql = `
    -- Enable RLS on roles table (if not already enabled)
    ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

    -- Create policy to allow anyone to SELECT roles
    CREATE POLICY "Allow public to read roles"
    ON roles
    FOR SELECT
    USING (true);
  `

  const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql })

  if (error) {
    // Try alternative approach using raw SQL
    console.log('Trying direct SQL execution...\n')

    const { error: error1 } = await supabase
      .from('roles')
      .select('*')
      .limit(0) // Just to test connection

    console.log('Creating RLS policy using SQL...')

    // Execute using pg_manage_rls tool instead
    console.log('Please run this SQL in Supabase SQL Editor:')
    console.log()
    console.log('='.repeat(80))
    console.log(sql)
    console.log('='.repeat(80))

    return
  }

  console.log('✅ RLS policy added successfully!')
}

addRolesRLSPolicy()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Fatal error:', err)
    process.exit(1)
  })
