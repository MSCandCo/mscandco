import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { userHasPermission } from '@/lib/permissions'
import UptimeClient from './UptimeClient'

export const metadata = {
  title: 'Uptime Monitoring | Systems',
  description: 'Monitor system uptime and service availability'
}

export default async function UptimePage() {
  const supabase = await createClient()
  
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()

  if (sessionError || !session) {
    redirect('/login')
  }

  const hasPermission = await userHasPermission(session.user.id, 'systems:uptime:view', true)

  if (!hasPermission) {
    redirect('/admin/systems')
  }

  return <UptimeClient />
}

