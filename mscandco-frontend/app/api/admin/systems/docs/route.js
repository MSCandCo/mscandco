import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

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

    const { data: docs, error } = await query

    if (error && error.code !== 'PGRST116') {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // If no docs, return defaults
    const defaultDocs = [
      {
        id: '1',
        title: 'Getting Started',
        description: 'Quick start guide to get up and running with the platform',
        category: 'Guides',
        updated_at: new Date().toISOString(),
        content: 'Welcome to MSC & Co platform...'
      },
      {
        id: '2',
        title: 'API Authentication',
        description: 'Learn how to authenticate API requests using API keys and tokens',
        category: 'API',
        updated_at: new Date().toISOString(),
        content: 'API authentication methods...'
      },
      {
        id: '3',
        title: 'User Management',
        description: 'Complete guide to managing users, roles, and permissions',
        category: 'Guides',
        updated_at: new Date().toISOString(),
        content: 'User management overview...'
      },
      {
        id: '4',
        title: 'Database Schema',
        description: 'Technical reference for database tables and relationships',
        category: 'Reference',
        updated_at: new Date().toISOString(),
        content: 'Database schema documentation...'
      },
      {
        id: '5',
        title: 'Earnings API',
        description: 'Calculate and retrieve earnings data via API',
        category: 'API',
        updated_at: new Date().toISOString(),
        content: 'Earnings API endpoints...'
      },
      {
        id: '6',
        title: 'Analytics Integration',
        description: 'How to integrate and display analytics data',
        category: 'Guides',
        updated_at: new Date().toISOString(),
        content: 'Analytics integration guide...'
      },
      {
        id: '7',
        title: 'Release Management',
        description: 'Managing music releases and distribution',
        category: 'Guides',
        updated_at: new Date().toISOString(),
        content: 'Release management guide...'
      },
      {
        id: '8',
        title: 'Webhook Events',
        description: 'Real-time notifications via webhooks',
        category: 'API',
        updated_at: new Date().toISOString(),
        content: 'Webhook events documentation...'
      },
      {
        id: '9',
        title: 'Security Best Practices',
        description: 'Security guidelines and best practices',
        category: 'Reference',
        updated_at: new Date().toISOString(),
        content: 'Security best practices...'
      }
    ]

    return NextResponse.json({ 
      docs: docs && docs.length > 0 ? docs : defaultDocs 
    })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

