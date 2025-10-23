import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { userHasPermission } from '@/lib/permissions'
import ProfileClient from './ProfileClient'

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
