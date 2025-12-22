import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import MessagesClient from './MessagesClient'

export const metadata = {
  title: 'Admin Messages',
  description: 'Manage platform messages and communications - view and respond to user inquiries',
  keywords: 'admin messages, platform communications, support messages, admin notifications',
  openGraph: {
    title: 'Admin Messages | MSC & Co',
    description: 'Manage platform messages and communications - view and respond to user inquiries',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Admin Messages | MSC & Co',
    description: 'Manage platform messages and communications - view and respond to user inquiries',
  },
}

export default async function MessagesPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) redirect('/login')

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <MessagesClient user={session.user} />
    </div>
  )
}