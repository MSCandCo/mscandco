import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { userHasPermission } from '@/lib/permissions'
import ProfileClient from './ProfileClient'

export default async function LabelAdminProfilePage() {
  const supabase = await createClient()
  
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()

  console.log('🔐 Label Admin Profile Page - Session check:', {
    hasSession: !!session,
    userId: session?.user?.id,
    error: sessionError?.message
  })

  if (sessionError || !session) {
    console.log('❌ No session found, redirecting to login')
    redirect('/login')
  }

  // Check if user has permission to access label admin profile
  const hasPermission = await userHasPermission(session.user.id, 'labeladmin:profile:access', true)

  console.log('🔐 Label Admin Profile Page - Permission check:', {
    userId: session.user.id,
    hasPermission,
    requiredPermission: 'labeladmin:profile:access'
  })

  if (!hasPermission) {
    console.log('❌ User does not have labeladmin:profile:access permission, redirecting to dashboard')
    redirect('/dashboard')
  }

  return <ProfileClient />
}

