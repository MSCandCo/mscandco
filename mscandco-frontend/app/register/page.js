/**
 * Register Page - App Router Version
 *
 * Public registration page for new users
 */

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import RegisterClient from './RegisterClient'

export const metadata = {
  title: 'Register | MSC & Co',
  description: 'Create your free account with MSC & Co'
}

export default async function RegisterPage() {
  const supabase = await createClient()

  // Check if user is already authenticated
  const { data: { session } } = await supabase.auth.getSession()

  // If authenticated, redirect to dashboard
  if (session?.user) {
    redirect('/dashboard')
  }

  // Show registration page
  return <RegisterClient />
}
