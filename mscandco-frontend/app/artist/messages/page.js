import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { userHasPermission } from '@/lib/permissions'
import MessagesClient from './MessagesClient'

export const metadata = {

export const dynamic = 'force-dynamic'

  title: 'Messages',
  description: 'View and manage your messages - platform notifications, support tickets, and communications',
  keywords: 'artist messages, music platform messages, notifications, support tickets, communications',
  openGraph: {
    title: 'Messages | MSC & Co',
    description: 'View and manage your messages - platform notifications, support tickets, and communications',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Messages | MSC & Co',
    description: 'View and manage your messages - platform notifications, support tickets, and communications',
  },
}

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