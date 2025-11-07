import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ReleasesClient from './ReleasesClient'

export default async function ArtistReleasesPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  // Quick role check - allow access if profile doesn't exist or role is null (will default to artist)
  // This is faster than full permission check and more lenient
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', session.user.id)
    .maybeSingle()

  // Only redirect if profile exists AND role is explicitly NOT artist
  // Allow access if: profile doesn't exist, role is null, or role is 'artist'
  if (profile && profile.role && profile.role !== 'artist') {
    // User has a different role (e.g., label_admin, company_admin) - redirect
    redirect('/unauthorized')
  }

  // Allow access: profile doesn't exist (will be created), role is null (defaults to artist), or role is 'artist'
  return <ReleasesClient user={session.user} />
}