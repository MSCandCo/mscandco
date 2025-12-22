import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// Force dynamic rendering to avoid build-time evaluation
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request) {
  try {
    // Lazy load Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(supabaseUrl, serviceRoleKey)

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      copyright_registration_id,
      platform,
      infringing_url,
      infringing_user,
      description,
      evidence_urls,
    } = body;

    // Validate required fields
    if (!copyright_registration_id || !platform || !infringing_url) {
      return NextResponse.json(
        { error: 'Registration ID, platform, and infringing URL are required' },
        { status: 400 }
      );
    }

    // Insert DMCA takedown request
    const { data, error } = await supabase
      .from('dmca_takedowns')
      .insert({
        user_id: user.id,
        copyright_registration_id,
        platform,
        infringing_url,
        infringing_user: infringing_user || null,
        description: description || null,
        evidence_urls: evidence_urls || [],
        status: 'submitted',
        submitted_date: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error submitting DMCA takedown:', error);
      return NextResponse.json({ error: 'Failed to submit DMCA takedown' }, { status: 500 });
    }

    // In production, trigger email notification to platform
    // await sendDMCANotification(data);

    return NextResponse.json({ success: true, takedown: data });
  } catch (error) {
    console.error('Error in DMCA takedown submission:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

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

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user's DMCA takedowns
    const { data, error } = await supabase
      .from('dmca_takedowns')
      .select('*, copyright_registrations(work_title)')
      .eq('user_id', user.id)
      .order('submitted_date', { ascending: false });

    if (error) {
      console.error('Error fetching DMCA takedowns:', error);
      return NextResponse.json({ error: 'Failed to fetch DMCA takedowns' }, { status: 500 });
    }

    return NextResponse.json({ takedowns: data });
  } catch (error) {
    console.error('Error in fetching DMCA takedowns:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
