import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { userHasPermission } from '@/lib/permissions';
import SustainabilityAdminClient from './SustainabilityAdminClient';

export const metadata = {

export const dynamic = 'force-dynamic'

  title: 'Sustainability Management',
  description: 'Track and manage platform sustainability metrics and carbon footprint'
}

export default async function SustainabilityAdminPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  // Check if user has permission to manage sustainability
  const hasPermission = await userHasPermission(
    session.user.id,
    'sustainability:manage',
    true // use service role
  );

  if (!hasPermission) {
    redirect('/dashboard');
  }

  return <SustainabilityAdminClient user={session.user} />;
}
