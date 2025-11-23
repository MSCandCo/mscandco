import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'

// Use service role to bypass RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

/**
 * GET /api/labeladmin/profile
 * Fetch label admin profile data
 */
export async function GET(request) {
  try {
    // Authenticate user
    const serverSupabase = await createServerClient()
    const { data: { user }, error: userError } = await serverSupabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = user.id
    console.log('👤 Label admin profile API for:', userId)

    // Fetch user profile using service role to bypass RLS
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    if (profileError) {
      console.error('❌ Error fetching profile:', profileError)
      return NextResponse.json(
        { error: 'Failed to fetch profile', details: profileError.message },
        { status: 500 }
      )
    }

    // If no profile exists, create a minimal one
    if (!profile) {
      console.log('⚠️ No profile found, creating minimal profile for label admin:', userId)

      // Get user email from auth
      const { data: userData } = await supabase.auth.admin.getUserById(userId)
      const email = userData?.user?.email || ''

      const { data: newProfile, error: createError } = await supabase
        .from('user_profiles')
        .insert({
          id: userId,
          email: email,
          role: 'label_admin',
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
          labelName: '',
          dateOfBirth: null,
          nationality: '',
          country: '',
          city: '',
          phone: '',
          countryCode: '+44',
          primaryGenre: '',
          secondaryGenre: '',
          yearsActive: '',
          companyName: '',
          bio: '',
          website: '',
          instagram: '',
          facebook: '',
          twitter: '',
          youtube: '',
          tiktok: '',
          spotify: '',
          apple_music: '',
          profile_picture_url: null
        })
      }

      console.log('✅ Created minimal profile for label admin')
      
      // Use the newly created profile
      const finalProfile = newProfile
      
      return NextResponse.json({
        id: finalProfile.id,
        firstName: finalProfile.first_name || '',
        lastName: finalProfile.last_name || '',
        email: finalProfile.email || email,
        labelName: finalProfile.artist_name || '',
        dateOfBirth: finalProfile.date_of_birth,
        nationality: finalProfile.nationality || '',
        country: finalProfile.country || '',
        city: finalProfile.city || '',
        phone: finalProfile.phone || '',
        countryCode: finalProfile.country_code || '+44',
        primaryGenre: finalProfile.primary_genre || '',
        secondaryGenre: finalProfile.secondary_genre || '',
        yearsActive: finalProfile.years_active || '',
        companyName: finalProfile.company_name || '',
        bio: finalProfile.bio || '',
        website: finalProfile.website || '',
        instagram: finalProfile.instagram || '',
        facebook: finalProfile.facebook || '',
        twitter: finalProfile.twitter || '',
        youtube: finalProfile.youtube || '',
        tiktok: finalProfile.tiktok || '',
        spotify: finalProfile.spotify || '',
        apple_music: finalProfile.apple_music || '',
        profile_picture_url: finalProfile.profile_picture_url || null
      })
    }

    console.log('✅ Profile loaded from database')

    // Map database fields to camelCase for frontend
    return NextResponse.json({
      id: profile.id,
      firstName: profile.first_name || '',
      lastName: profile.last_name || '',
      email: profile.email || '',
      labelName: profile.artist_name || '', // Label admins use artist_name field for label name
      dateOfBirth: profile.date_of_birth,
      nationality: profile.nationality || '',
      country: profile.country || '',
      city: profile.city || '',
      phone: profile.phone || '',
      countryCode: profile.country_code || '+44',
      primaryGenre: profile.primary_genre || '',
      secondaryGenre: profile.secondary_genre || '',
      yearsActive: profile.years_active || '',
      companyName: profile.company_name || '',
      bio: profile.bio || '',
      website: profile.website || '',
      instagram: profile.instagram || '',
      facebook: profile.facebook || '',
      twitter: profile.twitter || '',
      youtube: profile.youtube || '',
      tiktok: profile.tiktok || '',
      spotify: profile.spotify || '',
      apple_music: profile.apple_music || '',
      profile_picture_url: profile.profile_picture_url || null
    }, {
      headers: {
        'Cache-Control': 'private, max-age=300, stale-while-revalidate=60',
        'CDN-Cache-Control': 'private, max-age=300',
        'Vary': 'Authorization, Cookie'
      }
    })

  } catch (error) {
    console.error('Profile API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/labeladmin/profile
 * Update label admin profile data
 */
export async function PATCH(request) {
  try {
    // Authenticate user
    const serverSupabase = await createServerClient()
    const { data: { user }, error: userError } = await serverSupabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = user.id
    const body = await request.json()

    console.log('💾 Updating label admin profile:', body)

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

    // Map camelCase fields back to database snake_case
    const updates = {}
    if (body.email !== undefined) updates.email = body.email // Include email in profile update
    if (body.labelName !== undefined) updates.artist_name = body.labelName
    if (body.primaryGenre !== undefined) updates.primary_genre = body.primaryGenre
    if (body.secondaryGenre !== undefined) updates.secondary_genre = body.secondaryGenre
    if (body.yearsActive !== undefined) updates.years_active = body.yearsActive
    if (body.companyName !== undefined) updates.company_name = body.companyName
    if (body.bio !== undefined) updates.bio = body.bio
    if (body.website !== undefined) updates.website = body.website
    if (body.instagram !== undefined) updates.instagram = body.instagram
    if (body.facebook !== undefined) updates.facebook = body.facebook
    if (body.twitter !== undefined) updates.twitter = body.twitter
    if (body.youtube !== undefined) updates.youtube = body.youtube
    if (body.tiktok !== undefined) updates.tiktok = body.tiktok
    if (body.spotify !== undefined) updates.spotify = body.spotify
    if (body.apple_music !== undefined) updates.apple_music = body.apple_music
    if (body.profile_picture_url !== undefined) updates.profile_picture_url = body.profile_picture_url

    // Update profile using service role
    const { data: updatedProfile, error: updateError } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating profile:', updateError)
      return NextResponse.json(
        { error: 'Failed to update profile', details: updateError.message },
        { status: 500 }
      )
    }

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
      profile: updatedProfile
    })

  } catch (error) {
    console.error('Profile update API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/labeladmin/profile
 * Update label admin profile data (same as PATCH, for compatibility with ProfilePictureUpload)
 */
export async function PUT(request) {
  try {
    // Authenticate user
    const serverSupabase = await createServerClient()
    const { data: { user }, error: userError } = await serverSupabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = user.id
    const body = await request.json()

    console.log('💾 Updating label admin profile (PUT):', body)

    // Map camelCase fields back to database snake_case
    const updates = {}
    if (body.email !== undefined) updates.email = body.email
    if (body.labelName !== undefined) updates.artist_name = body.labelName
    if (body.primaryGenre !== undefined) updates.primary_genre = body.primaryGenre
    if (body.secondaryGenre !== undefined) updates.secondary_genre = body.secondaryGenre
    if (body.yearsActive !== undefined) updates.years_active = body.yearsActive
    if (body.companyName !== undefined) updates.company_name = body.companyName
    if (body.bio !== undefined) updates.bio = body.bio
    if (body.website !== undefined) updates.website = body.website
    if (body.instagram !== undefined) updates.instagram = body.instagram
    if (body.facebook !== undefined) updates.facebook = body.facebook
    if (body.twitter !== undefined) updates.twitter = body.twitter
    if (body.youtube !== undefined) updates.youtube = body.youtube
    if (body.tiktok !== undefined) updates.tiktok = body.tiktok
    if (body.spotify !== undefined) updates.spotify = body.spotify
    if (body.apple_music !== undefined) updates.apple_music = body.apple_music
    if (body.profile_picture_url !== undefined) updates.profile_picture_url = body.profile_picture_url

    // Update profile using service role
    const { data: updatedProfile, error: updateError } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating profile:', updateError)
      return NextResponse.json(
        { error: 'Failed to update profile', details: updateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      profile: updatedProfile
    })

  } catch (error) {
    console.error('Profile update API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

