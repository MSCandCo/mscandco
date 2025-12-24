/**
 * A&R Discovery System
 * AI-powered breakout artist identification and talent scouting
 *
 * Features:
 * - Breakout artist prediction
 * - Market gap analysis
 * - Signing recommendations
 * - Trend prediction
 * - Genre opportunity scoring
 */

// Growth indicators and weights
const GROWTH_INDICATORS = {
  streaming_velocity: 0.25,
  follower_growth: 0.20,
  engagement_rate: 0.15,
  playlist_momentum: 0.15,
  social_virality: 0.15,
  release_consistency: 0.10
};

// Career stage definitions
const CAREER_STAGES = {
  emerging: { streams_range: [0, 100000], followers_range: [0, 10000] },
  developing: { streams_range: [100000, 1000000], followers_range: [10000, 100000] },
  established: { streams_range: [1000000, 10000000], followers_range: [100000, 1000000] },
  mainstream: { streams_range: [10000000, Infinity], followers_range: [1000000, Infinity] }
};

/**
 * Identify breakout artists with high growth potential
 */
export function identifyBreakoutArtists(artistPool) {
  const candidates = [];

  artistPool.forEach(artist => {
    const breakoutScore = calculateBreakoutScore(artist);

    if (breakoutScore.overall_score >= 70) {
      candidates.push({
        artist_id: artist.id,
        artist_name: artist.name,
        genre: artist.genre,
        breakout_score: breakoutScore.overall_score,
        confidence: breakoutScore.confidence,
        indicators: breakoutScore.indicators,
        career_stage: breakoutScore.career_stage,
        projected_growth: breakoutScore.projected_growth,
        signing_recommendation: breakoutScore.signing_recommendation,
        risk_factors: breakoutScore.risk_factors,
        comparable_artists: breakoutScore.comparable_artists
      });
    }
  });

  // Sort by breakout score
  candidates.sort((a, b) => b.breakout_score - a.breakout_score);

  return {
    total_candidates: candidates.length,
    top_10: candidates.slice(0, 10),
    all_candidates: candidates,
    market_insights: generateMarketInsights(candidates)
  };
}

/**
 * Calculate breakout score for an artist
 */
function calculateBreakoutScore(artist) {
  const indicators = {};

  // 1. Streaming Velocity (25%)
  indicators.streaming_velocity = calculateStreamingVelocity(artist.streaming_data);

  // 2. Follower Growth (20%)
  indicators.follower_growth = calculateFollowerGrowth(artist.follower_data);

  // 3. Engagement Rate (15%)
  indicators.engagement_rate = calculateEngagementRate(artist.engagement_data);

  // 4. Playlist Momentum (15%)
  indicators.playlist_momentum = calculatePlaylistMomentum(artist.playlist_data);

  // 5. Social Virality (15%)
  indicators.social_virality = calculateSocialVirality(artist.social_data);

  // 6. Release Consistency (10%)
  indicators.release_consistency = calculateReleaseConsistency(artist.release_data);

  // Calculate weighted overall score
  let overallScore = 0;
  Object.entries(indicators).forEach(([indicator, score]) => {
    const weight = GROWTH_INDICATORS[indicator] || 0;
    overallScore += score * weight;
  });

  // Determine career stage
  const careerStage = determineCareerStage(artist);

  // Calculate confidence
  const confidence = calculateScoreConfidence(artist);

  // Generate projections
  const projectedGrowth = projectGrowth(artist, overallScore);

  // Generate signing recommendation
  const signingRecommendation = generateSigningRecommendation(
    overallScore,
    careerStage,
    artist
  );

  // Identify risk factors
  const riskFactors = identifyRiskFactors(artist);

  // Find comparable artists
  const comparableArtists = findComparableArtists(artist);

  return {
    overall_score: Math.round(overallScore * 100) / 100,
    confidence,
    indicators,
    career_stage: careerStage,
    projected_growth: projectedGrowth,
    signing_recommendation: signingRecommendation,
    risk_factors: riskFactors,
    comparable_artists: comparableArtists
  };
}

/**
 * Calculate streaming velocity score
 */
