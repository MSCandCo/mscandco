import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { userHasPermission } from '@/lib/permissions'
import LabelRosterClient from './LabelRosterClient'

export default async function LabelRosterPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  // Check permission
  const hasPermission = await userHasPermission(session.user.id, 'roster:access', true)
  if (!hasPermission) {
    redirect('/unauthorized')
  }

  // Label admins get an aggregated view of all contributors
  // across all releases from all affiliated artists
  return <LabelRosterClient user={session.user} />
}
