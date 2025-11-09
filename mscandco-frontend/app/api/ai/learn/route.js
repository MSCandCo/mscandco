import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use service role to bypass RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

/**
 * POST /api/ai/learn
 * Universal learning endpoint - tracks any user interaction for AI learning
 * This is called throughout the platform to learn from every user action
 */
export async function POST(request) {
  try {
    const body = await request.json()
    const {
      userId,
      interactionType, // 'page_view', 'feature_use', 'release_created', 'analytics_viewed', etc.
      interactionCategory, // 'navigation', 'releases', 'analytics', 'earnings', 'settings', 'social', 'collaboration', etc.
      interactionData = {}, // Contextual data about the interaction
      sessionId,
      ipAddress,
      userAgent,
      locationData, // { country, city, timezone }
    } = body

    if (!userId || !interactionType || !interactionCategory) {
      return NextResponse.json(
        { error: 'userId, interactionType, and interactionCategory are required' },
        { status: 400 }
      )
    }

    console.log(`🧠 Learning from interaction: ${interactionCategory}/${interactionType}`, { userId })

    // Log the interaction
    const { error: logError } = await supabase
      .from('user_interaction_logs')
      .insert({
        user_id: userId,
        interaction_type: interactionType,
        interaction_category: interactionCategory,
        interaction_data: interactionData,
        session_id: sessionId,
        ip_address: ipAddress,
        user_agent: userAgent,
        location_data: locationData,
      })

    if (logError) {
      console.error('Error logging interaction:', logError)
    }

    // Update learning data based on category
    const learningUpdate = {}

    switch (interactionCategory) {
      case 'navigation':
        learningUpdate.navigation = {
          mostVisitedPages: await getMostVisitedPages(userId),
          preferredTimeOfDay: await getPreferredTimeOfDay(userId),
          navigationPatterns: await getNavigationPatterns(userId),
          lastUpdated: new Date().toISOString(),
        }
        break

      case 'releases':
        learningUpdate.releases = {
          ...(await getReleaseLearning(userId)),
          lastReleaseType: interactionData.releaseType,
          lastReleaseGenre: interactionData.genre,
          releaseFrequency: await getReleaseFrequency(userId),
          preferredReleaseDates: await getPreferredReleaseDates(userId),
          lastUpdated: new Date().toISOString(),
        }
        break

      case 'analytics':
        learningUpdate.analytics = {
          mostViewedMetrics: await getMostViewedMetrics(userId),
          preferredTimeframes: await getPreferredTimeframes(userId),
          topPlatforms: await getTopPlatforms(userId),
          lastUpdated: new Date().toISOString(),
        }
        break

      case 'earnings':
        learningUpdate.earnings = {
          preferredCurrency: interactionData.currency,
          paymentPreferences: await getPaymentPreferences(userId),
          earningsViewFrequency: await getEarningsViewFrequency(userId),
          lastUpdated: new Date().toISOString(),
        }
        break

      case 'settings':
        learningUpdate.settings = {
          preferences: interactionData.preferences,
          themePreference: interactionData.theme,
          languagePreference: interactionData.language,
          notificationPreferences: interactionData.notifications,
          lastUpdated: new Date().toISOString(),
        }
        break

      case 'social':
        learningUpdate.social = {
          mostUsedPlatforms: await getMostUsedSocialPlatforms(userId),
          engagementPatterns: await getEngagementPatterns(userId),
          lastUpdated: new Date().toISOString(),
        }
        break

      case 'collaboration':
        learningUpdate.collaboration = {
          collaborationFrequency: await getCollaborationFrequency(userId),
          preferredCollaborators: await getPreferredCollaborators(userId),
          lastUpdated: new Date().toISOString(),
        }
        break

      default:
        learningUpdate[interactionCategory] = {
          ...interactionData,
          lastUpdated: new Date().toISOString(),
        }
    }

    // Update learning data using the database function
    const { error: updateError } = await supabase.rpc('update_ai_learning_data', {
      p_user_id: userId,
      p_category: interactionCategory,
      p_data: learningUpdate[interactionCategory] || interactionData,
    })

    if (updateError) {
      console.error('Error updating learning data:', updateError)
    }

    return NextResponse.json({
      success: true,
      message: 'Learning data updated',
      category: interactionCategory,
      type: interactionType,
    })

  } catch (error) {
    console.error('❌ AI learning error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

// Helper functions for learning analysis
async function getMostVisitedPages(userId) {
  const { data } = await supabase
    .from('user_interaction_logs')
    .select('interaction_data')
    .eq('user_id', userId)
    .eq('interaction_category', 'navigation')
    .eq('interaction_type', 'page_view')
    .order('created_at', { ascending: false })
    .limit(100)

  const pageCounts = {}
  data?.forEach(log => {
    const page = log.interaction_data?.page
    if (page) {
      pageCounts[page] = (pageCounts[page] || 0) + 1
    }
  })

  return Object.entries(pageCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([page]) => page)
}

async function getPreferredTimeOfDay(userId) {
  const { data } = await supabase
    .from('user_interaction_logs')
    .select('created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(100)

  const hourCounts = {}
  data?.forEach(log => {
    const hour = new Date(log.created_at).getHours()
    hourCounts[hour] = (hourCounts[hour] || 0) + 1
  })

  const mostActiveHour = Object.entries(hourCounts)
    .sort(([, a], [, b]) => b - a)[0]?.[0]

  return mostActiveHour ? `${mostActiveHour}:00` : null
}

async function getNavigationPatterns(userId) {
  const { data } = await supabase
    .from('user_interaction_logs')
    .select('interaction_data, created_at')
    .eq('user_id', userId)
    .eq('interaction_category', 'navigation')
    .order('created_at', { ascending: false })
    .limit(50)

  // Analyze navigation flows
  const flows = []
  for (let i = 0; i < (data?.length || 0) - 1; i++) {
    const from = data[i]?.interaction_data?.page
    const to = data[i + 1]?.interaction_data?.page
    if (from && to) {
      flows.push(`${from} -> ${to}`)
    }
  }

  return flows.slice(0, 10)
}

async function getReleaseLearning(userId) {
  const { data: releases } = await supabase
    .from('releases')
    .select('release_type, genre, release_date, created_at')
    .eq('artist_id', userId)
    .order('created_at', { ascending: false })
    .limit(20)

  const genres = releases?.map(r => r.genre).filter(Boolean) || []
  const types = releases?.map(r => r.release_type).filter(Boolean) || []

  const genreCounts = {}
  genres.forEach(g => { genreCounts[g] = (genreCounts[g] || 0) + 1 })
  const mostCommonGenre = Object.keys(genreCounts).sort((a, b) => genreCounts[b] - genreCounts[a])[0]

  const typeCounts = {}
  types.forEach(t => { typeCounts[t] = (typeCounts[t] || 0) + 1 })
  const mostCommonType = Object.keys(typeCounts).sort((a, b) => typeCounts[b] - typeCounts[a])[0]

  return {
    totalReleases: releases?.length || 0,
    mostCommonGenre,
    mostCommonReleaseType: mostCommonType,
    genres: [...new Set(genres)],
    releaseTypes: [...new Set(types)],
  }
}

async function getReleaseFrequency(userId) {
  const { data: releases } = await supabase
    .from('releases')
    .select('created_at')
    .eq('artist_id', userId)
    .order('created_at', { ascending: false })
    .limit(10)

  if (!releases || releases.length < 2) return null

  const intervals = []
  for (let i = 0; i < releases.length - 1; i++) {
    const diff = new Date(releases[i].created_at) - new Date(releases[i + 1].created_at)
    intervals.push(diff / (1000 * 60 * 60 * 24)) // days
  }

  const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length
  return Math.round(avgInterval)
}

async function getPreferredReleaseDates(userId) {
  const { data: releases } = await supabase
    .from('releases')
    .select('release_date')
    .eq('artist_id', userId)
    .not('release_date', 'is', null)
    .limit(20)

  const dayOfWeekCounts = {}
  releases?.forEach(r => {
    if (r.release_date) {
      const day = new Date(r.release_date).getDay()
      dayOfWeekCounts[day] = (dayOfWeekCounts[day] || 0) + 1
    }
  })

  const preferredDay = Object.entries(dayOfWeekCounts)
    .sort(([, a], [, b]) => b - a)[0]?.[0]

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  return preferredDay !== undefined ? dayNames[preferredDay] : null
}

async function getMostViewedMetrics(userId) {
  const { data } = await supabase
    .from('user_interaction_logs')
    .select('interaction_data')
    .eq('user_id', userId)
    .eq('interaction_category', 'analytics')
    .limit(50)

  const metricCounts = {}
  data?.forEach(log => {
    const metric = log.interaction_data?.metric
    if (metric) {
      metricCounts[metric] = (metricCounts[metric] || 0) + 1
    }
  })

  return Object.entries(metricCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([metric]) => metric)
}

async function getPreferredTimeframes(userId) {
  const { data } = await supabase
    .from('user_interaction_logs')
    .select('interaction_data')
    .eq('user_id', userId)
    .eq('interaction_category', 'analytics')
    .limit(50)

  const timeframeCounts = {}
  data?.forEach(log => {
    const timeframe = log.interaction_data?.timeframe
    if (timeframe) {
      timeframeCounts[timeframe] = (timeframeCounts[timeframe] || 0) + 1
    }
  })

  return Object.entries(timeframeCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([timeframe]) => timeframe)
}

async function getTopPlatforms(userId) {
  // This would analyze analytics data to find top platforms
  // For now, return empty array - can be enhanced with actual analytics queries
  return []
}

async function getPaymentPreferences(userId) {
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('preferred_currency, payment_method')
    .eq('id', userId)
    .maybeSingle()

  return {
    currency: profile?.preferred_currency || 'GBP',
    method: profile?.payment_method,
  }
}

async function getEarningsViewFrequency(userId) {
  const { data } = await supabase
    .from('user_interaction_logs')
    .select('created_at')
    .eq('user_id', userId)
    .eq('interaction_category', 'earnings')
    .order('created_at', { ascending: false })
    .limit(20)

  if (!data || data.length < 2) return null

  const intervals = []
  for (let i = 0; i < data.length - 1; i++) {
    const diff = new Date(data[i].created_at) - new Date(data[i + 1].created_at)
    intervals.push(diff / (1000 * 60 * 60)) // hours
  }

  const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length
  return Math.round(avgInterval)
}

async function getMostUsedSocialPlatforms(userId) {
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('instagram, twitter, facebook, youtube, tiktok, spotify')
    .eq('id', userId)
    .maybeSingle()

  const platforms = []
  if (profile?.instagram) platforms.push('instagram')
  if (profile?.twitter) platforms.push('twitter')
  if (profile?.facebook) platforms.push('facebook')
  if (profile?.youtube) platforms.push('youtube')
  if (profile?.tiktok) platforms.push('tiktok')
  if (profile?.spotify) platforms.push('spotify')

  return platforms
}

async function getEngagementPatterns(userId) {
  // Analyze social media engagement patterns
  // Can be enhanced with actual engagement data
  return {}
}

async function getCollaborationFrequency(userId) {
  // Analyze collaboration patterns
  // Can be enhanced with actual collaboration data
  return null
}

async function getPreferredCollaborators(userId) {
  // Analyze preferred collaborators
  // Can be enhanced with actual collaboration data
  return []
}

