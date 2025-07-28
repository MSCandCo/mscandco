const axios = require('axios');

// Configuration
const STRAPI_URL = 'http://localhost:1337';
const ADMIN_EMAIL = 'info@audiostems.co.uk'; // Your admin email
const ADMIN_PASSWORD = 'Test@2025'; // Your admin password

// Test users to create
const testUsers = [
  // ADMIN USERS
  {
    email: 'superadmin@mscandco.com',
    username: 'superadmin',
    password: 'Test@2025',
    firstname: 'Super',
    lastname: 'Admin',
    role: 'super-admin',
    brand: 'MSC & Co',
    confirmed: true,
    blocked: false
  },
  {
    email: 'admin@yhwhmsc.com',
    username: 'yhwh_admin',
    password: 'Test@2025',
    firstname: 'YHWH',
    lastname: 'Admin',
    role: 'company-admin',
    brand: 'YHWH MSC',
    confirmed: true,
    blocked: false
  },
  {
    email: 'admin@audiomsc.com',
    username: 'audio_admin',
    password: 'Test@2025',
    firstname: 'Audio',
    lastname: 'Admin',
    role: 'company-admin',
    brand: 'Audio MSC',
    confirmed: true,
    blocked: false
  },
  
  // ARTIST USERS
  {
    email: 'artist1@yhwhmsc.com',
    username: 'yhwh_artist1',
    password: 'Test@2025',
    firstname: 'YHWH',
    lastname: 'Artist1',
    role: 'artist',
    brand: 'YHWH MSC',
    confirmed: true,
    blocked: false
  },
  {
    email: 'artist2@yhwhmsc.com',
    username: 'yhwh_artist2',
    password: 'Test@2025',
    firstname: 'YHWH',
    lastname: 'Artist2',
    role: 'artist',
    brand: 'YHWH MSC',
    confirmed: true,
    blocked: false
  },
  {
    email: 'artist1@audiomsc.com',
    username: 'audio_artist1',
    password: 'Test@2025',
    firstname: 'Audio',
    lastname: 'Artist1',
    role: 'artist',
    brand: 'Audio MSC',
    confirmed: true,
    blocked: false
  },
  {
    email: 'artist2@audiomsc.com',
    username: 'audio_artist2',
    password: 'Test@2025',
    firstname: 'Audio',
    lastname: 'Artist2',
    role: 'artist',
    brand: 'Audio MSC',
    confirmed: true,
    blocked: false
  },
  
  // DISTRIBUTION USERS
  {
    email: 'distadmin@mscandco.com',
    username: 'dist_admin',
    password: 'Test@2025',
    firstname: 'Distribution',
    lastname: 'Admin',
    role: 'distribution-admin',
    brand: 'MSC & Co',
    confirmed: true,
    blocked: false
  },
  {
    email: 'distributor1@mscandco.com',
    username: 'distributor1',
    password: 'Test@2025',
    firstname: 'Distributor',
    lastname: 'One',
    role: 'distributor',
    brand: 'MSC & Co',
    confirmed: true,
    blocked: false
  }
];

async function loginAsAdmin() {
  try {
    console.log('🔐 Logging in as admin...');
    const response = await axios.post(`${STRAPI_URL}/admin/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });
    
    const token = response.data.data.token;
    console.log('✅ Admin login successful');
    return token;
  } catch (error) {
    console.error('❌ Admin login failed:', error.response?.data || error.message);
    throw error;
  }
}

async function createUser(adminToken, userData) {
  try {
    console.log(`👤 Creating user: ${userData.email}`);
    
    const userPayload = {
      email: userData.email,
      username: userData.username,
      password: userData.password,
      firstname: userData.firstname,
      lastname: userData.lastname,
      confirmed: userData.confirmed,
      blocked: userData.blocked,
      role: userData.role,
      brand: userData.brand
    };
    
    const response = await axios.post(`${STRAPI_URL}/admin/users`, userPayload, {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`✅ User created successfully: ${userData.email} (ID: ${response.data.data.id})`);
    return response.data.data;
  } catch (error) {
    console.error(`❌ Failed to create user ${userData.email}:`, error.response?.data || error.message);
    return null;
  }
}

async function createAllUsers() {
  try {
    console.log('🚀 Starting automated user creation...\n');
    
    // Login as admin
    const adminToken = await loginAsAdmin();
    
    console.log('\n📝 Creating all test users...\n');
    
    const results = [];
    
    // Create users one by one
    for (const userData of testUsers) {
      const result = await createUser(adminToken, userData);
      results.push({ user: userData, success: !!result, data: result });
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Summary
    console.log('\n📊 CREATION SUMMARY:');
    console.log('==================');
    
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    console.log(`✅ Successfully created: ${successful.length} users`);
    console.log(`❌ Failed to create: ${failed.length} users`);
    
    if (successful.length > 0) {
      console.log('\n✅ SUCCESSFULLY CREATED USERS:');
      successful.forEach(r => {
        console.log(`  - ${r.user.email} (${r.user.role}) - ${r.user.brand}`);
      });
    }
    
    if (failed.length > 0) {
      console.log('\n❌ FAILED TO CREATE USERS:');
      failed.forEach(r => {
        console.log(`  - ${r.user.email} (${r.user.role}) - ${r.user.brand}`);
      });
    }
    
    console.log('\n🎯 NEXT STEPS:');
    console.log('1. Test login at http://localhost:3000');
    console.log('2. Verify brand switching functionality');
    console.log('3. Test role-based access control');
    console.log('4. Create sample content for testing');
    
    return results;
    
  } catch (error) {
    console.error('💥 Fatal error:', error.message);
    throw error;
  }
}

// Run the script
if (require.main === module) {
  createAllUsers()
    .then(() => {
      console.log('\n🎉 User creation process completed!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 Script failed:', error.message);
      process.exit(1);
    });
}

module.exports = { createAllUsers, testUsers }; 