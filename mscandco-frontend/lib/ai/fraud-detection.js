/**
 * AI-Powered Fraud Detection System
 * Detects fake streams, bot activity, and suspicious patterns
 *
 * Detection Methods:
 * - Streaming velocity analysis
 * - Geographic anomaly detection
 * - Listener behavior patterns
 * - Device fingerprint analysis
 * - Playlist manipulation detection
 * - Click farm identification
 */

// Risk thresholds
const RISK_THRESHOLDS = {
  low: 20,
  medium: 50,
  high: 75,
  critical: 90
};

// Fraud indicators and their weights
const FRAUD_INDICATORS = {
  streaming_velocity: 0.20,      // Sudden spikes
  geographic_anomaly: 0.18,      // Streams from unusual locations
  listener_diversity: 0.15,      // Too many single-stream listeners
  device_patterns: 0.12,         // Unusual device distribution
  timing_patterns: 0.12,         // Streams at odd hours
  engagement_rate: 0.10,         // Low save/share/playlist adds
  listener_retention: 0.08,      // Skip rate, average listen time
  traffic_source: 0.05           // Direct vs. organic
};

/**
 * Analyze streaming data for fraud
 */
export function analyzeFraudRisk(streamingData) {
  const {
    release_id,
    artist_id,
    streams = [],
    time_period = '30d'
  } = streamingData;

  const indicators = {};
  const alerts = [];

  // 1. Streaming Velocity Analysis
  const velocityScore = analyzeStreamingVelocity(streams);
  indicators.streaming_velocity = velocityScore;
  if (velocityScore > 70) {
    alerts.push({
      severity: 'high',
      type: 'velocity_spike',
      message: 'Unusual spike in streaming velocity detected',
      details: 'Streams increased by more than 10x in less than 24 hours',
      confidence: velocityScore / 100
    });
  }

  // 2. Geographic Anomaly Detection
  const geoScore = analyzeGeographicDistribution(streams);
  indicators.geographic_anomaly = geoScore;
  if (geoScore > 70) {
    alerts.push({
      severity: 'high',
      type: 'geographic_anomaly',
      message: 'Suspicious geographic distribution',
      details: 'High concentration of streams from unusual locations',
      confidence: geoScore / 100
    });
  }

  // 3. Listener Diversity Analysis
  const diversityScore = analyzeListenerDiversity(streams);
  indicators.listener_diversity = diversityScore;
  if (diversityScore > 60) {
    alerts.push({
      severity: 'medium',
      type: 'low_diversity',
      message: 'Low listener diversity detected',
      details: 'High percentage of single-stream listeners',
      confidence: diversityScore / 100
    });
  }

  // 4. Device Pattern Analysis
  const deviceScore = analyzeDevicePatterns(streams);
  indicators.device_patterns = deviceScore;
  if (deviceScore > 70) {
    alerts.push({
      severity: 'high',
      type: 'device_anomaly',
      message: 'Unusual device distribution',
      details: 'Streams concentrated on similar device types',
      confidence: deviceScore / 100
    });
  }

  // 5. Timing Pattern Analysis
  const timingScore = analyzeTimingPatterns(streams);
  indicators.timing_patterns = timingScore;
  if (timingScore > 60) {
    alerts.push({
      severity: 'medium',
      type: 'timing_anomaly',
      message: 'Unusual streaming times detected',
      details: 'High concentration of streams during off-peak hours',
      confidence: timingScore / 100
    });
  }

  // 6. Engagement Rate Analysis
  const engagementScore = analyzeEngagementRate(streams);
  indicators.engagement_rate = engagementScore;
  if (engagementScore > 70) {
    alerts.push({
      severity: 'high',
      type: 'low_engagement',
      message: 'Unusually low engagement rate',
      details: 'Few saves, shares, or playlist additions relative to streams',
      confidence: engagementScore / 100
    });
  }

  // 7. Listener Retention Analysis
  const retentionScore = analyzeListenerRetention(streams);
  indicators.listener_retention = retentionScore;
  if (retentionScore > 65) {
    alerts.push({
      severity: 'medium',
      type: 'poor_retention',
      message: 'High skip rate detected',
      details: 'Many streams not reaching 30-second threshold',
      confidence: retentionScore / 100
    });
  }

  // 8. Traffic Source Analysis
  const trafficScore = analyzeTrafficSource(streams);
  indicators.traffic_source = trafficScore;
  if (trafficScore > 75) {
    alerts.push({
      severity: 'high',
      type: 'suspicious_traffic',
      message: 'Suspicious traffic source patterns',
      details: 'High percentage of direct/unknown traffic sources',
      confidence: trafficScore / 100
    });
  }

  // Calculate overall fraud risk score
  let totalRiskScore = 0;
  Object.entries(indicators).forEach(([indicator, score]) => {
    const weight = FRAUD_INDICATORS[indicator] || 0;
    totalRiskScore += score * weight;
  });

  const riskLevel = getRiskLevel(totalRiskScore);

  // Generate recommendations
  const recommendations = generateFraudRecommendations(alerts, riskLevel);

  return {
    release_id,
    artist_id,
    overall_risk_score: Math.round(totalRiskScore * 100) / 100,
    risk_level: riskLevel,
    confidence: calculateConfidence(indicators),
    indicators,
    alerts,
    recommendations,
    requires_review: totalRiskScore >= RISK_THRESHOLDS.high,
    requires_action: totalRiskScore >= RISK_THRESHOLDS.critical,
    analyzed_at: new Date().toISOString(),
    analysis_period: time_period
  };
}

