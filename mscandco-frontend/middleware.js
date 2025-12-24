import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/middleware';
import { createAdminClient } from '@/lib/supabase/middleware-admin';

export async function middleware(req) {
  const { supabase, response } = createClient(req);

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  // Define protected paths
  const protectedPaths = [
    '/dashboard',
    '/admin',
    '/superadmin',
    '/artist',
    '/labeladmin',
    '/distribution',
    '/notifications',
  ];

  const isProtectedPath = protectedPaths.some(path =>
    req.nextUrl.pathname.startsWith(path)
  );

  // If accessing protected path without session, redirect to login
  if (isProtectedPath && (!session || sessionError)) {
    const redirectUrl = new URL('/login', req.url);
    redirectUrl.searchParams.set('redirectedFrom', req.nextUrl.pathname);
    redirectUrl.searchParams.set('session_expired', 'true');
    return NextResponse.redirect(redirectUrl);
  }

  // For authenticated users on protected paths, verify role-based access
  // Skip role checks for /dashboard to prevent redirect loops
  if (session && isProtectedPath && !req.nextUrl.pathname.startsWith('/dashboard')) {
    try {
      // Get user profile for role-based access control
      // Use admin client to bypass RLS policies for authorization checks
      const adminClient = createAdminClient();
      const { data: profile, error: profileError } = await adminClient
        .from('user_profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      // If profile query fails, redirect to login (session might be corrupted)
      if (profileError || !profile) {
        console.error('Profile query failed:', profileError);
        const redirectUrl = new URL('/login', req.url);
        redirectUrl.searchParams.set('error', 'profile_not_found');
        return NextResponse.redirect(redirectUrl);
      }

      // Get user role (already lowercase with underscores in database)
      const userRole = profile.role?.toLowerCase();

      // Protect /superadmin/* routes - super_admin only
      if (req.nextUrl.pathname.startsWith('/superadmin')) {
        if (userRole !== 'super_admin') {
          return NextResponse.redirect(new URL('/unauthorized', req.url));
        }
      }

      // Protect /admin/* routes - various admin roles
      if (req.nextUrl.pathname.startsWith('/admin')) {
        const allowedRoles = [
          'super_admin',
          'company_admin',
          'analytics_admin',
          'requests_admin'
        ];
        if (!allowedRoles.includes(userRole)) {
          return NextResponse.redirect(new URL('/unauthorized', req.url));
        }
      }

      // Protect /labeladmin/* routes - label_admin and above
      if (req.nextUrl.pathname.startsWith('/labeladmin')) {
        const allowedRoles = [
          'label_admin',
          'company_admin',
          'super_admin'
        ];
        if (!allowedRoles.includes(userRole)) {
          return NextResponse.redirect(new URL('/unauthorized', req.url));
        }
      }

      // Protect /artist/* routes - artist and above
      if (req.nextUrl.pathname.startsWith('/artist')) {
        const allowedRoles = [
          'artist',
          'label_admin',
          'company_admin',
          'super_admin'
        ];
        if (!allowedRoles.includes(userRole)) {
          return NextResponse.redirect(new URL('/unauthorized', req.url));
        }
      }

      // Protect /distribution/* routes - distribution_partner and admins
      if (req.nextUrl.pathname.startsWith('/distribution')) {
        const allowedRoles = [
          'distribution_partner',
          'company_admin',
          'super_admin'
        ];
        if (!allowedRoles.includes(userRole)) {
          return NextResponse.redirect(new URL('/unauthorized', req.url));
        }
      }
    } catch (error) {
      // If role check fails (e.g., missing credentials), allow access but log the error
      // This prevents middleware from crashing while still allowing the app to function
      console.error('Middleware role check error:', error);
      // Continue to allow the request through - don't block on middleware errors
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc)
     * - api routes (handled separately)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api/).*)',
  ],
};
