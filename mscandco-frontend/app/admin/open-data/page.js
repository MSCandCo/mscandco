import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { userHasPermission } from '@/lib/permissions';
import OpenDataAdminClient from './OpenDataAdminClient';

export const metadata = {

export const dynamic = 'force-dynamic'

  title: 'Open Data Management',
  description: 'Manage open data initiatives, API access, and public data sharing'
}

export default async function OpenDataAdminPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  // Check if user has permission to manage open data
  const hasPermission = await userHasPermission(
    session.user.id,
    'opendata:manage',
    true // use service role
  );

  if (!hasPermission) {
    redirect('/dashboard');
  }

  return <OpenDataAdminClient user={session.user} />;
}
