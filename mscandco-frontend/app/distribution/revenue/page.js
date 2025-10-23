/**
 * Distribution Revenue Reporting - App Router (Server Component)
 *
 * Revenue and analytics reporting for distributed releases
 */

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import RevenueReportingClient from './RevenueReportingClient'

export const metadata = {
  title: 'Revenue Reporting | MSC & Co',
  description: 'Revenue and analytics reporting for distributed releases'
}

export default async function RevenueReportingPage() {
  const supabase = await createClient()

  // Get session
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  return <RevenueReportingClient user={session.user} />
}
