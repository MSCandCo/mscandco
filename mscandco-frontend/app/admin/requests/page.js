import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import RequestsClient from './RequestsClient'


export const dynamic = 'force-dynamic'
export const metadata = {
  title: 'Admin Requests',
  description: 'Manage platform requests - review and process user requests, support tickets, and administrative tasks',
  keywords: 'admin requests, support requests, user requests, request management, admin tasks',
  openGraph: {
    title: 'Admin Requests | MSC & Co',
    description: 'Manage platform requests - review and process user requests, support tickets, and administrative tasks',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Admin Requests | MSC & Co',
    description: 'Manage platform requests - review and process user requests, support tickets, and administrative tasks',
  },
}

export default async function RequestsPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) redirect('/login')

  return <RequestsClient />
}