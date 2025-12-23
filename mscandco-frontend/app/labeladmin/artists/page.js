import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { userHasPermission } from '@/lib/permissions'
import ArtistsClient from './ArtistsClient'


export const dynamic = 'force-dynamic'
export const metadata = {
  title: 'Label Artists',
  description: 'Manage your label artists - roster management, artist profiles, and collaboration tools',
  keywords: 'label artists, roster management, artist management, label administration, music label',
  openGraph: {
    title: 'Label Artists | MSC & Co',
    description: 'Manage your label artists - roster management, artist profiles, and collaboration tools',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Label Artists | MSC & Co',
    description: 'Manage your label artists - roster management, artist profiles, and collaboration tools',
  },
}

export default async function LabelArtistsPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  // Check permission
  const hasPermission = await userHasPermission(session.user.id, 'roster:access', true)
  if (!hasPermission) {
    redirect('/unauthorized')
  }

  return <ArtistsClient />
}