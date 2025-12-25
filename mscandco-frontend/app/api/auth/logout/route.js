import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST() {
  const supabase = await createClient()

  // Sign out the user with global scope
  await supabase.auth.signOut({ scope: 'global' })

  // Clear all cookies
  const cookieStore = await cookies()
  const allCookies = cookieStore.getAll()

  // Delete each cookie individually
  allCookies.forEach(cookie => {
    cookieStore.delete({
      name: cookie.name,
      path: '/',
      domain: cookie.domain || undefined
    })
  })

  // Create response with additional cookie clearing headers
  const response = NextResponse.json({ success: true })

  // Set headers to clear cookies and storage
  response.headers.set('Clear-Site-Data', '"cache", "cookies", "storage"')

  // Also set explicit cookie deletion headers for Supabase cookies
  const supabaseCookies = allCookies.filter(c =>
    c.name.includes('supabase') ||
    c.name.includes('sb-') ||
    c.name.startsWith('sb-')
  )

  supabaseCookies.forEach(cookie => {
    response.cookies.delete({
      name: cookie.name,
      path: '/',
      domain: cookie.domain || undefined
    })
  })

  return response
}
