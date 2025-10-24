import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { userHasPermission } from '@/lib/permissions'
import DocsClient from './DocsClient'

export const metadata = {
  title: 'Documentation Hub | Systems',
  description: 'Access system documentation and API references'
}

export default async function DocsPage() {
  const supabase = await createClient()
  
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()

  if (sessionError || !session) {
    redirect('/login')
  }

  const hasPermission = await userHasPermission(session.user.id, 'systems:docs:view', true)

  if (!hasPermission) {
    redirect('/admin/systems')
  }

  return <DocsClient />
}

