/**
 * Analytics Management Page - App Router (Server Component)
 *
 * View and manage artist analytics and performance metrics
 */

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { userHasPermission } from '@/lib/permissions'
import AnalyticsManagementClient from './AnalyticsManagementClient'


export const dynamic = 'force-dynamic'
export const metadata = {
  title: 'Analytics Management',
  description: 'Manage platform analytics - view artist performance metrics, streaming data, and platform insights',
  keywords: 'analytics management, platform analytics, artist analytics, performance metrics, streaming analytics',
  openGraph: {
    title: 'Analytics Management | MSC & Co',
    description: 'Manage platform analytics - view artist performance metrics, streaming data, and platform insights',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Analytics Management | MSC & Co',
    description: 'Manage platform analytics - view artist performance metrics, streaming data, and platform insights',
  },
}

export default async function AnalyticsManagementPage() {
  const supabase = await createClient()

  // Get session (already authenticated by layout)
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  // Check if user has permission to manage analytics
  const hasPermission = await userHasPermission(
    session.user.id,
    'analytics:analytics_management:read',
    true // use service role
  )

  if (!hasPermission) {
    redirect('/dashboard')
  }

  return <AnalyticsManagementClient user={session.user} />
}