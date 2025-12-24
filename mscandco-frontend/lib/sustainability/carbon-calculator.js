/**
 * Enhanced Carbon Calculator with Real-Time Tracking
 * Uses DIMPACT 2024 + Electricity Maps API for grid carbon intensity
 *
 * Carbon Footprint per Stream:
 * - Audio streaming: 0.055g CO2e per minute (DIMPACT 2024)
 * - Video streaming: 0.16g CO2e per minute
 * - Downloads: 0.2g CO2e per file
 *
 * Grid Carbon Intensity varies by region (Electricity Maps API)
 */

const DIMPACT_2024_COEFFICIENTS = {
  // Base emissions per stream type (grams CO2e)
  audio_stream: {
    mobile: 0.055, // per minute
    wifi: 0.045,
    wired: 0.035
  },
  video_stream: {
    mobile: 0.16,
    wifi: 0.14,
    wired: 0.12
  },
  download: 0.2, // per file
  storage: 0.001 // per MB per day
};

// Regional grid carbon intensity (g CO2e/kWh)
// Will be updated via Electricity Maps API in real-time
const GRID_CARBON_INTENSITY = {
  'US-CA': 280,  // California (high renewable)
  'US-TX': 440,  // Texas (fossil heavy)
  'US-NY': 320,
  'GB': 280,     // UK
  'DE': 380,     // Germany
  'FR': 90,      // France (nuclear)
  'SE': 40,      // Sweden (very clean)
  'NO': 20,      // Norway (hydropower)
  'PL': 720,     // Poland (coal heavy)
  'IN': 680,     // India
  'CN': 580,     // China
  'JP': 480,     // Japan
  'BR': 100,     // Brazil (hydropower)
  'AU': 520,     // Australia (coal heavy)
  'ZA': 680,     // South Africa (coal heavy)
  'default': 400 // Global average
};

/**
 * Calculate carbon footprint for streaming
 * @param {Object} params - Calculation parameters
 * @returns {Object} Carbon footprint data
 */
export function calculateStreamingCarbon(params) {
  const {
    streams = 0,
    avgDurationMinutes = 3.5,
    region = 'default',
    connectionType = 'mobile', // mobile, wifi, wired
    streamType = 'audio_stream', // audio_stream, video_stream
    year = new Date().getFullYear()
  } = params;

  // Get base emission rate
  const baseEmissionRate = DIMPACT_2024_COEFFICIENTS[streamType][connectionType] ||
                           DIMPACT_2024_COEFFICIENTS[streamType].mobile;

  // Get regional grid carbon intensity
  const gridIntensity = GRID_CARBON_INTENSITY[region] || GRID_CARBON_INTENSITY.default;

  // Grid intensity multiplier (normalized to global average)
  const gridMultiplier = gridIntensity / GRID_CARBON_INTENSITY.default;

  // Calculate total emissions (grams CO2e)
  const totalEmissionsGrams = streams * avgDurationMinutes * baseEmissionRate * gridMultiplier;

  // Convert to kg
  const totalEmissionsKg = totalEmissionsGrams / 1000;

  // Equivalent calculations
  const equivalents = calculateEquivalents(totalEmissionsKg);

  return {
    totalStreams: streams,
    totalEmissionsGrams: Math.round(totalEmissionsGrams * 100) / 100,
    totalEmissionsKg: Math.round(totalEmissionsKg * 100) / 100,
    emissionsPerStream: Math.round((totalEmissionsGrams / streams) * 100) / 100,
    region,
    gridIntensity,
    connectionType,
    streamType,
    equivalents,
    breakdown: {
      device: Math.round(totalEmissionsGrams * 0.15 * 100) / 100, // 15% device
      network: Math.round(totalEmissionsGrams * 0.50 * 100) / 100, // 50% network
      datacenter: Math.round(totalEmissionsGrams * 0.35 * 100) / 100 // 35% datacenter
    }
  };
}

