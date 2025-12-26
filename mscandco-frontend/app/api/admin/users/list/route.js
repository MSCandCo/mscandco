/**
 * API: List All Users (App Router)
 * GET /api/admin/users/list
 *
 * List all users with their profiles, roles, and subscription information
 * Requires: users_access:user_management:read permission or super_admin role
 */

import { NextResponse } from 'next/server'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request) {
  try {
    // Lazy load Supabase clients to avoid build-time errors
    const { createClient } = await import('@/lib/supabase/server');
    const { createServiceRoleClient } = await import('@/lib/supabase/server');
    
    // Check authentication
    const supabase = await createClient();
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'No authorization token provided' },
        { status: 401 }
      );
    }

    // Check admin permissions - permission-based access
    const supabaseAdmin = await createServiceRoleClient();
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    // Permission-based access: Check role first, then check permissions
    let hasPermission = profile?.role === 'super_admin' || profile?.role === 'company_admin';
    
    // If not super_admin or company_admin, check for user management permissions
    if (!hasPermission) {
      // Check role-based permissions
      const { data: roleData } = await supabaseAdmin
        .from('roles')
        .select('id')
        .eq('name', profile?.role || '')
        .single();

      if (roleData) {
        const { data: rolePermissions } = await supabaseAdmin
          .from('role_permissions')
          .select(`
            permissions!role_permissions_permission_id_fkey (
              name
            )
          `)
          .eq('role_id', roleData.id);
        
        const permissionNames = (rolePermissions || []).map(rp => rp.permissions?.name).filter(Boolean);
        hasPermission = permissionNames.some(p => 
          p === 'users_access:user_management:read' || 
          p === 'users_access:user_management:manage' ||
          p.startsWith('user:read:')
        );
      }
      
      // Also check user-specific permissions
      if (!hasPermission) {
        const { data: userPermissions } = await supabaseAdmin
          .from('user_permissions')
          .select(`
            permissions!user_permissions_permission_id_fkey (
              name
            )
          `)
          .eq('user_id', session.user.id)
          .eq('is_active', true);
        
        const userPermissionNames = (userPermissions || []).map(up => up.permissions?.name).filter(Boolean);
        hasPermission = userPermissionNames.some(p => 
          p === 'users_access:user_management:read' || 
          p === 'users_access:user_management:manage' ||
          p.startsWith('user:read:')
        );
      }
    }

    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'User management access required' },
        { status: 403 }
      );
    }

    console.log('📊 Fetching all users for admin...');

    // Get all auth users
    const { data: authResult, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Error fetching auth users:', authError);
      return NextResponse.json(
        { error: 'Failed to fetch users', details: authError.message },
        { status: 500 }
      );
    }

    const authUsers = authResult?.users || [];

    // Get all user profiles
    const { data: profiles, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('id, first_name, last_name, email, artist_name, label_name, display_name, role, created_at, updated_at')
      .order('created_at', { ascending: false });

    if (profileError) {
      console.error('❌ Error fetching profiles:', profileError);
      return NextResponse.json(
        { error: 'Failed to fetch user profiles', details: profileError.message },
        { status: 500 }
      );
    }

    // Create a map of profiles by ID for quick lookup
    const profileMap = {};
    (profiles || []).forEach(profile => {
      profileMap[profile.id] = profile;
    });

    // Combine auth users with their profiles
    const combinedUsers = authUsers.map(authUser => {
      const profile = profileMap[authUser.id];
      
      // Determine role - prioritize profile role, fallback to metadata
      let userRole = profile?.role || authUser.user_metadata?.role || authUser.app_metadata?.role;
      
      // Email-based role detection for known admin users
      if (!userRole) {
        const userEmail = authUser.email?.toLowerCase() || '';
        if (userEmail === 'superadmin@mscandco.com') {
          userRole = 'super_admin';
        } else if (userEmail === 'companyadmin@mscandco.com') {
          userRole = 'company_admin';
        } else if (userEmail === 'codegroup@mscandco.com' || userEmail.includes('codegroup')) {
          userRole = 'distribution_partner';
        } else {
          userRole = 'artist';
        }
      }

      // Determine display name
      let displayName = profile?.display_name;
      if (!displayName) {
        if (profile?.artist_name) {
          displayName = profile.artist_name;
        } else if (profile?.label_name) {
          displayName = profile.label_name;
        } else if (profile?.first_name || profile?.last_name) {
          displayName = `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim();
        } else {
          displayName = authUser.email;
        }
      }

      // Determine status - check if user is confirmed
      const status = authUser.email_confirmed_at ? 'active' : 'pending';

      return {
        id: authUser.id,
        email: authUser.email,
        first_name: profile?.first_name || '',
        last_name: profile?.last_name || '',
        artist_name: profile?.artist_name || '',
        label_name: profile?.label_name || '',
        display_name: displayName,
        role: userRole,
        status: status,
        created_at: profile?.created_at || authUser.created_at,
        updated_at: profile?.updated_at || authUser.updated_at,
        last_sign_in_at: authUser.last_sign_in_at,
        email_confirmed_at: authUser.email_confirmed_at,
      };
    });

    console.log(`✅ Successfully fetched ${combinedUsers.length} users`);

    return NextResponse.json({
      success: true,
      users: combinedUsers,
    });

  } catch (error) {
    console.error('❌ Unexpected error in users/list GET:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
