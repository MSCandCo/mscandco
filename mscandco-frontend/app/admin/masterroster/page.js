import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import MasterRosterClient from './MasterRosterClient'

export const metadata = {

export const dynamic = 'force-dynamic'

  title: 'Master Roster',
  description: 'Manage platform master roster - view all artists, labels, and users across the platform',
  keywords: 'master roster, platform roster, artist management, user management, roster administration',
  openGraph: {
    title: 'Master Roster | MSC & Co',
    description: 'Manage platform master roster - view all artists, labels, and users across the platform',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Master Roster | MSC & Co',
    description: 'Manage platform master roster - view all artists, labels, and users across the platform',
  },
}

export default async function MasterRosterPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) redirect('/login')

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <MasterRosterClient user={session.user} />
    </div>
  )
}