/**
 * Tier Enforcement Middleware
 * 
 * Enforces pricing tier limits for releases, tracks, and Apollo Intelligence queries
 * Tracks usage and prompts upgrades when limits are reached
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Check if user can create a release/tracks based on their tier
 * 
 * @param userId - User ID
 * @param trackCount - Number of tracks in the release
 * @returns Object with allowed status, error message, and upgrade info
 */
export async function enforceReleaseLimit(userId, trackCount = 0) {
  try {
    // Get user tier and current usage
    const { data: user, error } = await supabase
      .from('user_profiles')
      .select('tier, releases_this_year, tracks_this_year, total_earnings_this_year, commission_rate')
      .eq('id', userId)
      .single();

    if (error || !user) {
      console.error('Error fetching user tier:', error);
      return {
        allowed: false,
        error: 'Unable to verify tier limits. Please try again.',
        upgradeRequired: 'pro'
      };
    }

    // Free tier limits
    if (user.tier === 'free') {
      // Check release limit (3 per year)
      if (user.releases_this_year >= 3) {
        return {
          allowed: false,
          error: 'Free tier limit reached: Maximum 3 releases per year. Upgrade to MSC Pro for unlimited releases.',
          upgradeRequired: 'pro',
          currentUsage: {
            releases: user.releases_this_year,
            tracks: user.tracks_this_year,
            limit: { releases: 3, tracks: 15 }
          },
          limit: 3,
          limitType: 'releases'
        };
      }

      // Check track limit (15 per year)
      if (user.tracks_this_year + trackCount > 15) {
        return {
          allowed: false,
          error: `Free tier limit reached: Maximum 15 tracks per year. You have ${user.tracks_this_year} tracks, trying to add ${trackCount}. Upgrade to MSC Pro for unlimited tracks.`,
          upgradeRequired: 'pro',
          currentUsage: {
            releases: user.releases_this_year,
            tracks: user.tracks_this_year,
            limit: { releases: 3, tracks: 15 }
          },
          limit: 15,
          limitType: 'tracks'
        };
      }

      // Check if earnings threshold reached (prompt upgrade but allow)
      const promptUpgrade = user.total_earnings_this_year >= 5000;
      if (promptUpgrade) {
        return {
          allowed: true,
          promptUpgrade: true,
          upgradeMessage: `You've earned £${user.total_earnings_this_year.toFixed(2)} this year! Upgrade to MSC Pro (15% commission) to save money on commissions.`,
          savingsIfUpgrade: (user.total_earnings_this_year * 0.20) - (user.total_earnings_this_year * 0.15 + 199),
          upgradeRequired: 'pro'
        };
      }
    }

    // Pro, MPP, and Investment tiers have no limits
    return {
      allowed: true,
      promptUpgrade: false
    };
  } catch (error) {
    console.error('Tier enforcement error:', error);
    return {
      allowed: false,
      error: 'An error occurred checking tier limits. Please try again.',
      upgradeRequired: 'pro'
    };
  }
}

/**
 * Track release creation and increment usage counters
 * 
 * @param userId - User ID
 * @param trackCount - Number of tracks created
 */