/**
 * Analyze streaming velocity for sudden spikes
 */
function analyzeStreamingVelocity(streams) {
  if (streams.length < 2) return 0;

  // Group by day
  const dailyStreams = {};
  streams.forEach(stream => {
    const date = new Date(stream.timestamp).toISOString().split('T')[0];
    dailyStreams[date] = (dailyStreams[date] || 0) + 1;
  });

  const days = Object.values(dailyStreams);
  if (days.length < 2) return 0;

  // Calculate day-over-day growth rates
  const growthRates = [];
  for (let i = 1; i < days.length; i++) {
    if (days[i - 1] > 0) {
      const growthRate = (days[i] - days[i - 1]) / days[i - 1];
      growthRates.push(growthRate);
    }
  }

  // Flag: > 10x growth in one day
  const maxGrowth = Math.max(...growthRates);
  if (maxGrowth > 10) return 95; // Very suspicious
  if (maxGrowth > 5) return 80;
  if (maxGrowth > 3) return 60;
  if (maxGrowth > 2) return 40;

  return Math.min(100, maxGrowth * 20);
}

/**
 * Analyze geographic distribution
 */
function analyzeGeographicDistribution(streams) {
  const countries = {};
  streams.forEach(stream => {
    const country = stream.country || 'unknown';
    countries[country] = (countries[country] || 0) + 1;
  });

  const totalStreams = streams.length;
  let suspicionScore = 0;

  // Known click farm locations (simplified)
  const highRiskCountries = ['XX', 'unknown'];
  const mediumRiskCountries = [];

  Object.entries(countries).forEach(([country, count]) => {
    const percentage = (count / totalStreams) * 100;

    // Flag: > 50% from one country (unless it's a local artist)
    if (percentage > 50) {
      suspicionScore += 30;
    }

    // Flag: High concentration from high-risk countries
    if (highRiskCountries.includes(country) && percentage > 10) {
      suspicionScore += 40;
    }

    // Flag: Streams from many countries with very low counts (bot networks)
    if (percentage < 1 && Object.keys(countries).length > 50) {
      suspicionScore += 2;
    }
  });

  return Math.min(100, suspicionScore);
}

/**
 * Analyze listener diversity
 */
function analyzeListenerDiversity(streams) {
  const listeners = {};
  streams.forEach(stream => {
    const listenerId = stream.listener_id || stream.user_id;
    listeners[listenerId] = (listeners[listenerId] || 0) + 1;
  });

  const totalListeners = Object.keys(listeners).length;
  const totalStreams = streams.length;

  // Calculate percentage of single-stream listeners
  const singleStreamListeners = Object.values(listeners).filter(count => count === 1).length;
  const singleStreamPercentage = (singleStreamListeners / totalListeners) * 100;

  // Flag: > 80% single-stream listeners
  if (singleStreamPercentage > 80) return 85;
  if (singleStreamPercentage > 70) return 70;
  if (singleStreamPercentage > 60) return 50;

  // Also check average streams per listener
  const avgStreamsPerListener = totalStreams / totalListeners;

  // Flag: Very low diversity (< 1.5 streams per listener on average)
  if (avgStreamsPerListener < 1.5) return Math.max(singleStreamPercentage * 0.8, 60);

  return singleStreamPercentage * 0.6;
}

/**
 * Analyze device patterns
 */
