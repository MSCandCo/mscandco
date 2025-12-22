import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SuperadminDashboardClient from './SuperadminDashboardClient'

export const metadata = {
  title: 'Superadmin Dashboard',
  description: 'Platform administration dashboard - manage users, permissions, and system configuration'
}

export default async function SuperadminDashboardPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  return <SuperadminDashboardClient user={session.user} />
}