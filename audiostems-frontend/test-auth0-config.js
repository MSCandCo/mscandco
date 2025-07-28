// Test Auth0 Configuration
const { auth0Config } = require('./lib/auth0-config.js');

console.log('=== Auth0 Configuration Test ===');
console.log('Domain:', auth0Config.domain);
console.log('Client ID:', auth0Config.clientId);
console.log('Audience:', auth0Config.authorizationParams.audience);
console.log('Redirect URI:', auth0Config.authorizationParams.redirect_uri);
console.log('Scope:', auth0Config.authorizationParams.scope);

// Check environment variables
console.log('\n=== Environment Variables ===');
console.log('NEXT_PUBLIC_AUTH0_DOMAIN:', process.env.NEXT_PUBLIC_AUTH0_DOMAIN);
console.log('NEXT_PUBLIC_AUTH0_CLIENT_ID:', process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID);
console.log('NEXT_PUBLIC_AUTH0_AUDIENCE:', process.env.NEXT_PUBLIC_AUTH0_AUDIENCE);

// Test Auth0 domain connectivity
const https = require('https');
const url = `https://${auth0Config.domain}/.well-known/openid_configuration`;

console.log('\n=== Testing Auth0 Domain Connectivity ===');
console.log('Testing URL:', url);

https.get(url, (res) => {
  console.log('Status:', res.statusCode);
  console.log('Headers:', res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const config = JSON.parse(data);
      console.log('Auth0 OpenID Configuration loaded successfully');
      console.log('Issuer:', config.issuer);
      console.log('Authorization Endpoint:', config.authorization_endpoint);
    } catch (error) {
      console.error('Error parsing Auth0 configuration:', error.message);
    }
  });
}).on('error', (error) => {
  console.error('Error connecting to Auth0:', error.message);
}); 