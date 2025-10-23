import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import MasterRosterClient from './MasterRosterClient'

export default async function MasterRosterPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) redirect('/login')
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <MasterRosterClient user={session.user} />
    </div>
  )
}