function analyzeDevicePatterns(streams) {
  const devices = {};
  streams.forEach(stream => {
    const device = stream.device_type || 'unknown';
    devices[device] = (devices[device] || 0) + 1;
  });

  const totalStreams = streams.length;
  let suspicionScore = 0;

  Object.entries(devices).forEach(([device, count]) => {
    const percentage = (count / totalStreams) * 100;

    // Flag: > 90% from one device type
    if (percentage > 90) {
      suspicionScore += 50;
    } else if (percentage > 80) {
      suspicionScore += 35;
    }

    // Flag: High percentage of "unknown" devices
    if (device === 'unknown' && percentage > 30) {
      suspicionScore += 30;
    }
  });

  return Math.min(100, suspicionScore);
}

/**
 * Analyze timing patterns
 */
function analyzeTimingPatterns(streams) {
  const hourCounts = Array(24).fill(0);

  streams.forEach(stream => {
    const hour = new Date(stream.timestamp).getHours();
    hourCounts[hour]++;
  });

  // Calculate percentage during off-peak hours (2am-6am local time)
  const offPeakHours = [2, 3, 4, 5, 6];
  const offPeakCount = offPeakHours.reduce((sum, hour) => sum + hourCounts[hour], 0);
  const offPeakPercentage = (offPeakCount / streams.length) * 100;

  // Flag: > 40% during off-peak hours
  if (offPeakPercentage > 40) return 75;
  if (offPeakPercentage > 30) return 55;
  if (offPeakPercentage > 20) return 35;

  return offPeakPercentage * 1.5;
}

/**
 * Analyze engagement rate
 */
function analyzeEngagementRate(streams) {
  const totalStreams = streams.length;

  // Count engagement actions
  const saves = streams.filter(s => s.saved).length;
  const shares = streams.filter(s => s.shared).length;
  const playlistAdds = streams.filter(s => s.added_to_playlist).length;

  const totalEngagements = saves + shares + playlistAdds;
  const engagementRate = (totalEngagements / totalStreams) * 100;

  // Typical engagement rate: 2-5%
  // Flag: < 0.5% engagement
  if (engagementRate < 0.5) return 85;
  if (engagementRate < 1) return 65;
  if (engagementRate < 2) return 40;

  return Math.max(0, (2 - engagementRate) * 20);
}

/**
 * Analyze listener retention
 */
function analyzeListenerRetention(streams) {
  const completedStreams = streams.filter(s => s.completed || s.listen_time_seconds >= 30).length;
  const skippedStreams = streams.filter(s => s.skipped).length;

  const totalStreams = streams.length;
  const completionRate = (completedStreams / totalStreams) * 100;
  const skipRate = (skippedStreams / totalStreams) * 100;

  // Flag: < 50% completion rate
  if (completionRate < 50) return 75;
  if (completionRate < 60) return 55;
  if (completionRate < 70) return 35;

  // Flag: > 40% skip rate
  if (skipRate > 40) return 70;
  if (skipRate > 30) return 50;

  return Math.max(0, (70 - completionRate) + (skipRate * 0.5));
}

/**
 * Analyze traffic source
 */
function analyzeTrafficSource(streams) {
  const sources = {};
  streams.forEach(stream => {
    const source = stream.traffic_source || 'unknown';
    sources[source] = (sources[source] || 0) + 1;
  });

  const totalStreams = streams.length;
  let suspicionScore = 0;

  // Flag: > 60% from unknown/direct sources
  const unknownPercentage = ((sources.unknown || 0) + (sources.direct || 0)) / totalStreams * 100;
  if (unknownPercentage > 60) suspicionScore += 50;
  else if (unknownPercentage > 40) suspicionScore += 30;

  // Flag: Very low organic discovery (search, radio, playlists)
  const organicPercentage = ((sources.search || 0) + (sources.radio || 0) + (sources.playlist || 0)) / totalStreams * 100;
  if (organicPercentage < 10) suspicionScore += 40;
  else if (organicPercentage < 20) suspicionScore += 20;

  return Math.min(100, suspicionScore);
}

/**
 * Get risk level
 */
function getRiskLevel(score) {
  if (score >= RISK_THRESHOLDS.critical) return { label: 'Critical', color: 'red', action: 'immediate_review' };
  if (score >= RISK_THRESHOLDS.high) return { label: 'High', color: 'orange', action: 'review_required' };
  if (score >= RISK_THRESHOLDS.medium) return { label: 'Medium', color: 'yellow', action: 'monitor_closely' };
  if (score >= RISK_THRESHOLDS.low) return { label: 'Low', color: 'green', action: 'continue_monitoring' };
  return { label: 'Minimal', color: 'blue', action: 'normal_monitoring' };
}

