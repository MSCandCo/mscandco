// Brand Configuration for MSC & Co Multi-Brand Platform

export const BRANDS = {
  YHWH_MSC: {
    id: 'yhwh-msc',
    name: 'YHWH MSC',
    displayName: 'YHWH MSC',
    description: 'Gospel and Christian music distribution and publishing',
    focus: 'Gospel and Christian music distribution and publishing',
    services: [
      'Gospel music distribution',
      'Christian music publishing',
      'Sync licensing for Christian media',
      'Worship music distribution',
      'Christian artist development'
    ],
    colorScheme: {
      primary: '#1a365d', // Deep blue
      secondary: '#2d3748',
      accent: '#3182ce',
      background: '#f7fafc'
    },
    logo: '/logos/msc-logo.png',
    emailDomain: 'yhwh-msc.mscandco.com'
  },
  AUDIO_MSC: {
    id: 'audio-msc',
    name: 'Audio MSC',
    displayName: 'Audio MSC',
    description: 'General music distribution and licensing for film/TV/media',
    focus: 'General music distribution + licensing for film, TV, movies, commercials, and all media',
    services: [
      'General music distribution',
      'Film and TV licensing',
      'Commercial music licensing',
      'Sync licensing',
      'Media placement',
      'Artist development'
    ],
    colorScheme: {
      primary: '#2d3748', // Dark gray
      secondary: '#4a5568',
      accent: '#e53e3e',
      background: '#f7fafc'
    },
    logo: '/logos/msc-logo.png',
    emailDomain: 'audio-msc.mscandco.com'
  }
};

export const getBrandById = (brandId) => {
  return BRANDS[brandId.toUpperCase()] || BRANDS.AUDIO_MSC;
};

export const getBrandByUser = (user) => {
  if (!user) return BRANDS.AUDIO_MSC;
  
  const userBrand = user.user_metadata?.brand || user.app_metadata?.brand;
  return getBrandById(userBrand);
};

export const getBrandServices = (brandId) => {
  const brand = getBrandById(brandId);
  return brand.services;
};

export const getBrandColorScheme = (brandId) => {
  const brand = getBrandById(brandId);
  return brand.colorScheme;
};

// Brand selection options for forms
export const BRAND_OPTIONS = [
  {
    value: 'yhwh-msc',
    label: 'YHWH MSC',
    description: 'Gospel and Christian music distribution and publishing'
  },
  {
    value: 'audio-msc',
    label: 'Audio MSC',
    description: 'General music distribution and licensing for film/TV/media'
  }
];

// Company information
export const COMPANY_INFO = {
  name: 'YHWH MSC',
  fullName: 'YHWH MSC',
  domain: 'mscandco.com',
  email: 'info@mscandco.com',
  support: 'support@mscandco.com',
  copyright: '© 2024 MSC & Co. All rights reserved.',
  description: 'Multi-brand music distribution and publishing platform'
}; 