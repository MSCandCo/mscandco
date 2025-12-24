/**
 * Carbon Offset Marketplace Integration
 * Supports: Gold Standard, Ecologi, Pachama, Verra, Climeworks
 *
 * Purchase verified carbon offsets directly through the platform
 */

/**
 * Offset providers and their offerings
 */
export const OFFSET_PROVIDERS = {
  gold_standard: {
    name: 'Gold Standard',
    description: 'High-quality verified carbon offsets',
    website: 'https://www.goldstandard.org',
    certification: 'Gold Standard Certified',
    minPurchase: 1, // tonne
    pricePerTonne: 15,
    currency: 'USD',
    projectTypes: ['renewable_energy', 'clean_cooking', 'forest_protection'],
    deliveryTime: 'immediate',
    features: {
      retirement_certificate: true,
      blockchain_verified: false,
      api_available: true,
      bulk_purchase: true
    },
    rating: 4.8,
    totalOffsetsRetired: 50000000 // tonnes
  },

  verra: {
    name: 'Verra (VCS)',
    description: 'World\'s most widely used voluntary carbon offset program',
    website: 'https://verra.org',
    certification: 'Verified Carbon Standard (VCS)',
    minPurchase: 1,
    pricePerTonne: 12,
    currency: 'USD',
    projectTypes: ['reforestation', 'forest_protection', 'renewable_energy', 'methane_capture'],
    deliveryTime: 'immediate',
    features: {
      retirement_certificate: true,
      blockchain_verified: false,
      api_available: true,
      bulk_purchase: true
    },
    rating: 4.7,
    totalOffsetsRetired: 800000000
  },

  ecologi: {
    name: 'Ecologi',
    description: 'Premium carbon offset projects with tree planting',
    website: 'https://ecologi.com',
    certification: 'Multiple (Gold Standard, VCS, Plan Vivo)',
    minPurchase: 0.1,
    pricePerTonne: 20,
    currency: 'USD',
    projectTypes: ['reforestation', 'renewable_energy', 'ocean_protection'],
    deliveryTime: 'immediate',
    features: {
      retirement_certificate: true,
      blockchain_verified: false,
      api_available: true,
      bulk_purchase: true,
      tree_planting: true,
      public_profile: true
    },
    rating: 4.9,
    totalOffsetsRetired: 2000000,
    bonusFeature: 'Includes tree planting + offset'
  },

  pachama: {
    name: 'Pachama',
    description: 'AI-verified forest carbon credits',
    website: 'https://pachama.com',
    certification: 'Verra VCS + AI Verification',
    minPurchase: 1,
    pricePerTonne: 25,
    currency: 'USD',
    projectTypes: ['forest_protection', 'reforestation'],
    deliveryTime: '24_hours',
    features: {
      retirement_certificate: true,
      blockchain_verified: true,
      api_available: true,
      bulk_purchase: true,
      satellite_monitoring: true,
      ai_verification: true
    },
    rating: 4.9,
    totalOffsetsRetired: 5000000,
    bonusFeature: 'AI + satellite verification for highest integrity'
  },

  climeworks: {
    name: 'Climeworks',
    description: 'Direct air capture - permanent carbon removal',
    website: 'https://climeworks.com',
    certification: 'CDR.fyi Certified',
    minPurchase: 0.01,
    pricePerTonne: 1200,
    currency: 'USD',
    projectTypes: ['direct_air_capture'],
    deliveryTime: 'immediate',
    features: {
      retirement_certificate: true,
      blockchain_verified: false,
      api_available: false,
      bulk_purchase: true,
      permanent_removal: true,
      facility_tour: true // Virtual tour available
    },
    rating: 5.0,
    totalOffsetsRetired: 15000,
    bonusFeature: 'Permanent removal, not just avoidance'
  }
};

/**
 * Get offset recommendations based on budget and preferences
 */
