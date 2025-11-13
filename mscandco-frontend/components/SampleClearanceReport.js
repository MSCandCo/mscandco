/**
 * Sample Clearance Report Component
 *
 * Displays Cleared API results to artists with actionable recommendations
 */

import { useState } from 'react'
import { AlertCircle, CheckCircle, XCircle, Info, ExternalLink } from 'lucide-react'

export default function SampleClearanceReport({ results, onActionTaken }) {
  const [expandedSamples, setExpandedSamples] = useState({})

  if (!results || !results.success) {
    return null
  }

  const toggleSample = (index) => {
    setExpandedSamples(prev => ({
      ...prev,
      [index]: !prev[index]
    }))
  }

  const handleAction = async (sampleId, action) => {
    if (onActionTaken) {
      await onActionTaken(sampleId, action)
    }
  }

  // No issues detected
  if (!results.has_issues || results.samples_detected.length === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-start">
          <CheckCircle className="w-6 h-6 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-semibold text-green-900 mb-2">
              ✅ Sample Clearance: Passed
            </h3>
            <p className="text-green-800">
              No uncleared samples detected. Your track is clear for distribution to all platforms.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Issues detected
  const riskColors = {
    critical: { bg: 'bg-red-50', border: 'border-red-300', text: 'text-red-900', icon: 'text-red-600' },
    high: { bg: 'bg-orange-50', border: 'border-orange-300', text: 'text-orange-900', icon: 'text-orange-600' },
    medium: { bg: 'bg-yellow-50', border: 'border-yellow-300', text: 'text-yellow-900', icon: 'text-yellow-600' },
    low: { bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-900', icon: 'text-blue-600' }
  }

  const colors = riskColors[results.risk_level] || riskColors.medium

  return (
    <div className={`${colors.bg} border ${colors.border} rounded-lg p-6`}>
      <div className="flex items-start mb-4">
        <AlertCircle className={`w-6 h-6 ${colors.icon} mt-0.5 mr-3 flex-shrink-0`} />
        <div className="flex-1">
          <h3 className={`text-lg font-semibold ${colors.text} mb-2`}>
            {results.risk_level === 'critical' && '🚨 CRITICAL: Distribution Blocked'}
            {results.risk_level === 'high' && '⚠️ HIGH RISK: Action Required'}
            {results.risk_level === 'medium' && '⚠️ MEDIUM RISK: Review Recommended'}
            {results.risk_level === 'low' && 'ℹ️ LOW RISK: Review Suggested'}
          </h3>
          <p className={`${colors.text} mb-4`}>
            {results.message}
          </p>

          {/* Education Box */}
          <div className="bg-white/50 border border-gray-300 rounded-lg p-4 mb-4">
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
              <Info className="w-4 h-4 mr-2" />
              What does this mean?
            </h4>
            <p className="text-sm text-gray-700 mb-2">
              Our AI detected samples from copyrighted recordings in your track. Using uncleared samples can result in:
            </p>
            <ul className="text-sm text-gray-700 space-y-1 ml-4 list-disc">
              <li><strong>Copyright lawsuits:</strong> Average settlement $150K-$1M+</li>
              <li><strong>Track takedowns:</strong> Removed from all platforms</li>
              <li><strong>Revenue loss:</strong> YouTube Content ID claims your earnings</li>
              <li><strong>Account suspension:</strong> Repeated infringement can ban your account</li>
            </ul>
          </div>

          {/* Detected Samples List */}
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900">
              {results.samples.length} Uncleared Sample{results.samples.length > 1 ? 's' : ''} Detected:
            </h4>

            {results.samples.map((sample, index) => (
              <div
                key={index}
                className="bg-white border border-gray-300 rounded-lg overflow-hidden"
              >
                {/* Sample Header */}
                <div
                  className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleSample(index)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900">
                          {sample.source_title}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          sample.confidence >= 90 ? 'bg-red-100 text-red-700' :
                          sample.confidence >= 70 ? 'bg-orange-100 text-orange-700' :
                          sample.confidence >= 50 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {sample.confidence}% match
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        by {sample.source_artist}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Rights held by: <span className="font-medium">{sample.rights_holder}</span>
                      </p>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">
                      {expandedSamples[index] ? '▼' : '▶'}
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedSamples[index] && (
                  <div className="border-t border-gray-200 p-4 bg-gray-50">
                    <div className="space-y-3">
                      {/* Timestamp */}
                      {sample.timestamp && (
                        <div>
                          <span className="text-xs font-semibold text-gray-700">Sample Location:</span>
                          <p className="text-sm text-gray-600">{sample.timestamp}</p>
                        </div>
                      )}

                      {/* Recommendation */}
                      <div>
                        <span className="text-xs font-semibold text-gray-700">Recommendation:</span>
                        <p className="text-sm text-gray-600">{sample.recommendation}</p>
                      </div>

                      {/* Actions */}
                      <div>
                        <span className="text-xs font-semibold text-gray-700 block mb-2">What can I do?</span>
                        <div className="space-y-2">
                          <button
                            onClick={() => handleAction(sample.id, 'clear_sample')}
                            className="w-full text-left text-sm bg-white border border-gray-300 rounded-lg p-3 hover:bg-gray-50 transition-colors"
                          >
                            <div className="font-medium text-gray-900">1. Clear the Sample (Recommended)</div>
                            <div className="text-xs text-gray-600 mt-1">
                              Contact the rights holder to license the sample. We can help with clearance services.
                            </div>
                          </button>

                          <button
                            onClick={() => handleAction(sample.id, 'remove_sample')}
                            className="w-full text-left text-sm bg-white border border-gray-300 rounded-lg p-3 hover:bg-gray-50 transition-colors"
                          >
                            <div className="font-medium text-gray-900">2. Remove the Sample</div>
                            <div className="text-xs text-gray-600 mt-1">
                              Re-produce your track without the sample and re-upload.
                            </div>
                          </button>

                          <button
                            onClick={() => handleAction(sample.id, 'replace_sample')}
                            className="w-full text-left text-sm bg-white border border-gray-300 rounded-lg p-3 hover:bg-gray-50 transition-colors"
                          >
                            <div className="font-medium text-gray-900">3. Replace with Royalty-Free</div>
                            <div className="text-xs text-gray-600 mt-1">
                              Find similar sounds on Splice, Tracklib, or YouTube Audio Library.
                            </div>
                          </button>

                          {sample.confidence < 70 && (
                            <button
                              onClick={() => handleAction(sample.id, 'dispute')}
                              className="w-full text-left text-sm bg-white border border-gray-300 rounded-lg p-3 hover:bg-gray-50 transition-colors"
                            >
                              <div className="font-medium text-gray-900">4. Dispute (Low Confidence Only)</div>
                              <div className="text-xs text-gray-600 mt-1">
                                If you believe this is a false positive, you can dispute the detection.
                              </div>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Resources */}
                      <div className="pt-3 border-t border-gray-200">
                        <span className="text-xs font-semibold text-gray-700 block mb-2">Helpful Resources:</span>
                        <div className="space-y-1">
                          <a
                            href="https://www.tracklib.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-xs text-blue-600 hover:text-blue-800"
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            Tracklib - Legal Sample Marketplace
                          </a>
                          <a
                            href="https://splice.com/sounds"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-xs text-blue-600 hover:text-blue-800"
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            Splice - Royalty-Free Samples
                          </a>
                          <a
                            href="/help/sample-clearance"
                            className="flex items-center text-xs text-blue-600 hover:text-blue-800"
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            MSC & Co Sample Clearance Guide
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          {results.action_required && (
            <div className="mt-4 p-4 bg-white/70 border border-gray-300 rounded-lg">
              <p className="text-sm font-semibold text-gray-900 mb-2">
                Distribution is currently blocked for this track.
              </p>
              <p className="text-sm text-gray-700 mb-3">
                Please address the detected samples above before proceeding. Our team is here to help if you need guidance on sample clearance.
              </p>
              <button
                onClick={() => window.location.href = '/support'}
                className="text-sm bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Contact Support for Help
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
