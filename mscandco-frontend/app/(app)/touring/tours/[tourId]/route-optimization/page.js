/**
 * Touring Platform - Route Optimization Page
 * Visual route planner with map and optimization suggestions
 */

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import RouteOptimizationClient from './RouteOptimizationClient';


export const dynamic = 'force-dynamic'

export default async function RouteOptimizationPage({ params }) {
  const supabase = await createClient();
  
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.user) {
    redirect('/login');
  }
  
  return <RouteOptimizationClient tourId={params.tourId} userId={session.user.id} />;
}

