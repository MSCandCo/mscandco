import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
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

