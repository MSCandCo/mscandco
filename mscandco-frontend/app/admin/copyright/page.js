import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { userHasPermission } from '@/lib/permissions';
import CopyrightAdminClient from './CopyrightAdminClient';

export const metadata = {
  title: 'Copyright Management',
  description: 'Manage copyright verification and clearance requests across the platform'
}

export default async function CopyrightManagementPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  // Check if user has permission to manage copyright
  const hasPermission = await userHasPermission(
    session.user.id,
    'copyright:manage',
    true // use service role
  );

  if (!hasPermission) {
    redirect('/dashboard');
  }

  return <CopyrightAdminClient user={session.user} />;
}
