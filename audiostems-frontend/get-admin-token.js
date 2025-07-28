const axios = require('axios');

// Configuration
const STRAPI_URL = 'http://localhost:1337';

async function checkAdminStatus() {
  try {
    console.log('🔍 Checking Strapi admin status...');
    
    // Check if admin exists
    const initResponse = await axios.get(`${STRAPI_URL}/admin/init`);
    console.log('✅ Admin panel accessible');
    console.log('Admin status:', initResponse.data);
    
    return true;
  } catch (error) {
    console.error('❌ Cannot access admin panel:', error.message);
    return false;
  }
}

async function tryCommonAdminCredentials() {
  const commonCredentials = [
    { email: 'info@audiostems.co.uk', password: 'Test@2025' },
    { email: 'info@audiostems.co.uk', password: 'admin' },
    { email: 'info@audiostems.co.uk', password: 'password' },
    { email: 'admin@audiostems.co.uk', password: 'Test@2025' },
    { email: 'admin@audiostems.co.uk', password: 'admin' },
    { email: 'admin@mscandco.com', password: 'Test@2025' },
    { email: 'admin@mscandco.com', password: 'admin' }
  ];
  
  console.log('🔐 Trying common admin credentials...');
  
  for (const cred of commonCredentials) {
    try {
      console.log(`Trying: ${cred.email} / ${cred.password}`);
      const response = await axios.post(`${STRAPI_URL}/admin/login`, cred);
      console.log('✅ SUCCESS! Found working credentials:');
      console.log(`Email: ${cred.email}`);
      console.log(`Password: ${cred.password}`);
      console.log(`Token: ${response.data.data.token.substring(0, 20)}...`);
      return { success: true, credentials: cred, token: response.data.data.token };
    } catch (error) {
      console.log(`❌ Failed: ${cred.email} / ${cred.password}`);
    }
  }
  
  console.log('❌ No common credentials worked');
  return { success: false };
}

async function getBrowserToken() {
  console.log('\n🌐 BROWSER TOKEN EXTRACTION GUIDE:');
  console.log('====================================');
  console.log('1. Open your browser and go to http://localhost:1337/admin');
  console.log('2. Log in with your admin credentials');
  console.log('3. Open Developer Tools (F12)');
  console.log('4. Go to Application/Storage tab');
  console.log('5. Look for "strapi_jwt" in Local Storage or Cookies');
  console.log('6. Copy the token value');
  console.log('7. Use it in the create-all-test-users.js script');
  console.log('\nAlternative: Check Network tab for Authorization headers');
}

async function main() {
  console.log('🚀 MSC & Co Admin Token Helper\n');
  
  // Check admin status
  const adminAccessible = await checkAdminStatus();
  
  if (!adminAccessible) {
    console.log('❌ Cannot access admin panel. Check if Strapi is running.');
    return;
  }
  
  // Try common credentials
  const credentialResult = await tryCommonAdminCredentials();
  
  if (credentialResult.success) {
    console.log('\n🎉 GREAT! We found working admin credentials!');
    console.log('You can now update the create-all-test-users.js script with:');
    console.log(`ADMIN_EMAIL = '${credentialResult.credentials.email}'`);
    console.log(`ADMIN_PASSWORD = '${credentialResult.credentials.password}'`);
    
    // Update the script automatically
    const fs = require('fs');
    const scriptPath = './create-all-test-users.js';
    
    if (fs.existsSync(scriptPath)) {
      let scriptContent = fs.readFileSync(scriptPath, 'utf8');
      scriptContent = scriptContent.replace(
        /const ADMIN_EMAIL = '[^']*'/,
        `const ADMIN_EMAIL = '${credentialResult.credentials.email}'`
      );
      scriptContent = scriptContent.replace(
        /const ADMIN_PASSWORD = '[^']*'/,
        `const ADMIN_PASSWORD = '${credentialResult.credentials.password}'`
      );
      
      fs.writeFileSync(scriptPath, scriptContent);
      console.log('\n✅ Updated create-all-test-users.js with working credentials!');
      console.log('Now run: node create-all-test-users.js');
    }
  } else {
    console.log('\n❌ No common credentials worked.');
    console.log('Please provide your actual admin credentials or follow the browser guide below.');
    
    // Show browser token extraction guide
    await getBrowserToken();
  }
}

// Run the script
if (require.main === module) {
  main()
    .then(() => {
      console.log('\n🎯 Next steps:');
      console.log('1. If credentials were found, run: node create-all-test-users.js');
      console.log('2. If not, follow the browser guide above to get your token');
      console.log('3. Or create users manually using the manual-user-creation-guide.md');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 Script failed:', error.message);
      process.exit(1);
    });
}

module.exports = { checkAdminStatus, tryCommonAdminCredentials, getBrowserToken }; 