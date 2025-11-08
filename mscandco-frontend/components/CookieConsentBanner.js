'use client'

import { useState, useEffect } from 'react'
import { Cookie, X, Settings, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

const COOKIE_CATEGORIES = {
  necessary: {
    name: 'Strictly Necessary',
    description: 'Essential for the website to function. Cannot be disabled.',
    required: true,
    cookies: ['Authentication', 'Session management', 'Security tokens']
  },
  analytics: {
    name: 'Analytics & Performance',
    description: 'Help us understand how you use our site to improve your experience.',
    required: false,
    cookies: ['Google Analytics', 'Performance monitoring', 'Error tracking']
  },
  functional: {
    name: 'Functional',
    description: 'Enable enhanced functionality and personalization.',
    required: false,
    cookies: ['User preferences', 'Language settings', 'Theme preferences']
  }
}

export default function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false)
  const [showPreferences, setShowPreferences] = useState(false)
  const [preferences, setPreferences] = useState({
    necessary: true,
    analytics: false,
    functional: false
  })
  const [isChecking, setIsChecking] = useState(true)

  // Helper function to get cookie value
  const getCookie = (name) => {
    if (typeof document === 'undefined') return null
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) return parts.pop().split(';').shift()
    return null
  }

  // Helper function to set cookie
  const setCookie = (name, value, days = 365) => {
    if (typeof document === 'undefined') return
    const date = new Date()
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000))
    const expires = `expires=${date.toUTCString()}`
    document.cookie = `${name}=${value};${expires};path=/;SameSite=Lax`
  }

  useEffect(() => {
    const checkConsent = async () => {
      setIsChecking(true)
      
      // Check multiple sources for consent
      const localStorageConsent = localStorage.getItem('cookie_consent')
      const sessionStorageConsent = sessionStorage.getItem('cookie_consent')
      const cookieConsent = getCookie('cookie_consent')
      const dnt = navigator.doNotTrack === '1' || window.doNotTrack === '1'

      // If Do Not Track is enabled, respect it and don't show banner
      if (dnt) {
        const dntPrefs = { necessary: true, analytics: false, functional: false }
        setPreferences(dntPrefs)
        applyConsentSettings(dntPrefs)
        setIsChecking(false)
        return
      }

      // Check if consent exists in any storage
      let savedConsent = null
      if (localStorageConsent) {
        try {
          savedConsent = JSON.parse(localStorageConsent)
        } catch (e) {
          console.warn('Invalid localStorage consent, clearing')
          localStorage.removeItem('cookie_consent')
        }
      } else if (sessionStorageConsent) {
        try {
          savedConsent = JSON.parse(sessionStorageConsent)
          // Migrate to localStorage and cookie for persistence
          localStorage.setItem('cookie_consent', sessionStorageConsent)
          setCookie('cookie_consent', 'true', 180) // 6 months
        } catch (e) {
          console.warn('Invalid sessionStorage consent, clearing')
          sessionStorage.removeItem('cookie_consent')
        }
      } else if (cookieConsent === 'true') {
        // Cookie exists but no localStorage - restore from cookie
        // Default to necessary only if cookie exists but no preferences stored
        savedConsent = { necessary: true, analytics: false, functional: false }
        localStorage.setItem('cookie_consent', JSON.stringify(savedConsent))
      }

      // If consent exists, apply it and don't show banner
      if (savedConsent) {
        setPreferences(savedConsent)
        applyConsentSettings(savedConsent)
        setIsVisible(false)
        setIsChecking(false)
        return
      }

      // Check database for logged-in users
      try {
        const response = await fetch('/api/user/cookie-consent', {
          credentials: 'include'
        })
        
        if (response.ok) {
          const data = await response.json()
          if (data.consent) {
            // User has consent in database
            const dbConsent = {
              necessary: data.consent.necessary !== false,
              analytics: data.consent.analytics === true,
              functional: data.consent.functional === true
            }
            setPreferences(dbConsent)
            applyConsentSettings(dbConsent)
            // Sync to localStorage and cookie
            localStorage.setItem('cookie_consent', JSON.stringify(dbConsent))
            setCookie('cookie_consent', 'true', 180) // 6 months
            setIsVisible(false)
            setIsChecking(false)
            return
          }
        }
      } catch (error) {
        // Silently fail - user might not be logged in
        console.debug('Could not fetch consent from database:', error)
      }

      // No consent found anywhere - show banner after delay
      setTimeout(() => {
        setIsVisible(true)
        setIsChecking(false)
      }, 1000)
    }

    checkConsent()
  }, [])

  const applyConsentSettings = (prefs) => {
    // Apply analytics consent
    if (typeof window.gtag !== 'undefined') {
      window.gtag('consent', 'update', {
        analytics_storage: prefs.analytics ? 'granted' : 'denied',
        functionality_storage: prefs.functional ? 'granted' : 'denied'
      })
    }

    // Save to database for logged-in users
    if (typeof window.supabase !== 'undefined') {
      saveCookieConsent(prefs)
    }
  }

  const saveCookieConsent = async (prefs) => {
    try {
      const response = await fetch('/api/user/cookie-consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          consent: prefs,
          timestamp: new Date().toISOString()
        })
      })

      if (!response.ok) {
        console.error('Failed to save cookie consent')
      }
    } catch (error) {
      console.error('Error saving cookie consent:', error)
    }
  }

  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      functional: true
    }

    // Save to multiple storage locations for redundancy
    localStorage.setItem('cookie_consent', JSON.stringify(allAccepted))
    sessionStorage.setItem('cookie_consent', JSON.stringify(allAccepted))
    localStorage.setItem('cookie_consent_date', new Date().toISOString())
    setCookie('cookie_consent', 'true', 180) // 6 months expiration

    setPreferences(allAccepted)
    applyConsentSettings(allAccepted)
    setIsVisible(false)
  }

  const handleRejectAll = () => {
    const necessaryOnly = {
      necessary: true,
      analytics: false,
      functional: false
    }

    // Save to multiple storage locations for redundancy
    localStorage.setItem('cookie_consent', JSON.stringify(necessaryOnly))
    sessionStorage.setItem('cookie_consent', JSON.stringify(necessaryOnly))
    localStorage.setItem('cookie_consent_date', new Date().toISOString())
    setCookie('cookie_consent', 'true', 180) // 6 months expiration

    setPreferences(necessaryOnly)
    applyConsentSettings(necessaryOnly)
    setIsVisible(false)
  }

  const handleSavePreferences = () => {
    // Save to multiple storage locations for redundancy
    localStorage.setItem('cookie_consent', JSON.stringify(preferences))
    sessionStorage.setItem('cookie_consent', JSON.stringify(preferences))
    localStorage.setItem('cookie_consent_date', new Date().toISOString())
    setCookie('cookie_consent', 'true', 180) // 6 months expiration

    applyConsentSettings(preferences)
    setIsVisible(false)
    setShowPreferences(false)
  }

  const togglePreference = (category) => {
    if (category === 'necessary') return // Can't disable necessary cookies

    setPreferences(prev => ({
      ...prev,
      [category]: !prev[category]
    }))
  }

  // Don't render anything while checking or if not visible
  if (isChecking || !isVisible) return null

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" />

      {/* Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-gray-200 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {!showPreferences ? (
            // Main consent banner
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                <Cookie className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    We value your privacy
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    We use cookies to enhance your experience, analyze site traffic, and for marketing purposes.
                    By clicking "Accept All", you consent to our use of cookies. You can manage your preferences or reject non-essential cookies.
                    {' '}
                    <a href="/cookie-policy" className="text-blue-600 hover:text-blue-700 underline">
                      Learn more about cookies
                    </a>
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <Button
                  onClick={() => setShowPreferences(true)}
                  variant="outline"
                  className="flex items-center justify-center gap-2"
                >
                  <Settings className="h-4 w-4" />
                  Customize
                </Button>
                <Button
                  onClick={handleRejectAll}
                  variant="outline"
                  className="text-gray-700"
                >
                  Reject All
                </Button>
                <Button
                  onClick={handleAcceptAll}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Accept All
                </Button>
              </div>
            </div>
          ) : (
            // Preferences panel
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">
                  Cookie Preferences
                </h3>
                <button
                  onClick={() => setShowPreferences(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {Object.entries(COOKIE_CATEGORIES).map(([key, category]) => (
                  <div
                    key={key}
                    className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-gray-900">
                          {category.name}
                        </h4>
                        {category.required && (
                          <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                            Required
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {category.description}
                      </p>
                      <details className="text-xs text-gray-500">
                        <summary className="cursor-pointer hover:text-gray-700">
                          What cookies are used?
                        </summary>
                        <ul className="mt-2 ml-4 list-disc space-y-1">
                          {category.cookies.map((cookie, i) => (
                            <li key={i}>{cookie}</li>
                          ))}
                        </ul>
                      </details>
                    </div>

                    <button
                      onClick={() => togglePreference(key)}
                      disabled={category.required}
                      className={`
                        relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                        ${category.required ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                        ${preferences[key] ? 'bg-blue-600' : 'bg-gray-300'}
                      `}
                    >
                      <span
                        className={`
                          inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                          ${preferences[key] ? 'translate-x-6' : 'translate-x-1'}
                        `}
                      />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Your preferences will be saved for 6 months
                </p>
                <div className="flex gap-3">
                  <Button
                    onClick={() => setShowPreferences(false)}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSavePreferences}
                    className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                  >
                    <Check className="h-4 w-4" />
                    Save Preferences
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
