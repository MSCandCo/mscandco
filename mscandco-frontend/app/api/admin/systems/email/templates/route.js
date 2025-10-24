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

    const { data: templates, error } = await serviceSupabase
      .from('email_templates')
      .select('*')
      .order('name', { ascending: true })

    if (error && error.code !== 'PGRST116') {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // If no templates, return defaults
    const defaultTemplates = [
      {
        id: '1',
        name: 'Welcome Email',
        description: 'Sent to new users upon registration',
        category: 'Onboarding'
      },
      {
        id: '2',
        name: 'Password Reset',
        description: 'Sent when user requests password reset',
        category: 'Security'
      },
      {
        id: '3',
        name: 'Release Notification',
        description: 'Notify users of new releases',
        category: 'Notifications'
      },
      {
        id: '4',
        name: 'Earnings Report',
        description: 'Monthly earnings summary',
        category: 'Reports'
      },
      {
        id: '5',
        name: 'Account Verification',
        description: 'Email verification for new accounts',
        category: 'Security'
      }
    ]

    return NextResponse.json({ 
      templates: templates && templates.length > 0 ? templates : defaultTemplates 
    })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

