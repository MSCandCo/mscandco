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

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true) // Start with true for proper loading state

  // Ultra-simple function - just return the auth user as-is
  const getUserProfile = (authUser) => {
    if (!authUser) return null
    
    console.log('✅ Simple auth - user logged in:', authUser.email);
    
    // Return the user directly - no database calls at all!
    return {
      ...authUser,
      role: 'artist', // Default role for everyone
      brand: 'YHWH MSC',
      needsRegistration: false
    }
  }

  useEffect(() => {
    let isMounted = true
    
    // Get initial session - quick and non-blocking with timeout
    const getInitialSession = async () => {
      try {
        // Add timeout to prevent infinite loading
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session timeout')), 10000)
        );
        
        const { data: { session }, error } = await Promise.race([sessionPromise, timeoutPromise]);
        
        if (!isMounted) return
        
        if (error) {
          console.warn('Auth session error:', error)
          setUser(null)
        } else if (session?.user) {
          const fullUser = await getUserProfile(session.user)
          if (isMounted) setUser(fullUser)
        } else {
          setUser(null)
        }
        
        if (isMounted) setIsLoading(false)
      } catch (err) {
        console.error('Failed to get session:', err)
        if (isMounted) {
          setUser(null)
          setIsLoading(false)
        }
      }
    }

    // Run in background without blocking UI
    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return
        
        if (session?.user) {
          const fullUser = await getUserProfile(session.user)
          if (isMounted) setUser(fullUser)
        } else {
          if (isMounted) setUser(null)
        }
        if (isMounted) setIsLoading(false)
      }
    )

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  }

  const signUp = async (email, password, metadata = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    })
    return { data, error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  const value = {
    user,
    isLoading,
    signIn,
    signUp,
    signOut,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// For compatibility with existing useUser hook
export const useUser = () => {
  const { user, isLoading } = useAuth()
  return {
    user,
    isLoading,
    error: null
  }
}