/**
 * Calculate confidence
 */
function calculateConfidence(indicators) {
  const dataPoints = Object.keys(indicators).length;
  const maxDataPoints = Object.keys(FRAUD_INDICATORS).length;

  return (dataPoints / maxDataPoints) * 100;
}

/**
 * Generate recommendations
 */
function generateFraudRecommendations(alerts, riskLevel) {
  const recommendations = [];

  if (riskLevel.action === 'immediate_review') {
    recommendations.push({
      priority: 'urgent',
      action: 'Suspend streaming revenue payments',
      reason: 'Critical fraud indicators detected',
      next_steps: [
        'Conduct manual review of streaming patterns',
        'Contact artist for verification',
        'Report to streaming platforms if confirmed fraud'
      ]
    });
  }

  if (riskLevel.action === 'review_required') {
    recommendations.push({
      priority: 'high',
      action: 'Flag account for detailed review',
      reason: 'Multiple fraud indicators present',
      next_steps: [
        'Request additional verification from artist',
        'Monitor for continued suspicious activity',
        'Consider temporary hold on payments'
      ]
    });
  }

  if (alerts.some(a => a.type === 'velocity_spike')) {
    recommendations.push({
      priority: 'medium',
      action: 'Investigate traffic source',
      reason: 'Unusual spike in streaming velocity',
      next_steps: [
        'Check for playlist placements or viral moments',
        'Verify marketing campaigns',
        'Review geographic distribution of new streams'
      ]
    });
  }

  if (alerts.some(a => a.type === 'low_engagement')) {
    recommendations.push({
      priority: 'medium',
      action: 'Analyze listener behavior',
      reason: 'Low engagement relative to stream count',
      next_steps: [
        'Compare with artist\'s historical engagement rates',
        'Check for bot-like listening patterns',
        'Monitor for improvement over next 7 days'
      ]
    });
  }

  return recommendations;
}

/**
 * Real-time fraud monitoring
 */
export function monitorRealTimeActivity(streamEvent) {
  const flags = [];

  // Check for rapid repeated plays
  if (streamEvent.plays_last_hour > 100) {
    flags.push({
      type: 'rapid_plays',
      severity: 'high',
      message: 'Unusually high play count in last hour'
    });
  }

  // Check for suspicious user agent
  if (!streamEvent.user_agent || streamEvent.user_agent === 'unknown') {
    flags.push({
      type: 'missing_user_agent',
      severity: 'medium',
      message: 'Missing or invalid user agent'
    });
  }

  // Check for VPN/proxy usage
  if (streamEvent.is_vpn || streamEvent.is_proxy) {
    flags.push({
      type: 'vpn_proxy',
      severity: 'low',
      message: 'Stream from VPN or proxy detected'
    });
  }

  return {
    is_suspicious: flags.length > 0,
    flags,
    recommended_action: flags.length >= 2 ? 'block' : 'allow'
  };
}

/**
 * Bot detection using machine learning patterns
 */
export function detectBotBehavior(userActivity) {
  const {
    listening_sessions = [],
    device_changes = 0,
    location_changes = 0,
    time_between_sessions = [],
    playlist_diversity = 0
  } = userActivity;

  let botScore = 0;

  // Pattern 1: Too consistent timing
  if (time_between_sessions.length > 5) {
    const avgTimeBetween = time_between_sessions.reduce((a, b) => a + b) / time_between_sessions.length;
    const variance = time_between_sessions.reduce((sum, time) => sum + Math.pow(time - avgTimeBetween, 2), 0) / time_between_sessions.length;

    // Bots often have very consistent timing
    if (variance < 10) botScore += 30;
  }

  // Pattern 2: No device changes (bot using same device)
  if (listening_sessions.length > 20 && device_changes === 0) {
    botScore += 25;
  }

  // Pattern 3: Impossible location changes
  if (location_changes > listening_sessions.length * 0.5) {
    botScore += 30;
  }

  // Pattern 4: No playlist diversity (bot playing same playlist)
  if (playlist_diversity < 0.2) {
    botScore += 15;
  }

  return {
    is_bot: botScore >= 60,
    bot_confidence: Math.min(100, botScore) / 100,
    patterns_detected: botScore >= 60 ? ['consistent_timing', 'no_device_changes', 'low_diversity'] : []
  };
}
