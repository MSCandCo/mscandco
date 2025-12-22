import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { userHasPermission } from '@/lib/permissions';
import AccessibilityAdminClient from './AccessibilityAdminClient';

export const metadata = {
  title: 'Accessibility Management',
  description: 'Manage accessibility requests and ensure platform accessibility compliance'
}

export default async function AccessibilityAdminPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  // Check if user has permission to manage accessibility
  const hasPermission = await userHasPermission(
    session.user.id,
    'accessibility:manage',
    true // use service role
  );

  if (!hasPermission) {
    redirect('/dashboard');
  }

  return <AccessibilityAdminClient user={session.user} />;
}
