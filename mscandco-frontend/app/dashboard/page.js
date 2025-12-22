import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardClient from './DashboardClient'

export const metadata = {

export const dynamic = 'force-dynamic'

  title: 'Dashboard',
  description: 'Your music distribution dashboard - manage releases, track earnings, and grow your career'
}

export default async function DashboardPage() {
  console.log('📄 Dashboard Page: Server component rendering')

  try {
    const supabase = await createClient()
    console.log('📄 Dashboard Page: Getting session...')

    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError) {
      console.error('📄 Dashboard: Session error:', sessionError)
      redirect('/login')
    }

    if (!session) {
      console.log('📄 Dashboard: No session, redirecting to login')
      redirect('/login')
    }

    console.log('📄 Dashboard: Session valid, rendering DashboardClient for user:', session.user.id)
    return <DashboardClient user={session.user} />
  } catch (error) {
    console.error('📄 Dashboard: Server error:', error)
    // Redirect to login on any error
    redirect('/login')
  }
}
