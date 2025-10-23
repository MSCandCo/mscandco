import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AssetLibraryClient from './AssetLibraryClient'

export default async function AssetLibraryPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) redirect('/login')
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <AssetLibraryClient user={session.user} />
    </div>
  )
}
