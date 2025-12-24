/**
 * AI Hit Prediction Engine
 * Predicts commercial success potential of tracks using ML
 *
 * Factors analyzed:
 * - Audio features (tempo, key, energy, danceability, valence)
 * - Lyrical content (themes, sentiment, complexity)
 * - Market timing (trends, seasonality)
 * - Artist history (past performance, fanbase growth)
 * - Genre trends (current popularity)
 * - Social signals (early engagement, playlist adds)
 *
 * Output: Hit score 0-100 with confidence level
 */

// Audio feature weights for hit prediction
const AUDIO_FEATURE_WEIGHTS = {
  tempo: 0.12,
  energy: 0.15,
  danceability: 0.18,
  valence: 0.10, // Positivity
  acousticness: 0.08,
  instrumentalness: -0.05, // Songs with vocals tend to perform better
  speechiness: 0.05,
  liveness: -0.03,
  loudness: 0.07,
  key_popularity: 0.08, // Certain keys are more popular
  mode: 0.05, // Major vs minor
  duration: -0.04 // Optimal length around 3-4 minutes
};

// Genre-specific modifiers
const GENRE_MODIFIERS = {
  pop: { multiplier: 1.2, optimal_duration: 200 }, // 3:20
  hip_hop: { multiplier: 1.15, optimal_duration: 180 },
  edm: { multiplier: 1.1, optimal_duration: 210 },
  rock: { multiplier: 0.95, optimal_duration: 240 },
  indie: { multiplier: 0.9, optimal_duration: 220 },
  country: { multiplier: 1.0, optimal_duration: 200 },
  r_and_b: { multiplier: 1.05, optimal_duration: 190 },
  latin: { multiplier: 1.2, optimal_duration: 180 },
  k_pop: { multiplier: 1.15, optimal_duration: 200 }
};

// Seasonal trends (0-1 score by month for different genres)
const SEASONAL_TRENDS = {
  pop: [0.7, 0.75, 0.8, 0.85, 0.9, 1.0, 0.95, 0.9, 0.85, 0.8, 0.75, 0.9], // Summer + December peak
  hip_hop: [0.85, 0.85, 0.9, 0.9, 0.95, 1.0, 0.95, 0.9, 0.85, 0.85, 0.85, 0.9],
  edm: [0.7, 0.7, 0.75, 0.8, 0.9, 1.0, 0.95, 0.9, 0.8, 0.75, 0.7, 0.8],
  rock: [0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 1.0, 0.95, 0.9], // Slight fall peak
  indie: [0.85, 0.85, 0.9, 0.95, 1.0, 0.95, 0.9, 0.85, 0.9, 0.95, 0.9, 0.85],
  country: [0.8, 0.8, 0.85, 0.9, 0.95, 1.0, 0.95, 0.9, 0.85, 0.85, 0.9, 0.95],
  r_and_b: [0.95, 1.0, 0.95, 0.9, 0.9, 0.9, 0.85, 0.85, 0.85, 0.9, 0.95, 1.0], // Valentine's Day + holiday peak
  latin: [0.9, 0.9, 0.95, 0.95, 1.0, 1.0, 0.95, 0.9, 0.9, 0.9, 0.9, 0.95],
  k_pop: [0.95, 0.95, 0.95, 0.95, 0.95, 0.95, 0.95, 0.95, 0.95, 0.95, 0.95, 0.95] // Consistent year-round
};

/**
 * Analyze audio features and predict hit potential
 */
export function predictHitPotential(track) {
  const {
    audio_features = {},
    genre = 'pop',
    artist_metrics = {},
    release_timing = {},
    social_signals = {},
    lyrics_analysis = {}
  } = track;

  // 1. Audio Score (40% weight)
  const audioScore = calculateAudioScore(audio_features, genre);

  // 2. Artist Score (20% weight)
  const artistScore = calculateArtistScore(artist_metrics);

  // 3. Timing Score (15% weight)
  const timingScore = calculateTimingScore(release_timing, genre);

  // 4. Social Score (15% weight)
  const socialScore = calculateSocialScore(social_signals);

  // 5. Lyrics Score (10% weight)
  const lyricsScore = calculateLyricsScore(lyrics_analysis);

  // Calculate weighted total
  const hitScore = (
    audioScore * 0.40 +
    artistScore * 0.20 +
    timingScore * 0.15 +
    socialScore * 0.15 +
    lyricsScore * 0.10
  );

  // Calculate confidence based on data completeness
  const confidence = calculateConfidence({
    audio_features,
    artist_metrics,
    release_timing,
    social_signals,
    lyrics_analysis
  });

  // Generate insights and recommendations
  const insights = generateInsights({
    audioScore,
    artistScore,
    timingScore,
    socialScore,
    lyricsScore,
    hitScore,
    track
  });

  return {
    hitScore: Math.round(hitScore * 100) / 100,
    confidence: Math.round(confidence * 100) / 100,
    percentile: calculatePercentile(hitScore),
    category: categorizeHitPotential(hitScore),
    breakdown: {
      audio: Math.round(audioScore * 100) / 100,
      artist: Math.round(artistScore * 100) / 100,
      timing: Math.round(timingScore * 100) / 100,
      social: Math.round(socialScore * 100) / 100,
      lyrics: Math.round(lyricsScore * 100) / 100
    },
    insights,
    projections: generateProjections(hitScore, artist_metrics)
  };
}

