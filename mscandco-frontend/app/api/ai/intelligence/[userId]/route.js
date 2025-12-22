import { NextResponse } from 'next/server'

// Force dynamic rendering to avoid build-time evaluation
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * GET /api/ai/intelligence/:userId
 * Get comprehensive AI intelligence insights for a user
 * Aggregates learning from all categories and provides intelligent recommendations
 */
export async function GET(request, { params }) {
  try {
    const { userId } = params

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Lazy load Supabase client
    const { createServiceRoleClient } = await import('@/lib/supabase/server');
    const supabase = await createServiceRoleClient();

    // Get comprehensive learning data with advanced metrics
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('ai_learning_data, ai_intelligence_score, ai_learning_confidence, ai_prediction_accuracy, ai_behavioral_cluster, country, city, primary_genre, artist_name')
      .eq('id', userId)
      .maybeSingle()

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    const learningData = profile.ai_learning_data || {}

    // Get interaction statistics
    const { data: interactions } = await supabase
      .from('user_interaction_logs')
      .select('interaction_category, interaction_type, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1000)

    // Analyze comprehensive patterns
    const intelligence = {
      userId,
      artistName: profile.artist_name,
      location: {
        country: profile.country,
        city: profile.city,
      },
      
      // Navigation Intelligence
      navigation: {
        mostVisitedPages: learningData.navigation?.mostVisitedPages || [],
        preferredTimeOfDay: learningData.navigation?.preferredTimeOfDay,
        navigationPatterns: learningData.navigation?.navigationPatterns || [],
        totalPageViews: interactions?.filter(i => i.interaction_type === 'page_view').length || 0,
      },

      // Release Intelligence
      releases: {
        totalReleases: learningData.releases?.totalReleases || 0,
        mostCommonGenre: learningData.releases?.mostCommonGenre || profile.primary_genre,
        mostCommonReleaseType: learningData.releases?.mostCommonReleaseType || 'single',
        releaseFrequency: learningData.releases?.releaseFrequency,
        preferredReleaseDates: learningData.releases?.preferredReleaseDates,
        intelligenceLevel: (learningData.releases?.totalReleases || 0) >= 3 ? 'experienced' : 
                          (learningData.releases?.totalReleases || 0) >= 1 ? 'learning' : 'new',
      },

      // Analytics Intelligence
      analytics: {
        mostViewedMetrics: learningData.analytics?.mostViewedMetrics || [],
        preferredTimeframes: learningData.analytics?.preferredTimeframes || [],
        topPlatforms: learningData.analytics?.topPlatforms || [],
        analyticsViewCount: interactions?.filter(i => i.interaction_category === 'analytics').length || 0,
      },

      // Earnings Intelligence
      earnings: {
        preferredCurrency: learningData.earnings?.preferredCurrency || 'GBP',
        paymentPreferences: learningData.earnings?.paymentPreferences || {},
        earningsViewFrequency: learningData.earnings?.earningsViewFrequency,
        earningsViewCount: interactions?.filter(i => i.interaction_category === 'earnings').length || 0,
      },

      // Settings Intelligence
      settings: {
        themePreference: learningData.settings?.themePreference || 'light',
        languagePreference: learningData.settings?.languagePreference || 'en',
        notificationPreferences: learningData.settings?.notificationPreferences || {},
      },

      // Social Intelligence
      social: {
        mostUsedPlatforms: learningData.social?.mostUsedPlatforms || [],
        engagementPatterns: learningData.social?.engagementPatterns || {},
      },

      // Collaboration Intelligence
      collaboration: {
        collaborationFrequency: learningData.collaboration?.collaborationFrequency,
        preferredCollaborators: learningData.collaboration?.preferredCollaborators || [],
      },

      // Overall Intelligence Score
      intelligenceScore: profile.ai_intelligence_score || calculateIntelligenceScore(learningData, interactions),
      learningConfidence: profile.ai_learning_confidence || 0,
      predictionAccuracy: profile.ai_prediction_accuracy || 0,
      behavioralCluster: profile.ai_behavioral_cluster || null,

      // Intelligent Recommendations
      recommendations: generateRecommendations(learningData, profile, interactions),

      // Predictive Insights
      predictions: generatePredictions(learningData, profile, interactions),

      // Adaptive Defaults
      adaptiveDefaults: generateAdaptiveDefaults(learningData, profile),
    }

    return NextResponse.json({
      success: true,
      intelligence,
      lastUpdated: learningData.lastUpdated || null,
    })

  } catch (error) {
    console.error('❌ Intelligence fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

function calculateIntelligenceScore(learningData, interactions) {
  let score = 0
  
  // Release intelligence (0-30 points)
  const releaseCount = learningData.releases?.totalReleases || 0
  score += Math.min(releaseCount * 10, 30)
  
  // Navigation intelligence (0-20 points)
  const pageViews = interactions?.filter(i => i.interaction_type === 'page_view').length || 0
  score += Math.min(pageViews / 10, 20)
  
  // Feature usage intelligence (0-25 points)
  const categories = new Set(interactions?.map(i => i.interaction_category) || [])
  score += Math.min(categories.size * 5, 25)
  
  // Consistency intelligence (0-25 points)
  const recentInteractions = interactions?.slice(0, 30) || []
  const daysActive = new Set(recentInteractions.map(i => 
    new Date(i.created_at).toDateString()
  )).size
  score += Math.min(daysActive * 2, 25)
  
  return Math.min(Math.round(score), 100)
}

function generateRecommendations(learningData, profile, interactions) {
  const recommendations = []
  
  // Release recommendations
  if (learningData.releases?.totalReleases === 0) {
    recommendations.push({
      type: 'release',
      priority: 'high',
      message: 'Create your first release to get started!',
      action: 'create_release',
    })
  } else if (learningData.releases?.totalReleases === 1) {
    recommendations.push({
      type: 'release',
      priority: 'medium',
      message: 'Great start! Create another release to establish your release pattern.',
      action: 'create_release',
    })
  }
  
  // Analytics recommendations
  if (learningData.releases?.totalReleases > 0 && 
      (learningData.analytics?.analyticsViewCount || 0) === 0) {
    recommendations.push({
      type: 'analytics',
      priority: 'medium',
      message: 'Check your analytics to see how your releases are performing!',
      action: 'view_analytics',
    })
  }
  
  // Social media recommendations
  if (learningData.social?.mostUsedPlatforms?.length === 0) {
    recommendations.push({
      type: 'social',
      priority: 'low',
      message: 'Add your social media links to your profile for better promotion.',
      action: 'update_profile',
    })
  }
  
  return recommendations
}

function generatePredictions(learningData, profile, interactions) {
  const predictions = []
  
  // Predict next release date
  if (learningData.releases?.releaseFrequency) {
    const lastRelease = learningData.releases?.lastReleaseDate
    if (lastRelease) {
      const nextRelease = new Date(lastRelease)
      nextRelease.setDate(nextRelease.getDate() + learningData.releases.releaseFrequency)
      predictions.push({
        type: 'next_release_date',
        value: nextRelease.toISOString().split('T')[0],
        confidence: 'medium',
      })
    }
  }
  
  // Predict preferred genre
  if (learningData.releases?.mostCommonGenre) {
    predictions.push({
      type: 'preferred_genre',
      value: learningData.releases.mostCommonGenre,
      confidence: 'high',
    })
  }
  
  return predictions
}

function generateAdaptiveDefaults(learningData, profile) {
  return {
    genre: learningData.releases?.mostCommonGenre || profile.primary_genre || 'Pop',
    releaseType: learningData.releases?.mostCommonReleaseType || 'single',
    currency: learningData.earnings?.preferredCurrency || 'GBP',
    theme: learningData.settings?.themePreference || 'light',
    language: learningData.settings?.languagePreference || 'en',
    preferredTimeOfDay: learningData.navigation?.preferredTimeOfDay,
    preferredReleaseDay: learningData.releases?.preferredReleaseDates,
  }
}

