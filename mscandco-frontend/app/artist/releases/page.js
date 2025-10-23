import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { userHasPermission } from '@/lib/permissions'
import ReleasesClient from './ReleasesClient'

export default async function ArtistReleasesPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  // Check permission
  const hasPermission = await userHasPermission(session.user.id, 'releases:access', true)
  if (!hasPermission) {
    redirect('/unauthorized')
  }

  return <ReleasesClient user={session.user} />
}
