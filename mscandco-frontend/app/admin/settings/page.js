import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SettingsClient from './SettingsClient'


export const dynamic = 'force-dynamic'
export const metadata = {
  title: 'Admin Settings',
  description: 'Configure platform settings - system configuration, preferences, and administrative options',
  keywords: 'admin settings, platform configuration, system settings, administrative options',
  openGraph: {
    title: 'Admin Settings | MSC & Co',
    description: 'Configure platform settings - system configuration, preferences, and administrative options',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Admin Settings | MSC & Co',
    description: 'Configure platform settings - system configuration, preferences, and administrative options',
  },
}

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) redirect('/login')

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <SettingsClient user={session.user} />
    </div>
  )
}