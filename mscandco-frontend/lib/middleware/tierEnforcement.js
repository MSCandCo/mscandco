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
    const { data: user, error } = await supabase
      .from('user_profiles')
      .select('apollo_queries_used_this_month, apollo_query_limit, apollo_unlimited_addon, tier')
      .eq('id', userId)
      .single();

    if (error || !user) {
      console.error('Error fetching Apollo limit:', error);
      return {
        allowed: true, // Allow on error to not break functionality
        error: null
      };
    }

    // Unlimited addon or Investment tier = no limit
    if (user.apollo_unlimited_addon || user.tier === 'investment') {
      return {
        allowed: true,
        error: null
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
    const usedCount = user.apollo_queries_used_this_month || 0;

    // Check if limit reached
    if (usedCount >= queryLimit) {
      const tierName = user.tier === 'free' ? 'MSC Free' : user.tier === 'pro' ? 'MSC Pro' : 'MPP Partner';
      const nextTier = user.tier === 'free' ? 'pro' : 'mpp';
      const nextLimit = user.tier === 'free' ? 100 : 500;

      return {
        allowed: false,
        error: `Apollo Intelligence limit reached: You've used all ${queryLimit} queries this month (${tierName} tier).`,
        upgradeMessage: `Upgrade to ${nextTier === 'pro' ? 'MSC Pro' : 'MPP Partner'} for ${nextLimit} queries/month, or add unlimited AI for £9.99/month.`,
        upgradeUrl: `/billing/upgrade?tier=${nextTier}&reason=apollo_limit`,
        addonUrl: '/billing/addons?addon=apollo_unlimited',
        currentUsage: {
          used: usedCount,
          limit: queryLimit,
          remaining: 0
        }
      };
    }

    return {
      allowed: true,
      error: null,
      currentUsage: {
        used: usedCount,
        limit: queryLimit,
        remaining: queryLimit - usedCount
      }
    };
  } catch (error) {
    console.error('Apollo limit check error:', error);
    return {
      allowed: true, // Allow on error
      error: null
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
      .select('apollo_queries_used_this_month, apollo_unlimited_addon, tier')
      .eq('id', userId)
      .single();

    if (!user) return;

    // Don't increment if unlimited
    if (user.apollo_unlimited_addon || user.tier === 'investment') {
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
