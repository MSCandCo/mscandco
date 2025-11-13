require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function setupGhostSessions() {
  console.log('\n=== Setting Up Ghost Sessions ===\n')

  try {
    // Check if table exists
    console.log('Checking if ghost_sessions table exists...')

    const { data: checkData, error: checkError } = await supabase.rpc('exec_sql', {
      query: `
        SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_schema = 'public'
          AND table_name = 'ghost_sessions'
        ) as table_exists
      `
    }).catch(() => ({ data: null, error: null }))

    // Create table if it doesn't exist
    console.log('\nCreating/updating ghost_sessions table...')

    const createTableSQL = `
      -- Create ghost_sessions table if it doesn't exist
      CREATE TABLE IF NOT EXISTS ghost_sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        admin_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        target_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        magic_link TEXT NOT NULL,
        notes TEXT,
        started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        ended_at TIMESTAMP WITH TIME ZONE,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Enable RLS
      ALTER TABLE ghost_sessions ENABLE ROW LEVEL SECURITY;

      -- Drop existing policies
      DROP POLICY IF EXISTS "authenticated_users_full_access" ON ghost_sessions;
      DROP POLICY IF EXISTS "Service role can manage all sessions" ON ghost_sessions;
      DROP POLICY IF EXISTS "Users can view their own sessions" ON ghost_sessions;

      -- Create simple policy for authenticated users
      CREATE POLICY "authenticated_users_full_access" ON ghost_sessions
      FOR ALL
      TO authenticated
      USING (true)
      WITH CHECK (true);

      -- Grant necessary permissions
      GRANT ALL ON ghost_sessions TO authenticated;
      GRANT ALL ON ghost_sessions TO service_role;
    `

    const { data, error } = await supabase.rpc('exec_sql', {
      query: createTableSQL
    }).catch(async () => {
      // Fallback - try using execute_sql from supabase MCP
      console.log('Trying alternative method...')
      return { data: null, error: { message: 'RPC method not available' } }
    })

    if (error) {
      console.error('❌ Error creating table:', error.message)
      console.log('\nPlease run this SQL manually in Supabase SQL Editor:')
      console.log(createTableSQL)
    } else {
      console.log('✅ Ghost sessions table setup complete')
    }

    // Test access
    console.log('\nTesting table access...')
    const { data: testData, error: testError } = await supabase
      .from('ghost_sessions')
      .select('count')
      .limit(0)

    if (testError) {
      console.error('❌ Access test failed:', testError.message)
    } else {
      console.log('✅ Table is accessible')
    }

  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

setupGhostSessions()