export function getOffsetRecommendations(params) {
  const {
    emissionsKg,
    budget,
    preferences = {
      projectType: null, // null = all types
      certification: null,
      permanence: false, // true = only permanent removal
      location: null
    }
  } = params;

  const emissionsTonnes = emissionsKg / 1000;
  const recommendations = [];

  // Filter providers based on preferences
  Object.entries(OFFSET_PROVIDERS).forEach(([key, provider]) => {
    // Check if project type matches
    if (preferences.projectType && !provider.projectTypes.includes(preferences.projectType)) {
      return;
    }

    // Check if certification matches
    if (preferences.certification && !provider.certification.includes(preferences.certification)) {
      return;
    }

    // Check if permanence required
    if (preferences.permanence && !provider.features.permanent_removal) {
      return;
    }

    // Calculate cost
    const totalCost = emissionsTonnes * provider.pricePerTonne;

    // Check if within budget
    if (budget && totalCost > budget) {
      return;
    }

    recommendations.push({
      provider: key,
      providerName: provider.name,
      emissionsTonnes,
      pricePerTonne: provider.pricePerTonne,
      totalCost: Math.round(totalCost * 100) / 100,
      currency: provider.currency,
      certification: provider.certification,
      deliveryTime: provider.deliveryTime,
      features: provider.features,
      rating: provider.rating,
      description: provider.description,
      bonusFeature: provider.bonusFeature || null
    });
  });

  // Sort by best value (rating / price)
  recommendations.sort((a, b) => {
    const valueA = a.rating / a.pricePerTonne;
    const valueB = b.rating / b.pricePerTonne;
    return valueB - valueA;
  });

  return {
    emissionsKg,
    emissionsTonnes,
    budget,
    preferences,
    recommendations,
    totalOptions: recommendations.length
  };
}

/**
 * Purchase carbon offsets
 */
export async function purchaseOffsets(params) {
  const {
    provider,
    emissionsTonnes,
    artistId,
    paymentMethod = 'card',
    projectPreference = null,
    publicProfile = false
  } = params;

  const providerData = OFFSET_PROVIDERS[provider];

  if (!providerData) {
    throw new Error('Invalid offset provider');
  }

  if (emissionsTonnes < providerData.minPurchase) {
    throw new Error(`Minimum purchase is ${providerData.minPurchase} tonne for ${providerData.name}`);
  }

  const totalCost = emissionsTonnes * providerData.pricePerTonne;

  // This would integrate with actual payment processor
  const purchase = {
    id: `offset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    provider,
    providerName: providerData.name,
    artistId,
    emissionsTonnes,
    pricePerTonne: providerData.pricePerTonne,
    totalCost: Math.round(totalCost * 100) / 100,
    currency: providerData.currency,
    paymentMethod,
    projectPreference,
    publicProfile,
    status: 'pending',
    purchasedAt: new Date().toISOString(),
    certificateUrl: null, // Will be generated after confirmation
    retirementCertificateId: null
  };

  return purchase;
}

/**
 * Get retirement certificate
 */
export function generateRetirementCertificate(purchase) {
  const provider = OFFSET_PROVIDERS[purchase.provider];

  return {
    certificateId: `RET-${purchase.id.toUpperCase()}`,
    artistId: purchase.artistId,
    provider: provider.name,
    certification: provider.certification,
    emissionsTonnes: purchase.emissionsTonnes,
    retiredAt: new Date().toISOString(),
    serialNumber: `${purchase.provider.toUpperCase()}-${Date.now()}`,
    verificationUrl: `https://registry.${purchase.provider}.org/verify/${purchase.id}`,
    certificate: {
      title: 'Carbon Offset Retirement Certificate',
      recipientName: 'Artist Name', // From artist profile
      statement: `This certificate confirms the permanent retirement of ${purchase.emissionsTonnes} tonnes of verified carbon offsets through ${provider.name}.`,
      projectDetails: purchase.projectPreference,
      retiredOn: new Date().toISOString(),
      signature: 'Platform Administrator',
      seal: 'Official Platform Seal'
    }
  };
}

/**
 * Track offset portfolio for an artist
 */