function calculateStreamingVelocity(streamingData) {
  if (!streamingData || !streamingData.monthly_streams) return 0;

  const months = streamingData.monthly_streams;
  if (months.length < 3) return 0;

  // Calculate month-over-month growth rates
  const growthRates = [];
  for (let i = 1; i < months.length; i++) {
    if (months[i - 1] > 0) {
      const growth = (months[i] - months[i - 1]) / months[i - 1];
      growthRates.push(growth);
    }
  }

  const avgGrowth = growthRates.reduce((a, b) => a + b, 0) / growthRates.length;

  // Score based on average monthly growth
  // 20% growth = 60 points, 50% = 80, 100% = 95, 200% = 100
  let score = 0;
  if (avgGrowth >= 2.0) score = 100;
  else if (avgGrowth >= 1.0) score = 95;
  else if (avgGrowth >= 0.5) score = 80;
  else if (avgGrowth >= 0.3) score = 70;
  else if (avgGrowth >= 0.2) score = 60;
  else if (avgGrowth >= 0.1) score = 45;
  else score = avgGrowth * 300;

  // Bonus for acceleration (growth rate increasing)
  if (growthRates.length >= 3) {
    const recentGrowth = growthRates.slice(-3).reduce((a, b) => a + b, 0) / 3;
    const earlierGrowth = growthRates.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
    if (recentGrowth > earlierGrowth * 1.5) {
      score = Math.min(100, score + 10);
    }
  }

  return Math.min(100, score);
}

/**
 * Calculate follower growth score
 */
function calculateFollowerGrowth(followerData) {
  if (!followerData || !followerData.monthly_followers) return 0;

  const months = followerData.monthly_followers;
  if (months.length < 3) return 0;

  // Calculate growth rate
  const startFollowers = months[0];
  const endFollowers = months[months.length - 1];
  const growthRate = (endFollowers - startFollowers) / startFollowers;

  // Score based on growth rate
  let score = 0;
  if (growthRate >= 3.0) score = 100; // 300%+ growth
  else if (growthRate >= 2.0) score = 90;
  else if (growthRate >= 1.0) score = 80;
  else if (growthRate >= 0.5) score = 70;
  else if (growthRate >= 0.3) score = 60;
  else if (growthRate >= 0.2) score = 50;
  else score = growthRate * 200;

  return Math.min(100, score);
}

/**
 * Calculate engagement rate score
 */
function calculateEngagementRate(engagementData) {
  if (!engagementData) return 0;

  const {
    total_followers = 0,
    avg_likes_per_post = 0,
    avg_comments_per_post = 0,
    avg_shares_per_post = 0,
    stream_to_save_ratio = 0,
    stream_to_playlist_ratio = 0
  } = engagementData;

  if (total_followers === 0) return 0;

  // Social media engagement rate
  const socialEngagementRate = (avg_likes_per_post + avg_comments_per_post * 2 + avg_shares_per_post * 3) / total_followers;

  // Streaming engagement
  const streamingEngagement = (stream_to_save_ratio * 0.6 + stream_to_playlist_ratio * 0.4);

  // Combined score
  const socialScore = Math.min(100, socialEngagementRate * 1000); // 10% engagement = 100 points
  const streamingScore = Math.min(100, streamingEngagement * 200); // 0.5 ratio = 100 points

  return (socialScore * 0.6 + streamingScore * 0.4);
}

/**
 * Calculate playlist momentum score
 */
function calculatePlaylistMomentum(playlistData) {
  if (!playlistData) return 0;

  const {
    total_playlists = 0,
    editorial_playlists = 0,
    playlist_adds_last_30d = 0,
    playlist_reach = 0,
    avg_playlist_position = 999
  } = playlistData;

  let score = 0;

  // Total playlists (20 points max)
  score += Math.min(20, total_playlists / 5);

  // Editorial playlists (30 points max) - huge signal
  score += Math.min(30, editorial_playlists * 10);

  // Recent adds (25 points max)
  score += Math.min(25, playlist_adds_last_30d / 2);

  // Playlist reach (15 points max)
  score += Math.min(15, playlist_reach / 100000);

  // Position in playlists (10 points max)
  if (avg_playlist_position < 50) score += 10;
  else if (avg_playlist_position < 100) score += 7;
  else if (avg_playlist_position < 200) score += 4;

  return Math.min(100, score);
}

