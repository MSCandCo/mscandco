import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Also export as useUser for compatibility with existing code
export const useUser = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useUser must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [ghostUser, setGhostUser] = useState(null)

  // Check for ghost mode on component mount and storage changes
  useEffect(() => {
    const checkGhostMode = () => {
      if (typeof window !== 'undefined') {
        const ghostMode = sessionStorage.getItem('ghost_mode')
        const ghostTargetUser = sessionStorage.getItem('ghost_target_user')
        
        if (ghostMode === 'true' && ghostTargetUser) {
          try {
            const targetUser = JSON.parse(ghostTargetUser)
            setGhostUser(targetUser)
          } catch (error) {
            console.error('Error parsing ghost user data:', error)
            setGhostUser(null)
          }
        } else {
          setGhostUser(null)
        }
      }
    }

    checkGhostMode()

    // Listen for storage changes (ghost mode activation/deactivation)
    const handleStorageChange = (e) => {
      if (e.key === 'ghost_mode' || e.key === 'ghost_target_user') {
        checkGhostMode()
      }
    }

    // Also listen for custom events (for same-tab ghost mode changes)
    const handleGhostModeChange = () => {
      checkGhostMode()
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('ghostModeChanged', handleGhostModeChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('ghostModeChanged', handleGhostModeChange)
    }
  }, [])

  useEffect(() => {
    let isMounted = true
    let isProcessing = false // Prevent multiple simultaneous auth calls
    
    // Simple auth handler that doesn't do complex database operations
    const handleAuthUser = async (authUser) => {
      if (!isMounted || isProcessing) {
        console.log('⚠️ SupabaseProvider: Skipping handleAuthUser (mounted:', isMounted, 'processing:', isProcessing, ')')
        return
      }
      isProcessing = true

      console.log('🔧 SupabaseProvider: Processing auth user...', authUser ? 'User exists' : 'No user')

      try {
        if (authUser) {
          // Fetch role from database via profile API
          let userRole = 'artist' // default

          try {
            const { data: { session } } = await supabase.auth.getSession()
            const token = session?.access_token

            if (token) {
              const response = await fetch('/api/artist/profile', {
                headers: { 'Authorization': `Bearer ${token}` }
              })

              if (response.ok) {
                const profileData = await response.json()
                userRole = profileData.role || 'artist'
                console.log('✅ SupabaseProvider: User role from database:', userRole)
              } else {
                // Fallback to getUserRoleSync if API fails
                const { getUserRoleSync } = await import('../../lib/user-utils')
                userRole = getUserRoleSync(authUser)
                console.log('⚠️ SupabaseProvider: Using fallback role:', userRole)
              }
            }
          } catch (roleError) {
            console.error('⚠️ SupabaseProvider: Error fetching role from database:', roleError)
            // Fallback to getUserRoleSync
            const { getUserRoleSync } = await import('../../lib/user-utils')
            userRole = getUserRoleSync(authUser)
          }

          console.log('✅ SupabaseProvider: Final user role:', userRole)

          // Set user with role from database
          setUser({
            ...authUser,
            role: userRole,
            needsRegistration: false
          })
        } else {
          console.log('❌ SupabaseProvider: No auth user, setting user to null')
          setUser(null)
        }
      } catch (error) {
        console.error('💥 SupabaseProvider: Error processing auth user:', error)
        setUser(null)
      } finally {
        if (isMounted) {
          console.log('✅ SupabaseProvider: Setting isLoading to FALSE')
          setIsLoading(false)
          isProcessing = false
        }
      }
    }
    
    // Get initial session with minimal retry logic
    const getInitialSession = async () => {
      try {
        console.log('🔍 SupabaseProvider: Getting initial session...')
        // Reduced retry logic - only retry once with shorter delay
        let session = null
        let retries = 2 // Reduced from 5 to 2

        while (!session && retries > 0 && isMounted) {
          console.log(`🔄 SupabaseProvider: Attempting to get session (${3 - retries}/2)...`)
          const { data, error } = await supabase.auth.getSession()

          if (error) {
            console.warn('❌ SupabaseProvider: Auth session error:', error)
            break
          }

          if (data.session) {
            console.log('✅ SupabaseProvider: Session found!')
            session = data.session
            break
          }

          console.log(`⏳ SupabaseProvider: No session yet, retrying... (${retries - 1} retries left)`)
          // Reduced wait time from 300ms to 100ms
          await new Promise(resolve => setTimeout(resolve, 100))
          retries--
        }

        if (!isMounted) {
          console.log('⚠️ SupabaseProvider: Component unmounted during session check')
          return
        }

        if (session) {
          console.log('👤 SupabaseProvider: Processing user from session')
          await handleAuthUser(session.user)
        } else {
          console.log('❌ SupabaseProvider: No session found after retries')
          setUser(null)
          setIsLoading(false)
        }
      } catch (err) {
        console.error('💥 SupabaseProvider: Failed to get session:', err)
        if (isMounted) {
          setUser(null)
          setIsLoading(false)
        }
      }
    }

    // Run session check
    getInitialSession()

    // Listen for auth changes - simplified
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return

        console.log('🔔 SupabaseProvider: Auth state change detected -', event, session?.user ? 'User present' : 'No user')

        // Only handle SIGNED_IN and SIGNED_OUT events to prevent loops
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'INITIAL_SESSION') {
          await handleAuthUser(session?.user)
        }
      }
    )

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  const value = {
    user: ghostUser || user, // Return ghost user if in ghost mode, otherwise return real user
    isLoading,
    signOut: () => supabase.auth.signOut(),
    isGhostMode: !!ghostUser,
    realUser: user // Keep reference to real user for admin functions
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}