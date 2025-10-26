import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import EarningsClient from './EarningsClient'

export default async function LabelEarningsPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  // Layout already verified label admin access
  return <EarningsClient user={session.user} />
}