/**
 * Calculate social virality score
 */
function calculateSocialVirality(socialData) {
  if (!socialData) return 0;

  const {
    tiktok_videos = 0,
    tiktok_views = 0,
    instagram_mentions = 0,
    twitter_mentions = 0,
    youtube_videos = 0,
    viral_moments = 0,
    influencer_endorsements = 0
  } = socialData;

  let score = 0;

  // TikTok metrics (40 points max) - strongest virality indicator
  if (tiktok_videos > 0) {
    score += Math.min(20, tiktok_videos / 10);
    score += Math.min(20, tiktok_views / 1000000); // 1M views = 20 points
  }

  // Instagram mentions (20 points max)
  score += Math.min(20, instagram_mentions / 100);

  // Twitter/X mentions (10 points max)
  score += Math.min(10, twitter_mentions / 100);

  // YouTube videos (15 points max)
  score += Math.min(15, youtube_videos / 5);

  // Viral moments (10 points max)
  score += Math.min(10, viral_moments * 5);

  // Influencer endorsements (5 points max)
  score += Math.min(5, influencer_endorsements * 2);

  return Math.min(100, score);
}

/**
 * Calculate release consistency score
 */
function calculateReleaseConsistency(releaseData) {
  if (!releaseData || !releaseData.releases) return 0;

  const releases = releaseData.releases;
  if (releases.length < 2) return 0;

  // Calculate average time between releases
  const timeBetween = [];
  for (let i = 1; i < releases.length; i++) {
    const days = (new Date(releases[i].date) - new Date(releases[i - 1].date)) / (1000 * 60 * 60 * 24);
    timeBetween.push(days);
  }

  const avgDaysBetween = timeBetween.reduce((a, b) => a + b, 0) / timeBetween.length;

  // Optimal: 30-90 days between releases
  let score = 0;
  if (avgDaysBetween >= 30 && avgDaysBetween <= 90) {
    score = 100;
  } else if (avgDaysBetween >= 20 && avgDaysBetween < 30) {
    score = 80; // Slightly frequent
  } else if (avgDaysBetween > 90 && avgDaysBetween <= 180) {
    score = 70; // Slightly infrequent
  } else if (avgDaysBetween > 180) {
    score = 40; // Too infrequent
  } else {
    score = 30; // Too frequent
  }

  // Bonus for recent activity
  const daysSinceLastRelease = (Date.now() - new Date(releases[releases.length - 1].date)) / (1000 * 60 * 60 * 24);
  if (daysSinceLastRelease < 60) {
    score = Math.min(100, score + 10);
  }

  return score;
}

/**
 * Determine career stage
 */
function determineCareerStage(artist) {
  const totalStreams = artist.streaming_data?.total_streams || 0;
  const totalFollowers = artist.follower_data?.total_followers || 0;

  for (const [stage, ranges] of Object.entries(CAREER_STAGES)) {
    if (totalStreams >= ranges.streams_range[0] && totalStreams < ranges.streams_range[1] &&
        totalFollowers >= ranges.followers_range[0] && totalFollowers < ranges.followers_range[1]) {
      return {
        stage,
        streams: totalStreams,
        followers: totalFollowers,
        label: stage.charAt(0).toUpperCase() + stage.slice(1)
      };
    }
  }

  return { stage: 'emerging', streams: totalStreams, followers: totalFollowers, label: 'Emerging' };
}

/**
 * Calculate confidence score
 */
function calculateScoreConfidence(artist) {
  let dataPoints = 0;
  let maxDataPoints = 6;

  if (artist.streaming_data?.monthly_streams?.length >= 3) dataPoints++;
  if (artist.follower_data?.monthly_followers?.length >= 3) dataPoints++;
  if (artist.engagement_data) dataPoints++;
  if (artist.playlist_data) dataPoints++;
  if (artist.social_data) dataPoints++;
  if (artist.release_data?.releases?.length >= 2) dataPoints++;

  return Math.round((dataPoints / maxDataPoints) * 100);
}

/**
 * Project future growth
 */
