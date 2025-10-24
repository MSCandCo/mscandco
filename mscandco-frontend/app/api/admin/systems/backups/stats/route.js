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

    // Get total count
    const { count: total } = await serviceSupabase
      .from('system_backups')
      .select('*', { count: 'exact', head: true })

    // Get total size
    const { data: backups } = await serviceSupabase
      .from('system_backups')
      .select('size')

    const totalSize = backups?.reduce((sum, backup) => sum + (backup.size || 0), 0) || 0

    // Get last backup
    const { data: lastBackup } = await serviceSupabase
      .from('system_backups')
      .select('created_at')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    // Calculate next scheduled (for demo, just add 1 day to last backup)
    const nextScheduled = lastBackup 
      ? new Date(new Date(lastBackup.created_at).getTime() + 24 * 60 * 60 * 1000).toISOString()
      : null

    return NextResponse.json({
      stats: {
        total: total || 0,
        totalSize,
        lastBackup: lastBackup?.created_at || null,
        nextScheduled
      }
    })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