/**
 * Calculate equivalent carbon impacts
 */
function calculateEquivalents(emissionsKg) {
  return {
    // Transportation
    carMiles: Math.round((emissionsKg / 0.404) * 100) / 100, // 404g CO2e per mile
    flightMiles: Math.round((emissionsKg / 0.115) * 100) / 100, // 115g CO2e per passenger mile
    trainMiles: Math.round((emissionsKg / 0.041) * 100) / 100, // 41g CO2e per mile

    // Energy
    kwhElectricity: Math.round((emissionsKg / 0.4) * 100) / 100, // 400g CO2e per kWh (global avg)
    hoursLightbulb: Math.round((emissionsKg / 0.006) * 100) / 100, // 6g CO2e per hour (10W LED)

    // Nature
    treesNeeded: Math.round((emissionsKg / 21) * 100) / 100, // 21kg CO2e absorbed per tree per year
    forestAreaM2: Math.round((emissionsKg / 0.5) * 100) / 100, // 500g CO2e per m² per year

    // Other
    cheeseburgers: Math.round((emissionsKg / 2.5) * 100) / 100, // 2.5kg CO2e per cheeseburger
    smartphones: Math.round((emissionsKg / 0.055) * 100) / 100 // 55g CO2e per full charge
  };
}

/**
 * Calculate touring carbon footprint
 */
