/**
 * Touring Platform - Tour Detail Page
 */

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import TourDetailClient from './TourDetailClient';

export const metadata = {
  title: 'Tour Details | Touring Platform',
  description: 'Manage your tour details, dates, crew, and more'
};

export default async function TourDetailPage({ params }) {
  const supabase = await createClient();
  
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.user) {
    redirect('/login');
  }
  
  return <TourDetailClient tourId={params.tourId} userId={session.user.id} />;
}

