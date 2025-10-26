'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { PageLoading } from '@/components/ui/LoadingSpinner';

export default function LogoutPage() {
  const router = useRouter()
  const [hasRun, setHasRun] = useState(false)

  useEffect(() => {
    // Prevent multiple executions
    if (hasRun) return

    const handleLogout = async () => {
      try {
        const supabase = createClient()

        console.log('Logging out user...')

        // Sign out
        const { error } = await supabase.auth.signOut()

        if (error) {
          console.error('Logout error:', error)
        } else {
          console.log('Successfully logged out')
        }

        // Mark as run
        setHasRun(true)

        // Force redirect with window.location for more reliable navigation
        window.location.href = '/'
      } catch (error) {
        console.error('Logout error:', error)
        // Still redirect even if there's an error
        window.location.href = '/'
      }
    }

    handleLogout()
  }, [hasRun])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-4 text-gray-600">Logging out...</p>
      </div>
    </div>
  )
}
