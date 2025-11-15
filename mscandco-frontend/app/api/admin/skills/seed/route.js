import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { readFileSync } from 'fs';
import { join } from 'path';

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
            cookieStore.set({ name, value, '', ...options });
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

    // Use service role client
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

    // Read and execute the comprehensive SQL seed file
    const sqlPath = join(process.cwd(), 'database/seed-data/learning_modules_comprehensive.sql');
    const sql = readFileSync(sqlPath, 'utf8');

    // Execute the SQL (this bypasses the schema cache issue)
    const { data, error } = await supabaseAdmin.rpc('query', {
      query_text: sql
    });

    if (error) {
      console.error('SQL execution error:', error);
      return NextResponse.json({
        success: false,
        error: error.message,
        hint: 'SQL file execution failed'
      }, { status: 500 });
    }

    // Verify the insert
    const { data: modules, count, error: countError } = await supabaseAdmin
      .from('learning_modules')
      .select('*', { count: 'exact' });

    if (countError) {
      console.error('Count error:', countError);
    }

    return NextResponse.json({
      success: true,
      message: 'Learning modules seeded successfully',
      total: count || modules?.length || 0
    });

  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
