import { NextResponse } from 'next/server'

// Force dynamic rendering to avoid build-time evaluation
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Use service role to bypass RLS

/**
 * POST /api/profile/create-comprehensive
 * Create comprehensive profile - only needs to be done once in the Aiverse
 * Intelligently collects all necessary information without redundant questions
 */
export async function POST(request) {
  try {
    // Lazy load Supabase client
    const { createServiceRoleClient } = await import('@/lib/supabase/server');
    const supabase = await createServiceRoleClient();

    const body = await request.json()
    const {
      // Basic Info
      email,
      artistName,
      firstName,
      lastName,
      fullName,
      
      // Location & Demographics
      country,
      city,
      nationality,
      timezone,
      location, // Full location string for parsing
      
      // Music Info
      primaryGenre,
      secondaryGenre,
      artistType,
      yearsActive,
      recordLabel,
      bio,
      
      // Contact
      phone,
      countryCode,
      
      // Social Media
      website,
      instagram,
      twitter,
      facebook,
      youtube,
      tiktok,
      spotify,
      
      // Preferences (for learning)
      preferredReleaseType,
      preferredReleaseDate,
      preferredTerritories,
      preferredPlatforms,
      
      // Payment Info (optional)
      paymentMethod,
      paymentDetails,
      
      // Context from conversation
      conversationContext,
      detectedLocation,
    } = body

    if (!email || !artistName) {
      return NextResponse.json(
        { error: 'Email and artist name are required' },
        { status: 400 }
      )
    }

    console.log('🎨 Creating comprehensive profile:', { email, artistName })

    // Parse full name if provided
    let parsedFirstName = firstName
    let parsedLastName = lastName
    if (fullName && !firstName && !lastName) {
      const nameParts = fullName.trim().split(/\s+/)
      parsedFirstName = nameParts[0] || ''
      parsedLastName = nameParts.slice(1).join(' ') || ''
    }

    // Parse location if provided as string
    let parsedCountry = country
    let parsedCity = city
    if (location && !country) {
      // Simple location parsing (can be enhanced with geocoding API)
      const locationParts = location.split(',').map(p => p.trim())
      if (locationParts.length > 1) {
        parsedCity = locationParts[0]
        parsedCountry = locationParts[locationParts.length - 1]
      }
    }

    // Use detected location if available
    if (detectedLocation && !parsedCountry) {
      parsedCountry = detectedLocation.country
      parsedCity = detectedLocation.city || parsedCity
    }

    // Create comprehensive profile data
    const profileData = {
      email: email.toLowerCase().trim(),
      artist_name: artistName.trim(),
      first_name: parsedFirstName,
      last_name: parsedLastName,
      role: 'artist',
      country: parsedCountry,
      city: parsedCity,
      nationality: nationality || parsedCountry,
      primary_genre: primaryGenre,
      secondary_genre: secondaryGenre,
      artist_type: artistType,
      years_active: yearsActive,
      record_label: recordLabel,
      bio: bio,
      phone: phone,
      country_code: countryCode || '+44',
      website: website,
      instagram: instagram,
      twitter: twitter,
      facebook: facebook,
      youtube: youtube,
      tiktok: tiktok,
      spotify: spotify,
      timezone: timezone || 'UTC',
      // Store learning preferences in JSONB
      ai_learning_data: {
        preferredReleaseType: preferredReleaseType,
        preferredReleaseDate: preferredReleaseDate,
        preferredTerritories: preferredTerritories || [],
        preferredPlatforms: preferredPlatforms || [],
        releaseCount: 0,
        lastReleaseDate: null,
        commonGenres: primaryGenre ? [primaryGenre] : [],
        conversationContext: conversationContext,
        createdAt: new Date().toISOString(),
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('email', profileData.email)
      .maybeSingle()

    if (existingProfile) {
      // Update existing profile with comprehensive data
      const { data: updatedProfile, error: updateError } = await supabase
        .from('user_profiles')
        .update({
          ...profileData,
          ai_learning_data: {
            ...(existingProfile.ai_learning_data || {}),
            ...profileData.ai_learning_data,
          },
        })
        .eq('id', existingProfile.id)
        .select()
        .single()

      if (updateError) {
        throw updateError
      }

      return NextResponse.json({
        success: true,
        profileCreated: true,
        profileId: updatedProfile.id,
        message: 'Profile updated with comprehensive information',
        profile: updatedProfile,
      })
    }

    // Create new profile
    // Note: This requires an auth.users entry first
    // For now, we'll create a profile that can be linked later
    const { data: newProfile, error: createError } = await supabase
      .from('user_profiles')
      .insert(profileData)
      .select()
      .single()

    if (createError) {
      // If insert fails (likely due to missing auth.users entry),
      // return the profile data for later creation
      return NextResponse.json({
        success: true,
        profileCreated: false,
        message: 'Profile data collected. Complete account creation at: ' + (process.env.NEXT_PUBLIC_APP_URL || 'https://mscandco.com') + '/register',
        profileData: profileData,
        nextStep: 'Complete registration to create account',
      })
    }

    return NextResponse.json({
      success: true,
      profileCreated: true,
      profileId: newProfile.id,
      message: 'Comprehensive profile created successfully. This only needs to be done once in the Aiverse!',
      profile: newProfile,
    })

  } catch (error) {
    console.error('❌ Comprehensive profile creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

