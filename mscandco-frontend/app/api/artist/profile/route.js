import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'

// Force dynamic rendering to avoid build-time evaluation
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Use service role to bypass RLS

/**
 * GET /api/artist/profile
 * Load artist profile
 */
export async function GET(request) {
  try {
    // Lazy load Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(supabaseUrl, serviceRoleKey)

    // Authenticate user
    const serverSupabase = await createServerClient()
    const { data: { user }, error: userError } = await serverSupabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = user.id
    console.log('👤 Artist profile API for:', userId)

    // Load artist profile from database
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    if (error) {
      console.error('❌ Error loading profile:', error)
      return NextResponse.json(
        { error: 'Failed to load profile' },
        { status: 500 }
      )
    }

    // If profile exists but role is NULL, fix it
    if (profile && !profile.role) {
      console.log('⚠️ Profile has NULL role, updating to artist for user:', userId)
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ role: 'artist', updated_at: new Date().toISOString() })
        .eq('id', userId)

      if (updateError) {
        console.error('❌ Error updating profile role:', updateError)
      } else {
        profile.role = 'artist'
      }
    }

    // If no profile exists, create a minimal one
    if (!profile) {
      console.log('⚠️ No profile found, creating minimal profile for user:', userId)

      // Get user email from auth
      const { data: userData } = await supabase.auth.admin.getUserById(userId)
      const email = userData?.user?.email || ''

      const { data: newProfile, error: createError } = await supabase
        .from('user_profiles')
        .insert({
          id: userId,
          email: email,
          role: 'artist',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (createError) {
        console.error('❌ Error creating profile:', createError)
        // Return empty profile instead of failing
        return NextResponse.json({
          id: userId,
          email: email,
          firstName: '',
          lastName: '',
          artistName: '',
          dateOfBirth: null,
          nationality: '',
          country: '',
          city: '',
          artistType: '',
          phone: '',
          countryCode: '+44',
          primaryGenre: '',
          secondaryGenre: '',
          yearsActive: '',
          recordLabel: '',
          bio: '',
          website: '',
          instagram: '',
          facebook: '',
          twitter: '',
          youtube: '',
          tiktok: '',
          profile_picture_url: null
        })
      }

      console.log('✅ Created minimal profile')
      profile = newProfile
    } else {
      console.log('✅ Profile loaded from database')
    }

    // Return real profile data in expected format
    return NextResponse.json({
      id: profile.id,
      email: profile.email,
      role: profile.role || 'artist',
      firstName: profile.first_name || '',
      lastName: profile.last_name || '',
      artistName: profile.artist_name || '',
      dateOfBirth: profile.date_of_birth,
      nationality: profile.nationality || '',
      country: profile.country || '',
      city: profile.city || '',
      artistType: profile.artist_type || '',
      phone: profile.phone || '',
      countryCode: profile.country_code || '+44',
      primaryGenre: profile.primary_genre || '',
      secondaryGenre: profile.secondary_genre || '',
      yearsActive: profile.years_active || '',
      recordLabel: profile.record_label || '',
      bio: profile.bio || '',
      website: profile.website || '',
      instagram: profile.instagram || '',
      facebook: profile.facebook || '',
      twitter: profile.twitter || '',
      youtube: profile.youtube || '',
      tiktok: profile.tiktok || '',
      profile_picture_url: profile.profile_picture_url || null
    }, {
      headers: {
        'Cache-Control': 'private, max-age=300, stale-while-revalidate=60',
        'CDN-Cache-Control': 'private, max-age=300',
        'Vary': 'Authorization, Cookie'
      }
    })
  } catch (error) {
    console.error('❌ Artist profile API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/artist/profile
 * Update artist profile
 */
export async function PUT(request) {
  try {
    // Lazy load Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(supabaseUrl, serviceRoleKey)

    // Authenticate user
    const serverSupabase = await createServerClient()
    const { data: { user }, error: userError } = await serverSupabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = user.id
    const body = await request.json()

    console.log('💾 Updating artist profile:', body)

    // Check if email is being changed
    if (body.email && body.email !== user.email) {
      console.log('📧 Email change detected:', { oldEmail: user.email, newEmail: body.email })

      // Update Supabase auth email (this sends a verification email to the new address)
      // The email change will only take effect after the user verifies the new email
      const { error: authError } = await supabase.auth.admin.updateUserById(
        userId,
        {
          email: body.email,
          email_confirm: false // Require email verification before change takes effect
        }
      )

      if (authError) {
        console.error('❌ Error updating auth email:', authError)
        return NextResponse.json(
          {
            error: 'Failed to update login email',
            details: authError.message
          },
          { status: 500 }
        )
      }

      console.log('✅ Verification email sent to new address:', body.email)
      console.log('⚠️ Email change will take effect after verification')
    }

    // Map frontend fields to database fields
    const updateData = {
      email: body.email, // Include email in profile update
      first_name: body.firstName,
      last_name: body.lastName,
      artist_name: body.artistName,
      date_of_birth: body.dateOfBirth,
      nationality: body.nationality,
      country: body.country,
      city: body.city,
      artist_type: body.artistType,
      phone: body.phone,
      country_code: body.countryCode,
      primary_genre: body.primaryGenre,
      secondary_genre: body.secondaryGenre,
      years_active: body.yearsActive,
      record_label: body.recordLabel,
      bio: body.bio,
      website: body.website,
      instagram: body.instagram,
      facebook: body.facebook,
      twitter: body.twitter,
      youtube: body.youtube,
      tiktok: body.tiktok,
      profile_picture_url: body.profile_picture_url,
      updated_at: new Date().toISOString()
    }

    // Update artist profile in database
    const { data: updatedProfile, error } = await supabase
      .from('user_profiles')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      console.error('❌ Error updating profile:', error)
      return NextResponse.json(
        { error: 'Failed to update profile', details: error.message },
        { status: 500 }
      )
    }

    console.log('✅ Profile updated successfully')

    // Mark all artist's releases for cache refresh
    await supabase
      .from('releases')
      .update({ cache_updated_at: null })
      .eq('artist_id', userId)

    console.log('🔄 Artist releases marked for cache refresh')

    // Prepare response message
    let responseMessage = 'Profile updated successfully';
    let emailVerificationRequired = false;

    if (body.email && body.email !== user.email) {
      responseMessage = 'Profile updated! Please check your new email address for a verification link to complete the email change.';
      emailVerificationRequired = true;
    }

    return NextResponse.json({
      success: true,
      message: responseMessage,
      emailVerificationRequired,
      profile: {
        id: updatedProfile.id,
        email: updatedProfile.email,
        firstName: updatedProfile.first_name || '',
        lastName: updatedProfile.last_name || '',
        artistName: updatedProfile.artist_name || '',
        dateOfBirth: updatedProfile.date_of_birth,
        nationality: updatedProfile.nationality || '',
        country: updatedProfile.country || '',
        city: updatedProfile.city || '',
        artistType: updatedProfile.artist_type || '',
        phone: updatedProfile.phone || '',
        countryCode: updatedProfile.country_code || '+44',
        primaryGenre: updatedProfile.primary_genre || '',
        secondaryGenre: updatedProfile.secondary_genre || '',
        yearsActive: updatedProfile.years_active || '',
        recordLabel: updatedProfile.record_label || '',
        bio: updatedProfile.bio || '',
        website: updatedProfile.website || '',
        instagram: updatedProfile.instagram || '',
        facebook: updatedProfile.facebook || '',
        twitter: updatedProfile.twitter || '',
        youtube: updatedProfile.youtube || '',
        tiktok: updatedProfile.tiktok || ''
      }
    })
  } catch (error) {
    console.error('❌ Artist profile API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

