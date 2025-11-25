/**
 * Touring Platform - Financial Tracking Page
 */

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import FinancialTrackingClient from './FinancialTrackingClient';

export default async function FinancialTrackingPage({ params }) {
  const supabase = await createClient();
  
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.user) {
    redirect('/login');
  }
  
  return <FinancialTrackingClient tourId={params.tourId} userId={session.user.id} />;
}

