import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PlatformAnalyticsClient from './PlatformAnalyticsClient'

export default async function PlatformAnalyticsPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) redirect('/login')
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <PlatformAnalyticsClient user={session.user} />
    </div>
  )
}
