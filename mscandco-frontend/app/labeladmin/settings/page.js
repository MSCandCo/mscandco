import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { userHasPermission } from '@/lib/permissions'
import SettingsClient from './SettingsClient'

export default async function LabelAdminSettingsPage() {
  const supabase = await createClient()
  
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()

  console.log('🔐 Label Admin Settings Page - Session check:', {
    hasSession: !!session,
    userId: session?.user?.id,
    error: sessionError?.message
  })

  if (sessionError || !session) {
    console.log('❌ No session found, redirecting to login')
    redirect('/login')
  }

  // Check if user has permission to access settings
  const hasPermission = await userHasPermission(session.user.id, 'settings:access', true)

  console.log('🔐 Label Admin Settings Page - Permission check:', {
    userId: session.user.id,
    hasPermission,
    requiredPermission: 'settings:access'
  })

  if (!hasPermission) {
    console.log('❌ User does not have settings:access permission, redirecting to dashboard')
    redirect('/dashboard')
  }

  return <SettingsClient />
}
