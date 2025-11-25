/**
 * Touring Platform - Add Tour Date Page
 */

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import AddTourDateClient from './AddTourDateClient';

export const metadata = {
  title: 'Add Tour Date | Touring Platform'
};

export default async function AddTourDatePage({ params }) {
  const supabase = await createClient();
  
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.user) {
    redirect('/login');
  }
  
  return <AddTourDateClient tourId={params.tourId} userId={session.user.id} />;
}

