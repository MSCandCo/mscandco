'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Download, FileJson, Loader2 } from 'lucide-react'

/**
 * ExportData Component
 *
 * GDPR Right to Data Portability (Article 20)
 * Allows users to download all their personal data in JSON format
 *
 * Features:
 * - One-click data export
 * - Includes all personal data (profile, earnings, releases, etc.)
 * - Downloads as JSON file
 * - Shows export progress
 */
export default function ExportData() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const supabase = createClient()

  const handleExportData = async () => {
    setLoading(true)
    setError('')

    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        setError('You must be logged in to export your data')
        setLoading(false)
        return
      }

      const response = await fetch('/api/user/export-data', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to export data')
        setLoading(false)
        return
      }

      // Get the blob from response
      const blob = await response.blob()

      // Create download link
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `mscandco-data-export-${Date.now()}.json`
      document.body.appendChild(a)
      a.click()

      // Cleanup
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      setLoading(false)
    } catch (err) {
      console.error('Export error:', err)
      setError('An unexpected error occurred while exporting your data')
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-blue-100 rounded-lg">
          <FileJson className="w-6 h-6 text-blue-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Export Your Data
          </h3>
          <p className="text-gray-600 mb-4">
            Download a complete copy of all your personal data in JSON format. This includes your profile, earnings, releases, and all other information we store about you.
          </p>
          <p className="text-sm text-gray-500 mb-4">
            GDPR Right to Data Portability: You have the right to receive your personal data in a structured, commonly used, and machine-readable format.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <button
            onClick={handleExportData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Download My Data
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
