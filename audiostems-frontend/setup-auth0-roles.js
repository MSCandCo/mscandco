// Auth0 Role Setup for MSC & Co Platform
const axios = require('axios');

// Auth0 Management API configuration
const AUTH0_DOMAIN = 'dev-x2t2bdk6z050yxkr.uk.auth0.com';
const AUTH0_CLIENT_ID = 'MyeJlwvUbUH3fsCZiDElp45W3EfdZvac';
const AUTH0_CLIENT_SECRET = 'd_uz_xfELEL1_gy9MvXzfe5US1FhG-miRC1avrwThEJLB7GizI6Mj07KITVyPdu6';
const AUTH0_MANAGEMENT_AUDIENCE = `https://${AUTH0_DOMAIN}/api/v2/`;

// Role definitions for MSC & Co
const ROLES = {
  SUPER_ADMIN: {
    name: 'Super Admin',
    description: 'Full platform control, user/role management, analytics',
    permissions: ['read:users', 'update:users', 'create:users', 'delete:users', 'read:analytics', 'manage:roles']
  },
  COMPANY_ADMIN: {
    name: 'Company Admin',
    description: 'Brand-level management, content oversight',
    permissions: ['read:users', 'update:users', 'read:analytics', 'manage:content']
  },
  ARTIST: {
    name: 'Artist',
    description: 'Upload/manage music, view analytics, earnings, and projects',
    permissions: ['read:own_content', 'create:own_content', 'update:own_content', 'read:own_analytics']
  },
  DISTRIBUTION_PARTNER: {
    name: 'Distribution Partner',
    description: 'Manage partner content, analytics, and projects',
    permissions: ['read:partner_content', 'manage:partner_content', 'read:partner_analytics']
  },
  DISTRIBUTOR: {
    name: 'Distributor',
    description: 'Manage distribution, content, and reporting',
    permissions: ['read:distribution_content', 'manage:distribution', 'read:distribution_reports']
  }
};

// Brand definitions
const BRANDS = {
  YHWH_MSC: {
    id: 'yhwh_msc',
    name: 'YHWH MSC',
    displayName: 'YHWH MSC',
    description: 'YHWH Music & Sound Company'
  },
  AUDIO_MSC: {
    id: 'audio_msc',
    name: 'Audio MSC',
    displayName: 'Audio MSC',
    description: 'Audio Music & Sound Company'
  }
};

// Test users with different roles
const TEST_USERS = [
  {
    email: 'superadmin@mscandco.com',
    password: 'TestPassword123!',
    role: 'super_admin',
    brand: 'yhwh_msc',
    name: 'Super Admin User',
    permissions: ['read:users', 'update:users', 'create:users', 'delete:users', 'read:analytics', 'manage:roles']
  },
  {
    email: 'companyadmin@mscandco.com',
    password: 'TestPassword123!',
    role: 'company_admin',
    brand: 'audio_msc',
    name: 'Company Admin User',
    permissions: ['read:users', 'update:users', 'read:analytics', 'manage:content']
  },
  {
    email: 'artist@mscandco.com',
    password: 'TestPassword123!',
    role: 'artist',
    brand: 'yhwh_msc',
    name: 'Artist User',
    permissions: ['read:own_content', 'create:own_content', 'update:own_content', 'read:own_analytics']
  },
  {
    email: 'distributor@mscandco.com',
    password: 'TestPassword123!',
    role: 'distribution_partner',
    brand: 'audio_msc',
    name: 'Distribution Partner User',
    permissions: ['read:partner_content', 'manage:partner_content', 'read:partner_analytics']
  }
];

async function getManagementToken() {
  try {
    console.log('🔑 Getting Auth0 Management API token...');
    
    const response = await axios.post(`https://${AUTH0_DOMAIN}/oauth/token`, {
      client_id: AUTH0_CLIENT_ID,
      client_secret: AUTH0_CLIENT_SECRET,
      audience: AUTH0_MANAGEMENT_AUDIENCE,
      grant_type: 'client_credentials'
    });

    console.log('✅ Management token obtained successfully');
    return response.data.access_token;
  } catch (error) {
    console.error('❌ Error getting management token:', error.response?.data || error.message);
    throw error;
  }
}

async function createUser(managementToken, userData) {
  try {
    console.log(`👤 Creating user: ${userData.email}`);
    
    const response = await axios.post(`https://${AUTH0_DOMAIN}/api/v2/users`, {
      email: userData.email,
      password: userData.password,
      name: userData.name,
      connection: 'Username-Password-Authentication',
      user_metadata: {
        role: userData.role,
        brand: userData.brand,
        permissions: userData.permissions
      },
      app_metadata: {
        role: userData.role,
        brand: userData.brand,
        permissions: userData.permissions
      }
    }, {
      headers: {
        'Authorization': `Bearer ${managementToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log(`✅ User created: ${userData.email} (${userData.role})`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 409) {
      console.log(`⚠️  User already exists: ${userData.email}`);
      return null;
    }
    console.error(`❌ Error creating user ${userData.email}:`, error.response?.data || error.message);
    throw error;
  }
}

async function updateUserMetadata(managementToken, userId, metadata) {
  try {
    console.log(`📝 Updating metadata for user: ${userId}`);
    
    const response = await axios.patch(`https://${AUTH0_DOMAIN}/api/v2/users/${userId}`, {
      user_metadata: metadata
    }, {
      headers: {
        'Authorization': `Bearer ${managementToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log(`✅ User metadata updated: ${userId}`);
    return response.data;
  } catch (error) {
    console.error(`❌ Error updating user metadata:`, error.response?.data || error.message);
    throw error;
  }
}

async function setupRolesAndUsers() {
  try {
    console.log('🚀 Setting up Auth0 roles and users for MSC & Co...');
    
    // Get management token
    const managementToken = await getManagementToken();
    
    // Create test users
    console.log('\n👥 Creating test users...');
    const createdUsers = [];
    
    for (const userData of TEST_USERS) {
      const user = await createUser(managementToken, userData);
      if (user) {
        createdUsers.push(user);
      }
    }
    
    console.log(`\n✅ Setup complete! Created ${createdUsers.length} test users:`);
    createdUsers.forEach(user => {
      console.log(`  - ${user.email} (${user.user_metadata?.role || 'unknown role'})`);
    });
    
    console.log('\n📋 Test User Credentials:');
    TEST_USERS.forEach(user => {
      console.log(`  Email: ${user.email}`);
      console.log(`  Password: ${user.password}`);
      console.log(`  Role: ${user.role}`);
      console.log(`  Brand: ${user.brand}`);
      console.log('  ---');
    });
    
    console.log('\n🎯 Next Steps:');
    console.log('1. Test login with these credentials at http://localhost:3001/login');
    console.log('2. Verify role-based access in the dashboard');
    console.log('3. Check that different users see appropriate content');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  }
}

// Run the setup
setupRolesAndUsers(); 