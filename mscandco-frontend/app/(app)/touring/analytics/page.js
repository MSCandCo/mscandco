/**
 * Touring Platform - Analytics Dashboard
 * AI-powered insights and predictions
 */

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import AnalyticsDashboardClient from './AnalyticsDashboardClient';

export const metadata = {

export const dynamic = 'force-dynamic'

  title: 'Touring Analytics | Touring Platform'
};

export default async function AnalyticsDashboardPage() {
  const supabase = await createClient();
  
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.user) {
    redirect('/login');
  }
  
  return <AnalyticsDashboardClient userId={session.user.id} />;
}

