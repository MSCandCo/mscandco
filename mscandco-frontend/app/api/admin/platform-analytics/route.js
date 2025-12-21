import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'


// Lazy initialization to avoid build-time errors
async function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Supabase configuration is missing')
  }
  
  const { createClient } = await import('@supabase/supabase-js')
  return createClient(supabaseUrl, serviceRoleKey)
}
/**
 * GET /api/admin/platform-analytics
 * Get platform-wide analytics and statistics
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

    // Check if user is admin
    const supabaseAdmin = await getSupabaseAdmin()
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (!profile || !['super_admin', 'company_admin', 'label_admin'].includes(profile.role)) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Admin access required' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30d'

    // Calculate date range
    const now = new Date()
    const startDate = new Date()
    if (period === '7d') startDate.setDate(now.getDate() - 7)
    else if (period === '30d') startDate.setDate(now.getDate() - 30)
    else if (period === '90d') startDate.setDate(now.getDate() - 90)
    else if (period === '1y') startDate.setFullYear(now.getFullYear() - 1)

    // Get all users
    const { data: allUsers, error: usersError } = await supabaseAdmin
      .from('user_profiles')
      .select('id, role, created_at')

    // Get artists
    const artists = allUsers?.filter(u => u.role === 'artist') || []
    const labelAdmins = allUsers?.filter(u => u.role === 'label_admin') || []

    // Get releases
    const { data: releases, error: releasesError } = await supabaseAdmin
      .from('releases')
      .select('id, created_at, status')

    // Get earnings
    const { data: earnings, error: earningsError } = await supabaseAdmin
      .from('earnings_log')
      .select('amount, created_at')
      .gte('created_at', startDate.toISOString())

    // Calculate stats
    const totalUsers = allUsers?.length || 0
    const totalArtists = artists.length
    const totalReleases = releases?.length || 0
    const totalEarnings = earnings?.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0) || 0

    // Active users (logged in within last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const activeUsers = allUsers?.filter(u => {
      const created = new Date(u.created_at)
      return created > thirtyDaysAgo
    }).length || 0

    // Monthly growth (placeholder calculation)
    const previousPeriodStart = new Date(startDate)
    previousPeriodStart.setDate(previousPeriodStart.getDate() - (now - startDate) / (1000 * 60 * 60 * 24))
    
    const { data: previousUsers } = await supabaseAdmin
      .from('user_profiles')
      .select('id')
      .gte('created_at', previousPeriodStart.toISOString())
      .lt('created_at', startDate.toISOString())

    const previousCount = previousUsers?.length || 0
    const currentCount = allUsers?.filter(u => {
      const created = new Date(u.created_at)
      return created >= startDate
    }).length || 0

    const monthlyGrowth = previousCount > 0 
      ? ((currentCount - previousCount) / previousCount * 100).toFixed(1)
      : currentCount > 0 ? 100 : 0

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        totalArtists,
        totalReleases,
        totalEarnings,
        activeUsers,
        monthlyGrowth: parseFloat(monthlyGrowth),
        period
      }
    })

  } catch (error) {
    console.error('Error in platform-analytics GET:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}

