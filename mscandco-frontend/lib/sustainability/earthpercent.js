/**
 * EarthPercent Integration
 * Automatic donation system: 1-2% of royalties to environmental causes
 *
 * EarthPercent is a charity founded by Massive Attack & Brian Eno
 * that encourages the music industry to donate to climate action.
 */

/**
 * Calculate EarthPercent donation
 */
export function calculateEarthPercentDonation(royalties, percentage = 1) {
  if (percentage < 0 || percentage > 5) {
    throw new Error('EarthPercent donation must be between 0-5%');
  }

  const donationAmount = (royalties * percentage) / 100;

  return {
    royaltyAmount: royalties,
    donationPercentage: percentage,
    donationAmount: Math.round(donationAmount * 100) / 100,
    netRoyalties: Math.round((royalties - donationAmount) * 100) / 100,
    currency: 'USD'
  };
}

/**
 * EarthPercent project categories
 */
export const EARTHPERCENT_PROJECTS = {
  renewable_energy: {
    name: 'Renewable Energy',
    description: 'Solar, wind, and hydroelectric projects in developing countries',
    impact: 'Reduces reliance on fossil fuels',
    examples: [
      {
        name: 'Solar Power India',
        location: 'India',
        impact: '10,000 tonnes CO2e avoided per year',
        certification: 'Gold Standard'
      },
      {
        name: 'Wind Farm Kenya',
        location: 'Kenya',
        impact: '25,000 tonnes CO2e avoided per year',
        certification: 'VCS'
      }
    ]
  },
  reforestation: {
    name: 'Reforestation & Forest Protection',
    description: 'Planting trees and protecting existing forests',
    impact: 'Carbon sequestration and biodiversity preservation',
    examples: [
      {
        name: 'Amazon Rainforest Protection',
        location: 'Brazil',
        impact: '50,000 tonnes CO2e sequestered per year',
        certification: 'Verra'
      },
      {
        name: 'Mangrove Restoration',
        location: 'Philippines',
        impact: '15,000 tonnes CO2e sequestered per year',
        certification: 'Plan Vivo'
      }
    ]
  },
  ocean_protection: {
    name: 'Ocean & Marine Protection',
    description: 'Protecting marine ecosystems and blue carbon',
    impact: 'Ocean carbon sequestration and ecosystem health',
    examples: [
      {
        name: 'Seagrass Restoration',
        location: 'Indonesia',
        impact: '8,000 tonnes CO2e sequestered per year',
        certification: 'Verra Blue Carbon'
      }
    ]
  },
  clean_cooking: {
    name: 'Clean Cooking',
    description: 'Efficient cookstoves to reduce deforestation',
    impact: 'Reduces emissions and improves health',
    examples: [
      {
        name: 'Efficient Cookstoves Kenya',
        location: 'Kenya',
        impact: '20,000 tonnes CO2e avoided per year',
        certification: 'Gold Standard'
      }
    ]
  },
  direct_air_capture: {
    name: 'Direct Air Capture',
    description: 'Technology that removes CO2 directly from the atmosphere',
    impact: 'Permanent carbon removal',
    examples: [
      {
        name: 'Climeworks Orca',
        location: 'Iceland',
        impact: 'Permanent carbon removal',
        certification: 'CDR.fyi certified'
      }
    ]
  }
};

/**
 * Get artist's EarthPercent status
 */
export function getEarthPercentStatus(artist) {
  const {
    earthPercentEnabled = false,
    earthPercentPercentage = 0,
    totalDonations = 0,
    totalRoyalties = 0,
    memberSince = null
  } = artist.earthPercent || {};

  const lifetimeDonationPercentage = totalRoyalties > 0 ? (totalDonations / totalRoyalties) * 100 : 0;
  const monthsSinceMembership = memberSince ? monthsBetween(new Date(memberSince), new Date()) : 0;
  const avgDonationPerMonth = monthsSinceMembership > 0 ? totalDonations / monthsSinceMembership : 0;

  // Calculate badge tier
  let badgeTier = null;
  if (earthPercentEnabled) {
    if (totalDonations >= 10000) badgeTier = 'platinum'; // $10K+
    else if (totalDonations >= 5000) badgeTier = 'gold'; // $5K+
    else if (totalDonations >= 1000) badgeTier = 'silver'; // $1K+
    else if (totalDonations >= 100) badgeTier = 'bronze'; // $100+
    else badgeTier = 'member';
  }

  return {
    isEnabled: earthPercentEnabled,
    percentage: earthPercentPercentage,
    totalDonations: Math.round(totalDonations * 100) / 100,
    lifetimeDonationPercentage: Math.round(lifetimeDonationPercentage * 100) / 100,
    avgDonationPerMonth: Math.round(avgDonationPerMonth * 100) / 100,
    badgeTier,
    memberSince,
    monthsSinceMembership,
    projectedAnnualDonation: Math.round(avgDonationPerMonth * 12 * 100) / 100
  };
}

