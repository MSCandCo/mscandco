'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { usePathname } from 'next/navigation'

/**
 * InactivityLogout Component
 *
 * Automatically logs out users after a period of inactivity.
 * Tracks user activity through mouse, keyboard, scroll, and touch events.
 * Countdown continues even when page is in background using timestamps.
 *
 * @param {number} timeoutMinutes - Minutes of inactivity before logout (default: 30)
 * @param {number} warningMinutes - Minutes before timeout to show warning (default: 5)
 */
export function InactivityLogout({
  timeoutMinutes = 30,
  warningMinutes = 5
}) {
  const pathname = usePathname()
  const supabase = createClient()
  const timeoutRef = useRef(null)
  const warningTimeoutRef = useRef(null)
  const countdownIntervalRef = useRef(null)
  const showWarningRef = useRef(false)
  const warningStartTimeRef = useRef(null) // Track when warning started
  const [showWarning, setShowWarning] = useState(false)
  const [remainingSeconds, setRemainingSeconds] = useState(warningMinutes * 60)

  // Don't run on public pages
  const publicPaths = ['/login', '/register', '/reset-password', '/']
  const isPublicPage = publicPaths.includes(pathname)

  const logout = async () => {
    // Clear countdown interval if it's running
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current)
      countdownIntervalRef.current = null
    }

    // Clear all timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current)
      warningTimeoutRef.current = null
    }

    try {
      // Sign out first with proper scope
      await supabase.auth.signOut({ scope: 'global' })
    } catch (error) {
      console.error('Error signing out:', error)
    }

    // Clear all storage after signout
    if (typeof window !== 'undefined') {
      localStorage.clear()
      sessionStorage.clear()

      // Clear cookies by setting them to expire
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/")
      })
    }

    // Hard redirect to login page with reason
    if (typeof window !== 'undefined') {
      window.location.href = '/login?reason=inactivity'
    }
  }

  const updateCountdown = () => {
    if (!warningStartTimeRef.current) return
    
    const elapsed = Math.floor((Date.now() - warningStartTimeRef.current) / 1000)
    const remaining = Math.max(0, (warningMinutes * 60) - elapsed)
    
    setRemainingSeconds(remaining)
    
    if (remaining <= 0) {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current)
        countdownIntervalRef.current = null
      }
      logout()
    }
  }

  const resetTimeout = () => {
    // Don't reset on public pages
    if (isPublicPage) return

    // If warning is already shown, don't reset - let user interact with modal
    if (showWarningRef.current) return

    // Clear existing timeouts and intervals
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current)
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current)

    // Set warning timeout (shown N minutes before actual logout)
    const warningTime = (timeoutMinutes - warningMinutes) * 60 * 1000
    if (warningTime > 0) {
      warningTimeoutRef.current = setTimeout(() => {
        showWarningRef.current = true
        setShowWarning(true)
        warningStartTimeRef.current = Date.now() // Record when warning started
        setRemainingSeconds(warningMinutes * 60)

        // Start countdown using timestamps (works even when page is in background)
        // Update every second for smooth countdown display
        countdownIntervalRef.current = setInterval(() => {
          updateCountdown()
        }, 1000) // Update every second
        
        // Backup timeout to ensure logout happens
        timeoutRef.current = setTimeout(() => {
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current)
            countdownIntervalRef.current = null
          }
          logout()
        }, warningMinutes * 60 * 1000)
      }, warningTime)
    }

    // Set actual logout timeout (only if warning hasn't been shown yet)
    if (!showWarningRef.current) {
      timeoutRef.current = setTimeout(() => {
        logout()
      }, timeoutMinutes * 60 * 1000)
    }
  }

  const extendSession = () => {
    // Clear countdown interval if it's running
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current)
      countdownIntervalRef.current = null
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current)
      warningTimeoutRef.current = null
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    warningStartTimeRef.current = null
    showWarningRef.current = false
    setShowWarning(false)
    resetTimeout()
  }

  const handleLogout = (e) => {
    e?.preventDefault()
    e?.stopPropagation()
    logout()
  }

  useEffect(() => {
    if (isPublicPage) return

    // Track user activity events
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove']

    const handleActivity = (e) => {
      // Don't reset if warning is shown - user must interact with modal
      if (showWarningRef.current) return
      resetTimeout()
    }

    // Handle page visibility changes - recalculate time when page becomes visible
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is hidden - timestamps will handle the countdown
        return
      } else {
        // Page is visible again - update countdown immediately
        if (showWarningRef.current && warningStartTimeRef.current) {
          updateCountdown()
        }
      }
    }

    events.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true })
    })
    
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Initial timeout setup
    resetTimeout()

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current)
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current)

      events.forEach(event => {
        document.removeEventListener(event, handleActivity)
      })
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isPublicPage, pathname])

  if (isPublicPage || !showWarning) return null

  const minutes = Math.floor(remainingSeconds / 60)
  const seconds = remainingSeconds % 60

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 animate-fade-in">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-amber-100 mb-4">
            <svg
              className="h-8 w-8 text-amber-600"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Session Expiring Soon
          </h3>

          <p className="text-gray-600 mb-6">
            You've been inactive for a while. For your security, you'll be automatically logged out in:
          </p>

          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <div className="text-5xl font-bold text-gray-900 font-mono">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </div>
            <p className="text-sm text-gray-500 mt-2">minutes remaining</p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                extendSession()
              }}
              className="flex-1 bg-[#1f2937] text-white rounded-xl px-6 py-3 font-semibold hover:bg-[#374151] transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Stay Logged In
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                logout()
              }}
              className="flex-1 bg-gray-200 text-gray-700 rounded-xl px-6 py-3 font-semibold hover:bg-gray-300 transition-all duration-200"
            >
              Logout Now
            </button>
          </div>

          <p className="text-xs text-gray-500 mt-4">
            Please click a button above to continue
          </p>
        </div>
      </div>
    </div>
  )
}
