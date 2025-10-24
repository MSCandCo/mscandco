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
    const range = searchParams.get('range') || '1h'

    // In production, these would come from actual monitoring tools
    // For now, we'll return simulated metrics
    const metrics = {
      cpu: {
        current: Math.floor(Math.random() * 60) + 20, // 20-80%
        avg: Math.floor(Math.random() * 40) + 30, // 30-70%
        peak: Math.floor(Math.random() * 20) + 70 // 70-90%
      },
      memory: {
        current: Math.floor(Math.random() * 50) + 30, // 30-80%
        avg: Math.floor(Math.random() * 40) + 35, // 35-75%
        peak: Math.floor(Math.random() * 20) + 75, // 75-95%
        total: 16 * 1024 * 1024 * 1024 // 16GB
      },
      disk: {
        used: 250 * 1024 * 1024 * 1024, // 250GB
        total: 500 * 1024 * 1024 * 1024, // 500GB
        percentage: 50
      },
      network: {
        inbound: Math.floor(Math.random() * 1000000) + 500000, // 0.5-1.5MB/s
        outbound: Math.floor(Math.random() * 500000) + 250000 // 0.25-0.75MB/s
      }
    }

    return NextResponse.json({ metrics })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

