/**
 * Superadmin Messages Page - App Router (Server Component)
 *
 * View and manage platform messages
 */

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SuperadminMessagesClient from './SuperadminMessagesClient'

export const metadata = {
  title: 'Platform Messages | MSC & Co',
  description: 'View and manage platform-wide communications'
}

export default async function SuperadminMessagesPage() {
  const supabase = await createClient()

  // Get session (already authenticated by layout)
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  return <SuperadminMessagesClient user={session.user} />
}