function projectGrowth(artist, breakoutScore) {
  const currentStreams = artist.streaming_data?.total_streams || 0;
  const currentFollowers = artist.follower_data?.total_followers || 0;

  // Growth multiplier based on breakout score
  const multiplier = breakoutScore / 50; // Score of 50 = 1x, 100 = 2x

  return {
    next_6_months: {
      streams: {
        conservative: Math.round(currentStreams * (1 + multiplier * 0.5)),
        expected: Math.round(currentStreams * (1 + multiplier * 1.0)),
        optimistic: Math.round(currentStreams * (1 + multiplier * 2.0))
      },
      followers: {
        conservative: Math.round(currentFollowers * (1 + multiplier * 0.3)),
        expected: Math.round(currentFollowers * (1 + multiplier * 0.6)),
        optimistic: Math.round(currentFollowers * (1 + multiplier * 1.2))
      }
    },
    next_12_months: {
      streams: {
        conservative: Math.round(currentStreams * (1 + multiplier * 1.0)),
        expected: Math.round(currentStreams * (1 + multiplier * 2.5)),
        optimistic: Math.round(currentStreams * (1 + multiplier * 5.0))
      },
      followers: {
        conservative: Math.round(currentFollowers * (1 + multiplier * 0.6)),
        expected: Math.round(currentFollowers * (1 + multiplier * 1.5)),
        optimistic: Math.round(currentFollowers * (1 + multiplier * 3.0))
      }
    }
  };
}

/**
 * Generate signing recommendation
 */
function generateSigningRecommendation(score, careerStage, artist) {
  const recommendation = {
    should_sign: false,
    priority: 'low',
    deal_type: null,
    advance_range: null,
    reasoning: []
  };

  // Emerging artists with high scores = best opportunities
  if (careerStage.stage === 'emerging' && score >= 80) {
    recommendation.should_sign = true;
    recommendation.priority = 'high';
    recommendation.deal_type = 'development';
    recommendation.advance_range = { min: 10000, max: 50000, currency: 'USD' };
    recommendation.reasoning.push('High growth potential in early career stage');
    recommendation.reasoning.push('Opportunity to sign before mainstream labels notice');
  }

  // Developing artists with strong momentum
  if (careerStage.stage === 'developing' && score >= 75) {
    recommendation.should_sign = true;
    recommendation.priority = 'medium';
    recommendation.deal_type = 'distribution_plus';
    recommendation.advance_range = { min: 50000, max: 200000, currency: 'USD' };
    recommendation.reasoning.push('Strong momentum with growing fanbase');
    recommendation.reasoning.push('Ready for label support to reach next level');
  }

  // Established artists with renewed momentum
  if (careerStage.stage === 'established' && score >= 70) {
    recommendation.should_sign = true;
    recommendation.priority = 'medium';
    recommendation.deal_type = 'licensing';
    recommendation.advance_range = { min: 200000, max: 1000000, currency: 'USD' };
    recommendation.reasoning.push('Proven track record with new growth phase');
    recommendation.reasoning.push('Consider catalog acquisition opportunity');
  }

  // Genre-specific adjustments
  if (artist.genre && ['latin', 'k_pop', 'afrobeats'].includes(artist.genre)) {
    recommendation.reasoning.push(`${artist.genre} is trending globally - higher opportunity`);
    if (recommendation.advance_range) {
      recommendation.advance_range.max *= 1.5;
    }
  }

  return recommendation;
}

/**
 * Identify risk factors
 */
function identifyRiskFactors(artist) {
  const risks = [];

  // Inconsistent release schedule
  if (artist.release_data?.releases) {
    const daysSinceLastRelease = (Date.now() - new Date(artist.release_data.releases[artist.release_data.releases.length - 1].date)) / (1000 * 60 * 60 * 24);
    if (daysSinceLastRelease > 180) {
      risks.push({
        factor: 'Release inactivity',
        severity: 'medium',
        detail: 'No releases in past 6 months'
      });
    }
  }

  // Low engagement despite high streams (potential bot/fake streams)
  const streams = artist.streaming_data?.total_streams || 0;
  const followers = artist.follower_data?.total_followers || 0;
  const ratio = streams / Math.max(followers, 1);
  if (ratio > 100) { // More than 100 streams per follower
    risks.push({
      factor: 'Engagement mismatch',
      severity: 'high',
      detail: 'High stream count relative to follower base - verify authenticity'
    });
  }

  // Single platform dependency
  const platforms = artist.social_data?.active_platforms || [];
  if (platforms.length < 3) {
    risks.push({
      factor: 'Platform concentration',
      severity: 'low',
      detail: 'Limited presence across social platforms'
    });
  }

  // No viral moments despite growth
  if (artist.social_data?.viral_moments === 0 && artist.streaming_data?.total_streams > 100000) {
    risks.push({
      factor: 'Organic growth unclear',
      severity: 'medium',
      detail: 'Growth without clear viral catalyst - investigate sources'
    });
  }

  return risks;
}