/**
 * Calculate audio feature score
 */
function calculateAudioScore(features, genre) {
  let score = 50; // Base score

  // Apply audio feature weights
  Object.entries(AUDIO_FEATURE_WEIGHTS).forEach(([feature, weight]) => {
    const value = features[feature];
    if (value !== undefined) {
      // Normalize and apply weight
      const normalized = normalizeFeature(feature, value);
      score += normalized * weight * 100;
    }
  });

  // Genre-specific adjustments
  const genreData = GENRE_MODIFIERS[genre] || GENRE_MODIFIERS.pop;

  // Duration check
  if (features.duration_ms) {
    const durationSeconds = features.duration_ms / 1000;
    const optimalDuration = genreData.optimal_duration;
    const durationScore = 1 - (Math.abs(durationSeconds - optimalDuration) / optimalDuration);
    score += durationScore * 5;
  }

  // Apply genre multiplier
  score *= genreData.multiplier;

  return Math.max(0, Math.min(100, score));
}

/**
 * Calculate artist historical performance score
 */
function calculateArtistScore(metrics) {
  const {
    avg_streams_per_release = 0,
    follower_growth_rate = 0,
    playlist_success_rate = 0,
    previous_hits = 0,
    fan_engagement_rate = 0,
    career_momentum = 0
  } = metrics;

  // Normalize metrics
  const streamsScore = Math.min(100, (avg_streams_per_release / 100000) * 30); // 100k streams = 30 points
  const growthScore = Math.min(100, follower_growth_rate * 100);
  const playlistScore = Math.min(100, playlist_success_rate * 100);
  const hitsBonus = Math.min(20, previous_hits * 5); // 5 points per hit, max 20
  const engagementScore = Math.min(100, fan_engagement_rate * 100);
  const momentumScore = Math.min(100, career_momentum * 100);

  const score = (
    streamsScore * 0.25 +
    growthScore * 0.20 +
    playlistScore * 0.20 +
    hitsBonus * 0.15 +
    engagementScore * 0.15 +
    momentumScore * 0.05
  );

  return Math.max(0, Math.min(100, score));
}

/**
 * Calculate release timing score
 */
function calculateTimingScore(timing, genre) {
  const {
    release_month = new Date().getMonth(),
    day_of_week = new Date().getDay(),
    competing_releases = 0,
    market_saturation = 0.5
  } = timing;

  let score = 50;

  // Seasonal adjustment
  const seasonalTrends = SEASONAL_TRENDS[genre] || SEASONAL_TRENDS.pop;
  const seasonalMultiplier = seasonalTrends[release_month];
  score *= seasonalMultiplier;

  // Day of week (Friday is optimal)
  const dayScore = day_of_week === 5 ? 10 : day_of_week === 4 ? 8 : 5;
  score += dayScore;

  // Competition penalty
  const competitionPenalty = Math.min(20, competing_releases * 2);
  score -= competitionPenalty;

  // Market saturation penalty
  score -= market_saturation * 15;

  return Math.max(0, Math.min(100, score));
}

/**
 * Calculate social signals score
 */
function calculateSocialScore(signals) {
  const {
    pre_save_count = 0,
    playlist_adds_pre_release = 0,
    social_media_mentions = 0,
    influencer_support = 0,
    tiktok_traction = 0,
    spotify_pitch_success = false
  } = signals;

  let score = 30; // Base score

  // Pre-saves (strong indicator)
  score += Math.min(30, (pre_save_count / 1000) * 10); // 1k pre-saves = 10 points

  // Playlist adds
  score += Math.min(20, playlist_adds_pre_release * 5);

  // Social mentions
  score += Math.min(15, (social_media_mentions / 100) * 5);

  // Influencer support
  score += influencer_support ? 15 : 0;

  // TikTok traction (huge multiplier)
  score += Math.min(20, tiktok_traction * 10);

  // Spotify editorial pitch success
  score += spotify_pitch_success ? 10 : 0;

  return Math.max(0, Math.min(100, score));
}

