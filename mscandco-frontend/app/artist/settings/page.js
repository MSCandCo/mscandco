import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { userHasPermission } from '@/lib/permissions'
import SettingsClient from './SettingsClient'

export default async function ArtistSettingsPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    redirect('/login')
  }

  // Check if user has permission to access settings
  const hasAccess = await userHasPermission(session.user.id, 'artist:settings:access', true)

  if (!hasAccess) {
    redirect('/dashboard')
  }
  
  return <SettingsClient />
}
