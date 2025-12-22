/**
 * Touring Platform - Main Dashboard
 * Server component wrapper
 */

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import TouringDashboardClient from './TouringDashboardClient';

export const metadata = {
  title: 'Touring Platform | MSC & Co',
  description: 'AI-powered touring management platform - plan tours, manage venues, crew, and guest lists'
};

export default async function TouringDashboardPage() {
  const supabase = await createClient();
  
  // Check authentication
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.user) {
    redirect('/login');
  }
  
  // Pass userId for reference, but API route handles auth server-side
  return <TouringDashboardClient userId={session.user.id} />;
}

