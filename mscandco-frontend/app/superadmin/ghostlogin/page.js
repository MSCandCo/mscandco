/**
 * Ghost Login Page - App Router (Server Component)
 *
 * Login as other users for support purposes
 */

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import GhostLoginClient from './GhostLoginClient'

export const metadata = {
  title: 'Ghost Login',
  description: 'Login as other users for support and troubleshooting purposes',
  keywords: 'ghost login, user impersonation, support tools, admin tools',
  openGraph: {
    title: 'Ghost Login | MSC & Co',
    description: 'Login as other users for support and troubleshooting purposes',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Ghost Login | MSC & Co',
    description: 'Login as other users for support and troubleshooting purposes',
  },
}

export default async function GhostLoginPage() {
  const supabase = await createClient()

  // Get session (already authenticated by layout)
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  return <GhostLoginClient user={session.user} />
}