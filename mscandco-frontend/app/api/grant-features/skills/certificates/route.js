import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const certificate_id = searchParams.get('certificate_id');

  let query = supabase
    .from('learning_certificates')
    .select('*, learning_modules(module_title)')
    .eq('user_id', user.id)
    .order('issued_at', { ascending: false });

  if (certificate_id) {
    query = query.eq('id', certificate_id).single();
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    certificates: certificate_id ? [data] : data,
    count: certificate_id ? 1 : data.length
  });
}

export async function POST(request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { module_id, enrollment_id } = body;

  if (!module_id || !enrollment_id) {
    return NextResponse.json(
      { error: 'Missing required fields: module_id, enrollment_id' },
      { status: 400 }
    );
  }

  // Verify enrollment is completed
  const { data: enrollment, error: enrollmentError } = await supabase
    .from('learning_enrollments')
    .select('*')
    .eq('id', enrollment_id)
    .eq('user_id', user.id)
    .single();

  if (enrollmentError || !enrollment) {
    return NextResponse.json(
      { error: 'Enrollment not found or unauthorized' },
      { status: 404 }
    );
  }

  if (enrollment.enrollment_status !== 'completed' || enrollment.progress_percentage < 100) {
    return NextResponse.json(
      { error: 'Module must be completed before issuing certificate' },
      { status: 400 }
    );
  }

  // Check if certificate already exists
  const { data: existingCert } = await supabase
    .from('learning_certificates')
    .select('*')
    .eq('user_id', user.id)
    .eq('module_id', module_id)
    .single();

  if (existingCert) {
    return NextResponse.json({
      success: true,
      certificate: existingCert,
      message: 'Certificate already issued'
    });
  }

  // Generate certificate number
  const certificateNumber = `MSC-${Date.now()}-${user.id.substring(0, 8).toUpperCase()}`;

  // In production, generate blockchain hash
  const blockchainHash = `0x${Math.random().toString(16).substring(2, 66)}`;

  const { data: certificate, error: certError } = await supabase
    .from('learning_certificates')
    .insert([{
      user_id: user.id,
      module_id,
      certificate_number: certificateNumber,
      blockchain_hash: blockchainHash,
      verification_url: `https://verify.mscandco.com/${certificateNumber}`,
      issued_at: new Date().toISOString()
    }])
    .select()
    .single();

  if (certError) {
    return NextResponse.json({ error: certError.message }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    certificate,
    message: 'Certificate issued successfully'
  });
}
