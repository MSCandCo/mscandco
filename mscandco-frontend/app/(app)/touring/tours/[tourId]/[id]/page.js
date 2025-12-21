/**
 * Touring Platform - Tour Detail Page
 * Server component wrapper for tour detail view
 */

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import TourDetailClient from './TourDetailClient';

export default async function TourDetailPage({ params }) {
  const supabase = await createClient();

  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login');
  }

  const { id } = await params;

  return <TourDetailClient tourId={id} />;
}
