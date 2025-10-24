import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { userHasPermission } from '@/lib/permissions'
import SettingsClient from './SettingsClient'

export default async function LabelAdminSettingsPage() {
  const supabase = await createClient()
  
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()

  if (sessionError || !session) {
    redirect('/login')
  }

  // Check if user has permission to access settings
  const hasPermission = await userHasPermission(session.user.id, 'settings:access', true)

  if (!hasPermission) {
    redirect('/dashboard')
  }

  return <SettingsClient />
}
