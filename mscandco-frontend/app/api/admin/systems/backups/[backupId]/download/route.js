import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

export async function GET(request, { params }) {
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

    const { backupId } = params

    // Get backup details
    const { data: backup, error: backupError } = await serviceSupabase
      .from('system_backups')
      .select('*')
      .eq('id', backupId)
      .single()

    if (backupError || !backup) {
      return NextResponse.json({ error: 'Backup not found' }, { status: 404 })
    }

    // In production, this would fetch the actual backup file from storage
    // For now, we'll return a placeholder
    const backupData = {
      id: backup.id,
      name: backup.name,
      created_at: backup.created_at,
      type: backup.type,
      note: 'This is a placeholder. In production, this would contain the actual backup data.'
    }

    return new NextResponse(JSON.stringify(backupData, null, 2), {
      headers: {
        'Content-Type': 'application/sql',
        'Content-Disposition': `attachment; filename="backup-${backupId}.sql"`
      }
    })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

