import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request) {
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

    // Fetch all skills data in parallel
    const [modulesResult, enrollmentsResult, certificatesResult, progressResult, sessionsResult] = await Promise.all([
      supabaseAdmin.from('learning_modules').select('*', { count: 'exact', head: true }).eq('is_published', true),
      supabaseAdmin.from('learning_enrollments').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('learning_certificates').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('learning_enrollments').select('progress_percentage'),
      supabaseAdmin.from('ai_tutor_sessions').select('*', { count: 'exact', head: true })
        .gte('last_message_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    ]);

    // Handle errors gracefully
    const modules = modulesResult.error && modulesResult.error.code !== '42P01' ? 0 : (modulesResult.count || 0);
    const enrollments = enrollmentsResult.error && enrollmentsResult.error.code !== '42P01' ? 0 : (enrollmentsResult.count || 0);
    const certificates = certificatesResult.error && certificatesResult.error.code !== '42P01' ? 0 : (certificatesResult.count || 0);
    const progressData = progressResult.error && progressResult.error.code !== '42P01' ? [] : (progressResult.data || []);
    const sessions = sessionsResult.error && sessionsResult.error.code !== '42P01' ? 0 : (sessionsResult.count || 0);

    const avgCompletion = progressData.length > 0
      ? Math.round(progressData.reduce((acc, p) => acc + (p.progress_percentage || 0), 0) / progressData.length)
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalModules: modules,
          totalEnrollments: enrollments,
          certificatesIssued: certificates,
          avgCompletion,
          activeTutorSessions: sessions
        }
      }
    });

  } catch (error) {
    console.error('Error in skills API:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

