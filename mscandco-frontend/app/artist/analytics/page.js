import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { userHasPermission } from '@/lib/permissions'
import AnalyticsClient from './AnalyticsClient'

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
