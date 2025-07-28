// Test Role-Based System
const { getUserRole, getUserBrand, USER_ROLES, BRANDS } = require('./lib/auth0-config.js');

console.log('=== Testing Role-Based System ===');

// Mock user objects with different roles
const testUsers = [
  {
    email: 'superadmin@mscandco.com',
    name: 'Super Admin User',
    'https://mscandco.com/role': 'super_admin',
    'https://mscandco.com/brand': 'yhwh_msc'
  },
  {
    email: 'companyadmin@mscandco.com',
    name: 'Company Admin User',
    'https://mscandco.com/role': 'company_admin',
    'https://mscandco.com/brand': 'audio_msc'
  },
  {
    email: 'artist@mscandco.com',
    name: 'Artist User',
    'https://mscandco.com/role': 'artist',
    'https://mscandco.com/brand': 'yhwh_msc'
  },
  {
    email: 'distributor@mscandco.com',
    name: 'Distribution Partner User',
    'https://mscandco.com/role': 'distribution_partner',
    'https://mscandco.com/brand': 'audio_msc'
  },
  {
    email: 'unknown@mscandco.com',
    name: 'Unknown User',
    'https://mscandco.com/role': 'unknown_role',
    'https://mscandco.com/brand': 'unknown_brand'
  }
];

console.log('Testing role and brand detection for different users:\n');

testUsers.forEach((user, index) => {
  console.log(`User ${index + 1}: ${user.name} (${user.email})`);
  
  const detectedRole = getUserRole(user);
  const detectedBrand = getUserBrand(user);
  
  console.log(`  Expected Role: ${user['https://mscandco.com/role']}`);
  console.log(`  Detected Role: ${detectedRole}`);
  console.log(`  Expected Brand: ${user['https://mscandco.com/brand']}`);
  console.log(`  Detected Brand: ${detectedBrand?.displayName || 'Unknown'}`);
  
  // Test role validation
  const isValidRole = Object.values(USER_ROLES).includes(detectedRole);
  const isValidBrand = Object.values(BRANDS).some(brand => brand.id === user['https://mscandco.com/brand']);
  
  console.log(`  Role Valid: ${isValidRole ? '✅' : '❌'}`);
  console.log(`  Brand Valid: ${isValidBrand ? '✅' : '❌'}`);
  console.log('  ---');
});

console.log('\n=== Role Definitions ===');
Object.entries(USER_ROLES).forEach(([key, value]) => {
  console.log(`${key}: ${value}`);
});

console.log('\n=== Brand Definitions ===');
Object.entries(BRANDS).forEach(([key, brand]) => {
  console.log(`${key}: ${brand.displayName} (${brand.id})`);
});

console.log('\n=== Navigation Test ===');
console.log('Testing navigation items for each role:');

const getNavigationItems = (role) => {
  switch (role) {
    case 'super_admin':
      return ['Dashboard', 'User Management', 'Analytics', 'Content Management', 'Platform Settings'];
    case 'company_admin':
      return ['Dashboard', 'User Management', 'Analytics', 'Content Management'];
    case 'artist':
      return ['Dashboard', 'Earnings', 'My Projects', 'Analytics', 'Profile'];
    case 'distribution_partner':
      return ['Dashboard', 'Content Management', 'Analytics', 'Reports'];
    case 'distributor':
      return ['Dashboard', 'Distribution', 'Reports', 'Settings'];
    default:
      return ['Dashboard'];
  }
};

testUsers.forEach((user, index) => {
  const role = getUserRole(user);
  const navItems = getNavigationItems(role);
  console.log(`  ${user.name}: ${navItems.join(', ')}`);
});

console.log('\n✅ Role-based system test complete!'); 