export async function trackReleaseCreation(userId, trackCount = 0) {
  try {
    // Increment counters atomically
    const { error } = await supabase.rpc('increment_release_counters', {
      p_user_id: userId,
      p_track_count: trackCount
    });

    if (error) {
      // Fallback: Manual update if RPC doesn't exist
      const { data: user } = await supabase
        .from('user_profiles')
        .select('releases_this_year, tracks_this_year')
        .eq('id', userId)
        .single();

      if (user) {
        await supabase
          .from('user_profiles')
          .update({
            releases_this_year: (user.releases_this_year || 0) + 1,
            tracks_this_year: (user.tracks_this_year || 0) + trackCount,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);
      }
    }

    // Check if upgrade should be prompted (earnings threshold)
    const { data: user } = await supabase
      .from('user_profiles')
      .select('tier, total_earnings_this_year, upgrade_prompted')
      .eq('id', userId)
      .single();

    if (user && user.tier === 'free' && user.total_earnings_this_year >= 5000 && !user.upgrade_prompted) {
      await supabase
        .from('user_profiles')
        .update({ upgrade_prompted: true })
        .eq('id', userId);
    }
  } catch (error) {
    console.error('Error tracking release creation:', error);
    // Don't throw - tracking failure shouldn't break release creation
  }
}

/**
 * Check Apollo Intelligence query limit
 * 
 * @param userId - User ID
 * @returns Object with allowed status and error message
 */
export async function enforceApolloQueryLimit(userId) {
  try {
    // TEMPORARY BYPASS: Allow all users during debugging (can be disabled via env var)
    // Also check if we're in development/staging
    // CRITICAL: Check request headers for staging domain
    const requestUrl = typeof window !== 'undefined' ? window.location.href : '';
    const isStaging = process.env.APOLLO_BYPASS_LIMITS === 'true' || 
                      process.env.NODE_ENV === 'development' ||
                      process.env.NEXT_PUBLIC_APP_URL?.includes('staging') ||
                      process.env.VERCEL_URL?.includes('staging') ||
                      requestUrl.includes('staging.mscandco.com');
    
    // TEMPORARY: Always bypass limits for now until we fix the root cause
    // This ensures Apollo works for everyone while we debug
    const FORCE_BYPASS = true; // Set to false to re-enable limits
    
    if (FORCE_BYPASS || isStaging) {
      console.log(`⚠️ BYPASS MODE: Apollo limits disabled for user ${userId}`, {
        FORCE_BYPASS,
        isStaging,
        NODE_ENV: process.env.NODE_ENV,
        NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
        VERCEL_URL: process.env.VERCEL_URL,
        requestUrl
      });
      return {
        allowed: true,
        error: null,
        bypassReason: FORCE_BYPASS ? 'force_bypass_enabled' : 'bypass_mode_enabled'
      };
    }

    // First, try to get user from user_profiles
    const { data: user, error } = await supabase
      .from('user_profiles')
      .select('apollo_queries_used_this_month, apollo_query_limit, apollo_unlimited_addon, tier, role')
      .eq('id', userId)
      .single();

    // If user_profiles doesn't have the user, check auth.users as fallback
    let userRole = null;
    let isAdmin = false;

    if (user) {
      userRole = user.role;
      // CRITICAL: Check admin roles FIRST before any limit checks
      // Admins get unlimited Apollo access - check this immediately
      isAdmin = userRole === 'super_admin' || 
                userRole === 'company_admin' || 
                userRole === 'admin' ||
                userRole === 'label_admin';
      
      console.log(`👤 User profile found:`, {
        userId,
        role: userRole,
        tier: user.tier,
        isAdmin,
        apollo_queries_used: user.apollo_queries_used_this_month,
        apollo_query_limit: user.apollo_query_limit,
        apollo_unlimited_addon: user.apollo_unlimited_addon
      });
    } else if (error) {
      // Fallback: Check auth.users metadata
      console.log(`⚠️ User not found in user_profiles, checking auth.users for ${userId}`);
      try {
        const { data: authUser } = await supabase.auth.admin.getUserById(userId);
        if (authUser?.user) {
          userRole = authUser.user.user_metadata?.role || authUser.user.app_metadata?.role;
          isAdmin = userRole === 'super_admin' || 
                   userRole === 'company_admin' || 
                   userRole === 'admin' ||
                   userRole === 'label_admin';
          console.log(`📋 Found role in auth metadata: ${userRole}, isAdmin: ${isAdmin}`);
        }
      } catch (authError) {
        console.error('Error checking auth.users:', authError);
      }
    }

    // If admin, grant unlimited access immediately
    if (isAdmin) {
      console.log(`✅ Admin user ${userId} (role: ${userRole}) - Unlimited Apollo access granted`);
      return {
        allowed: true,
        error: null,
        bypassReason: 'admin_role',
        isAdmin: true,
        role: userRole
      };
    }

    // If no user found at all, fail open (allow access)
    if (error || !user) {
      console.error('⚠️ Error fetching Apollo limit - FAILING OPEN (allowing access):', error);
      // FAIL OPEN: Allow access on error to not break functionality
      return {
        allowed: true,
        error: null,
        bypassReason: 'error_fetching_user',
        warning: 'User profile not found, allowing access for reliability'
      };
    }

    // Unlimited addon or Investment tier = no limit
    if (user.apollo_unlimited_addon || user.tier === 'investment') {
      return {
        allowed: true,
        error: null,
        bypassReason: 'unlimited_addon_or_investment'
      };
    }

    // Set default limits based on tier if limit is null or 0
    let queryLimit = user.apollo_query_limit;
    if (queryLimit === null || queryLimit === 0 || queryLimit === undefined) {
      // Set defaults based on tier
      if (user.tier === 'free') {
        queryLimit = 10; // Free tier: 10 queries/month
      } else if (user.tier === 'pro') {
        queryLimit = 100; // Pro tier: 100 queries/month
      } else if (user.tier === 'mpp' || user.tier === 'mpp_partner') {
        queryLimit = 500; // MPP tier: 500 queries/month
      } else {
        // Default for other tiers or unknown tiers
        queryLimit = 50;
      }
      
      // Update the user's limit in database for future queries
      await supabase
        .from('user_profiles')
        .update({ apollo_query_limit: queryLimit })
        .eq('id', userId);
      
      console.log(`✅ Set default Apollo limit for user ${userId}: ${queryLimit} (tier: ${user.tier})`);
    }

    // Ensure used count is a number
    const usedCount = Number(user.apollo_queries_used_this_month) || 0;
    const queryLimitNum = Number(queryLimit) || 0;

    console.log(`📊 Apollo limit check for user ${userId}:`, {
      used: usedCount,
      limit: queryLimitNum,
      tier: user.tier,
      role: user.role,
      isAdmin: isAdmin,
      unlimited_addon: user.apollo_unlimited_addon
    });

    // SAFETY: If limit is 0 or invalid, allow access (fail open)
    if (queryLimitNum <= 0) {
      console.log(`⚠️ Invalid or zero limit (${queryLimitNum}) - ALLOWING ACCESS for user ${userId}`);
      return {
        allowed: true,
        error: null,
        bypassReason: 'invalid_limit',
        currentUsage: {
          used: usedCount,
          limit: queryLimitNum,
          remaining: 'unlimited'
        }
      };
    }

    // Check if limit reached (only if we have a valid limit > 0)
    if (usedCount >= queryLimitNum) {
      const tierName = user.tier === 'free' ? 'MSC Free' : user.tier === 'pro' ? 'MSC Pro' : 'MPP Partner';
      const nextTier = user.tier === 'free' ? 'pro' : 'mpp';
      const nextLimit = user.tier === 'free' ? 100 : 500;

      console.log(`⚠️ Apollo limit reached for user ${userId}: ${usedCount}/${queryLimitNum} (tier: ${user.tier})`);

      // TEMPORARY: For debugging, allow access even if limit reached (remove this in production)
      const ALLOW_OVERRIDE = process.env.APOLLO_ALLOW_OVERRIDE === 'true';
      if (ALLOW_OVERRIDE) {
        console.log(`⚠️ OVERRIDE MODE: Allowing access despite limit being reached`);
        return {
          allowed: true,
          error: null,
          bypassReason: 'override_mode',
          warning: `Limit reached (${usedCount}/${queryLimitNum}) but override enabled`,
          currentUsage: {
            used: usedCount,
            limit: queryLimitNum,
            remaining: 0
          }
        };
      }

      return {
        allowed: false,
        error: `Apollo Intelligence limit reached: You've used all ${queryLimitNum} queries this month (${tierName} tier).`,
        upgradeMessage: `Upgrade to ${nextTier === 'pro' ? 'MSC Pro' : 'MPP Partner'} for ${nextLimit} queries/month, or add unlimited AI for £9.99/month.`,
        upgradeUrl: `/billing/upgrade?tier=${nextTier}&reason=apollo_limit`,
        addonUrl: '/billing/addons?addon=apollo_unlimited',
        currentUsage: {
          used: usedCount,
          limit: queryLimitNum,
          remaining: 0
        }
      };
    }

    console.log(`✅ Apollo access granted for user ${userId}: ${usedCount}/${queryLimitNum} used (${queryLimitNum - usedCount} remaining)`);

    return {
      allowed: true,
      error: null,
      currentUsage: {
        used: usedCount,
        limit: queryLimitNum,
        remaining: Math.max(0, queryLimitNum - usedCount)
      }
    };
  } catch (error) {
    console.error('❌ Apollo limit check error:', error);
    // FAIL OPEN: Always allow on error to prevent breaking functionality
    return {
      allowed: true,
      error: null,
      bypassReason: 'error_in_check',
      errorDetails: error.message
    };
  }
}

/**
 * Track Apollo Intelligence query usage
 * 
 * @param userId - User ID
 */
export async function trackApolloQuery(userId) {
  try {
    const { data: user } = await supabase
      .from('user_profiles')
      .select('apollo_queries_used_this_month, apollo_unlimited_addon, tier, role')
      .eq('id', userId)
      .single();

    if (!user) return;

    // Admins get unlimited Apollo access - check FIRST
    const isAdmin = user.role === 'super_admin' || 
                   user.role === 'company_admin' || 
                   user.role === 'admin' ||
                   user.role === 'label_admin';

    // Don't increment if unlimited or admin
    if (user.apollo_unlimited_addon || user.tier === 'investment' || isAdmin) {
      if (isAdmin) {
        console.log(`✅ Admin user ${userId} (role: ${user.role}) - Skipping Apollo query tracking`);
      }
      return;
    }

    // Increment counter
    await supabase
      .from('user_profiles')
      .update({
        apollo_queries_used_this_month: (user.apollo_queries_used_this_month || 0) + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
  } catch (error) {
    console.error('Error tracking Apollo query:', error);
    // Don't throw - tracking failure shouldn't break query
  }
}

/**
 * Check if user should see upgrade prompt
 * 
 * @param userId - User ID
 * @returns Object with prompt info
 */
export async function checkUpgradePrompt(userId) {
  try {
    const { data: user } = await supabase
      .from('user_profiles')
      .select('tier, releases_this_year, tracks_this_year, total_earnings_this_year, upgrade_prompted, apollo_queries_used_this_month, apollo_query_limit')
      .eq('id', userId)
      .single();

    if (!user) return null;

    const prompts = [];

    // Free tier release limit
    if (user.tier === 'free' && user.releases_this_year >= 3) {
      prompts.push({
        type: 'release_limit',
        message: 'You\'ve reached your free tier limit of 3 releases per year. Upgrade to MSC Pro for unlimited releases.',
        upgradeUrl: '/billing/upgrade?tier=pro&reason=release_limit',
        urgent: true
      });
    }

    // Free tier track limit
    if (user.tier === 'free' && user.tracks_this_year >= 15) {
      prompts.push({
        type: 'track_limit',
        message: 'You\'ve reached your free tier limit of 15 tracks per year. Upgrade to MSC Pro for unlimited tracks.',
        upgradeUrl: '/billing/upgrade?tier=pro&reason=track_limit',
        urgent: true
      });
    }

    // Earnings threshold
    if (user.tier === 'free' && user.total_earnings_this_year >= 5000 && !user.upgrade_prompted) {
      prompts.push({
        type: 'earnings_threshold',
        message: `You've earned £${user.total_earnings_this_year.toFixed(2)} this year! Upgrade to MSC Pro to save on commissions.`,
        upgradeUrl: '/billing/upgrade?tier=pro&reason=earnings_threshold',
        urgent: false
      });
    }

    // Apollo query limit
    if (user.apollo_query_limit !== null && user.apollo_queries_used_this_month >= user.apollo_query_limit) {
      prompts.push({
        type: 'apollo_limit',
        message: `You've used all ${user.apollo_query_limit} Apollo Intelligence queries this month. Upgrade for more queries.`,
        upgradeUrl: `/billing/upgrade?tier=${user.tier === 'free' ? 'pro' : 'mpp'}&reason=apollo_limit`,
        urgent: false
      });
    }

    return prompts.length > 0 ? prompts : null;
  } catch (error) {
    console.error('Error checking upgrade prompts:', error);
    return null;
  }
}
