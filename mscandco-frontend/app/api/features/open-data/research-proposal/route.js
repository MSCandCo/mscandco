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

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      title, 
      institution, 
      principal_investigator, 
      email, 
      phone,
      research_objectives,
      methodology,
      expected_outcomes,
      data_requirements,
      timeline,
      funding_source,
      ethical_approval,
      additional_info
    } = body;

    // Validate required fields
    if (!title || !institution || !principal_investigator || !email || !research_objectives) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Insert research proposal
    const { data, error } = await supabase
      .from('research_proposals')
      .insert({
        user_id: user.id,
        title,
        institution,
        principal_investigator,
        email,
        phone: phone || null,
        research_objectives,
        methodology: methodology || null,
        expected_outcomes: expected_outcomes || null,
        data_requirements: data_requirements || null,
        timeline: timeline || null,
        funding_source: funding_source || null,
        ethical_approval: ethical_approval || false,
        additional_info: additional_info || null,
        status: 'pending',
        submitted_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error submitting research proposal:', error);
      return NextResponse.json(
        { error: 'Failed to submit research proposal' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      proposal_id: data.id,
      message: 'Research proposal submitted successfully'
    });
  } catch (error) {
    console.error('Error in research proposal:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

