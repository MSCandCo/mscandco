import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * POST /api/admin/marketing/campaigns/preview-filters
 * Preview recipients based on filters (for new campaigns)
 */
export async function POST(request) {
  try {
    const supabase = await createClient()
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check admin permissions
    const supabaseAdmin = await createServiceRoleClient()
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (!profile || !['super_admin', 'company_admin'].includes(profile.role)) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Admin access required' },
        { status: 403 }
      )
    }

    const { filters, limit = 100 } = await request.json()

    if (!filters) {
      return NextResponse.json(
        { error: 'Filters are required' },
        { status: 400 }
      )
    }

    // Build query based on filters
    const recipients = await buildRecipientQuery(supabaseAdmin, filters, limit)

    // Get total count (without limit)
    const totalRecipients = await buildRecipientQuery(supabaseAdmin, filters, null)

    return NextResponse.json({
      success: true,
      recipients,
      totalCount: totalRecipients.length,
      previewCount: recipients.length,
      filters
    })

  } catch (error) {
    console.error('Error in POST /api/admin/marketing/campaigns/preview-filters:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * Build recipient query based on filter criteria
 */
async function buildRecipientQuery(supabaseAdmin, filters, limit = 100) {
  let query = supabaseAdmin
    .from('user_profiles')
    .select('id, email, display_name, first_name, last_name, role, city, nationality, created_at, last_active_at')

  // Filter by role
  if (filters.roles && filters.roles.length > 0) {
    query = query.in('role', filters.roles)
  }

  // Filter by location (city)
  if (filters.cities && filters.cities.length > 0) {
    query = query.in('city', filters.cities)
  }

  // Filter by country (nationality)
  if (filters.countries && filters.countries.length > 0) {
    query = query.in('nationality', filters.countries)
  }

  // Filter by last login (inactive users)
  if (filters.lastLoginDays) {
    const daysAgo = new Date()
    daysAgo.setDate(daysAgo.getDate() - filters.lastLoginDays)
    // Use last_active_at or created_at as fallback
    query = query.or(`last_active_at.lt.${daysAgo.toISOString()},and(last_active_at.is.null,created_at.lt.${daysAgo.toISOString()})`)
  }

  // Filter by subscription tier
  if (filters.subscriptionTiers && filters.subscriptionTiers.length > 0) {
    query = query.in('subscription_tier', filters.subscriptionTiers)
  }

  // Filter by genre (if available)
  if (filters.genres && filters.genres.length > 0) {
    query = query.or(filters.genres.map(g => `primary_genre.eq.${g},secondary_genre.eq.${g}`).join(','))
  }

  // Filter by label (for artists)
  if (filters.labels && filters.labels.length > 0) {
    query = query.in('label', filters.labels)
  }

  // Filter by created date range
  if (filters.createdAfter) {
    query = query.gte('created_at', filters.createdAfter)
  }
  if (filters.createdBefore) {
    query = query.lte('created_at', filters.createdBefore)
  }

  if (limit) {
    query = query.limit(limit)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error building recipient query:', error)
    throw error
  }

  return data || []
}

