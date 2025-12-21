import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'


// Lazy initialization to avoid build-time errors
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Supabase configuration is missing')
  }
  
  const { createClient } = require('@supabase/supabase-js')
  return createClient(supabaseUrl, serviceRoleKey)
}
/**
 * Get default permission IDs for a role based on the RBAC system
 * This matches the logic from database/migrations/create_rbac_system.sql
 */
async function getDefaultPermissionIds(supabaseAdmin, roleName) {
  let permissionIds = []

  if (roleName === 'super_admin') {
    // Super Admin: Gets wildcard permission (all access)
    const { data: wildcardPerm } = await supabaseAdmin
      .from('permissions')
      .select('id')
      .eq('name', '*:*:*')
      .single()

    if (wildcardPerm) {
      permissionIds = [wildcardPerm.id]
    }
  } else if (roleName === 'company_admin') {
    // Company Admin: Gets "any" scope permissions + essential "own" permissions
    const { data: anyScopePerms } = await supabaseAdmin
      .from('permissions')
      .select('id')
      .eq('scope', 'any')

    const { data: ownPerms } = await supabaseAdmin
      .from('permissions')
      .select('id')
      .in('name', [
        'user:read:own', 'user:update:own',
        'notification:read:own', 'message:read:own',
        'support:create:own', 'support:update:own', 'support:close:own', 'support:respond:own'
      ])

    permissionIds = [
      ...(anyScopePerms || []).map(p => p.id),
      ...(ownPerms || []).map(p => p.id)
    ]
  } else if (roleName === 'label_admin') {
    // Label Admin: Specific permissions (matching the migration)
    const { data: labelAdminPerms } = await supabaseAdmin
      .from('permissions')
      .select('id')
      .in('name', [
        // Page Access
        'analytics:access', 'earnings:access', 'releases:access', 'roster:access',
        'profile:access', 'platform:access', 'messages:access', 'settings:access', 'dashboard:access',
        // Message Tabs
        'messages:invitations:view', 'messages:earnings:view', 'messages:payouts:view', 'messages:system:view',
        // Settings Tabs
        'settings:preferences:edit', 'settings:security:edit', 'settings:notifications:edit',
        'settings:billing:view', 'settings:billing:edit', 'settings:api_keys:view', 'settings:api_keys:manage',
        // Analytics Tabs
        'analytics:basic:view', 'analytics:advanced:view',
        // Own User Permissions
        'user:read:own', 'user:update:own', 'notification:read:own', 'message:read:own',
        // Label-Specific
        'label:read:own', 'label:update:own', 'label:roster:read:own', 'label:roster:manage:own',
        'artist:invite:label', 'artist:manage:label'
      ])

    permissionIds = (labelAdminPerms || []).map(p => p.id)
  } else if (roleName === 'distribution_partner') {
    // Distribution Partner: Specific permissions
    const { data: distPartnerPerms } = await supabaseAdmin
      .from('permissions')
      .select('id')
      .in('name', [
        // Core Distribution Access
        'distribution:read:any', 'distribution:manage:any',
        'revenue:read', 'revenue:create', 'revenue:update',
        // Basic User Access
        'dashboard:access', 'profile:access', 'messages:access', 'settings:access',
        // Message Tabs
        'messages:system:view',
        // Settings Tabs
        'settings:preferences:edit', 'settings:security:edit', 'settings:notifications:edit',
        // Own User Permissions
        'user:read:own', 'user:update:own', 'notification:read:own', 'message:read:own'
      ])

    permissionIds = (distPartnerPerms || []).map(p => p.id)
  } else if (roleName === 'artist') {
    // Artist: Gets "own" scope permissions only
    const { data: ownScopePerms } = await supabaseAdmin
      .from('permissions')
      .select('id')
      .eq('scope', 'own')

    permissionIds = (ownScopePerms || []).map(p => p.id)
  }

  return permissionIds
}

/**
 * POST /api/admin/roles/[roleId]/reset-default
 * Reset a role to its default permissions
 */
export async function POST(request, { params }) {
  try {
    // Authenticate user
    const supabase = await createServerClient()
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'No authorization token provided' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (!profile || !['super_admin', 'company_admin'].includes(profile.role)) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Admin access required' },
        { status: 403 }
      )
    }

    const { roleId } = await params

    if (!roleId) {
      return NextResponse.json(
        { error: 'Invalid request', message: 'roleId is required' },
        { status: 400 }
      )
    }

    console.log(`🔄 Resetting role ${roleId} to default permissions`)

    // Get the role
    const { data: role, error: roleError } = await supabaseAdmin
      .from('roles')
      .select('id, name, description, is_system_role')
      .eq('id', roleId)
      .single()

    if (roleError || !role) {
      console.error('Error fetching role:', roleError)
      return NextResponse.json(
        { error: 'Role not found', message: roleError?.message },
        { status: 404 }
      )
    }

    // Check if it's a system role (only system roles can be reset)
    if (!role.is_system_role) {
      return NextResponse.json(
        { error: 'Can only reset system roles to default permissions' },
        { status: 400 }
      )
    }

    // Get default permission IDs for this role
    const defaultPermissionIds = await getDefaultPermissionIds(supabaseAdmin, role.name)

    if (!defaultPermissionIds || defaultPermissionIds.length === 0) {
      return NextResponse.json(
        { error: `No default permissions defined for role: ${role.name}` },
        { status: 400 }
      )
    }

    console.log(`📋 Default permissions for ${role.name}:`, defaultPermissionIds.length)

    // Get permission details for logging
    const { data: permissions } = await supabaseAdmin
      .from('permissions')
      .select('id, name')
      .in('id', defaultPermissionIds)

    console.log(`✅ Found ${defaultPermissionIds.length} permissions to assign`)

    // Clear all existing permissions for this role
    const { error: clearError } = await supabaseAdmin
      .from('role_permissions')
      .delete()
      .eq('role_id', roleId)

    if (clearError) {
      console.error('Error clearing role permissions:', clearError)
      return NextResponse.json(
        { error: 'Failed to clear existing permissions', message: clearError.message },
        { status: 500 }
      )
    }

    console.log(`🗑️ Cleared existing permissions for role ${role.name}`)

    // Add default permissions
    const rolePermissions = defaultPermissionIds.map(permissionId => ({
      role_id: roleId,
      permission_id: permissionId,
      granted_at: new Date().toISOString()
    }))

    const { error: insertError } = await supabaseAdmin
      .from('role_permissions')
      .insert(rolePermissions)

    if (insertError) {
      console.error('Error inserting default permissions:', insertError)
      return NextResponse.json(
        { 
          error: 'Failed to set default permissions', 
          message: insertError.message,
          details: insertError.details,
          hint: insertError.hint
        },
        { status: 500 }
      )
    }

    console.log(`✅ Successfully reset role "${role.name}" to default permissions (${defaultPermissionIds.length} permissions)`)

    return NextResponse.json({
      success: true,
      message: `Role "${role.name}" has been reset to default permissions`,
      permissions_set: defaultPermissionIds.length
    })

  } catch (error) {
    console.error('Error in reset-default POST:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}

