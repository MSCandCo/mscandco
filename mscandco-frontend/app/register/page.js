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

  // Check registration status BEFORE rendering anything
  // This ensures redirect happens before any HTML is sent to the client
  try {
    const { createServiceRoleClient } = await import('@/lib/supabase/server');
    const supabaseAdmin = await createServiceRoleClient();

    const { data: setting, error: settingError } = await supabaseAdmin
      .from('platform_settings')
      .select('value')
      .eq('key', 'registration_enabled')
      .single();

    if (settingError) {
      if (settingError.code === 'PGRST116') {
        // No setting found - default to enabled
        console.log('No registration setting found, defaulting to enabled');
      } else {
        console.error('Error checking registration status:', settingError);
        // Fail open on error - allow registration but log it
      }
    } else if (setting && setting.value !== undefined) {
      // Normalize JSONB value to boolean - handle all possible formats
      const value = setting.value;
      let registrationEnabled = false;
      
      // Check for explicit true values
      if (value === true || value === 'true') {
        registrationEnabled = true;
      } 
      // Check for explicit false values
      else if (value === false || value === 'false') {
        registrationEnabled = false;
      } 
      // Handle string representations
      else {
        const strValue = String(value).toLowerCase().trim();
        registrationEnabled = strValue === 'true' || strValue === '1';
      }

      console.log('Registration check (server):', {
        rawValue: value,
        valueType: typeof value,
        normalized: registrationEnabled,
        settingExists: !!setting
      });

      // Redirect BEFORE rendering if disabled
      if (!registrationEnabled) {
        console.log('Registration disabled, redirecting to /registration-closed');
        redirect('/registration-closed')
      } else {
        console.log('Registration enabled, showing registration form');
      }
    }
  } catch (error) {
    console.error('Error checking registration status:', error);
    // Fail open on error - allow registration
    console.log('Failing open due to error, allowing registration');
  }

  // Show registration page only if we get here (registration enabled)
  return <RegisterClient />
}
