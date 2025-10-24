import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { userHasPermission } from '@/lib/permissions'
import BillingClient from './BillingClient'

export default async function ArtistBillingPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    redirect('/login')
  }

  // Check if user has permission to access billing (uses settings:access which artists already have)
  const hasAccess = await userHasPermission(session.user.id, 'settings:access', true)

  if (!hasAccess) {
    redirect('/dashboard')
  }
  
  return <BillingClient userRole="artist" />
}

