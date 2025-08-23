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

  useEffect(() => {
    let isMounted = true
    let isProcessing = false // Prevent multiple simultaneous auth calls
    
    // Simple auth handler that doesn't do complex database operations
    const handleAuthUser = async (authUser) => {
      if (!isMounted || isProcessing) return
      isProcessing = true
      
      // Processing auth user
      
      try {
        if (authUser) {
          // Import getUserRoleSync to determine role
          const { getUserRoleSync } = await import('../../lib/user-utils')
          const userRole = getUserRoleSync(authUser)
          
          // User role determined successfully
          
          // Set user with role - no complex database operations
          setUser({
            ...authUser,
            role: userRole,
            needsRegistration: false
          })
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error('Error processing auth user:', error)
        setUser(null)
      } finally {
        if (isMounted) {
          setIsLoading(false)
          isProcessing = false
        }
      }
    }
    
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (!isMounted) return
        
        if (error) {
          console.warn('Auth session error:', error)
          setUser(null)
          setIsLoading(false)
        } else {
          await handleAuthUser(session?.user)
        }
      } catch (err) {
        console.error('Failed to get session:', err)
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
        
        // Auth state change detected
        
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
    user,
    isLoading,
    signOut: () => supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}