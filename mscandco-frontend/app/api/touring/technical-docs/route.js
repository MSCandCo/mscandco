/**
 * Touring Platform - Technical Documents API
 * Manage technical documents (stage plots, input lists, tech riders, hospitality riders)
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';

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
 * GET - Fetch technical documents for a tour or tour date
 */
export async function GET(request) {
  try {
    const serverSupabase = await createServerClient();
    const { data: { user }, error: userError } = await serverSupabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const tourId = searchParams.get('tour_id');
    const tourDateId = searchParams.get('tour_date_id');
    const docType = searchParams.get('type');
    const currentOnly = searchParams.get('current') === 'true';

    let query = supabaseAdmin
      .from('tour_technical_docs')
      .select('*')
      .order('created_at', { ascending: false });

    if (tourId) {
      query = query.eq('tour_id', tourId);
    }

    if (tourDateId) {
      query = query.eq('tour_date_id', tourDateId);
    }

    if (docType) {
      query = query.eq('doc_type', docType);
    }

    if (currentOnly) {
      query = query.eq('is_current', true);
    }

    const { data: docs, error } = await query;

    if (error) throw error;

    return NextResponse.json({
      success: true,
      docs: docs || [],
      count: docs?.length || 0
    });

  } catch (error) {
    console.error('❌ Error fetching technical docs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch technical documents', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST - Create/upload a new technical document
 */
export async function POST(request) {
  try {
    const serverSupabase = await createServerClient();
    const { data: { user }, error: userError } = await serverSupabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const body = await request.json();
    const {
      tour_id,
      tour_date_id,
      doc_type,
      title,
      description,
      file_url,
      file_name,
      file_size,
      mime_type,
      version,
      is_current
    } = body;

    if (!tour_id || !doc_type || !title || !file_url || !file_name) {
      return NextResponse.json(
        { error: 'Missing required fields: tour_id, doc_type, title, file_url, file_name' },
        { status: 400 }
      );
    }

    // If marking as current, set all other docs of same type to not current
    if (is_current) {
      await supabaseAdmin
        .from('tour_technical_docs')
        .update({ is_current: false })
        .eq('tour_id', tour_id)
        .eq('doc_type', doc_type);
    }

    const { data: doc, error } = await supabaseAdmin
      .from('tour_technical_docs')
      .insert({
        tour_id,
        tour_date_id: tour_date_id || null,
        doc_type,
        title,
        description: description || null,
        file_url,
        file_name,
        file_size: file_size || null,
        mime_type: mime_type || null,
        version: version || 1,
        is_current: is_current !== undefined ? is_current : true,
        uploaded_by: user.id
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      doc
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Error creating technical doc:', error);
    return NextResponse.json(
      { error: 'Failed to create technical document', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PATCH - Update a technical document
 */
export async function PATCH(request) {
  try {
    const serverSupabase = await createServerClient();
    const { data: { user }, error: userError } = await serverSupabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Document ID is required' }, { status: 400 });
    }

    // If marking as current, get the doc first to know tour_id and doc_type
    if (updates.is_current) {
      const { data: currentDoc } = await supabaseAdmin
        .from('tour_technical_docs')
        .select('tour_id, doc_type')
        .eq('id', id)
        .single();

      if (currentDoc) {
        await supabaseAdmin
          .from('tour_technical_docs')
          .update({ is_current: false })
          .eq('tour_id', currentDoc.tour_id)
          .eq('doc_type', currentDoc.doc_type);
      }
    }

    const { data: doc, error } = await supabaseAdmin
      .from('tour_technical_docs')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      doc
    });

  } catch (error) {
    console.error('❌ Error updating technical doc:', error);
    return NextResponse.json(
      { error: 'Failed to update technical document', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Delete a technical document
 */
export async function DELETE(request) {
  try {
    const serverSupabase = await createServerClient();
    const { data: { user }, error: userError } = await serverSupabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Document ID is required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('tour_technical_docs')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Technical document deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error deleting technical doc:', error);
    return NextResponse.json(
      { error: 'Failed to delete technical document', details: error.message },
      { status: 500 }
    );
  }
}
