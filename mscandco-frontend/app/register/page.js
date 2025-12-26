/**
 * Register Page - App Router Version
 *
 * Public registration page for new users
 */

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import RegisterClient from './RegisterClient'


export const dynamic = 'force-dynamic'
export const metadata = {
  title: 'Register',
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

  // Check if registration is enabled
  try {
    const { createServiceRoleClient } = await import('@/lib/supabase/server');
    const supabaseAdmin = await createServiceRoleClient();

    const { data: setting } = await supabaseAdmin
      .from('platform_settings')
      .select('value')
      .eq('key', 'registration_enabled')
      .single();

    const registrationEnabled = setting?.value === true || setting?.value === 'true' || !setting;

    if (!registrationEnabled) {
      redirect('/registration-closed')
    }
  } catch (error) {
    console.error('Error checking registration status:', error);
    // Continue to registration page on error (fail open)
  }

  // Show registration page
  return <RegisterClient />
}