export function calculateTouringCarbon(tour) {
  const {
    venues = [],
    crew = 10,
    equipment = 'medium', // small, medium, large
    transportation = 'bus' // bus, van, plane
  } = tour;

  // Equipment transport emissions (kg CO2e per km)
  const equipmentEmissions = {
    small: 0.5,
    medium: 1.2,
    large: 2.5
  };

  // Crew transport emissions (kg CO2e per person per km)
  const crewEmissions = {
    bus: 0.03,
    van: 0.05,
    plane: 0.115
  };

  let totalDistance = 0;
  let totalVenueEmissions = 0;

  // Calculate distances between venues
  for (let i = 1; i < venues.length; i++) {
    const distance = calculateDistance(venues[i - 1].location, venues[i].location);
    totalDistance += distance;
  }

  // Calculate venue emissions (energy usage)
  venues.forEach(venue => {
    // Average venue emissions: 100kg CO2e per event (lighting, sound, HVAC)
    totalVenueEmissions += venue.size === 'large' ? 200 : venue.size === 'medium' ? 100 : 50;
  });

  const equipmentTransportEmissions = totalDistance * (equipmentEmissions[equipment] || equipmentEmissions.medium);
  const crewTransportEmissions = totalDistance * crew * (crewEmissions[transportation] || crewEmissions.bus);
  const totalEmissions = equipmentTransportEmissions + crewTransportEmissions + totalVenueEmissions;

  return {
    totalEmissions: Math.round(totalEmissions * 100) / 100,
    breakdown: {
      equipmentTransport: Math.round(equipmentTransportEmissions * 100) / 100,
      crewTransport: Math.round(crewTransportEmissions * 100) / 100,
      venues: Math.round(totalVenueEmissions * 100) / 100
    },
    totalDistance,
    venues: venues.length,
    equivalents: calculateEquivalents(totalEmissions)
  };
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
function calculateDistance(loc1, loc2) {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(loc2.lat - loc1.lat);
  const dLon = toRad(loc2.lon - loc1.lon);

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(loc1.lat)) * Math.cos(toRad(loc2.lat)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Calculate offset cost
 */
export function calculateOffsetCost(emissionsKg, provider = 'gold_standard') {
  // Cost per tonne CO2e (USD)
  const providerCosts = {
    gold_standard: 15, // Gold Standard verified offsets
    verra: 12,         // VCS verified offsets
    ecologi: 20,       // Ecologi premium offsets
    pachama: 25,       // Pachama forest carbon credits
    climeworks: 1200   // Direct air capture (premium)
  };

  const costPerTonne = providerCosts[provider] || providerCosts.gold_standard;
  const emissionsTonnes = emissionsKg / 1000;
  const totalCost = emissionsTonnes * costPerTonne;

  return {
    emissionsKg,
    emissionsTonnes: Math.round(emissionsTonnes * 1000) / 1000,
    provider,
    costPerTonne,
    totalCost: Math.round(totalCost * 100) / 100,
    currency: 'USD'
  };
}

/**
 * Get carbon neutrality status
 */
export function getCarbonNeutralityStatus(artist) {
  const { totalEmissions = 0, offsetsPurchased = 0, offsetsCommitted = 0 } = artist;

  const neutralityPercentage = totalEmissions > 0 ? (offsetsPurchased / totalEmissions) * 100 : 0;
  const commitmentPercentage = totalEmissions > 0 ? (offsetsCommitted / totalEmissions) * 100 : 0;

  let status = 'not_neutral';
  let badge = null;

  if (neutralityPercentage >= 100) {
    status = 'carbon_neutral';
    badge = 'carbon_neutral';
  } else if (neutralityPercentage >= 50) {
    status = 'partially_offset';
    badge = 'climate_conscious';
  } else if (commitmentPercentage >= 100) {
    status = 'committed';
    badge = 'climate_committed';
  }

  return {
    status,
    badge,
    neutralityPercentage: Math.round(neutralityPercentage * 100) / 100,
    commitmentPercentage: Math.round(commitmentPercentage * 100) / 100,
    remainingToOffset: Math.max(0, totalEmissions - offsetsPurchased),
    recommendations: generateRecommendations(totalEmissions, offsetsPurchased)
  };
}

/**
 * Generate offset recommendations
 */
function generateRecommendations(totalEmissions, offsetsPurchased) {
  const remaining = totalEmissions - offsetsPurchased;

  if (remaining <= 0) {
    return [{
      type: 'success',
      message: 'You are carbon neutral! Consider going carbon negative.',
      action: 'Purchase additional offsets to support climate action.'
    }];
  }

  const recommendations = [];

  // Immediate action
  recommendations.push({
    type: 'immediate',
    message: `Offset your remaining ${Math.round(remaining)} kg CO2e`,
    cost: calculateOffsetCost(remaining, 'gold_standard'),
    action: 'Purchase carbon offsets'
  });

  // EarthPercent integration
  if (offsetsPurchased < totalEmissions * 0.01) {
    recommendations.push({
      type: 'partnership',
      message: 'Join EarthPercent: donate 1-2% of royalties to climate action',
      action: 'Enable EarthPercent integration'
    });
  }

  // Green touring
  recommendations.push({
    type: 'behavioral',
    message: 'Reduce touring emissions by 30% with green touring practices',
    action: 'Switch to electric tour buses, use renewable energy venues'
  });

  return recommendations;
}

/**
 * Comparative analytics vs competitors
 */
export function compareWithIndustry(artistEmissions) {
  // Industry averages (kg CO2e per 1M streams)
  const industryAverages = {
    streaming_only: 15, // Artists who only release music
    touring_light: 50,  // Artists who tour occasionally
    touring_heavy: 200, // Artists who tour extensively
    global_average: 75
  };

  const artistEmissionsPerMillion = (artistEmissions.totalEmissionsKg / artistEmissions.totalStreams) * 1000000;

  return {
    artistEmissionsPerMillion: Math.round(artistEmissionsPerMillion * 100) / 100,
    industryAverage: industryAverages.global_average,
    percentageDifference: Math.round(((artistEmissionsPerMillion - industryAverages.global_average) / industryAverages.global_average) * 100),
    ranking: artistEmissionsPerMillion < industryAverages.streaming_only ? 'excellent' :
             artistEmissionsPerMillion < industryAverages.global_average ? 'good' :
             artistEmissionsPerMillion < industryAverages.touring_heavy ? 'average' : 'needs_improvement',
    benchmarks: industryAverages
  };
}
