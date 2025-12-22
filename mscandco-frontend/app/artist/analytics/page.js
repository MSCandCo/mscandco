import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { userHasPermission } from '@/lib/permissions'
import AnalyticsClient from './AnalyticsClient'

export const metadata = {

export const dynamic = 'force-dynamic'

  title: 'Analytics',
  description: 'Track your music performance - streams, listeners, revenue, and detailed analytics across all platforms',
  keywords: 'music analytics, streaming analytics, music statistics, performance tracking, music insights, streaming data',
  openGraph: {
    title: 'Analytics | MSC & Co',
    description: 'Track your music performance - streams, listeners, revenue, and detailed analytics across all platforms',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Analytics | MSC & Co',
    description: 'Track your music performance - streams, listeners, revenue, and detailed analytics across all platforms',
  },
}

export default async function ArtistAnalyticsPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  // Check permission
  const hasPermission = await userHasPermission(session.user.id, 'analytics:access', true)
  if (!hasPermission) {
    redirect('/unauthorized')
  }

  return <AnalyticsClient user={session.user} />
}