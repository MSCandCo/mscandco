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

    const { data: setting, error: settingError } = await supabaseAdmin
      .from('platform_settings')
      .select('value')
      .eq('key', 'registration_enabled')
      .single();

    if (settingError && settingError.code !== 'PGRST116') {
      console.error('Error checking registration status:', settingError);
      // Fail open on error - allow registration
      return <RegisterClient />
    }

    // Default to enabled if setting doesn't exist
    if (!setting) {
      return <RegisterClient />
    }

    // Normalize JSONB value to boolean - handle all possible formats
    const value = setting.value;
    let registrationEnabled = false;
    
    if (value === true || value === 'true') {
      registrationEnabled = true;
    } else if (value === false || value === 'false') {
      registrationEnabled = false;
    } else {
      // Handle string representations
      const strValue = String(value).toLowerCase().trim();
      registrationEnabled = strValue === 'true' || strValue === '1';
    }

    console.log('Registration check (server):', {
      rawValue: value,
      valueType: typeof value,
      normalized: registrationEnabled
    });

    if (!registrationEnabled) {
      console.log('Registration disabled, redirecting to /registration-closed');
      redirect('/registration-closed')
    }
  } catch (error) {
    console.error('Error checking registration status:', error);
    // Fail open on error - allow registration
  }

  // Show registration page
  return <RegisterClient />
}
