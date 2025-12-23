import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { userHasPermission } from '@/lib/permissions'
import RosterClient from './RosterClient'


export const dynamic = 'force-dynamic'
export const metadata = {
  title: 'Roster',
  description: 'Manage your artist roster - view collaborators, featured artists, and manage your music network',
  keywords: 'artist roster, music collaborators, featured artists, music network, artist management',
  openGraph: {
    title: 'Roster | MSC & Co',
    description: 'Manage your artist roster - view collaborators, featured artists, and manage your music network',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Roster | MSC & Co',
    description: 'Manage your artist roster - view collaborators, featured artists, and manage your music network',
  },
}

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