import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// Force dynamic rendering to avoid build-time evaluation
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request, { params }) {
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
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { resource_id } = params;

    if (!resource_id) {
      return NextResponse.json({ error: 'Resource ID is required' }, { status: 400 });
    }

    // Fetch resource details
    const { data: resource, error } = await supabase
      .from('learning_resources')
      .select('*')
      .eq('id', resource_id)
      .single();

    if (error || !resource) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }

    // Check if user has access (free resources or paid resources user purchased)
    if (resource.price !== 'Free') {
      const { data: purchase } = await supabase
        .from('resource_purchases')
        .select('*')
        .eq('user_id', user.id)
        .eq('resource_id', resource_id)
        .single();

      if (!purchase) {
        return NextResponse.json({ error: 'Resource not purchased' }, { status: 403 });
      }
    }

    // Log download
    await supabase.from('resource_downloads').insert({
      user_id: user.id,
      resource_id,
      downloaded_at: new Date().toISOString(),
    });

    // In production, return actual file from storage
    // For now, return success
    return NextResponse.json({
      success: true,
      download_url: resource.file_url || '/downloads/resource.pdf',
    });
  } catch (error) {
    console.error('Error in resource download:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
