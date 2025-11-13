import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      release_id,
      work_title,
      copyright_type,
      registration_number,
      registration_date,
      territory,
      notes,
    } = body;

    // Validate required fields
    if (!work_title || !copyright_type) {
      return NextResponse.json(
        { error: 'Work title and copyright type are required' },
        { status: 400 }
      );
    }

    // Insert copyright registration
    const { data, error } = await supabase
      .from('copyright_registrations')
      .insert({
        user_id: user.id,
        release_id: release_id || null,
        work_title,
        copyright_type,
        registration_number: registration_number || null,
        registration_date: registration_date || new Date().toISOString(),
        territory: territory || 'worldwide',
        notes: notes || null,
        status: 'registered',
      })
      .select()
      .single();

    if (error) {
      console.error('Error registering copyright:', error);
      return NextResponse.json({ error: 'Failed to register copyright' }, { status: 500 });
    }

    return NextResponse.json({ success: true, registration: data });
  } catch (error) {
    console.error('Error in copyright registration:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user's copyright registrations
    const { data, error } = await supabase
      .from('copyright_registrations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching copyright registrations:', error);
      return NextResponse.json(
        { error: 'Failed to fetch copyright registrations' },
        { status: 500 }
      );
    }

    return NextResponse.json({ registrations: data });
  } catch (error) {
    console.error('Error in fetching copyright registrations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
