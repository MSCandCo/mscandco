import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use service role to bypass RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

/**
 * GET /api/profile/learning-data?profileId=xxx
 * Get AI learning data for a profile (release patterns, preferences, etc.)
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const profileId = searchParams.get('profileId')

    if (!profileId) {
      return NextResponse.json(
        { error: 'Profile ID is required' },
        { status: 400 }
      )
    }

    // Get profile with learning data
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('id, artist_name, email, country, city, primary_genre, ai_learning_data')
      .eq('id', profileId)
      .maybeSingle()

    if (error) throw error

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    // Get release history for learning
    const { data: releases, error: releasesError } = await supabase
      .from('releases')
      .select('id, title, release_type, genre, release_date, status, created_at')
      .eq('artist_id', profileId)
      .order('created_at', { ascending: false })
      .limit(10)

    if (releasesError) {
      console.error('Error fetching releases:', releasesError)
    }

    // Analyze release patterns
    const releaseCount = releases?.length || 0
    const genres = releases?.map(r => r.genre).filter(Boolean) || []
    const releaseTypes = releases?.map(r => r.release_type).filter(Boolean) || []
    
    // Get most common genre
    const genreCounts = {}
    genres.forEach(g => {
      genreCounts[g] = (genreCounts[g] || 0) + 1
    })
    const mostCommonGenre = Object.keys(genreCounts).sort((a, b) => genreCounts[b] - genreCounts[a])[0] || profile.primary_genre

    // Get most common release type
    const typeCounts = {}
    releaseTypes.forEach(t => {
      typeCounts[t] = (typeCounts[t] || 0) + 1
    })
    const mostCommonType = Object.keys(typeCounts).sort((a, b) => typeCounts[b] - typeCounts[a])[0] || 'single'

    // Build learning insights
    const learningData = {
      profileId: profile.id,
      artistName: profile.artist_name,
      location: {
        country: profile.country,
        city: profile.city,
      },
      releaseHistory: {
        totalReleases: releaseCount,
        mostCommonGenre: mostCommonGenre,
        mostCommonReleaseType: mostCommonType,
        genres: [...new Set(genres)],
        releaseTypes: [...new Set(releaseTypes)],
        lastReleaseDate: releases?.[0]?.created_at || null,
      },
      preferences: profile.ai_learning_data || {},
      intelligenceLevel: releaseCount >= 3 ? 'experienced' : releaseCount >= 1 ? 'learning' : 'new',
      suggestedDefaults: {
        genre: mostCommonGenre,
        releaseType: mostCommonType,
        // Suggest next release date based on pattern
        suggestedReleaseDate: releases?.[0]?.release_date 
          ? new Date(new Date(releases[0].release_date).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          : null,
      },
    }

    return NextResponse.json({
      success: true,
      learningData,
    })

  } catch (error) {
    console.error('❌ Learning data fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * POST /api/profile/update-learning
 * Update AI learning data after a release
 */
export async function POST(request) {
  try {
    const body = await request.json()
    const { profileId, releaseData } = body

    if (!profileId || !releaseData) {
      return NextResponse.json(
        { error: 'Profile ID and release data are required' },
        { status: 400 }
      )
    }

    // Get current learning data
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('ai_learning_data')
      .eq('id', profileId)
      .maybeSingle()

    const currentLearning = profile?.ai_learning_data || {}
    
    // Update learning data
    const updatedLearning = {
      ...currentLearning,
      releaseCount: (currentLearning.releaseCount || 0) + 1,
      lastReleaseDate: new Date().toISOString(),
      commonGenres: [
        ...(currentLearning.commonGenres || []),
        releaseData.genre,
      ].filter(Boolean),
      lastReleaseType: releaseData.release_type,
      lastReleaseGenre: releaseData.genre,
      updatedAt: new Date().toISOString(),
    }

    // Update profile
    const { error } = await supabase
      .from('user_profiles')
      .update({
        ai_learning_data: updatedLearning,
        updated_at: new Date().toISOString(),
      })
      .eq('id', profileId)

    if (error) throw error

    return NextResponse.json({
      success: true,
      message: 'Learning data updated',
      learningData: updatedLearning,
    })

  } catch (error) {
    console.error('❌ Learning data update error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

