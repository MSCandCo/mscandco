import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// Force dynamic rendering to avoid build-time evaluation
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request) {
  try {
    // Lazy load Supabase client
    const { createServiceRoleClient } = await import('@/lib/supabase/server');
    const supabase = await createServiceRoleClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch AI monitoring results for user's copyrighted works
    const { data, error } = await supabase
      .from('copyright_monitoring')
      .select('*, copyright_registrations(work_title)')
      .eq('user_id', user.id)
      .order('detected_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching monitoring results:', error);
      return NextResponse.json(
        { error: 'Failed to fetch monitoring results' },
        { status: 500 }
      );
    }

    // Calculate statistics
    const stats = {
      total_detections: data.length,
      pending_review: data.filter((d) => d.status === 'pending').length,
      confirmed_infringements: data.filter((d) => d.status === 'confirmed').length,
      false_positives: data.filter((d) => d.status === 'false_positive').length,
      resolved: data.filter((d) => d.status === 'resolved').length,
    };

    return NextResponse.json({ monitoring: data, stats });
  } catch (error) {
    console.error('Error in fetching monitoring results:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    // Lazy load Supabase client
    const { createServiceRoleClient } = await import('@/lib/supabase/server');
    const supabase = await createServiceRoleClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { detection_id, status, notes } = body;

    if (!detection_id || !status) {
      return NextResponse.json(
        { error: 'Detection ID and status are required' },
        { status: 400 }
      );
    }

    // Update monitoring detection status
    const { data, error } = await supabase
      .from('copyright_monitoring')
      .update({
        status,
        notes: notes || null,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', detection_id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating monitoring detection:', error);
      return NextResponse.json(
        { error: 'Failed to update monitoring detection' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, detection: data });
  } catch (error) {
    console.error('Error in updating monitoring detection:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
