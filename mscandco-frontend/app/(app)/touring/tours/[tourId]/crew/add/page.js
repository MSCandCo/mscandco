/**
 * Touring Platform - Add Crew Member Page
 */

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import AddCrewMemberClient from './AddCrewMemberClient';

export const metadata = {
  title: 'Add Crew Member | Touring Platform'
};

export default async function AddCrewMemberPage({ params }) {
  const supabase = await createClient();
  
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.user) {
    redirect('/login');
  }
  
  return <AddCrewMemberClient tourId={params.tourId} userId={session.user.id} />;
}

