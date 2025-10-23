'use client'

import { useUser } from '@/components/providers/SupabaseProvider'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

/**
 * Admin Layout Component - App Router Compatible
 *
 * Simple layout wrapper without duplicate navigation
 * Main header is already provided by the root layout
 */

export default function AdminLayout({ children }) {
  const { user, loading } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}






