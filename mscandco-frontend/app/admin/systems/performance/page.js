import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { userHasPermission } from '@/lib/permissions'
import PerformanceClient from './PerformanceClient'

export const metadata = {
  title: 'Performance Monitoring | Systems',
  description: 'Monitor application performance and resource usage'
}

export default async function PerformancePage() {
  const supabase = await createClient()
  
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()

  if (sessionError || !session) {
    redirect('/login')
  }

  const hasPermission = await userHasPermission(session.user.id, 'systems:performance:view', true)

  if (!hasPermission) {
    redirect('/admin/systems')
  }

  return <PerformanceClient />
}

