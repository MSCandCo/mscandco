import { supabase, db, auth } from '../../lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    console.log('🧪 Testing Supabase integration...')
    
    // Test basic connection
    const { data: session, error: sessionError } = await supabase.auth.getSession()
    
    const result = {
      connection: 'success',
      timestamp: new Date().toISOString(),
      supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      has_anon_key: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      session_check: sessionError ? 'error' : 'success',
      functions_available: {
        db: typeof db === 'object',
        auth: typeof auth === 'object'
      }
    }
    
    // Test if we can access the database (this will work once tables are created)
    try {
      const { data: tables, error: tablesError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .limit(5)
      
      if (tablesError) {
        result.database_test = 'No tables found or RLS blocking access'
      } else {
        result.database_test = 'Tables accessible'
        result.tables = tables?.map(t => t.table_name) || []
      }
    } catch (dbError) {
      result.database_test = `Error: ${dbError.message}`
    }
    
    res.status(200).json(result)
    
  } catch (error) {
    console.error('Supabase test error:', error)
    res.status(500).json({ 
      error: 'Supabase test failed', 
      message: error.message 
    })
  }
}