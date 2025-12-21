import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'


// Lazy initialization to avoid build-time errors
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Supabase configuration is missing')
  }
  
  const { createClient } = require('@supabase/supabase-js')
  return createClient(supabaseUrl, serviceRoleKey)
}
/**
 * GET /api/superadmin/dashboard
 * Get superadmin dashboard statistics
 */
export async function GET(request) {
  try {
    const supabase = await createServerClient()
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'No authorization token provided' },
        { status: 401 }
      )
    }

    // Check if user is superadmin
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (!profile || profile.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Superadmin access required' },
        { status: 403 }
      )
    }

    console.log('📊 Fetching superadmin dashboard stats')

    // Get total users
    const { count: totalUsers } = await supabaseAdmin
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })

    // Get total releases
    const { count: totalReleases } = await supabaseAdmin
      .from('releases')
      .select('*', { count: 'exact', head: true })

    // Get platform revenue (from earnings_log)
    const { data: earnings } = await supabaseAdmin
      .from('earnings_log')
      .select('amount')
      .not('status', 'eq', 'cancelled')

    const platformRevenue = earnings?.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0) || 0

    // System health (placeholder - can be enhanced with actual system metrics)
    const systemHealth = 100

    // Get user growth (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const { count: newUsers } = await supabaseAdmin
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', thirtyDaysAgo.toISOString())

    // Get release growth (last 30 days)
    const { count: newReleases } = await supabaseAdmin
      .from('releases')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', thirtyDaysAgo.toISOString())

    // Calculate growth percentages
    const userGrowth = totalUsers > 0 ? ((newUsers || 0) / totalUsers * 100).toFixed(1) : 0
    const releaseGrowth = totalReleases > 0 ? ((newReleases || 0) / totalReleases * 100).toFixed(1) : 0

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers: totalUsers || 0,
        totalReleases: totalReleases || 0,
        platformRevenue,
        systemHealth,
        userGrowth: parseFloat(userGrowth),
        releaseGrowth: parseFloat(releaseGrowth)
      }
    })

  } catch (error) {
    console.error('Error in superadmin dashboard GET:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}

