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
 * POST /api/admin/analytics/simple-save
 * Save analytics data to user_profiles.analytics_data column
 */
export async function POST(request) {
  try {
    // Authenticate user
    const supabase = await createServerClient()
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'No authorization token provided' },
        { status: 401 }
      )
    }

    // Check if user is admin
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

    const body = await request.json()
    const { artistId, releaseData, milestonesData, advancedData, sectionVisibility, lastUpdated, type } = body

    if (!artistId) {
      return NextResponse.json(
        { error: 'Artist ID is required' },
        { status: 400 }
      )
    }

    console.log('💾 Simple save request:', { artistId, type, hasReleaseData: !!releaseData, hasMilestones: !!milestonesData, hasAdvanced: !!advancedData })

    // Get existing data first to merge with new data
    const { data: existingProfile, error: fetchError } = await supabaseAdmin
      .from('user_profiles')
      .select('analytics_data')
      .eq('id', artistId)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching existing profile:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch existing analytics data', message: fetchError.message },
        { status: 500 }
      )
    }

    const existingData = existingProfile?.analytics_data || {}

    // Store analytics data in analytics_data column (existing JSONB column)
    const analyticsData = {
      ...existingData,
      lastUpdated: lastUpdated || new Date().toISOString(),
      updatedBy: session.user.id,
      type: type || 'manual_analytics'
    }

    // Update basic data if provided
    if (releaseData) {
      analyticsData.latestRelease = releaseData
    }

    // Only update milestones if explicitly provided (not null or empty from Advanced save)
    if (milestonesData !== null && milestonesData !== undefined) {
      analyticsData.milestones = milestonesData
    }

    // Update advanced data if provided
    if (advancedData) {
      analyticsData.advancedData = advancedData
    }

    // Update visibility settings if provided
    if (sectionVisibility) {
      analyticsData.sectionVisibility = sectionVisibility
    }

    console.log('📦 Final analytics data to save:', {
      hasLatestRelease: !!analyticsData.latestRelease,
      hasMilestones: !!analyticsData.milestones,
      hasAdvancedData: !!analyticsData.advancedData,
      hasSectionVisibility: !!analyticsData.sectionVisibility
    })

    // Update user_profiles with new analytics data
    const { data: updated, error: updateError } = await supabaseAdmin
      .from('user_profiles')
      .update({ 
        analytics_data: analyticsData,
        updated_at: new Date().toISOString()
      })
      .eq('id', artistId)
      .select('id, email, analytics_data')

    if (updateError) {
      console.error('❌ Save error:', updateError)
      return NextResponse.json(
        { 
          error: 'Failed to save analytics', 
          message: updateError.message,
          details: updateError.details,
          hint: updateError.hint
        },
        { status: 500 }
      )
    }

    console.log('✅ Analytics saved to user_profiles:', updated?.[0]?.id)

    return NextResponse.json({
      success: true,
      message: 'Analytics saved successfully',
      data: updated?.[0]
    })

  } catch (error) {
    console.error('Simple save error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}

