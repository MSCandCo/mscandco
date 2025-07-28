// Test UK Auth0 Domain Configuration
const https = require('https');

console.log('=== Testing UK Auth0 Domain ===');

const domain = 'dev-x2t2bdk6z050yxkr.uk.auth0.com';
const clientId = 'MyeJlwvUbUH3fsCZiDElp45W3EfdZvac';

console.log('Domain:', domain);
console.log('Client ID:', clientId);

// Test different endpoints
const endpoints = [
  '/.well-known/openid_configuration',
  '/.well-known/jwks.json',
  '/oauth/token',
  '/authorize',
  '/userinfo'
];

console.log('\n=== Testing Auth0 Endpoints ===');

endpoints.forEach(endpoint => {
  const testUrl = `https://${domain}${endpoint}`;
  console.log(`Testing: ${endpoint}`);
  
  https.get(testUrl, (res) => {
    console.log(`  Status: ${res.statusCode}`);
    
    if (res.statusCode === 200) {
      console.log(`  ✅ ${endpoint} is accessible`);
    } else if (res.statusCode === 401 || res.statusCode === 403) {
      console.log(`  ⚠️  ${endpoint} exists but requires authentication`);
    } else {
      console.log(`  ❌ ${endpoint} returned ${res.statusCode}`);
    }
  }).on('error', (error) => {
    console.log(`  ❌ Error accessing ${endpoint}: ${error.message}`);
  });
});

// Test the authorization endpoint specifically
console.log('\n=== Testing Authorization Endpoint ===');
const authUrl = `https://${domain}/authorize?client_id=${clientId}&response_type=code&redirect_uri=http://localhost:3001&scope=openid profile email`;

https.get(authUrl, (res) => {
  console.log('Authorization endpoint status:', res.statusCode);
  
  if (res.statusCode === 302) {
    console.log('✅ Authorization endpoint is working (redirecting to login)');
    console.log('Location header:', res.headers.location);
  } else if (res.statusCode === 401 || res.statusCode === 403) {
    console.log('⚠️  Authorization endpoint exists but requires proper authentication');
  } else {
    console.log('❌ Authorization endpoint returned:', res.statusCode);
  }
}).on('error', (error) => {
  console.log('❌ Error accessing authorization endpoint:', error.message);
});

// Test local app
const http = require('http');
console.log('\n=== Testing Local App ===');

http.get('http://localhost:3001/login', (res) => {
  console.log('Local app status:', res.statusCode);
  if (res.statusCode === 200) {
    console.log('✅ Local app is running on port 3001');
  } else {
    console.log('❌ Local app error:', res.statusCode);
  }
}).on('error', (error) => {
  console.log('❌ Error connecting to local app:', error.message);
}); 