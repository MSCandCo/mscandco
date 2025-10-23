import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { userHasPermission } from '@/lib/permissions'
import RosterClient from './RosterClient'

export default async function ArtistRosterPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  // Check permission
  const hasPermission = await userHasPermission(session.user.id, 'roster:access', true)
  if (!hasPermission) {
    redirect('/unauthorized')
  }

  return <RosterClient user={session.user} />
}
