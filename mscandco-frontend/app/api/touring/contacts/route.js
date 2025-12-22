/**
 * Touring Platform - Contacts API
 * Manage tour contacts (venues, vendors, crew, local contacts)
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseAdmin() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return null;
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
      db: {
        schema: 'public'
      }
    }
  );
}

/**
 * GET - Fetch contacts for a tour
 */

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request) {
  try {
    const serverSupabase = await createServerClient();
    const { data: { user }, error: userError } = await serverSupabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Lazy load Supabase admin client


    const { createServiceRoleClient } = await import(\'@/lib/supabase/server\');


    const supabaseAdmin = await createServiceRoleClient();;
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const tourId = searchParams.get('tour_id');
    const contactType = searchParams.get('type');
    const emergencyOnly = searchParams.get('emergency') === 'true';

    if (!tourId) {
      return NextResponse.json({ error: 'tour_id is required' }, { status: 400 });
    }

    let query = supabaseAdmin
      .from('tour_contacts')
      .select('*')
      .eq('tour_id', tourId)
      .order('name', { ascending: true });

    if (contactType) {
      query = query.eq('contact_type', contactType);
    }

    if (emergencyOnly) {
      query = query.eq('emergency_contact', true);
    }

    const { data: contacts, error } = await query;

    if (error) throw error;

    return NextResponse.json({
      success: true,
      contacts: contacts || [],
      count: contacts?.length || 0
    });

  } catch (error) {
    console.error('❌ Error fetching contacts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contacts', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST - Create a new contact
 */
export async function POST(request) {
  try {
    const serverSupabase = await createServerClient();
    const { data: { user }, error: userError } = await serverSupabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Lazy load Supabase admin client


    const { createServiceRoleClient } = await import(\'@/lib/supabase/server\');


    const supabaseAdmin = await createServiceRoleClient();;
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const body = await request.json();
    const {
      tour_id,
      contact_type,
      name,
      company,
      position,
      phone,
      phone_secondary,
      email,
      email_secondary,
      address,
      city,
      state_province,
      country,
      postal_code,
      role,
      notes,
      emergency_contact
    } = body;

    if (!tour_id || !contact_type || !name) {
      return NextResponse.json(
        { error: 'Missing required fields: tour_id, contact_type, name' },
        { status: 400 }
      );
    }

    const { data: contact, error } = await supabaseAdmin
      .from('tour_contacts')
      .insert({
        tour_id,
        contact_type,
        name,
        company: company || null,
        position: position || null,
        phone: phone || null,
        phone_secondary: phone_secondary || null,
        email: email || null,
        email_secondary: email_secondary || null,
        address: address || null,
        city: city || null,
        state_province: state_province || null,
        country: country || null,
        postal_code: postal_code || null,
        role: role || null,
        notes: notes || null,
        emergency_contact: emergency_contact || false
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      contact
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Error creating contact:', error);
    return NextResponse.json(
      { error: 'Failed to create contact', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PATCH - Update a contact
 */
export async function PATCH(request) {
  try {
    const serverSupabase = await createServerClient();
    const { data: { user }, error: userError } = await serverSupabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Lazy load Supabase admin client


    const { createServiceRoleClient } = await import(\'@/lib/supabase/server\');


    const supabaseAdmin = await createServiceRoleClient();;
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Contact ID is required' }, { status: 400 });
    }

    const { data: contact, error } = await supabaseAdmin
      .from('tour_contacts')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      contact
    });

  } catch (error) {
    console.error('❌ Error updating contact:', error);
    return NextResponse.json(
      { error: 'Failed to update contact', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Delete a contact
 */
export async function DELETE(request) {
  try {
    const serverSupabase = await createServerClient();
    const { data: { user }, error: userError } = await serverSupabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Lazy load Supabase admin client


    const { createServiceRoleClient } = await import(\'@/lib/supabase/server\');


    const supabaseAdmin = await createServiceRoleClient();;
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Contact ID is required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('tour_contacts')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Contact deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error deleting contact:', error);
    return NextResponse.json(
      { error: 'Failed to delete contact', details: error.message },
      { status: 500 }
    );
  }
}