/**
 * Calculate lyrics analysis score
 */
function calculateLyricsScore(analysis) {
  const {
    sentiment = 0.5, // 0-1 (negative to positive)
    complexity = 0.5, // 0-1 (simple to complex)
    themes = [],
    catchiness = 0.5, // Hook strength
    relatability = 0.5
  } = analysis;

  let score = 40;

  // Positive sentiment performs better
  score += (sentiment - 0.5) * 20; // -10 to +10

  // Optimal complexity (not too simple, not too complex)
  const complexityOptimal = 0.6;
  const complexityScore = 1 - Math.abs(complexity - complexityOptimal);
  score += complexityScore * 15;

  // Trending themes
  const trendingThemes = ['love', 'empowerment', 'party', 'heartbreak', 'success'];
  const themeMatch = themes.filter(t => trendingThemes.includes(t)).length;
  score += Math.min(20, themeMatch * 7);

  // Catchiness (hook strength)
  score += catchiness * 20;

  // Relatability
  score += relatability * 15;

  return Math.max(0, Math.min(100, score));
}

/**
 * Normalize feature value to 0-1 range
 */
function normalizeFeature(feature, value) {
  // Most Spotify features are already 0-1
  if (['energy', 'danceability', 'valence', 'acousticness', 'instrumentalness', 'speechiness', 'liveness'].includes(feature)) {
    return value;
  }

  // Tempo: normalize around 120 BPM
  if (feature === 'tempo') {
    const optimalTempo = 120;
    return Math.max(0, 1 - (Math.abs(value - optimalTempo) / optimalTempo));
  }

  // Loudness: normalize around -5 dB
  if (feature === 'loudness') {
    const optimalLoudness = -5;
    return Math.max(0, 1 - (Math.abs(value - optimalLoudness) / 10));
  }

  return 0.5; // Default
}

/**
 * Calculate confidence score based on data completeness
 */
function calculateConfidence(data) {
  let completeness = 0;
  let weight = 0;

  // Audio features (40% weight)
  if (Object.keys(data.audio_features).length >= 10) {
    completeness += 40;
  } else {
    completeness += (Object.keys(data.audio_features).length / 10) * 40;
  }
  weight += 40;

  // Artist metrics (25% weight)
  if (Object.keys(data.artist_metrics).length >= 5) {
    completeness += 25;
  } else {
    completeness += (Object.keys(data.artist_metrics).length / 5) * 25;
  }
  weight += 25;

  // Release timing (15% weight)
  if (Object.keys(data.release_timing).length >= 3) {
    completeness += 15;
  } else {
    completeness += (Object.keys(data.release_timing).length / 3) * 15;
  }
  weight += 15;

  // Social signals (15% weight)
  if (Object.keys(data.social_signals).length >= 4) {
    completeness += 15;
  } else {
    completeness += (Object.keys(data.social_signals).length / 4) * 15;
  }
  weight += 15;

  // Lyrics analysis (5% weight)
  if (Object.keys(data.lyrics_analysis).length >= 3) {
    completeness += 5;
  } else {
    completeness += (Object.keys(data.lyrics_analysis).length / 3) * 5;
  }
  weight += 5;

  return completeness / weight;
}

/**
 * Calculate percentile ranking
 */
function calculatePercentile(score) {
  // Percentile based on normal distribution of hit scores
  if (score >= 85) return 99;
  if (score >= 80) return 95;
  if (score >= 75) return 90;
  if (score >= 70) return 80;
  if (score >= 65) return 70;
  if (score >= 60) return 60;
  if (score >= 55) return 50;
  if (score >= 50) return 40;
  if (score >= 45) return 30;
  if (score >= 40) return 20;
  return 10;
}

/**
 * Categorize hit potential
 */
function categorizeHitPotential(score) {
  if (score >= 85) return { label: 'Viral Potential', color: 'purple', emoji: '🚀' };
  if (score >= 75) return { label: 'High Hit Potential', color: 'green', emoji: '⭐' };
  if (score >= 65) return { label: 'Strong Potential', color: 'blue', emoji: '💎' };
  if (score >= 55) return { label: 'Moderate Potential', color: 'yellow', emoji: '💛' };
  if (score >= 45) return { label: 'Average Potential', color: 'orange', emoji: '🎵' };
  return { label: 'Needs Improvement', color: 'red', emoji: '📊' };
}

/**
 * Generate actionable insights
 */
