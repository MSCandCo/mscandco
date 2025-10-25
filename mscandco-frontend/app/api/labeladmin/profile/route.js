import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/labeladmin/profile
 * Fetch label admin profile data
 */
export async function GET(request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('Error fetching profile:', profileError)
      return NextResponse.json(
        { error: 'Failed to fetch profile', details: profileError.message },
        { status: 500 }
      )
    }

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Map database fields to camelCase for frontend
    const response = {
      id: profile.id,
      firstName: profile.first_name,
      lastName: profile.last_name,
      email: profile.email,
      labelName: profile.artist_name, // Label admins use artist_name field for label name
      dateOfBirth: profile.date_of_birth,
      nationality: profile.nationality,
      country: profile.country,
      city: profile.city,
      phone: profile.phone,
      countryCode: profile.country_code,
      primaryGenre: profile.primary_genre,
      secondaryGenre: profile.secondary_genre,
      yearsActive: profile.years_active,
      companyName: profile.company_name,
      bio: profile.bio,
      website: profile.website,
      instagram: profile.instagram,
      facebook: profile.facebook,
      twitter: profile.twitter,
      youtube: profile.youtube,
      tiktok: profile.tiktok,
      spotify: profile.spotify,
      apple_music: profile.apple_music,
      profile_picture_url: profile.profile_picture_url
    }

    return NextResponse.json(response)

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
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Map camelCase fields back to database snake_case
    const updates = {}
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

    // Update profile
    const { data: updatedProfile, error: updateError } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', user.id)
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

