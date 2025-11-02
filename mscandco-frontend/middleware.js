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

  // Check if route requires authentication (legacy check for distribution)
  if (req.nextUrl.pathname.startsWith('/distribution')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    // Get user role
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    const allowedRoles = ['DistributionPartner', 'Admin', 'SuperAdmin'];

    if (!profile || !allowedRoles.includes(profile.role)) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }

  // For authenticated users on protected paths, verify role-based access
  if (session && isProtectedPath) {
    // Get user profile for role-based access control
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    // Protect /superadmin/* routes - SuperAdmin only
    if (req.nextUrl.pathname.startsWith('/superadmin')) {
      if (!profile || profile.role !== 'SuperAdmin') {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    }

    // Protect /admin/* routes - Admin and SuperAdmin only
    if (req.nextUrl.pathname.startsWith('/admin')) {
      const allowedRoles = ['Admin', 'SuperAdmin'];
      if (!profile || !allowedRoles.includes(profile.role)) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    }

    // Protect /labeladmin/* routes - LabelAdmin, Admin, and SuperAdmin
    if (req.nextUrl.pathname.startsWith('/labeladmin')) {
      const allowedRoles = ['LabelAdmin', 'Admin', 'SuperAdmin'];
      if (!profile || !allowedRoles.includes(profile.role)) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    }

    // Protect /artist/* routes - Artist and above
    if (req.nextUrl.pathname.startsWith('/artist')) {
      const allowedRoles = ['Artist', 'LabelAdmin', 'Admin', 'SuperAdmin'];
      if (!profile || !allowedRoles.includes(profile.role)) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
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
