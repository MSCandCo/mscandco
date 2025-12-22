import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// Force dynamic rendering to avoid build-time evaluation
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request) {
  try {
    // Lazy load Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(supabaseUrl, serviceRoleKey)

    const supabase = createClient();
    
    // Get published research papers from database
    const { data: papers, error } = await supabase
      .from('research_papers')
      .select('*')
      .eq('status', 'published')
      .order('published_date', { ascending: false });

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching research papers:', error);
    }

    // Return empty array if no papers (no dummy data)
    return NextResponse.json({
      papers: papers || []
    });
  } catch (error) {
    console.error('Error in research papers:', error);
    return NextResponse.json({
      papers: []
    });
  }
}

