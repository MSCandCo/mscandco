'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { trackPageVisit } from '@/lib/pageVisitTracker'

export default function PageVisitTracker({ userId }) {
  const pathname = usePathname()

  useEffect(() => {
    if (userId && pathname) {
      // Track the visit
      trackPageVisit(userId, pathname)
    }
  }, [userId, pathname])

  return null // This component renders nothing
}