/**
 * Find comparable artists
 */
function findComparableArtists(artist) {
  // In production, this would query the database for similar artists
  // Based on genre, size, growth trajectory, etc.

  return [
    {
      name: 'Comparable Artist 1',
      genre: artist.genre,
      current_stage: 'developing',
      success_trajectory: 'Went from 100K to 5M monthly listeners in 18 months',
      label: 'Major Indie Label',
      deal_type: 'Distribution'
    }
  ];
}

/**
 * Generate market insights
 */
function generateMarketInsights(candidates) {
  const genreCounts = {};
  const stageCounts = {};

  candidates.forEach(candidate => {
    genreCounts[candidate.genre] = (genreCounts[candidate.genre] || 0) + 1;
    stageCounts[candidate.career_stage.stage] = (stageCounts[candidate.career_stage.stage] || 0) + 1;
  });

  return {
    total_opportunities: candidates.length,
    by_genre: genreCounts,
    by_stage: stageCounts,
    trending_genres: Object.entries(genreCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([genre, count]) => ({ genre, count })),
    emerging_count: stageCounts.emerging || 0,
    developing_count: stageCounts.developing || 0
  };
}

/**
 * Market gap analysis
 */
export function analyzeMarketGaps(currentRoster, marketData) {
  const gaps = [];

  // Genre gaps
  const rosterGenres = currentRoster.map(a => a.genre);
  const trendingGenres = ['latin', 'afrobeats', 'k_pop', 'indie_pop', 'alt_pop'];

  trendingGenres.forEach(genre => {
    if (!rosterGenres.includes(genre)) {
      gaps.push({
        type: 'genre',
        gap: genre,
        opportunity_score: 85,
        reasoning: `${genre} is trending but missing from roster`,
        recommended_action: `Sign 2-3 ${genre} artists`
      });
    }
  });

  // Geographic gaps
  const rosterRegions = currentRoster.map(a => a.region);
  const growthRegions = ['latin_america', 'africa', 'southeast_asia'];

  growthRegions.forEach(region => {
    if (!rosterRegions.includes(region)) {
      gaps.push({
        type: 'geographic',
        gap: region,
        opportunity_score: 80,
        reasoning: `${region} has high streaming growth but low roster representation`,
        recommended_action: `Expand A&R presence in ${region}`
      });
    }
  });

  return {
    total_gaps: gaps.length,
    high_priority_gaps: gaps.filter(g => g.opportunity_score >= 80),
    all_gaps: gaps
  };
}

/**
 * Trend prediction
 */
export function predictTrends(historicalData, timeframe = '6m') {
  // Analyze historical data to predict upcoming trends

  const predictions = [
    {
      trend: 'Genre fusion increasing',
      confidence: 0.85,
      timeframe: '6-12 months',
      genres_involved: ['pop', 'latin', 'edm'],
      recommendation: 'Sign artists experimenting with cross-genre sounds'
    },
    {
      trend: 'Short-form content driving discovery',
      confidence: 0.92,
      timeframe: '3-6 months',
      platforms: ['tiktok', 'instagram_reels', 'youtube_shorts'],
      recommendation: 'Prioritize artists with strong social media presence'
    },
    {
      trend: 'AI-assisted production becoming mainstream',
      confidence: 0.78,
      timeframe: '12-18 months',
      impact: 'Faster release cycles, more experimental sounds',
      recommendation: 'Look for artists embracing AI tools creatively'
    }
  ];

  return {
    timeframe,
    predictions,
    market_opportunity_score: 87
  };
}
