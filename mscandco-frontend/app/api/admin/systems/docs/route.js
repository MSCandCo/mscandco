import { NextResponse } from 'next/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'


// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request) {
  try {
    // Authenticate with anon key
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Use service role for database operations
    const serviceSupabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    let query = serviceSupabase
      .from('documentation')
      .select('*')
      .order('title', { ascending: true })

    if (category && category !== 'all') {
      query = query.eq('category', category)
    }

    let docs = []
    let dbError = null
    
    try {
      const { data, error } = await query
      if (error) {
        // If table doesn't exist or other DB error, use comprehensive docs
        console.log('Database query error (using comprehensive docs):', error.message)
        dbError = error
      } else {
        docs = data || []
      }
    } catch (err) {
      // Catch any exceptions and use comprehensive docs
      console.log('Exception querying docs (using comprehensive docs):', err.message)
      dbError = err
    }

    // Use comprehensive documentation if database is empty or has errors
    // Database docs take precedence, but comprehensive docs serve as fallback and initial seed
    let finalDocs = docs && docs.length > 0 ? docs : []
    
    // If no database docs, use comprehensive docs
    if (finalDocs.length === 0) {
      console.log('Using comprehensive documentation (database empty or error)')
      try {
        const docsModule = await import('./comprehensive-docs')
        const comprehensiveDocs = docsModule.comprehensiveDocs || docsModule.default || []
        if (Array.isArray(comprehensiveDocs) && comprehensiveDocs.length > 0) {
          finalDocs = comprehensiveDocs
          console.log(`✅ Loaded ${comprehensiveDocs.length} comprehensive docs`)
        } else {
          console.error('❌ Comprehensive docs is empty or not an array')
        }
      } catch (importError) {
        console.error('❌ Failed to import comprehensive docs:', importError.message)
        finalDocs = []
      }
    }

    console.log(`Returning ${finalDocs.length} documentation entries`)

    return NextResponse.json({ 
      docs: finalDocs 
    })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

