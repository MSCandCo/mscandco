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
  const supabase = createClient()

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const signOut = async () => {
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

  const value = {
    user,
    session,
    loading,
    signOut,
    signIn,
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