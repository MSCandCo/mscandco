/**
 * Touring Platform - Add Hotel Page
 */

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import AddHotelClient from './AddHotelClient';

export default async function AddHotelPage({ params }) {
  const supabase = await createClient();
  
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.user) {
    redirect('/login');
  }
  
  return <AddHotelClient tourId={params.tourId} dateId={params.dateId} userId={session.user.id} />;
}

