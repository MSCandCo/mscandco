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
  
  console.log('🔐 Artist Settings Page - Permission Check:', {
    userId: session.user.id,
    email: session.user.email,
    hasAccess,
    requiredPermission: 'artist:settings:access'
  })

  if (!hasAccess) {
    console.log('❌ Access denied - redirecting to dashboard')
    redirect('/dashboard')
  }

  console.log('✅ Access granted - rendering SettingsClient')
  
  return <SettingsClient />
}
