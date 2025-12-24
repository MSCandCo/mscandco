'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import PageVisitTracker from '@/components/PageVisitTracker'

/**
 * Supabase Provider - App Router Compatible
 * 
 * Provides authentication state and methods to all components
 * Extracted from original Pages Router components
 */

const SupabaseContext = createContext({})

export function SupabaseProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState(null)
  // Lazy initialize Supabase client - only create it in useEffect (browser only)
  // This prevents build-time evaluation
  const [supabase, setSupabase] = useState(null)

  useEffect(() => {
    // Initialize Supabase client only in browser (lazy initialization)
    if (!supabase && typeof window !== 'undefined') {
      try {
        const client = createClient()
        setSupabase(client)
      } catch (error) {
        console.error('Failed to initialize Supabase client:', error)
        setLoading(false)
        return
      }
    }

    // If client not ready yet, wait
    if (!supabase) {
      return
    }

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          console.warn('SupabaseProvider: Error getting session:', error.message)
          // Set to null on error - treat as no session
          setSession(null)
          setUser(null)
        } else {
          setSession(session)
          setUser(session?.user ?? null)
        }
      } catch (error) {
        // Handle network errors, connection issues, etc.
        console.warn('SupabaseProvider: Failed to get session:', error.message)
        setSession(null)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    if (!supabase) return
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          setSession(session)
          setUser(session?.user ?? null)
        } catch (error) {
          console.warn('SupabaseProvider: Error in auth state change:', error.message)
          setSession(null)
          setUser(null)
        } finally {
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase])

  const signOut = async () => {
    if (!supabase) return
    setLoading(true)
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      console.error('Error signing out:', error)
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email, password) => {
    if (!supabase) {
      throw new Error('Supabase client not initialized')
    }
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error signing in:', error)
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  const verifyMfaChallenge = async (factorId, code) => {
    try {
      const { data, error } = await supabase.auth.mfa.challengeAndVerify({
        factorId,
        code
      })
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error verifying MFA:', error)
      return { data: null, error }
    }
  }

  const value = {
    user,
    session,
    loading,
    signOut,
    signIn,
    verifyMfaChallenge,
    supabase
  }

  return (
    <SupabaseContext.Provider value={value}>
      <PageVisitTracker userId={user?.id} />
      {children}
    </SupabaseContext.Provider>
  )
}

export function useUser() {
  const context = useContext(SupabaseContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a SupabaseProvider')
  }
  return context
}

// Export AuthProvider as alias for backward compatibility with Pages Router
export const AuthProvider = SupabaseProvider