/**
 * Enable EarthPercent for artist
 */
export function enableEarthPercent(artistId, percentage = 1, projectPreferences = []) {
  if (percentage < 0.5 || percentage > 5) {
    throw new Error('EarthPercent donation must be between 0.5-5%');
  }

  return {
    artistId,
    enabled: true,
    percentage,
    projectPreferences, // Array of project categories to support
    enabledAt: new Date().toISOString(),
    status: 'active',
    message: `EarthPercent enabled at ${percentage}%. Thank you for supporting climate action!`
  };
}

/**
 * Calculate impact metrics
 */
export function calculateImpactMetrics(donations) {
  // Average offset costs and impact
  const avgOffsetCost = 15; // $15 per tonne CO2e
  const tonnesOffset = donations / avgOffsetCost;

  return {
    totalDonations: donations,
    estimatedTonnesOffset: Math.round(tonnesOffset * 100) / 100,
    treesPlanted: Math.round(tonnesOffset * 50), // Approx 50 trees per tonne
    equivalents: {
      carsMilesAvoided: Math.round(tonnesOffset * 2475), // 1 tonne = 2,475 miles driven
      homesEnergyYear: Math.round(tonnesOffset * 0.12), // 1 tonne = 0.12 homes' energy for a year
      forestPreserved: Math.round(tonnesOffset * 5), // Acres of forest preserved
      peopleImpacted: Math.round(donations / 10) // Estimate: $10 impacts one person
    }
  };
}

/**
 * Generate EarthPercent certificate
 */
export function generateCertificate(artist, year) {
  const status = getEarthPercentStatus(artist);

  return {
    artistName: artist.name,
    year,
    totalDonated: status.totalDonations,
    percentage: status.percentage,
    badgeTier: status.badgeTier,
    impactMetrics: calculateImpactMetrics(status.totalDonations),
    certificateId: `EP-${artist.id}-${year}`,
    issuedAt: new Date().toISOString(),
    verificationUrl: `https://earthpercent.org/verify/${artist.id}/${year}`
  };
}

/**
 * Leaderboard: Top EarthPercent contributors
 */
export function getLeaderboard(artists, timeframe = 'all_time') {
  const sorted = artists
    .filter(a => a.earthPercent?.earthPercentEnabled)
    .sort((a, b) => (b.earthPercent?.totalDonations || 0) - (a.earthPercent?.totalDonations || 0))
    .slice(0, 100)
    .map((artist, index) => ({
      rank: index + 1,
      artistName: artist.name,
      totalDonations: artist.earthPercent.totalDonations,
      percentage: artist.earthPercent.earthPercentPercentage,
      badgeTier: getEarthPercentStatus(artist).badgeTier,
      impactMetrics: calculateImpactMetrics(artist.earthPercent.totalDonations)
    }));

  return {
    timeframe,
    totalArtists: sorted.length,
    totalDonations: sorted.reduce((sum, a) => sum + a.totalDonations, 0),
    leaderboard: sorted
  };
}

/**
 * Utility: Calculate months between dates
 */
function monthsBetween(date1, date2) {
  const months = (date2.getFullYear() - date1.getFullYear()) * 12 +
                 (date2.getMonth() - date1.getMonth());
  return Math.max(0, months);
}

/**
 * Get EarthPercent marketing assets
 */
export function getMarketingAssets(artist) {
  const status = getEarthPercentStatus(artist);

  return {
    badge: {
      tier: status.badgeTier,
      imageUrl: `/badges/earthpercent-${status.badgeTier}.svg`,
      alt: `EarthPercent ${status.badgeTier} Member`
    },
    socialMedia: {
      message: `🌍 I'm proud to support climate action by donating ${status.percentage}% of my music royalties through @EarthPercent. Together, we've offset ${calculateImpactMetrics(status.totalDonations).estimatedTonnesOffset} tonnes of CO2! #EarthPercent #ClimateAction`,
      hashtags: ['#EarthPercent', '#ClimateAction', '#MusicForThePlanet', '#SustainableMusic'],
      imageUrl: `/social/earthpercent-${artist.id}.png`
    },
    pressRelease: {
      headline: `${artist.name} Joins EarthPercent, Committing ${status.percentage}% of Royalties to Climate Action`,
      body: `${artist.name} has pledged to donate ${status.percentage}% of music royalties to environmental causes through EarthPercent, a charity founded by Massive Attack and Brian Eno. This commitment will support projects ranging from renewable energy to reforestation.`
    }
  };
}
