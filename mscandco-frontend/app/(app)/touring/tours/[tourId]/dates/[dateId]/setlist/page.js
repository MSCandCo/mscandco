/**
 * Touring Platform - Set List Builder Page
 */

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import SetListBuilderClient from './SetListBuilderClient';

export default async function SetListBuilderPage({ params }) {
  const supabase = await createClient();
  
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.user) {
    redirect('/login');
  }
  
  return <SetListBuilderClient tourId={params.tourId} dateId={params.dateId} userId={session.user.id} />;
}

