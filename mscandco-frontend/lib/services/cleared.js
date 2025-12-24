/**
 * Cleared API Service
 *
 * Pre-publication sample detection to prevent copyright infringement
 * https://clearedmusic.io
 *
 * Cost: First 50 tracks free, then $0.07/track
 */

const CLEARED_API_URL = process.env.CLEARED_API_URL || 'https://api.clearedmusic.io/v1'
const CLEARED_API_KEY = process.env.CLEARED_API_KEY

/**
 * Scan audio file for uncleared samples
 * @param {Object} params - Scan parameters
 * @param {string} params.audioUrl - Public URL to audio file
 * @param {string} params.releaseId - Release ID for tracking
 * @param {string} params.trackId - Track ID for tracking
 * @param {string} params.artistName - Artist name for metadata
 * @param {string} params.trackTitle - Track title for metadata
 * @returns {Promise<Object>} Sample detection results
 */
export async function scanForSamples({
  audioUrl,
  releaseId,
  trackId,
  artistName,
  trackTitle
}) {
  try {
    if (!CLEARED_API_KEY) {
      return {
        success: true,
        skipped: true,
        reason: 'api_key_not_configured',
        samples_detected: []
      }
    }

    const response = await fetch(`${CLEARED_API_URL}/scan`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CLEARED_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        audio_url: audioUrl,
        metadata: {
          release_id: releaseId,
          track_id: trackId,
          artist_name: artistName,
          track_title: trackTitle
        }
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`Cleared API error: ${response.status} - ${errorData.message || 'Unknown error'}`)
    }

    const data = await response.json()

    return {
      success: true,
      scan_id: data.scan_id,
      samples_detected: data.samples || [],
      royalty_free_detected: data.royalty_free || [],
      content_id_conflicts: data.content_id_conflicts || [],
      risk_level: calculateRiskLevel(data),
      timestamp: new Date().toISOString(),
      raw_response: data
    }
  } catch (error) {
    console.error('Cleared sample scan error:', error)
    return {
      success: false,
      error: error.message,
      samples_detected: [],
      timestamp: new Date().toISOString()
    }
  }
}

/**
 * Calculate overall risk level based on detection results
 * @param {Object} data - Cleared API response data
 * @returns {string} Risk level: 'none', 'low', 'medium', 'high', 'critical'
 */
function calculateRiskLevel(data) {
  const samples = data.samples || []
  const contentIdConflicts = data.content_id_conflicts || []

  // Critical: Major label samples detected
  const majorLabelSamples = samples.filter(s =>
    s.label && ['Universal', 'Sony', 'Warner', 'Atlantic', 'Columbia', 'Republic'].some(label =>
      s.label.includes(label)
    )
  )
  if (majorLabelSamples.length > 0) {
    return 'critical'
  }

  // High: Any uncleared samples + Content ID conflicts
  if (samples.length > 0 && contentIdConflicts.length > 0) {
    return 'high'
  }

  // Medium: Uncleared samples detected
  if (samples.length > 0) {
    return 'medium'
  }

  // Low: Only Content ID conflicts (might be false positives)
  if (contentIdConflicts.length > 0) {
    return 'low'
  }

  return 'none'
}

/**
 * Format sample detection results for artist notification
 * @param {Object} results - Scan results from scanForSamples
 * @returns {Object} Formatted results for UI display
 */
export function formatSampleResults(results) {
  if (!results.success || results.samples_detected.length === 0) {
    return {
      has_issues: false,
      message: 'No uncleared samples detected. Your track is clear for distribution.'
    }
  }

  const samples = results.samples_detected.map(sample => ({
    source_title: sample.title || 'Unknown Title',
    source_artist: sample.artist || 'Unknown Artist',
    rights_holder: sample.label || sample.publisher || 'Unknown Rights Holder',
    timestamp: sample.timestamp || 'Unknown',
    confidence: sample.confidence || 0,
    recommendation: getRecommendation(sample)
  }))

  return {
    has_issues: true,
    risk_level: results.risk_level,
    total_samples: samples.length,
    samples,
    action_required: results.risk_level === 'critical' || results.risk_level === 'high',
    message: generateMessage(results.risk_level, samples.length)
  }
}

/**
 * Get recommendation based on sample detection
 * @param {Object} sample - Detected sample info
 * @returns {string} Recommendation text
 */
function getRecommendation(sample) {
  const confidence = sample.confidence || 0

  if (confidence >= 90) {
    return 'High confidence match - must clear this sample or remove it before distribution'
  } else if (confidence >= 70) {
    return 'Likely match - strongly recommend clearing or replacing this sample'
  } else if (confidence >= 50) {
    return 'Possible match - review carefully and consider clearing'
  } else {
    return 'Low confidence match - may be a false positive, but review recommended'
  }
}

/**
 * Generate user-friendly message based on risk level
 * @param {string} riskLevel - Risk level from calculateRiskLevel
 * @param {number} sampleCount - Number of samples detected
 * @returns {string} User message
 */
function generateMessage(riskLevel, sampleCount) {
  const plural = sampleCount > 1 ? 's' : ''

  switch (riskLevel) {
    case 'critical':
      return `⚠️ CRITICAL: ${sampleCount} major label sample${plural} detected. Distribution blocked until cleared. Average lawsuit settlement: $150K-$1M+.`

    case 'high':
      return `⚠️ HIGH RISK: ${sampleCount} uncleared sample${plural} with Content ID conflicts detected. Clear samples before distribution to avoid takedowns.`

    case 'medium':
      return `⚠️ MEDIUM RISK: ${sampleCount} uncleared sample${plural} detected. Recommend clearing or replacing before distribution.`

    case 'low':
      return `ℹ️ LOW RISK: Content ID conflicts detected. May be false positives - review recommended.`

    default:
      return '✅ No copyright issues detected. Track is clear for distribution.'
  }
}

/**
 * Check if user has access to Cleared sample scanning
 * @param {Object} user - User object with subscription info
 * @returns {boolean} Whether user can access sample scanning
 */
export function hasAccessToSampleScanning(user) {
  if (!user) return false

  // MPP Partner tier and above get unlimited sample scanning
  const eligibleTiers = ['mpp_partner', 'msc_business', 'msc_enterprise']

  return eligibleTiers.includes(user.subscription_tier)
}

/**
 * Get remaining free scans for user
 * @param {string} userId - User ID
 * @returns {Promise<number>} Number of free scans remaining
 */
export async function getRemainingFreeScans(userId) {
  // This would query your database to track usage
  // For now, return a placeholder
  return 50
}

/**
 * Record sample scan usage for billing
 * @param {Object} params - Usage tracking params
 * @returns {Promise<void>}
 */
export async function recordSampleScanUsage({
  userId,
  releaseId,
  trackId,
  scanId,
  samplesDetected,
  riskLevel
}) {
  // Store in sample_scan_usage table:
  // - user_id, release_id, track_id, scan_id
  // - samples_detected, risk_level
  // - timestamp, cost (for billing)

    userId,
    releaseId,
    scanId,
    samplesDetected,
    riskLevel
  })
}

export default {
  scanForSamples,
  formatSampleResults,
  hasAccessToSampleScanning,
  getRemainingFreeScans,
  recordSampleScanUsage
}
