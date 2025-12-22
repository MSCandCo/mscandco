import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PlatformAnalyticsClient from './PlatformAnalyticsClient'

export const metadata = {
  title: 'Platform Analytics',
  description: 'View platform-wide analytics and insights - track growth, user engagement, and platform performance',
  keywords: 'platform analytics, platform insights, growth metrics, user engagement, platform performance',
  openGraph: {
    title: 'Platform Analytics | MSC & Co',
    description: 'View platform-wide analytics and insights - track growth, user engagement, and platform performance',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Platform Analytics | MSC & Co',
    description: 'View platform-wide analytics and insights - track growth, user engagement, and platform performance',
  },
}

export default async function PlatformAnalyticsPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) redirect('/login')

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <PlatformAnalyticsClient user={session.user} />
    </div>
  )
}