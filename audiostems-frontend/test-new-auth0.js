// Test New Auth0 Configuration
const https = require('https');

console.log('=== Testing New Auth0 Configuration ===');

// Test the Auth0 domain with new credentials
const domain = 'dev-x2t2bdk6z050yxkr.uk.auth0.com';
const clientId = 'MyeJlwvUbUH3fsCZiDElp45W3EfdZvac';
const testUrl = `https://${domain}/.well-known/openid_configuration`;

console.log('Domain:', domain);
console.log('Client ID:', clientId);
console.log('Test URL:', testUrl);

https.get(testUrl, (res) => {
  console.log('Status Code:', res.statusCode);
  
  if (res.statusCode === 200) {
    console.log('✅ Auth0 domain is accessible');
  } else {
    console.log('❌ Auth0 domain returned:', res.statusCode);
  }
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    if (res.statusCode === 200) {
      try {
        const config = JSON.parse(data);
        console.log('✅ Auth0 OpenID Configuration loaded successfully');
        console.log('Authorization Endpoint:', config.authorization_endpoint);
        console.log('Token Endpoint:', config.token_endpoint);
        console.log('Userinfo Endpoint:', config.userinfo_endpoint);
        
        // Test the authorization endpoint
        const authUrl = `${config.authorization_endpoint}?client_id=${clientId}&response_type=code&redirect_uri=http://localhost:3001&scope=openid profile email`;
        console.log('\n=== Test Authorization URL ===');
        console.log('Auth URL (first 100 chars):', authUrl.substring(0, 100) + '...');
        
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