'use client'

import { useEffect, useState } from 'react'
import { forceLogout } from '@/lib/auth/logout-utils'

export default function LogoutPage() {
  const [hasRun, setHasRun] = useState(false)

  useEffect(() => {
    // Prevent multiple executions
    if (hasRun) return

    const handleLogout = async () => {
      setHasRun(true)
      // Use force logout utility for comprehensive cleanup
      await forceLogout({ redirectTo: '/login?loggedOut=true', silent: false })
    }

    // Execute immediately
    handleLogout()
  }, [hasRun])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-12 h-12 border-b-2 rounded-full animate-spin mx-auto" style={{borderColor: '#1f2937'}}></div>
        <p className="mt-4 text-gray-600">Logging out...</p>
      </div>
    </div>
  )
}
