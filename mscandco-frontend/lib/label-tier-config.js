/**
 * Label Tier Configuration
 * 4-tier progressive pricing system for labels
 */

export const LABEL_TIERS = {
  STARTER: 'label_starter',
  PRO: 'label_pro',
  PARTNER: 'label_partner',
  ENTERPRISE: 'label_enterprise'
};

export const LABEL_TIER_CONFIG = {
  [LABEL_TIERS.STARTER]: {
    name: 'Label Starter',
    displayName: 'Starter',
    price: {
      monthly: 0,
      annual: 0,
      currency: 'GBP',
      symbol: '£'
    },
    commission: 0.25, // 25%
    limits: {
      artists: 5,
      releases_per_year: 10,
      tracks_per_year: 30,
      apollo_queries_per_month: 10,
      team_members: 1
    },
    features: [
      'Up to 5 artists under label',
      '10 releases per year (all artists combined)',
      '30 tracks per year (all artists combined)',
      '10 Apollo Intelligence queries per month',
      '25% commission on all label earnings',
      'Label roster management',
      'Basic analytics dashboard (all label artists)',
      'Release management for label artists',
      'Earnings view (aggregated across artists)'
    ],
    cta: 'Start Free',
    popular: false
  },

  [LABEL_TIERS.PRO]: {
    name: 'Label Pro',
    displayName: 'Pro',
    price: {
      monthly: 99,
      annual: 999, // ~2 months free
      currency: 'GBP',
      symbol: '£'
    },
    commission: 0.18, // 18%
    limits: {
      artists: 25,
      releases_per_year: -1, // unlimited
      tracks_per_year: -1, // unlimited
      apollo_queries_per_month: 200,
      team_members: 3
    },
    features: [
      'Up to 25 artists under label',
      'Unlimited releases and tracks',
      '200 Apollo Intelligence queries per month',
      '18% commission on all label earnings',
      'Everything in Starter, plus:',
      'Advanced analytics with export',
      'Bulk release upload',
      'Custom label branding',
      'Priority support',
      'Multi-user access (up to 3 team members)'
    ],
    cta: 'Upgrade to Pro',
    popular: true
  },

  [LABEL_TIERS.PARTNER]: {
    name: 'MPP Partner',
    displayName: 'Partner',
    price: {
      monthly: 499,
      annual: 4999, // ~2 months free
      currency: 'GBP',
      symbol: '£'
    },
    commission: 0.12, // 12%
    autoQualification: {
      annual_earnings: 50000, // £50,000+
      total_streams: 500000, // 500,000+
      artist_count: 25, // 25+ artists
      commissions_paid: 10000 // £10,000+
    },
    limits: {
      artists: 100,
      releases_per_year: -1, // unlimited
      tracks_per_year: -1, // unlimited
      apollo_queries_per_month: 1000,
      team_members: 10
    },
    features: [
      'Up to 100 artists under label',
      'Unlimited releases and tracks',
      '1,000 Apollo Intelligence queries per month',
      '12% commission on all label earnings',
      'FREE if you auto-qualify (see criteria below)',
      'Everything in Pro, plus:',
      'White-label platform option',
      'Custom domain for label portal',
      'API access for integrations',
      'Dedicated account manager',
      'Multi-user access (up to 10 team members)',
      'Custom reporting and analytics'
    ],
    autoQualifyFeatures: [
      '£50,000+ annual label earnings',
      '500,000+ total streams across label',
      '25+ artists under label',
      '£10,000+ commissions paid to MSC'
    ],
    cta: 'Upgrade to Partner',
    popular: false
  },

  [LABEL_TIERS.ENTERPRISE]: {
    name: 'Investment Partner',
    displayName: 'Enterprise',
    price: {
      monthly: null,
      annual: null,
      investment_range: { min: 50000, max: 250000 },
      currency: 'GBP',
      symbol: '£'
    },
    commission: 0.05, // 5%
    limits: {
      artists: -1, // unlimited
      releases_per_year: -1, // unlimited
      tracks_per_year: -1, // unlimited
      apollo_queries_per_month: -1, // unlimited
      team_members: -1 // unlimited
    },
    features: [
      'Unlimited artists',
      'Unlimited releases, tracks, and Apollo queries',
      '5% commission on all label earnings (lowest rate)',
      'Equity stake in MSC & Co',
      'Board voting rights',
      'Revenue share from platform growth',
      'Everything in Partner, plus:',
      'Full white-label solution',
      'Unlimited team members',
      'Custom feature development',
      'Priority infrastructure allocation',
      'Dedicated AI assistant'
    ],
    cta: 'Contact Sales',
    popular: false
  }
};

/**
 * Get label tier configuration by tier name
 * @param {string} tier - Tier name (e.g., 'label_pro')
 * @returns {object} - Tier configuration
 */
export function getLabelTierConfig(tier) {
  return LABEL_TIER_CONFIG[tier] || LABEL_TIER_CONFIG[LABEL_TIERS.STARTER];
}

/**
 * Get commission rate for a label tier
 * @param {string} tier - Tier name
 * @returns {number} - Commission rate (0.0 to 1.0)
 */
export function getLabelCommissionRate(tier) {
  const config = getLabelTierConfig(tier);
  return config.commission;
}

/**
 * Check if label exceeds tier limits
 * @param {string} tier - Current tier
 * @param {object} usage - Current usage stats
 * @returns {object} - { exceeded: boolean, limits: array of exceeded limits }
 */
