/**
 * Touring Platform - Tour Date Detail Page
 * Comprehensive view with guest list, itinerary, hotels, travel
 */

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import TourDateDetailClient from './TourDateDetailClient';

export const metadata = {
  title: 'Tour Date Details | Touring Platform'
};

export default async function TourDateDetailPage({ params }) {
  const supabase = await createClient();
  
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.user) {
    redirect('/login');
  }
  
  return <TourDateDetailClient tourId={params.tourId} dateId={params.dateId} userId={session.user.id} />;
}

