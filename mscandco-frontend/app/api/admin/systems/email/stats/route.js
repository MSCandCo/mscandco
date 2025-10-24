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

    // Get total sent
    const { count: totalSent } = await serviceSupabase
      .from('email_log')
      .select('*', { count: 'exact', head: true })

    // Get delivered
    const { count: delivered } = await serviceSupabase
      .from('email_log')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'delivered')

    // Get bounced
    const { count: bounced } = await serviceSupabase
      .from('email_log')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'bounced')

    // Get opened
    const { count: opened } = await serviceSupabase
      .from('email_log')
      .select('*', { count: 'exact', head: true })
      .eq('opened', true)

    // Get clicked
    const { count: clicked } = await serviceSupabase
      .from('email_log')
      .select('*', { count: 'exact', head: true })
      .eq('clicked', true)

    const deliveryRate = totalSent > 0 ? ((delivered / totalSent) * 100).toFixed(1) : 0
    const openRate = delivered > 0 ? ((opened / delivered) * 100).toFixed(1) : 0

    return NextResponse.json({
      stats: {
        totalSent: totalSent || 0,
        delivered: delivered || 0,
        bounced: bounced || 0,
        opened: opened || 0,
        clicked: clicked || 0,
        deliveryRate: parseFloat(deliveryRate),
        openRate: parseFloat(openRate)
      }
    })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

