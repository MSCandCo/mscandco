/**
 * Touring Platform - Add Itinerary Item Page
 */

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import AddItineraryItemClient from './AddItineraryItemClient';

export default async function AddItineraryItemPage({ params }) {
  const supabase = await createClient();
  
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.user) {
    redirect('/login');
  }
  
  return <AddItineraryItemClient tourId={params.tourId} dateId={params.dateId} userId={session.user.id} />;
}

