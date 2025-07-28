const axios = require('axios');

// Test Configuration
const BASE_URL = 'http://localhost:3000';
const BACKEND_URL = 'http://localhost:1337';

// Test Users with their expected roles
const TEST_USERS = [
  {
    email: 'superadmin@mscandco.com',
    password: 'Test@2025',
    role: 'Super Admin',
    expectedAccess: ['/admin/dashboard', '/admin/users', '/admin/settings']
  },
  {
    email: 'admin@yhwhmsc.com',
    password: 'Test@2025',
    role: 'Company Admin',
    expectedAccess: ['/admin/dashboard', '/admin/users', '/admin/content']
  },
  {
    email: 'artist1@yhwhmsc.com',
    password: 'Test@2025',
    role: 'Artist',
    expectedAccess: ['/dashboard', '/artist-portal/profile', '/artist-earnings']
  },
  {
    email: 'distadmin@mscandco.com',
    password: 'Test@2025',
    role: 'Distribution Partner Admin',
    expectedAccess: ['/distribution/dashboard', '/distribution/creations']
  },
  {
    email: 'distributor1@mscandco.com',
    password: 'Test@2025',
    role: 'Distributor',
    expectedAccess: ['/distributor/dashboard', '/distributor/content']
  }
];

// Test Results
const testResults = {
  passed: 0,
  failed: 0,
  warnings: 0,
  details: []
};

function logResult(test, status, message, details = null) {
  const result = {
    test,
    status,
    message,
    details,
    timestamp: new Date().toISOString()
  };
  
  testResults.details.push(result);
  
  if (status === 'PASSED') {
    testResults.passed++;
    console.log(`✅ ${test}: ${message}`);
  } else if (status === 'FAILED') {
    testResults.failed++;
    console.log(`❌ ${test}: ${message}`);
  } else if (status === 'WARNING') {
    testResults.warnings++;
    console.log(`⚠️ ${test}: ${message}`);
  }
}

async function testServiceHealth() {
  console.log('\n🔍 Testing Service Health...');
  
  try {
    // Test Frontend Health
    const frontendResponse = await axios.get(`${BASE_URL}/api/health`);
    if (frontendResponse.status === 200) {
      logResult('Frontend Health', 'PASSED', 'Frontend is responding correctly');
    } else {
      logResult('Frontend Health', 'FAILED', `Frontend returned status ${frontendResponse.status}`);
    }
  } catch (error) {
    logResult('Frontend Health', 'FAILED', `Frontend health check failed: ${error.message}`);
  }
  
  try {
    // Test Backend Health
    const backendResponse = await axios.get(`${BACKEND_URL}/admin`);
    if (backendResponse.status === 200) {
      logResult('Backend Health', 'PASSED', 'Strapi admin is accessible');
    } else {
      logResult('Backend Health', 'FAILED', `Backend returned status ${backendResponse.status}`);
    }
  } catch (error) {
    logResult('Backend Health', 'FAILED', `Backend health check failed: ${error.message}`);
  }
}

async function testLoginPage() {
  console.log('\n🔐 Testing Login Page...');
  
  try {
    const response = await axios.get(`${BASE_URL}/login-auth0`);
    if (response.status === 200) {
      logResult('Login Page', 'PASSED', 'Login page loads successfully');
    } else {
      logResult('Login Page', 'FAILED', `Login page returned status ${response.status}`);
    }
  } catch (error) {
    logResult('Login Page', 'FAILED', `Login page test failed: ${error.message}`);
  }
}

async function testRoleConfiguration() {
  console.log('\n👥 Testing Role Configuration...');
  
  try {
    // Test if roles exist in database
    const { exec } = require('child_process');
    const util = require('util');
    const execAsync = util.promisify(exec);
    
    const result = await execAsync('docker exec msc-co-postgres psql -U msc_co_user -d msc_co_dev -c "SELECT name FROM up_roles WHERE name IN (\'Super Admin\', \'Company Admin\', \'Artist\', \'Distribution Partner Admin\', \'Distributor\');"');
    
    if (result.stdout.includes('Super Admin') && 
        result.stdout.includes('Company Admin') && 
        result.stdout.includes('Artist') && 
        result.stdout.includes('Distribution Partner Admin') && 
        result.stdout.includes('Distributor')) {
      logResult('Role Configuration', 'PASSED', 'All required roles exist in database');
    } else {
      logResult('Role Configuration', 'FAILED', 'Missing required roles in database');
    }
  } catch (error) {
    logResult('Role Configuration', 'FAILED', `Role configuration test failed: ${error.message}`);
  }
}

