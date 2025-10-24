import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { userHasPermission } from '@/lib/permissions'
import MessagesClient from './MessagesClient'

export default async function ArtistMessagesPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    redirect('/login')
  }

  // Check permissions (useServiceRole = true for server-side)
  const hasAccess = await userHasPermission(session.user.id, 'artist:messages:access', true)
  
  if (!hasAccess) {
    redirect('/dashboard')
  }
  
  return <MessagesClient />
}
