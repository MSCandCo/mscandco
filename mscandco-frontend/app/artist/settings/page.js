import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { userHasPermission } from '@/lib/permissions'
import SettingsClient from './SettingsClient'


export const dynamic = 'force-dynamic'
export const metadata = {
  title: 'Settings',
  description: 'Manage your account settings - preferences, notifications, security, and account configuration',
  keywords: 'account settings, user settings, preferences, account management, security settings',
  openGraph: {
    title: 'Settings | MSC & Co',
    description: 'Manage your account settings - preferences, notifications, security, and account configuration',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Settings | MSC & Co',
    description: 'Manage your account settings - preferences, notifications, security, and account configuration',
  },
}

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