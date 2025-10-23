import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PermissionsClient from './PermissionsClient'

export default async function PermissionsPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) redirect('/login')
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <PermissionsClient user={session.user} />
    </div>
  )
}