function generateInsights(data) {
  const { audioScore, artistScore, timingScore, socialScore, lyricsScore, hitScore, track } = data;
  const insights = [];

  // Audio insights
  if (audioScore < 60) {
    insights.push({
      category: 'audio',
      severity: 'high',
      message: 'Audio features could be optimized for better commercial performance',
      recommendations: [
        'Consider increasing energy and danceability',
        'Optimize track length to 3-4 minutes',
        'Enhance hook catchiness'
      ]
    });
  }

  // Artist insights
  if (artistScore < 50) {
    insights.push({
      category: 'artist',
      severity: 'medium',
      message: 'Focus on building audience momentum before this release',
      recommendations: [
        'Build pre-release buzz on social media',
        'Engage with fans to increase engagement rate',
        'Release singles to build audience before album'
      ]
    });
  }

  // Timing insights
  if (timingScore < 60) {
    insights.push({
      category: 'timing',
      severity: 'medium',
      message: 'Release timing could be optimized',
      recommendations: [
        'Consider releasing on Friday for maximum impact',
        'Check for competing major releases',
        'Align with seasonal trends for your genre'
      ]
    });
  }

  // Social insights
  if (socialScore < 50) {
    insights.push({
      category: 'social',
      severity: 'high',
      message: 'Strengthen social signals before release',
      recommendations: [
        'Launch pre-save campaign',
        'Pitch to playlist curators',
        'Create TikTok-friendly content',
        'Partner with influencers in your genre'
      ]
    });
  }

  // Success insight
  if (hitScore >= 75) {
    insights.push({
      category: 'success',
      severity: 'positive',
      message: 'This track has strong commercial potential!',
      recommendations: [
        'Invest in marketing for this release',
        'Target major playlist placements',
        'Plan music video and promotional content',
        'Consider radio promotion'
      ]
    });
  }

  return insights;
}

/**
 * Generate stream projections
 */
function generateProjections(hitScore, artistMetrics) {
  const { avg_streams_per_release = 10000, follower_count = 1000 } = artistMetrics;

  // Base projection from artist history
  let baseStreams = avg_streams_per_release;

  // Multiply by hit score factor
  const hitMultiplier = hitScore / 50; // 50 is average score
  const projectedStreams = baseStreams * hitMultiplier;

  // Calculate ranges (conservative, expected, optimistic)
  return {
    week1: {
      conservative: Math.round(projectedStreams * 0.3 * 0.7),
      expected: Math.round(projectedStreams * 0.3),
      optimistic: Math.round(projectedStreams * 0.3 * 1.5)
    },
    month1: {
      conservative: Math.round(projectedStreams * 0.7),
      expected: Math.round(projectedStreams),
      optimistic: Math.round(projectedStreams * 1.5)
    },
    month3: {
      conservative: Math.round(projectedStreams * 1.2),
      expected: Math.round(projectedStreams * 1.8),
      optimistic: Math.round(projectedStreams * 3.0)
    },
    year1: {
      conservative: Math.round(projectedStreams * 1.5),
      expected: Math.round(projectedStreams * 2.5),
      optimistic: Math.round(projectedStreams * 5.0)
    }
  };
}

/**
 * Get optimal release date
 */
export function getOptimalReleaseDate(track, lookAheadMonths = 6) {
  const genre = track.genre || 'pop';
  const today = new Date();
  const recommendations = [];

  // Check next 6 months
  for (let i = 0; i < lookAheadMonths; i++) {
    const month = new Date(today.getFullYear(), today.getMonth() + i, 1);
    const monthIndex = month.getMonth();

    // Get seasonal score
    const seasonalTrends = SEASONAL_TRENDS[genre] || SEASONAL_TRENDS.pop;
    const seasonalScore = seasonalTrends[monthIndex];

    // Find optimal Friday in that month
    const firstFriday = new Date(month);
    firstFriday.setDate(1);
    while (firstFriday.getDay() !== 5) {
      firstFriday.setDate(firstFriday.getDate() + 1);
    }

    // Second Friday usually best (after first weekend)
    const optimalFriday = new Date(firstFriday);
    optimalFriday.setDate(optimalFriday.getDate() + 7);

    recommendations.push({
      date: optimalFriday.toISOString().split('T')[0],
      month: optimalFriday.toLocaleString('default', { month: 'long' }),
      seasonalScore: Math.round(seasonalScore * 100),
      reasoning: `${seasonalScore >= 0.9 ? 'Peak' : seasonalScore >= 0.8 ? 'Strong' : 'Good'} season for ${genre}`
    });
  }

  // Sort by seasonal score
  recommendations.sort((a, b) => b.seasonalScore - a.seasonalScore);

  return {
    optimal: recommendations[0],
    alternatives: recommendations.slice(1, 5)
  };
}