export function getOffsetPortfolio(artistId, purchases) {
  const artistPurchases = purchases.filter(p => p.artistId === artistId && p.status === 'completed');

  const byProvider = {};
  const byProjectType = {};
  let totalSpent = 0;
  let totalTonnesOffset = 0;

  artistPurchases.forEach(purchase => {
    // By provider
    if (!byProvider[purchase.provider]) {
      byProvider[purchase.provider] = {
        provider: purchase.provider,
        providerName: purchase.providerName,
        purchases: 0,
        tonnes: 0,
        spent: 0
      };
    }
    byProvider[purchase.provider].purchases += 1;
    byProvider[purchase.provider].tonnes += purchase.emissionsTonnes;
    byProvider[purchase.provider].spent += purchase.totalCost;

    // By project type
    const providerData = OFFSET_PROVIDERS[purchase.provider];
    providerData.projectTypes.forEach(type => {
      if (!byProjectType[type]) {
        byProjectType[type] = {
          projectType: type,
          tonnes: 0,
          spent: 0
        };
      }
      byProjectType[type].tonnes += purchase.emissionsTonnes / providerData.projectTypes.length;
      byProjectType[type].spent += purchase.totalCost / providerData.projectTypes.length;
    });

    totalSpent += purchase.totalCost;
    totalTonnesOffset += purchase.emissionsTonnes;
  });

  return {
    artistId,
    totalPurchases: artistPurchases.length,
    totalTonnesOffset: Math.round(totalTonnesOffset * 100) / 100,
    totalSpent: Math.round(totalSpent * 100) / 100,
    averageCostPerTonne: artistPurchases.length > 0 ? Math.round((totalSpent / totalTonnesOffset) * 100) / 100 : 0,
    byProvider: Object.values(byProvider),
    byProjectType: Object.values(byProjectType),
    firstPurchase: artistPurchases.length > 0 ? artistPurchases[0].purchasedAt : null,
    lastPurchase: artistPurchases.length > 0 ? artistPurchases[artistPurchases.length - 1].purchasedAt : null
  };
}

/**
 * Subscription-based automatic offsetting
 */
export function createOffsetSubscription(params) {
  const {
    artistId,
    provider,
    frequency = 'monthly', // monthly, quarterly, annual
    method = 'fixed', // fixed = fixed tonnes, percentage = % of royalties, automatic = match emissions
    amount = null, // tonnes per period (for fixed)
    percentage = null // % of royalties (for percentage method)
  } = params;

  if (method === 'fixed' && !amount) {
    throw new Error('Amount required for fixed subscription');
  }

  if (method === 'percentage' && !percentage) {
    throw new Error('Percentage required for percentage subscription');
  }

  const providerData = OFFSET_PROVIDERS[provider];

  return {
    id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    artistId,
    provider,
    providerName: providerData.name,
    frequency,
    method,
    amount: method === 'fixed' ? amount : null,
    percentage: method === 'percentage' ? percentage : null,
    estimatedCostPerPeriod: method === 'fixed' ? amount * providerData.pricePerTonne : null,
    status: 'active',
    createdAt: new Date().toISOString(),
    nextChargeDate: calculateNextChargeDate(frequency),
    totalOffsetToDate: 0
  };
}

/**
 * Calculate next charge date
 */
function calculateNextChargeDate(frequency) {
  const now = new Date();

  switch (frequency) {
    case 'monthly':
      return new Date(now.setMonth(now.getMonth() + 1)).toISOString();
    case 'quarterly':
      return new Date(now.setMonth(now.getMonth() + 3)).toISOString();
    case 'annual':
      return new Date(now.setFullYear(now.getFullYear() + 1)).toISOString();
    default:
      return new Date(now.setMonth(now.getMonth() + 1)).toISOString();
  }
}

/**
 * Get marketplace statistics
 */
export function getMarketplaceStats(allPurchases) {
  const completedPurchases = allPurchases.filter(p => p.status === 'completed');

  const stats = {
    totalPurchases: completedPurchases.length,
    totalTonnesOffset: 0,
    totalSpent: 0,
    uniqueArtists: new Set(),
    byProvider: {},
    trending: {
      mostPopularProvider: null,
      fastestGrowing: null
    },
    impact: {
      treesEquivalent: 0,
      carMilesAvoided: 0
    }
  };

  completedPurchases.forEach(purchase => {
    stats.totalTonnesOffset += purchase.emissionsTonnes;
    stats.totalSpent += purchase.totalCost;
    stats.uniqueArtists.add(purchase.artistId);

    if (!stats.byProvider[purchase.provider]) {
      stats.byProvider[purchase.provider] = {
        purchases: 0,
        tonnes: 0,
        spent: 0
      };
    }

    stats.byProvider[purchase.provider].purchases += 1;
    stats.byProvider[purchase.provider].tonnes += purchase.emissionsTonnes;
    stats.byProvider[purchase.provider].spent += purchase.totalCost;
  });

  stats.uniqueArtists = stats.uniqueArtists.size;
  stats.impact.treesEquivalent = Math.round(stats.totalTonnesOffset * 50);
  stats.impact.carMilesAvoided = Math.round(stats.totalTonnesOffset * 2475);

  // Find most popular
  const sortedProviders = Object.entries(stats.byProvider).sort((a, b) => b[1].purchases - a[1].purchases);
  if (sortedProviders.length > 0) {
    stats.trending.mostPopularProvider = sortedProviders[0][0];
  }

  return stats;
}
