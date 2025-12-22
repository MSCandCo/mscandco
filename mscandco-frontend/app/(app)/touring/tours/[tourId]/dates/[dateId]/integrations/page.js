/**
 * Touring Platform - External Integrations Page
 * Connect Eventbrite, sync ticket sales, manage payments
 */

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import IntegrationsClient from './IntegrationsClient';


export const dynamic = 'force-dynamic'

export default async function IntegrationsPage({ params }) {
  const supabase = await createClient();
  
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.user) {
    redirect('/login');
  }
  
  return <IntegrationsClient tourId={params.tourId} dateId={params.dateId} userId={session.user.id} />;
}

