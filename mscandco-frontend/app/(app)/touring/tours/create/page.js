/**
 * Touring Platform - Create Tour Page
 */

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import CreateTourClient from './CreateTourClient';

export const metadata = {
  title: 'Create Tour | Touring Platform',
  description: 'Create a new tour with AI assistance'
};

export default async function CreateTourPage() {
  const supabase = await createClient();
  
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.user) {
    redirect('/login');
  }
  
  return <CreateTourClient userId={session.user.id} />;
}

