import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import LabelDashboardClient from './LabelDashboardClient'


export const dynamic = 'force-dynamic'
export const metadata = {
  title: 'Label Dashboard',
  description: 'Your label dashboard - manage artists, releases, and track label performance'
}

export default async function LabelDashboardPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  return <LabelDashboardClient user={session.user} />
}