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
  
  console.log('🔐 Artist Messages Page - Permission Check:', {
    userId: session.user.id,
    email: session.user.email,
    hasAccess,
    requiredPermission: 'artist:messages:access'
  })
  
  if (!hasAccess) {
    console.log('❌ Access denied - redirecting to dashboard')
    redirect('/dashboard')
  }
  
  console.log('✅ Access granted - rendering MessagesClient')
  return <MessagesClient />
}
