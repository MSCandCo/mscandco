import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { userHasPermission } from '@/lib/permissions'
import ProfileClient from './ProfileClient'

export default async function LabelAdminProfilePage() {
  const supabase = await createClient()
  
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()

  if (sessionError || !session) {
    redirect('/login')
  }

  // Check if user has permission to access label admin profile
  const hasPermission = await userHasPermission(session.user.id, 'labeladmin:profile:access', true)

  if (!hasPermission) {
    redirect('/dashboard')
  }

  return <ProfileClient />
}

