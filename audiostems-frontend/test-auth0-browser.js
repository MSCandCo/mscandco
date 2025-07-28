// Test Auth0 Browser Configuration
const { auth0Config } = require('./lib/auth0-config.js');

console.log('=== Auth0 Browser Configuration Test ===');
console.log('Domain:', auth0Config.domain);
console.log('Client ID:', auth0Config.clientId);
console.log('Redirect URI:', auth0Config.authorizationParams.redirect_uri);
console.log('Audience:', auth0Config.authorizationParams.audience);
console.log('Scope:', auth0Config.authorizationParams.scope);

// Simulate the authorization URL that would be generated
const authUrl = `https://${auth0Config.domain}/authorize?` +
  `client_id=${auth0Config.clientId}&` +
  `response_type=code&` +
  `redirect_uri=${encodeURIComponent(auth0Config.authorizationParams.redirect_uri)}&` +
  `scope=${encodeURIComponent(auth0Config.authorizationParams.scope)}&` +
  `audience=${encodeURIComponent(auth0Config.authorizationParams.audience)}`;

console.log('\n=== Generated Authorization URL ===');
console.log('URL:', authUrl);

// Test if the authorization URL is accessible
const https = require('https');
const url = require('url');

const parsedUrl = url.parse(authUrl);
const options = {
  hostname: parsedUrl.hostname,
  port: parsedUrl.port || 443,
  path: parsedUrl.path,
  method: 'GET',
  headers: {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
  }
};

console.log('\n=== Testing Authorization URL ===');
https.request(options, (res) => {
  console.log('Status Code:', res.statusCode);
  console.log('Headers:', res.headers);
  
  if (res.statusCode === 302) {
    console.log('✅ Authorization URL is working (redirecting to login)');
    console.log('Location:', res.headers.location);
  } else if (res.statusCode === 400) {
    console.log('⚠️  Authorization URL exists but has validation errors');
  } else {
    console.log('❌ Authorization URL returned:', res.statusCode);
  }
}).on('error', (error) => {
  console.log('❌ Error testing authorization URL:', error.message);
}).end();

// Test local app login page
const http = require('http');
console.log('\n=== Testing Login Page ===');

http.get('http://localhost:3001/login', (res) => {
  console.log('Login page status:', res.statusCode);
  if (res.statusCode === 200) {
    console.log('✅ Login page is accessible');
  } else {
    console.log('❌ Login page error:', res.statusCode);
  }
}).on('error', (error) => {
  console.log('❌ Error accessing login page:', error.message);
}); 