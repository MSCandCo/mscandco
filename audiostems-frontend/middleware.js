import { NextResponse } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(req) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  console.log('🔒 Middleware checking:', req.nextUrl.pathname);

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Check if route requires authentication
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

    const allowedRoles = ['distribution_partner', 'company_admin', 'super_admin'];

    if (!profile || !allowedRoles.includes(profile.role)) {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }
  }

  // Protect /admin/* routes - company_admin and super_admin only
  if (req.nextUrl.pathname.startsWith('/admin')) {
    console.log('🔒 /admin route detected, checking access...');

    if (!session) {
      console.log('❌ No session, redirecting to login');
      return NextResponse.redirect(new URL('/login', req.url));
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    console.log('👤 User role:', profile?.role, 'User ID:', session.user.id);

    const allowedRoles = ['company_admin', 'super_admin'];

    if (!profile || !allowedRoles.includes(profile.role)) {
      console.log('❌ Role not allowed, redirecting to unauthorized');
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }

    console.log('✅ Access granted to /admin route');
  }

  // Protect /superadmin/* routes - super_admin only
  if (req.nextUrl.pathname.startsWith('/superadmin')) {
    console.log('🔒 /superadmin route detected, checking access...');
    console.log('[MW-DEBUG] Path:', req.nextUrl.pathname);

    if (!session) {
      console.log('[MW-DEBUG] Session check: NULL - no session found');
      console.log('❌ No session for /superadmin, redirecting to login');
      return NextResponse.redirect(new URL('/login', req.url));
    }

    console.log('[MW-DEBUG] Session exists:', JSON.stringify({
      userId: session.user?.id,
      email: session.user?.email,
      role: session.user?.role,
      metadata: session.user?.user_metadata
    }));

    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    console.log('[MW-DEBUG] Profile query result:', JSON.stringify({
      profile,
      error: profileError,
      userId: session.user.id
    }));

    console.log('👤 /superadmin - User role:', profile?.role, 'User ID:', session.user.id);

    if (!profile || profile.role !== 'super_admin') {
      console.log('[MW-DEBUG] Access denied - profile:', profile, 'role:', profile?.role);
      console.log('❌ Not super_admin, redirecting to dashboard');
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    console.log('[MW-DEBUG] Access granted - role matches super_admin');
    console.log('✅ Access granted to /superadmin route');
  }

  // Protect /companyadmin/* routes - company_admin and super_admin only
  if (req.nextUrl.pathname.startsWith('/companyadmin')) {
    console.log('🔒 /companyadmin route detected, checking access...');

    if (!session) {
      console.log('❌ No session, redirecting to login');
      return NextResponse.redirect(new URL('/login', req.url));
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    console.log('👤 User role:', profile?.role, 'User ID:', session.user.id);

    const allowedRoles = ['company_admin', 'super_admin'];

    if (!profile || !allowedRoles.includes(profile.role)) {
      console.log('❌ Role not allowed, redirecting to dashboard');
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    console.log('✅ Access granted to /companyadmin route');
  }

  // Protect /labeladmin/* routes - label_admin, company_admin, and super_admin
  if (req.nextUrl.pathname.startsWith('/labeladmin')) {
    console.log('🔒 /labeladmin route detected, checking access...');

    if (!session) {
      console.log('❌ No session, redirecting to login');
      return NextResponse.redirect(new URL('/login', req.url));
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    console.log('👤 User role:', profile?.role, 'User ID:', session.user.id);

    const allowedRoles = ['label_admin', 'company_admin', 'super_admin'];

    if (!profile || !allowedRoles.includes(profile.role)) {
      console.log('❌ Role not allowed, redirecting to dashboard');
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    console.log('✅ Access granted to /labeladmin route');
  }

  // Protect /artist/* routes - authenticated users only
  if (req.nextUrl.pathname.startsWith('/artist')) {
    console.log('🔒 /artist route detected, checking access...');

    if (!session) {
      console.log('❌ No session, redirecting to login');
      return NextResponse.redirect(new URL('/login', req.url));
    }

    console.log('✅ Access granted to /artist route');
  }

  return res;
}

export const config = {
  matcher: [
    '/distribution/:path*',
    '/admin/:path*',
    '/superadmin/:path*',
    '/companyadmin/:path*',
    '/labeladmin/:path*',
    '/artist/:path*',
  ],
};
