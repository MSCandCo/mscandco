import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { userHasPermission } from '@/lib/permissions'
import ErrorTrackingClient from './ErrorTrackingClient'

export const metadata = {
  title: 'Error Tracking | Systems',
  description: 'Monitor and track application errors in real-time'
}

export default async function ErrorTrackingPage() {
  const supabase = await createClient()
  
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()

  if (sessionError || !session) {
    redirect('/login')
  }

  const hasPermission = await userHasPermission(session.user.id, 'systems:errors:view', true)

  if (!hasPermission) {
    redirect('/admin/systems')
  }

  return <ErrorTrackingClient />
}

