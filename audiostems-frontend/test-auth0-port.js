// Test Auth0 Port Configuration
const https = require('https');

console.log('=== Testing Auth0 Port Configuration ===');

// Test the Auth0 domain
const domain = 'dev-x2t2bdk6z050yxkr.uk.auth0.com';
const testUrl = `https://${domain}/.well-known/openid_configuration`;

console.log('Testing Auth0 domain:', domain);
console.log('Test URL:', testUrl);

https.get(testUrl, (res) => {
  console.log('Status Code:', res.statusCode);
  console.log('Headers:', res.headers);
  
  if (res.statusCode === 200) {
    console.log('✅ Auth0 domain is accessible');
  } else {
    console.log('❌ Auth0 domain is not accessible');
    console.log('Response:', res.statusMessage);
  }
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    if (res.statusCode === 200) {
      try {
        const config = JSON.parse(data);
        console.log('✅ Auth0 OpenID Configuration loaded');
        console.log('Authorization Endpoint:', config.authorization_endpoint);
        console.log('Token Endpoint:', config.token_endpoint);
        console.log('Userinfo Endpoint:', config.userinfo_endpoint);
      } catch (error) {
        console.log('❌ Error parsing Auth0 config:', error.message);
      }
    } else {
      console.log('❌ Auth0 domain returned:', res.statusCode, data);
    }
  });
}).on('error', (error) => {
  console.log('❌ Error connecting to Auth0:', error.message);
});

// Test local app
const http = require('http');
console.log('\n=== Testing Local App ===');
console.log('Testing local app on port 3001...');

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