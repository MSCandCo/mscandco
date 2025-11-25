/**
 * Touring Platform - Add Travel Page
 */

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import AddTravelClient from './AddTravelClient';

export default async function AddTravelPage({ params }) {
  const supabase = await createClient();
  
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.user) {
    redirect('/login');
  }
  
  return <AddTravelClient tourId={params.tourId} dateId={params.dateId} userId={session.user.id} />;
}

