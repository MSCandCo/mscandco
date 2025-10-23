import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import RequestsClient from './RequestsClient'

export default async function RequestsPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) redirect('/login')

  return <RequestsClient />
}
