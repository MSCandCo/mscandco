import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    
    // Authenticate user first
    const supabaseAuth = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          get(name) {
            return cookieStore.get(name)?.value;
          },
          set(name, value, options) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name, options) {
            cookieStore.set({ name, value: '', ...options });
          },
        },
      }
    );
    
    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { verificationId, newStatus, notes } = body;

    if (!verificationId || !newStatus) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Use service role client to bypass RLS
    const supabaseAdmin = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        cookies: {
          get() { return undefined; },
          set() {},
          remove() {},
        },
      }
    );

    const updateData = {
      verification_status: newStatus,
      updated_at: new Date().toISOString()
    };

    if (notes) {
      updateData.manual_review_notes = notes;
      updateData.requires_manual_review = true;
      updateData.manual_review_by = user.id;
      updateData.manual_review_at = new Date().toISOString();
    }

    if (newStatus === 'clear') {
      updateData.resolution_status = 'cleared';
      updateData.resolved_at = new Date().toISOString();
      updateData.resolved_by = user.id;
    }

    const { error } = await supabaseAdmin
      .from('copyright_verifications')
      .update(updateData)
      .eq('id', verificationId);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: 'Verification updated successfully'
    });

  } catch (error) {
    console.error('Error updating verification:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

