const { ManagementClient } = require('auth0');

// Auth0 Management API configuration
const auth0 = new ManagementClient({
  domain: process.env.AUTH0_DOMAIN || 'dev-x2t2bdk6z050yxkr.uk.auth0.com',
  clientId: process.env.AUTH0_CLIENT_ID || 'MyeJlwvUbUH3fsCZiDElp45W3EfdZvac',
  clientSecret: process.env.AUTH0_CLIENT_SECRET || 'your-client-secret',
  scope: 'read:users create:users update:users'
});

// Test users configuration - 5 Essential Roles
const testUsers = [
  {
    email: 'super.admin@mscandco.com',
    password: 'TestPassword123!',
    name: 'Super Admin User',
    role: 'super_admin',
    brand: 'mscandco',
    description: 'Super Admin - All of MSC & Co (company-wide oversight)'
  },
  {
    email: 'company.admin.yhwh@mscandco.com',
    password: 'TestPassword123!',
    name: 'YHWH Company Admin User',
    role: 'company_admin',
    brand: 'yhwh_msc',
    description: 'Company Admin - Everything within YHWH MSC brand'
  },
  {
    email: 'label.admin.yhwh@mscandco.com',
    password: 'TestPassword123!',
    name: 'YHWH Label Admin User',
    role: 'label_admin',
    brand: 'yhwh_msc',
    description: 'Label Admin - Multiple artists within YHWH MSC brand'
  },
  {
    email: 'artist.yhwh@mscandco.com',
    password: 'TestPassword123!',
    name: 'YHWH Artist User',
    role: 'artist',
    brand: 'yhwh_msc',
    description: 'Artist - Individual creator within YHWH MSC brand'
  },
  {
    email: 'distribution.partner@mscandco.com',
    password: 'TestPassword123!',
    name: 'Distribution Partner User',
    role: 'distribution_partner',
    brand: 'mscandco',
    description: 'Distribution Partner - Distribution tools across all brands'
  }
];

async function createTestUsers() {
  console.log('🚀 Creating 5 essential test users for MSC & Co platform...\n');
  console.log('📋 User Roles:');
  console.log('1. Super Admin - All of MSC & Co (company-wide)');
  console.log('2. Company Admin - Everything within their brand');
  console.log('3. Label Admin - Multiple artists within their brand');
  console.log('4. Artist - Individual creators within a brand');
  console.log('5. Distribution Partner - Distribution tools\n');

  for (const userConfig of testUsers) {
    try {
      console.log(`📝 Creating user: ${userConfig.name}`);
      console.log(`   Email: ${userConfig.email}`);
      console.log(`   Role: ${userConfig.role}`);
      console.log(`   Brand: ${userConfig.brand}`);
      console.log(`   Description: ${userConfig.description}`);

      const userData = {
        email: userConfig.email,
        password: userConfig.password,
        name: userConfig.name,
        email_verified: true,
        user_metadata: {
          role: userConfig.role,
          brand: userConfig.brand
        },
        app_metadata: {
          role: userConfig.role,
          brand: userConfig.brand
        }
      };

      const user = await auth0.users.create(userData);
      
      console.log(`✅ Successfully created user: ${user.name} (${user.user_id})`);
      console.log(`   User ID: ${user.user_id}`);
      console.log(`   Metadata:`, user.user_metadata);
      console.log('');

    } catch (error) {
      console.error(`❌ Error creating user ${userConfig.email}:`, error.message);
      
      if (error.message.includes('already exists')) {
        console.log(`   User already exists, skipping...\n`);
      } else {
        console.log(`   Full error:`, error);
        console.log('');
      }
    }
  }

  console.log('🎉 Test user creation completed!');
  console.log('\n📋 Summary of 5 Essential Users:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('1. Super Admin - super.admin@mscandco.com');
  console.log('   Role: super_admin | Brand: mscandco (all of MSC & Co)');
  console.log('');
  console.log('2. Company Admin - company.admin.yhwh@mscandco.com');
  console.log('   Role: company_admin | Brand: yhwh_msc (everything in YHWH MSC)');
  console.log('');
  console.log('3. Label Admin - label.admin.yhwh@mscandco.com');
  console.log('   Role: label_admin | Brand: yhwh_msc (multiple artists)');
  console.log('');
  console.log('4. Artist - artist.yhwh@mscandco.com');
  console.log('   Role: artist | Brand: yhwh_msc (individual creator)');
  console.log('');
  console.log('5. Distribution Partner - distribution.partner@mscandco.com');
  console.log('   Role: distribution_partner | Brand: mscandco (distribution tools)');
  console.log('');
  console.log('🔑 All users have password: TestPassword123!');
  console.log('\n🧪 Ready for testing role-based access control!');
  console.log('\n🏢 Brand Structure:');
  console.log('   MSC & Co (Parent) → Super Admin, Distribution Partner');
  console.log('   YHWH MSC (Brand 1) → Company Admin, Label Admin, Artist');
  console.log('   Audio MSC (Brand 2) → Coming later');
}

// Run the script
createTestUsers().catch(console.error); 