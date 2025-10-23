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
  const supabase = await createClient()

  // Check if user is authenticated
  const { data: { session } } = await supabase.auth.getSession()

  // If authenticated, redirect to dashboard
  if (session?.user) {
    redirect('/dashboard')
  }

  // Show public homepage
  return <HomeClient />
}






