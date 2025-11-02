import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/middleware';

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
    // Get user profile for role-based access control
    const { data: profile, error: profileError } = await supabase
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

    // Protect /superadmin/* routes - SuperAdmin only
    if (req.nextUrl.pathname.startsWith('/superadmin')) {
      if (profile.role !== 'SuperAdmin') {
        return NextResponse.redirect(new URL('/unauthorized', req.url));
      }
    }

    // Protect /admin/* routes - Admin and SuperAdmin only
    if (req.nextUrl.pathname.startsWith('/admin')) {
      const allowedRoles = ['Admin', 'SuperAdmin'];
      if (!allowedRoles.includes(profile.role)) {
        return NextResponse.redirect(new URL('/unauthorized', req.url));
      }
    }

    // Protect /labeladmin/* routes - LabelAdmin, Admin, and SuperAdmin
    if (req.nextUrl.pathname.startsWith('/labeladmin')) {
      const allowedRoles = ['LabelAdmin', 'Admin', 'SuperAdmin'];
      if (!allowedRoles.includes(profile.role)) {
        return NextResponse.redirect(new URL('/unauthorized', req.url));
      }
    }

    // Protect /artist/* routes - Artist and above
    if (req.nextUrl.pathname.startsWith('/artist')) {
      const allowedRoles = ['Artist', 'LabelAdmin', 'Admin', 'SuperAdmin'];
      if (!allowedRoles.includes(profile.role)) {
        return NextResponse.redirect(new URL('/unauthorized', req.url));
      }
    }

    // Protect /distribution/* routes - DistributionPartner, Admin, SuperAdmin
    if (req.nextUrl.pathname.startsWith('/distribution')) {
      const allowedRoles = ['DistributionPartner', 'Admin', 'SuperAdmin'];
      if (!allowedRoles.includes(profile.role)) {
        return NextResponse.redirect(new URL('/unauthorized', req.url));
      }
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
