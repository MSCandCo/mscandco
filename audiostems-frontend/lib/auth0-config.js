// Auth0 Configuration for MSC & Co Platform
export const auth0Config = {
  domain: process.env.NEXT_PUBLIC_AUTH0_DOMAIN || 'dev-x2t2bdk6z050yxkr.uk.auth0.com',
  clientId: process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID || 'MyeJlwvUbUH3fsCZiDElp45W3EfdZvac',
  authorizationParams: {
    redirect_uri: typeof window !== 'undefined' ? `${window.location.origin}/dashboard` : 'http://localhost:3001/dashboard',
    audience: process.env.NEXT_PUBLIC_AUTH0_AUDIENCE || 'https://dev-x2t2bdk6z050yxkr.uk.auth0.com/api/v2/',
    scope: 'openid profile email read:user_idp_tokens'
  },
  cacheLocation: 'localstorage',
  useRefreshTokens: true
};

// Auth0 Management API configuration (for server-side operations)
export const auth0ManagementConfig = {
  domain: process.env.AUTH0_DOMAIN || 'your-domain.auth0.com',
  clientId: process.env.AUTH0_CLIENT_ID || 'your-client-id',
  clientSecret: process.env.AUTH0_CLIENT_SECRET || 'your-client-secret',
  audience: `https://${process.env.AUTH0_DOMAIN || 'your-domain.auth0.com'}/api/v2/`,
  scope: 'read:users update:users create:users'
};

// User roles mapping (5 essential roles)
export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  COMPANY_ADMIN: 'company_admin',
  LABEL_ADMIN: 'label_admin',
  ARTIST: 'artist',
  DISTRIBUTION_PARTNER: 'distribution_partner'
};

// Brand configuration - 2 brands under MSC & Co
export const BRANDS = {
  MSC_AND_CO: {
    id: 'mscandco',
    name: 'MSC & Co',
    displayName: 'MSC & Co',
    description: 'MSC & Co - Parent Company',
    isParent: true
  },
  YHWH_MSC: {
    id: 'yhwh_msc',
    name: 'YHWH MSC',
    displayName: 'YHWH MSC',
    description: 'YHWH Music & Sound Company',
    parent: 'mscandco'
  },
  AUDIO_MSC: {
    id: 'audio_msc',
    name: 'Audio MSC',
    displayName: 'Audio MSC',
    description: 'Audio Music & Sound Company',
    parent: 'mscandco'
  }
};

// Helper function to get user role from Auth0 metadata
export const getUserRole = (user) => {
  if (!user) return null;

  // Check multiple possible locations for role metadata
  const userRole = user['https://mscandco.com/role'] || 
                  user.user_metadata?.role || 
                  'artist';
  
  console.log('=== getUserRole Debug ===');
  console.log('User:', user);
  console.log('Raw role from custom claim:', user['https://mscandco.com/role']);
  console.log('Raw role from user_metadata:', user.user_metadata?.role);
  console.log('UserRole after fallback:', userRole);
  
  const result = USER_ROLES[userRole.toUpperCase()] || USER_ROLES.ARTIST;
  console.log('Returning role:', result);
  return result;
};

// Helper function to get user brand from Auth0 metadata
export const getUserBrand = (user) => {
  if (!user) return null;

  // Check multiple possible locations for brand metadata
  const userBrand = user['https://mscandco.com/brand'] || 
                   user.user_metadata?.brand || 
                   'yhwh_msc';
  
  console.log('=== getUserBrand Debug ===');
  console.log('User:', user);
  console.log('Raw brand from custom claim:', user['https://mscandco.com/brand']);
  console.log('Raw brand from user_metadata:', user.user_metadata?.brand);
  console.log('UserBrand after fallback:', userBrand);
  
  // Handle the parent company brand
  if (userBrand === 'mscandco') {
    console.log('Returning MSC_AND_CO brand');
    return BRANDS.MSC_AND_CO;
  }
  
  const result = BRANDS[userBrand.toUpperCase()] || BRANDS.YHWH_MSC;
  console.log('Returning brand:', result);
  return result;
};

// Helper function to check if user has access to a specific brand
export const hasBrandAccess = (user, brandId) => {
  if (!user) return false;
  
  const userBrand = getUserBrand(user);
  const userRole = getUserRole(user);
  
  // Super Admin has access to all brands
  if (userRole === 'super_admin') {
    return true;
  }
  
  // Company Admin has access to their assigned brand
  if (userRole === 'company_admin') {
    return userBrand?.id === brandId;
  }
  
  // Label Admin has access to their assigned brand
  if (userRole === 'label_admin') {
    return userBrand?.id === brandId;
  }
  
  // Artist has access to their assigned brand
  if (userRole === 'artist') {
    return userBrand?.id === brandId;
  }
  
  // Distribution Partner has access to all brands (for distribution tools)
  if (userRole === 'distribution_partner') {
    return true;
  }
  
  return false;
};

// Helper function to get default brand for display
export const getDefaultDisplayBrand = (user) => {
  if (!user) return BRANDS.YHWH_MSC;
  
  const userBrand = getUserBrand(user);
  const userRole = getUserRole(user);
  
  console.log('=== getDefaultDisplayBrand Debug ===');
  console.log('UserBrand:', userBrand);
  console.log('UserRole:', userRole);
  
  // Super Admin sees YHWH MSC by default (since that's what we're building)
  if (userRole === 'super_admin') {
    console.log('Returning YHWH_MSC for super admin role');
    return BRANDS.YHWH_MSC;
  }
  
  // Company Admin sees their assigned brand
  if (userRole === 'company_admin') {
    console.log('Returning user brand for company admin:', userBrand);
    return userBrand;
  }
  
  // Label Admin sees their assigned brand
  if (userRole === 'label_admin') {
    console.log('Returning user brand for label admin:', userBrand);
    return userBrand;
  }
  
  // Artist sees their assigned brand
  if (userRole === 'artist') {
    console.log('Returning user brand for artist:', userBrand);
    return userBrand;
  }
  
  // Distribution Partner sees YHWH MSC by default
  if (userRole === 'distribution_partner') {
    console.log('Returning YHWH_MSC for distribution partner');
    return BRANDS.YHWH_MSC;
  }
  
  // Default fallback
  console.log('Returning default YHWH_MSC');
  return BRANDS.YHWH_MSC;
}; 