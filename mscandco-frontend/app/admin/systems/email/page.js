import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { userHasPermission } from '@/lib/permissions'
import EmailClient from './EmailClient'

export const metadata = {
  title: 'Email System | Systems',
  description: 'Manage email templates and delivery monitoring'
}

export default async function EmailPage() {
  const supabase = await createClient()
  
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()

  if (sessionError || !session) {
    redirect('/login')
  }

  const hasPermission = await userHasPermission(session.user.id, 'systems:email:view', true)

  if (!hasPermission) {
    redirect('/admin/systems')
  }

  return <EmailClient />
}

