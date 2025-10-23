import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SplitConfigurationClient from './SplitConfigurationClient'

export default async function SplitConfigurationPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) redirect('/login')
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <SplitConfigurationClient user={session.user} />
    </div>
  )
}
