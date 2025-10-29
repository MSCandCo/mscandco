'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LogoutPage() {
  const router = useRouter()
  const [hasRun, setHasRun] = useState(false)

  useEffect(() => {
    // Prevent multiple executions
    if (hasRun) return

    const handleLogout = async () => {
      try {
        const supabase = createClient()

        // Sign out (don't wait for response)
        supabase.auth.signOut()

        // Mark as run
        setHasRun(true)

        // Immediate redirect - don't wait for signOut to complete
        router.push('/')
        router.refresh()
      } catch (error) {
        console.error('Logout error:', error)
        // Still redirect even if there's an error
        router.push('/')
      }
    }

    handleLogout()
  }, [hasRun, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-4 text-gray-600">Logging out...</p>
      </div>
    </div>
  )
}
