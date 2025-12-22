import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { userHasPermission } from '@/lib/permissions'
import BackupsClient from './BackupsClient'

export const metadata = {

export const dynamic = 'force-dynamic'

  title: 'Backup & Recovery',
  description: 'Manage database backups and recovery operations'
}

export default async function BackupsPage() {
  const supabase = await createClient()

  const { data: { session }, error: sessionError } = await supabase.auth.getSession()

  if (sessionError || !session) {
    redirect('/login')
  }

  const hasPermission = await userHasPermission(session.user.id, 'systems:backups:view', true)

  if (!hasPermission) {
    redirect('/admin/systems')
  }

  return <BackupsClient />
}