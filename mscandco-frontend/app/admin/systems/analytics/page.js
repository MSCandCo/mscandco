import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { userHasPermission } from '@/lib/permissions'
import AnalyticsClient from './AnalyticsClient'

export const metadata = {
  title: 'User Analytics | Systems',
  description: 'Monitor user behavior and platform analytics'
}

export default async function AnalyticsPage() {
  const supabase = await createClient()
  
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()

  if (sessionError || !session) {
    redirect('/login')
  }

  const hasPermission = await userHasPermission(session.user.id, 'systems:analytics:view', true)

  if (!hasPermission) {
    redirect('/admin/systems')
  }

  return <AnalyticsClient />
}

