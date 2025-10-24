import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import NotificationsClient from './NotificationsClient'

export default async function NotificationsPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) redirect('/login')

  // Use service role to fetch notifications (bypasses RLS)
  const supabaseAdmin = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  // Fetch initial notifications
  const { data: initialNotifications, error } = await supabaseAdmin
    .from('notifications')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  console.log('🔔 Notifications Page - Fetched notifications:', {
    userId: session.user.id,
    email: session.user.email,
    count: initialNotifications?.length || 0,
    types: initialNotifications?.map(n => n.type) || [],
    error: error?.message
  })

  return <NotificationsClient initialNotifications={initialNotifications || []} user={session.user} />
}
