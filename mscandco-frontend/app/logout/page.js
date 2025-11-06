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

        // Clear ghost mode if active
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('ghost_mode')
          sessionStorage.removeItem('ghost_session')
          sessionStorage.removeItem('original_admin_user')
          sessionStorage.removeItem('ghost_target_user')
        }

        // Sign out (don't wait for it to complete - redirect immediately)
        supabase.auth.signOut().catch(err => {
          console.error('Sign out error (non-blocking):', err)
        })

        // Mark as run
        setHasRun(true)

        // Clear local storage immediately
        if (typeof window !== 'undefined') {
          localStorage.clear()
          sessionStorage.clear()
        }

        // Hard redirect to login page immediately
        // Use window.location.href for full page reload to clear all state
        window.location.href = '/login'
      } catch (error) {
        console.error('Logout error:', error)
        // Still redirect even if there's an error
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
      }
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
