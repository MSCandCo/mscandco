import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ProfileClient from './ProfileClient'

export const metadata = {
  title: 'Admin Profile',
  description: 'Manage your admin profile - update account information, preferences, and administrative settings',
  keywords: 'admin profile, account management, admin settings, profile management',
  openGraph: {
    title: 'Admin Profile | MSC & Co',
    description: 'Manage your admin profile - update account information, preferences, and administrative settings',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Admin Profile | MSC & Co',
    description: 'Manage your admin profile - update account information, preferences, and administrative settings',
  },
}

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) redirect('/login')

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <ProfileClient user={session.user} />
    </div>
  )
}