import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { userHasPermission } from '@/lib/permissions'
import SecurityClient from './SecurityClient'

export const metadata = {
  title: 'Security Management | Systems',
  description: 'Monitor security events and manage security policies'
}

export default async function SecurityPage() {
  const supabase = await createClient()
  
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()

  if (sessionError || !session) {
    redirect('/login')
  }

  const hasPermission = await userHasPermission(session.user.id, 'systems:security:view', true)

  if (!hasPermission) {
    redirect('/admin/systems')
  }

  return <SecurityClient />
}