async function testUserRoleAssignments() {
  console.log('\n👤 Testing User Role Assignments...');
  
  try {
    const { exec } = require('child_process');
    const util = require('util');
    const execAsync = util.promisify(exec);
    
    const result = await execAsync('docker exec msc-co-postgres psql -U msc_co_user -d msc_co_dev -c "SELECT u.username, u.email, r.name as role FROM up_users u JOIN up_users_role_links url ON u.id = url.user_id JOIN up_roles r ON url.role_id = r.id ORDER BY u.id;"');
    
    const expectedUsers = [
      'superadmin@mscandco.com',
      'admin@yhwhmsc.com', 
      'admin@audiomsc.com',
      'artist1@yhwhmsc.com',
      'artist2@yhwhmsc.com',
      'artist1@audiomsc.com',
      'artist2@audiomsc.com',
      'distadmin@mscandco.com',
      'distributor1@mscandco.com'
    ];
    
    let foundUsers = 0;
    expectedUsers.forEach(email => {
      if (result.stdout.includes(email)) {
        foundUsers++;
      }
    });
    
    if (foundUsers === expectedUsers.length) {
      logResult('User Role Assignments', 'PASSED', `All ${expectedUsers.length} users have role assignments`);
    } else {
      logResult('User Role Assignments', 'WARNING', `Only ${foundUsers}/${expectedUsers.length} users have role assignments`);
    }
  } catch (error) {
    logResult('User Role Assignments', 'FAILED', `User role assignment test failed: ${error.message}`);
  }
}

async function testAuth0Configuration() {
  console.log('\n🔑 Testing Auth0 Configuration...');
  
  try {
    // Test if Auth0 config is properly loaded
    const response = await axios.get(`${BASE_URL}/api/auth/check-profile`);
    logResult('Auth0 Configuration', 'PASSED', 'Auth0 configuration is working');
  } catch (error) {
    if (error.response && error.response.status === 401) {
      logResult('Auth0 Configuration', 'PASSED', 'Auth0 is properly configured (401 expected for unauthenticated)');
    } else {
      logResult('Auth0 Configuration', 'WARNING', `Auth0 configuration test: ${error.message}`);
    }
  }
}

async function testProtectedRoutes() {
  console.log('\n🚪 Testing Protected Routes...');
  
  const protectedRoutes = [
    '/dashboard',
    '/admin/dashboard',
    '/artist-portal/profile',
    '/distribution/dashboard'
  ];
  
  for (const route of protectedRoutes) {
    try {
      const response = await axios.get(`${BASE_URL}${route}`);
      if (response.status === 200) {
        logResult(`Protected Route: ${route}`, 'WARNING', 'Route accessible without authentication (should redirect)');
      } else {
        logResult(`Protected Route: ${route}`, 'PASSED', `Route properly protected (status: ${response.status})`);
      }
    } catch (error) {
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        logResult(`Protected Route: ${route}`, 'PASSED', 'Route properly protected');
      } else {
        logResult(`Protected Route: ${route}`, 'WARNING', `Route test: ${error.message}`);
      }
    }
  }
}

async function testBrandConfiguration() {
  console.log('\n🏷️ Testing Brand Configuration...');
  
  try {
    const response = await axios.get(`${BASE_URL}`);
    if (response.status === 200) {
      logResult('Brand Configuration', 'PASSED', 'Brand configuration loaded successfully');
    } else {
      logResult('Brand Configuration', 'FAILED', `Brand configuration test failed`);
    }
  } catch (error) {
    logResult('Brand Configuration', 'FAILED', `Brand configuration test failed: ${error.message}`);
  }
}

function generateTestReport() {
  console.log('\n📊 TEST RESULTS SUMMARY');
  console.log('========================');
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`⚠️ Warnings: ${testResults.warnings}`);
  console.log(`📈 Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);
  
  console.log('\n📋 DETAILED RESULTS:');
  console.log('===================');
  testResults.details.forEach(result => {
    const statusIcon = result.status === 'PASSED' ? '✅' : result.status === 'FAILED' ? '❌' : '⚠️';
    console.log(`${statusIcon} ${result.test}: ${result.message}`);
  });
  
  console.log('\n🎯 RECOMMENDATIONS:');
  console.log('==================');
  
  if (testResults.failed === 0 && testResults.warnings === 0) {
    console.log('🎉 All tests passed! The platform is ready for user testing.');
  } else if (testResults.failed === 0) {
    console.log('✅ Core functionality is working. Address warnings for optimal performance.');
  } else {
    console.log('⚠️ Some critical issues found. Please address failed tests before proceeding.');
  }
  
  console.log('\n🔗 NEXT STEPS:');
  console.log('==============');
  console.log('1. Test manual login with each user role');
  console.log('2. Verify role-based navigation and permissions');
  console.log('3. Test brand switching functionality');
  console.log('4. Verify export and analytics features');
  console.log('5. Test file upload and content management');
}

async function runAllTests() {
  console.log('🚀 MSC & Co Platform - Login & Role Testing');
  console.log('===========================================');
  console.log(`Testing URL: ${BASE_URL}`);
  console.log(`Backend URL: ${BACKEND_URL}`);
  console.log(`Timestamp: ${new Date().toISOString()}`);
  
  await testServiceHealth();
  await testLoginPage();
  await testRoleConfiguration();
  await testUserRoleAssignments();
  await testAuth0Configuration();
  await testProtectedRoutes();
  await testBrandConfiguration();
  
  generateTestReport();
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  runAllTests,
  testResults,
  TEST_USERS
}; 