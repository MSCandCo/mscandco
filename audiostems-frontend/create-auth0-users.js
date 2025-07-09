const { ManagementClient } = require('auth0');

// Configuration
const AUTH0_DOMAIN = 'dev-x2t2bdk6z050yxkr.uk.auth0.com';
const AUTH0_CLIENT_ID = 'XuGhHG90AAh2GXfcj7QKDmKdc26Gu1fb';
const AUTH0_CLIENT_SECRET = 'd_uz_xfELEL1_gy9MvXzfe5US1FhG-miRC1avrwThEJLB7GizI6Mj07KITVyPdu6';

// Test Users Configuration
const TEST_USERS = [
  // SUPER ADMIN USER
  {
    username: 'superadmin',
    email: 'superadmin@mscandco.com',
    password: 'Test@2025',
    role: 'super_admin',
    brand: 'MSC & Co',
    firstName: 'Super',
    lastName: 'Admin',
    stageName: 'MSC Admin'
  },
  
  // YHWH MSC USERS
  {
    username: 'yhwh_admin',
    email: 'admin@yhwhmsc.com',
    password: 'Test@2025',
    role: 'company_admin',
    brand: 'YHWH MSC',
    firstName: 'YHWH',
    lastName: 'Admin',
    stageName: 'YHWH Admin'
  },
  {
    username: 'yhwh_artist1',
    email: 'artist1@yhwhmsc.com',
    password: 'Test@2025',
    role: 'artist',
    brand: 'YHWH MSC',
    firstName: 'Grace',
    lastName: 'Johnson',
    stageName: 'Grace Johnson'
  },
  {
    username: 'yhwh_artist2',
    email: 'artist2@yhwhmsc.com',
    password: 'Test@2025',
    role: 'artist',
    brand: 'YHWH MSC',
    firstName: 'Michael',
    lastName: 'Thompson',
    stageName: 'Michael T'
  },
  
  // AUDIO MSC USERS
  {
    username: 'audio_admin',
    email: 'admin@audiomsc.com',
    password: 'Test@2025',
    role: 'company_admin',
    brand: 'Audio MSC',
    firstName: 'Audio',
    lastName: 'Admin',
    stageName: 'Audio Admin'
  },
  {
    username: 'audio_artist1',
    email: 'artist1@audiomsc.com',
    password: 'Test@2025',
    role: 'artist',
    brand: 'Audio MSC',
    firstName: 'Sarah',
    lastName: 'Chen',
    stageName: 'Sarah Chen'
  },
  {
    username: 'audio_artist2',
    email: 'artist2@audiomsc.com',
    password: 'Test@2025',
    role: 'artist',
    brand: 'Audio MSC',
    firstName: 'David',
    lastName: 'Martinez',
    stageName: 'David M'
  },
  
  // DISTRIBUTION PARTNERS
  {
    username: 'dist_admin',
    email: 'distadmin@mscandco.com',
    password: 'Test@2025',
    role: 'distribution_partner_admin',
    brand: 'MSC & Co',
    firstName: 'Distribution',
    lastName: 'Admin',
    stageName: 'Dist Admin'
  },
  {
    username: 'distributor1',
    email: 'distributor1@mscandco.com',
    password: 'Test@2025',
    role: 'distributor',
    brand: 'MSC & Co',
    firstName: 'John',
    lastName: 'Distributor',
    stageName: 'John D'
  }
];

async function createAuth0Users() {
  console.log('🔐 Creating Auth0 users...');
  
  const management = new ManagementClient({
    domain: AUTH0_DOMAIN,
    clientId: AUTH0_CLIENT_ID,
    clientSecret: AUTH0_CLIENT_SECRET,
    scope: 'read:users create:users update:users'
  });

  for (const user of TEST_USERS) {
    try {
      const auth0User = await management.users.create({
        email: user.email,
        password: user.password,
        name: `${user.firstName} ${user.lastName}`,
        nickname: user.stageName,
        user_metadata: {
          username: user.username,
          role: user.role,
          brand: user.brand,
          stageName: user.stageName,
          firstName: user.firstName,
          lastName: user.lastName
        },
        app_metadata: {
          role: user.role,
          brand: user.brand
        }
      });
      
      console.log(`✅ Created Auth0 user: ${user.email}`);
    } catch (error) {
      console.log(`⚠️ Error creating Auth0 user ${user.email}:`, error.message);
    }
  }
}

async function main() {
  console.log('🚀 Starting Auth0 User Creation...\n');
  
  try {
    await createAuth0Users();
    
    console.log('\n🎉 Auth0 user creation complete!');
    console.log('\n📋 Test Users Created:');
    TEST_USERS.forEach(user => {
      console.log(`  - ${user.email} (${user.role}) - ${user.brand}`);
    });
    
    console.log('\n🔗 Next Steps:');
    console.log('  1. Test login with these users at http://localhost:3000');
    console.log('  2. Create Strapi data manually through admin panel');
    console.log('  3. Explore the platform with rich test data');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  }
}

// Run the setup
main(); 