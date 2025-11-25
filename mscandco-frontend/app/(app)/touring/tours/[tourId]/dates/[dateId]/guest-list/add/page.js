/**
 * Touring Platform - Add Guest Page
 */

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import AddGuestClient from './AddGuestClient';

export default async function AddGuestPage({ params }) {
  const supabase = await createClient();
  
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.user) {
    redirect('/login');
  }
  
  return <AddGuestClient tourId={params.tourId} dateId={params.dateId} userId={session.user.id} />;
}