export function checkLabelTierLimits(tier, usage) {
  const config = getLabelTierConfig(tier);
  const exceeded = [];

  if (config.limits.artists > 0 && usage.artist_count > config.limits.artists) {
    exceeded.push({
      type: 'artists',
      current: usage.artist_count,
      limit: config.limits.artists,
      message: `Artist limit exceeded (${usage.artist_count}/${config.limits.artists})`
    });
  }

  if (config.limits.releases_per_year > 0 && usage.releases_this_year > config.limits.releases_per_year) {
    exceeded.push({
      type: 'releases',
      current: usage.releases_this_year,
      limit: config.limits.releases_per_year,
      message: `Annual release limit exceeded (${usage.releases_this_year}/${config.limits.releases_per_year})`
    });
  }

  if (config.limits.tracks_per_year > 0 && usage.tracks_this_year > config.limits.tracks_per_year) {
    exceeded.push({
      type: 'tracks',
      current: usage.tracks_this_year,
      limit: config.limits.tracks_per_year,
      message: `Annual track limit exceeded (${usage.tracks_this_year}/${config.limits.tracks_per_year})`
    });
  }

  if (config.limits.apollo_queries_per_month > 0 && usage.apollo_queries_this_month > config.limits.apollo_queries_per_month) {
    exceeded.push({
      type: 'apollo',
      current: usage.apollo_queries_this_month,
      limit: config.limits.apollo_queries_per_month,
      message: `Apollo query limit exceeded (${usage.apollo_queries_this_month}/${config.limits.apollo_queries_per_month})`
    });
  }

  return {
    exceeded: exceeded.length > 0,
    limits: exceeded
  };
}

/**
 * Check if label qualifies for free Partner tier
 * @param {object} metrics - Label performance metrics
 * @returns {boolean} - True if qualifies for free Partner
 */
export function checkLabelPartnerQualification(metrics) {
  const criteria = LABEL_TIER_CONFIG[LABEL_TIERS.PARTNER].autoQualification;

  return (
    metrics.annual_earnings >= criteria.annual_earnings ||
    metrics.total_streams >= criteria.total_streams ||
    metrics.artist_count >= criteria.artist_count ||
    metrics.commissions_paid >= criteria.commissions_paid
  );
}

/**
 * Calculate savings by upgrading from one tier to another
 * @param {string} currentTier - Current tier
 * @param {string} targetTier - Target tier
 * @param {number} annualEarnings - Annual earnings in GBP
 * @returns {object} - Savings breakdown
 */
export function calculateLabelUpgradeSavings(currentTier, targetTier, annualEarnings) {
  const current = getLabelTierConfig(currentTier);
  const target = getLabelTierConfig(targetTier);

  const currentCommission = annualEarnings * current.commission;
  const targetCommission = annualEarnings * target.commission;
  const commissionSavings = currentCommission - targetCommission;

  const currentSubscription = current.price.annual || 0;
  const targetSubscription = target.price.annual || 0;
  const subscriptionCost = targetSubscription - currentSubscription;

  const netSavings = commissionSavings - subscriptionCost;

  return {
    currentCommission,
    targetCommission,
    commissionSavings,
    currentSubscription,
    targetSubscription,
    subscriptionCost,
    netSavings,
    worthUpgrading: netSavings > 0,
    breakEvenEarnings: subscriptionCost / (current.commission - target.commission)
  };
}

/**
 * Get next recommended tier for a label
 * @param {string} currentTier - Current tier
 * @param {object} usage - Current usage stats
 * @returns {string|null} - Next recommended tier or null
 */
export function getRecommendedLabelTier(currentTier, usage) {
  const tierOrder = [LABEL_TIERS.STARTER, LABEL_TIERS.PRO, LABEL_TIERS.PARTNER, LABEL_TIERS.ENTERPRISE];
  const currentIndex = tierOrder.indexOf(currentTier);

  if (currentIndex === -1 || currentIndex === tierOrder.length - 1) {
    return null; // Already at highest tier or invalid tier
  }

  const nextTier = tierOrder[currentIndex + 1];
  const currentConfig = getLabelTierConfig(currentTier);

  // Check if close to limits
  if (currentConfig.limits.artists > 0 && usage.artist_count >= currentConfig.limits.artists * 0.8) {
    return nextTier;
  }

  if (currentConfig.limits.releases_per_year > 0 && usage.releases_this_year >= currentConfig.limits.releases_per_year * 0.8) {
    return nextTier;
  }

  if (currentConfig.limits.apollo_queries_per_month > 0 && usage.apollo_queries_this_month >= currentConfig.limits.apollo_queries_per_month * 0.8) {
    return nextTier;
  }

  return null;
}

/**
 * Format tier limits for display
 * @param {string} tier - Tier name
 * @returns {object} - Formatted limits
 */
export function formatLabelTierLimits(tier) {
  const config = getLabelTierConfig(tier);

  return {
    artists: config.limits.artists > 0 ? `${config.limits.artists} artists` : 'Unlimited artists',
    releases: config.limits.releases_per_year > 0 ? `${config.limits.releases_per_year} releases/year` : 'Unlimited releases',
    tracks: config.limits.tracks_per_year > 0 ? `${config.limits.tracks_per_year} tracks/year` : 'Unlimited tracks',
    apollo: config.limits.apollo_queries_per_month > 0 ? `${config.limits.apollo_queries_per_month} queries/month` : 'Unlimited Apollo',
    teamMembers: config.limits.team_members > 0 ? `${config.limits.team_members} team members` : 'Unlimited team'
  };
}
