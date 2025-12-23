import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { userHasPermission } from '@/lib/permissions'
import ProfileClient from './ProfileClient'


export const dynamic = 'force-dynamic'
export const metadata = {
  title: 'Artist Profile',
  description: 'Manage your artist profile - update bio, photos, social links, and public information',
  keywords: 'artist profile, music profile, artist bio, music artist page, artist information',
  openGraph: {
    title: 'Artist Profile | MSC & Co',
    description: 'Manage your artist profile - update bio, photos, social links, and public information',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Artist Profile | MSC & Co',
    description: 'Manage your artist profile - update bio, photos, social links, and public information',
  },
}

export default async function ArtistProfilePage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  // Check permission
  const hasPermission = await userHasPermission(session.user.id, 'profile:read', true)
  if (!hasPermission) {
    redirect('/unauthorized')
  }

  return <ProfileClient />
}