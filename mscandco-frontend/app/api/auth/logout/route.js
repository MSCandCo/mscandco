import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
  const supabase = await createClient()

  // Sign out the user with global scope
  await supabase.auth.signOut({ scope: 'global' })

  // Clear all cookies
  const cookieStore = await cookies()
  const allCookies = cookieStore.getAll()
  
  allCookies.forEach(cookie => {
    cookieStore.delete(cookie.name)
  })

  // Create response with additional cookie clearing headers
  const response = NextResponse.json({ success: true })
  
  // Set headers to clear cookies
  response.headers.set('Clear-Site-Data', '"cache", "cookies", "storage"')
  
  return response
}
