import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  try {
    const supabase = await createClient()
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('Dashboard: Session error:', sessionError)
      redirect('/login')
    }
    
    if (!session) {
      redirect('/login')
    }

    return <DashboardClient user={session.user} />
  } catch (error) {
    console.error('Dashboard: Server error:', error)
    // Redirect to login on any error
    redirect('/login')
  }
}
