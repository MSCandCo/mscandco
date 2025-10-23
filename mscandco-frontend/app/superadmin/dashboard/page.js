import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SuperadminDashboardClient from './SuperadminDashboardClient'

export default async function SuperadminDashboardPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  return <SuperadminDashboardClient user={session.user} />
}






