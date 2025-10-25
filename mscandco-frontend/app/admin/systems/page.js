import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { userHasPermission } from '@/lib/permissions'
import SystemsDashboardClient from './SystemsDashboardClient'

export const metadata = {
  title: 'Systems Dashboard | Admin',
  description: 'Enterprise infrastructure monitoring and management'
}

export default async function SystemsPage() {
  const supabase = await createClient()
  
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()

  if (sessionError || !session) {
    redirect('/login')
  }

  // Check if user has permission to access systems
  const hasPermission = await userHasPermission(session.user.id, 'systems:access', true)

  if (!hasPermission) {
    redirect('/dashboard')
  }

  return <SystemsDashboardClient />
}

