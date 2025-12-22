import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { userHasPermission } from '@/lib/permissions'
import LabelAdminMessagesClient from './MessagesClient'

export const metadata = {

export const dynamic = 'force-dynamic'

  title: 'Messages',
  description: 'View and manage your label admin notifications and messages'
}

export default async function LabelAdminMessagesPage() {
  const supabase = await createClient()

  // Check authentication
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    redirect('/login')
  }

  // Check if user has permission to access label admin messages
  const hasPermission = await userHasPermission(session.user.id, 'labeladmin:messages:access', true)

  if (!hasPermission) {
    redirect('/dashboard')
  }

  return <LabelAdminMessagesClient />
}