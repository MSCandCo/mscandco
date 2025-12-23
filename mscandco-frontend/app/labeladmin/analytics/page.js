import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { userHasPermission } from '@/lib/permissions'
import AnalyticsClient from './AnalyticsClient'


export const dynamic = 'force-dynamic'
export const metadata = {
  title: 'Label Analytics',
  description: 'Track your label performance - analytics, revenue, and insights across all artists and releases',
  keywords: 'label analytics, music label analytics, label performance, label revenue, label insights',
  openGraph: {
    title: 'Label Analytics | MSC & Co',
    description: 'Track your label performance - analytics, revenue, and insights across all artists and releases',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Label Analytics | MSC & Co',
    description: 'Track your label performance - analytics, revenue, and insights across all artists and releases',
  },
}

export default async function LabelAnalyticsPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  // Check permission
  const hasPermission = await userHasPermission(session.user.id, 'analytics:access', true)
  if (!hasPermission) {
    redirect('/unauthorized')
  }

  return <AnalyticsClient />
}