import { NextResponse } from 'next/server'

// Force dynamic rendering to avoid build-time evaluation
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Use service role to bypass RLS

/**
 * POST /api/profile/match-or-link
 * Match or link a profile by email, artist name, and full name
 * Used for quick release process - allows users to confirm their identity
 * and get direct database access without full authentication setup
 */
export async function POST(request) {
  try {
    // Lazy load Supabase client
    const { createServiceRoleClient } = await import('@/lib/supabase/server');
    const supabase = await createServiceRoleClient();

    const body = await request.json()
    const { email, artistName, fullName } = body

    if (!email || !artistName) {
      return NextResponse.json(
        { error: 'Email and artist name are required' },
        { status: 400 }
      )
    }

    console.log('🔍 Matching profile:', { email, artistName, fullName })

    // Split full name if provided
    let firstName = ''
    let lastName = ''
    if (fullName) {
      const nameParts = fullName.trim().split(/\s+/)
      firstName = nameParts[0] || ''
      lastName = nameParts.slice(1).join(' ') || ''
    }

    // Try to match by email first (most reliable)
    let matchedProfile = null
    const { data: emailMatch, error: emailError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle()

    if (emailMatch && !emailError) {
      matchedProfile = emailMatch
      console.log('✅ Matched by email:', matchedProfile.id)
    } else {
      // Try to match by artist name
      const { data: artistMatch, error: artistError } = await supabase
        .from('user_profiles')
        .select('*')
        .ilike('artist_name', `%${artistName.trim()}%`)
        .maybeSingle()

      if (artistMatch && !artistError) {
        matchedProfile = artistMatch
        console.log('✅ Matched by artist name:', matchedProfile.id)
      }
    }

    if (matchedProfile) {
      // Update profile with provided info if missing
      const updates = {}
      if (firstName && !matchedProfile.first_name) {
        updates.first_name = firstName
      }
      if (lastName && !matchedProfile.last_name) {
        updates.last_name = lastName
      }
      if (artistName && !matchedProfile.artist_name) {
        updates.artist_name = artistName
      }
      if (Object.keys(updates).length > 0) {
        updates.updated_at = new Date().toISOString()
        await supabase
          .from('user_profiles')
          .update(updates)
          .eq('id', matchedProfile.id)
      }

      return NextResponse.json({
        success: true,
        matched: true,
        profileId: matchedProfile.id,
        email: matchedProfile.email,
        artistName: matchedProfile.artist_name || artistName,
        firstName: matchedProfile.first_name || firstName,
        lastName: matchedProfile.last_name || lastName,
        role: matchedProfile.role || 'artist',
        message: 'Profile matched successfully'
      })
    }

    // No match found - return info for creating new profile
    return NextResponse.json({
      success: true,
      matched: false,
      message: 'No existing profile found. You can create a new account.',
      suggestedProfile: {
        email,
        artistName,
        firstName,
        lastName
      }
    })

  } catch (error) {
    console.error('❌ Profile match error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
