import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { userHasPermission } from '@/lib/permissions'
import EarningsClient from './EarningsClient'

export default async function ArtistEarningsPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  // Check permission
  const hasPermission = await userHasPermission(session.user.id, 'earnings:access', true)
  if (!hasPermission) {
    redirect('/unauthorized')
  }

  return <EarningsClient user={session.user} />
}
