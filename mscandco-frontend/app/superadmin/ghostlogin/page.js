/**
 * Ghost Login Page - App Router (Server Component)
 *
 * Login as other users for support purposes
 */

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import GhostLoginClient from './GhostLoginClient'

export default async function GhostLoginPage() {
  const supabase = await createClient()

  // Get session (already authenticated by layout)
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  return <GhostLoginClient user={session.user} />
}




