/**
 * Distribution Hub - App Router (Server Component)
 * Central queue for reviewing and managing submitted releases
 */

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DistributionHubClient from './DistributionHubClient'

export const metadata = {
  title: 'Distribution Hub | MSC & Co',
  description: 'Review and manage submitted releases and revisions'
}

export default async function DistributionHubPage() {
  const supabase = await createClient()

  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  return <DistributionHubClient user={session.user} />
}
