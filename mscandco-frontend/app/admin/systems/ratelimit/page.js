import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { userHasPermission } from '@/lib/permissions'
import RateLimitClient from './RateLimitClient'

export const metadata = {
  title: 'Rate Limiting | Systems',
  description: 'Configure and monitor API rate limits'
}

export default async function RateLimitPage() {
  const supabase = await createClient()
  
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()

  if (sessionError || !session) {
    redirect('/login')
  }

  const hasPermission = await userHasPermission(session.user.id, 'systems:ratelimit:view', true)

  if (!hasPermission) {
    redirect('/admin/systems')
  }

  return <RateLimitClient />
}

