import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardClient from '@/app/dashboard/DashboardClient'

export default async function ArtistDashboardPage() {
  try {
    const supabase = await createClient()
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('Artist Dashboard: Session error:', sessionError)
      redirect('/login')
    }
    
    if (!session) {
      redirect('/login')
    }

    return <DashboardClient user={session.user} />
  } catch (error) {
    console.error('Artist Dashboard: Server error:', error)
    redirect('/login')
  }
}