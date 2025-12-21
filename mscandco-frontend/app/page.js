/**
 * Public Homepage - App Router Version
 *
 * Shows the public homepage to visitors
 * Redirects authenticated users to their dashboard
 */

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import HomeClient from './HomeClient'

export default async function HomePage() {
  try {
    const supabase = await createClient()

    // Check if user is authenticated
    // Wrap in try-catch to handle network/auth errors gracefully
    const { data: { session }, error } = await supabase.auth.getSession()

    // If authenticated, redirect to Apollo AI
    if (!error && session?.user) {
      redirect('/ai')
    }

    // If error occurred (network issue, etc.), just show public homepage
    // Show public homepage
    return <HomeClient />
  } catch (error) {
    // If Supabase client creation or auth check fails, show public homepage
    // This handles network errors, connection issues, etc.
    console.warn('Homepage: Auth check failed, showing public homepage:', error.message)
    return <HomeClient />
  }
}






