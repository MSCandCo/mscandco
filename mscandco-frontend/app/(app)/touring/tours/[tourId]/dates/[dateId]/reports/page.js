/**
 * Touring Platform - Reports Page
 * Generate day sheets, set lists, guest lists as PDF
 */

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ReportsClient from './ReportsClient';


export const dynamic = 'force-dynamic'

export default async function ReportsPage({ params }) {
  const supabase = await createClient();
  
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.user) {
    redirect('/login');
  }
  
  return <ReportsClient tourId={params.tourId} dateId={params.dateId} userId={session.user.id} />;
}

