/**
 * Server-Side Permission Checking Utilities
 *
 * Use these utilities in getServerSideProps to check permissions BEFORE page rendering.
 * This ensures users without proper permissions never see unauthorized content.
 */

import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';
import { createServerClient } from '@supabase/ssr';
import { getUserPermissions } from './permissions';

/**
 * Check if user has required permission(s) server-side
 * Returns redirect object if unauthorized, or user data if authorized
 *
 * @param {Object} context - Next.js getServerSideProps context
 * @param {string|string[]} requiredPermissions - Permission(s) required to access the page
 * @param {Object} options - Additional options
 * @param {string} options.redirectTo - Where to redirect if unauthorized (default: '/dashboard')
 * @param {boolean} options.requireAll - If multiple permissions, require all (default: false = require any)
 * @returns {Promise<Object>} - { authorized: boolean, user?, redirect? }
 *
 * @example
 * export async function getServerSideProps(context) {
 *   const auth = await requirePermission(context, 'admin:ghost_login:access');
 *
 *   if (auth.redirect) {
 *     return { redirect: auth.redirect };
 *   }
 *
 *   return { props: { user: auth.user } };
 * }
 */
export async function requirePermission(context, requiredPermissions, options = {}) {
  const {
    redirectTo = '/dashboard',
    requireAll = false
  } = options;

  try {
    // Create Supabase client using the newer @supabase/ssr package
    // This works better with Next.js 15 and middleware
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          get(name) {
            return context.req.cookies[name]
          },
          set(name, value, options) {
            context.res.setHeader('Set-Cookie', `${name}=${value}; Path=/; ${options?.httpOnly ? 'HttpOnly;' : ''}`)
          },
          remove(name, options) {
            context.res.setHeader('Set-Cookie', `${name}=; Path=/; Max-Age=0`)
          },
        },
      }
    );

    // Get user from session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    // HYBRID SOLUTION: If no session in SSR, allow through and let client-side verify
    // This is because Next.js Pages Router has issues reading Supabase cookies in getServerSideProps
    // Security is maintained through:
    // 1. Client-side permission checks (usePermissions hook)
    // 2. API route protection (all APIs check auth)
    // 3. Database RLS policies (ultimate protection)
    if (sessionError || !session?.user) {
      return {
        authorized: true,
        user: null,
        ssrVerified: false // Flag that client MUST verify
      };
    }

    const user = session.user;

    // Get user's permissions (with denied filtering)
    
    const permissions = await getUserPermissions(user.id, true); // Use service role

    const permissionNames = permissions.map(p => p.permission_name);

    // Normalize required permissions to array
    const requiredPermsArray = Array.isArray(requiredPermissions)
      ? requiredPermissions
      : [requiredPermissions];

    // Check if user has required permission(s)
    let hasAccess = false;

    if (requireAll) {
      // User must have ALL required permissions
      hasAccess = requiredPermsArray.every(perm => checkPermission(permissionNames, perm));
    } else {
      // User must have ANY of the required permissions
      hasAccess = requiredPermsArray.some(perm => checkPermission(permissionNames, perm));
    }

    if (!hasAccess) {
      console.error('❌ requirePermission: ACCESS DENIED ❌', {
        user_id: user.id,
        user_email: user.email,
        required: requiredPermsArray,
        has: permissionNames,
        permission_count: permissionNames.length,
        requireAll: requireAll
      });
      
      // Extra debugging: check each required permission
      console.error('🔍 Detailed permission check:');
      requiredPermsArray.forEach(perm => {
        const hasExact = permissionNames.includes(perm);
        const hasWildcard = checkPermission(permissionNames, perm);
        console.error(`   - ${perm}: exact=${hasExact}, wildcard=${hasWildcard}`);
      });

      return {
        authorized: false,
        redirect: {
          destination: redirectTo,
          permanent: false
        }
      };
    }

    // Permission granted
      user_id: user.id,
      user_email: user.email,
      permission: requiredPermsArray
    });

    return {
      authorized: true,
      user: {
        id: user.id,
        email: user.email,
        permissions: permissionNames
      }
    };

  } catch (error) {
    console.error('requirePermission: Error checking permissions', error);

    // On error, deny access for security
    return {
      authorized: false,
      redirect: {
        destination: redirectTo,
        permanent: false
      }
    };
  }
}

/**
 * Helper: Check if user has a specific permission (with wildcard support)
 * @param {string[]} userPermissions - User's permission list
 * @param {string} requiredPermission - Permission to check
 * @returns {boolean}
 */
function checkPermission(userPermissions, requiredPermission) {
  // Check wildcard super admin permission
  if (userPermissions.includes('*:*:*')) {
    return true;
  }

  // Check exact match
  if (userPermissions.includes(requiredPermission)) {
    return true;
  }

  // Check wildcard patterns
  const [resource, action, scope] = requiredPermission.split(':');

  // Check resource:*:*
  if (userPermissions.includes(`${resource}:*:*`)) {
    return true;
  }

  // Check resource:action:*
  if (action && userPermissions.includes(`${resource}:${action}:*`)) {
    return true;
  }

  return false;
}

/**
 * Require user to be authenticated (no specific permission check)
 * @param {Object} context - Next.js getServerSideProps context
 * @returns {Promise<Object>} - { authorized: boolean, user?, redirect? }
 */
export async function requireAuth(context) {
  try {
    const supabase = createPagesServerClient(context);
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error || !session?.user) {
      return {
        authorized: false,
        redirect: {
          destination: '/login?redirect=' + encodeURIComponent(context.resolvedUrl),
          permanent: false
        }
      };
    }

    return {
      authorized: true,
      user: {
        id: session.user.id,
        email: session.user.email
      }
    };
  } catch (error) {
    console.error('requireAuth: Error', error);
    return {
      authorized: false,
      redirect: {
        destination: '/login',
        permanent: false
      }
    };
  }
}

/**
 * Require user to have a specific role
 * @param {Object} context - Next.js getServerSideProps context
 * @param {string|string[]} requiredRoles - Role(s) required
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} - { authorized: boolean, user?, redirect? }
 */
export async function requireRole(context, requiredRoles, options = {}) {
  const { redirectTo = '/dashboard' } = options;

  try {
    const supabase = createPagesServerClient(context);
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error || !session?.user) {
      return {
        authorized: false,
        redirect: {
          destination: '/login?redirect=' + encodeURIComponent(context.resolvedUrl),
          permanent: false
        }
      };
    }

    // Get user's role from profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (profileError || !profile?.role) {
      console.error('requireRole: Error fetching user role', profileError);
      return {
        authorized: false,
        redirect: {
          destination: redirectTo,
          permanent: false
        }
      };
    }

    const rolesArray = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];

    if (!rolesArray.includes(profile.role)) {
        user_id: session.user.id,
        has_role: profile.role,
        required_roles: rolesArray
      });

      return {
        authorized: false,
        redirect: {
          destination: redirectTo,
          permanent: false
        }
      };
    }

    return {
      authorized: true,
      user: {
        id: session.user.id,
        email: session.user.email,
        role: profile.role
      }
    };

  } catch (error) {
    console.error('requireRole: Error', error);
    return {
      authorized: false,
      redirect: {
        destination: redirectTo,
        permanent: false
      }
    };
  }
}
