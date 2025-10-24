import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
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
    
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = session.user;

    // Get API key from database
    const { data, error } = await supabase
      .from('user_profiles')
      .select('api_key, api_usage')
      .eq('id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    const usage = data?.api_usage || {};

    return NextResponse.json({
      success: true,
      data: {
        apiKey: data?.api_key || '',
        usage: {
          requestsThisMonth: usage.requestsThisMonth || 0,
          rateLimit: usage.rateLimit || 1000,
          quotaRemaining: (usage.rateLimit || 1000) - (usage.requestsThisMonth || 0)
        }
      }
    });
  } catch (error) {
    console.error('Error in API key GET:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
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
    
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = session.user;
    const body = await request.json();
    const { action } = body;

    if (action === 'regenerate') {
      // Generate new API key
      const newApiKey = 'sk_' + crypto.randomBytes(32).toString('hex');

      const { error } = await supabase
        .from('user_profiles')
        .update({ api_key: newApiKey })
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      return NextResponse.json({
        success: true,
        data: { apiKey: newApiKey }
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error in API key POST:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

