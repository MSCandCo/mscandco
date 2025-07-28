const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);
const bcrypt = require('bcryptjs');

// Users to update with proper password hashing
const users = [
  { email: 'superadmin@mscandco.com', password: 'Test@2025' },
  { email: 'admin@yhwhmsc.com', password: 'Test@2025' },
  { email: 'admin@audiomsc.com', password: 'Test@2025' },
  { email: 'artist1@yhwhmsc.com', password: 'Test@2025' },
  { email: 'artist2@yhwhmsc.com', password: 'Test@2025' },
  { email: 'artist1@audiomsc.com', password: 'Test@2025' },
  { email: 'artist2@audiomsc.com', password: 'Test@2025' },
  { email: 'distadmin@mscandco.com', password: 'Test@2025' },
  { email: 'distributor1@mscandco.com', password: 'Test@2025' }
];

async function hashPassword(password) {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

async function updateUserPassword(userData) {
  try {
    console.log(`🔐 Updating password for: ${userData.email}`);
    
    const hashedPassword = await hashPassword(userData.password);
    
    // Escape single quotes in the hashed password
    const escapedPassword = hashedPassword.replace(/'/g, "''");
    
    const sql = `
      UPDATE up_users 
      SET password = '${escapedPassword}'
      WHERE email = '${userData.email}';
    `;

    const command = `docker exec msc-co-postgres psql -U msc_co_user -d msc_co_dev -c "${sql}"`;
    await execAsync(command);

    console.log(`✅ Password updated for: ${userData.email}`);
  } catch (error) {
    console.log(`❌ Error updating password for ${userData.email}: ${error.message}`);
  }
}

async function main() {
  console.log('🚀 Updating user passwords for Strapi authentication...\n');

  for (const userData of users) {
    await updateUserPassword(userData);
  }

  console.log('\n🎉 Password updates completed!');
  console.log('\n📋 Users with updated passwords:');
  users.forEach(user => {
    console.log(`- ${user.email} (password: ${user.password})`);
  });
  
  console.log('\n🔍 Testing authentication...');
  
  // Test authentication with one user
  const testUser = users[0];
  console.log(`\n🧪 Testing login with: ${testUser.email}`);
  
  const testCommand = `curl -X POST http://localhost:1337/api/auth/local -H "Content-Type: application/json" -d '{"identifier":"${testUser.email}","password":"${testUser.password}"}'`;
  
  try {
    const { stdout } = await execAsync(testCommand);
    if (stdout.includes('"jwt"')) {
      console.log('✅ Authentication test successful!');
    } else {
      console.log('❌ Authentication test failed:', stdout);
    }
  } catch (error) {
    console.log('❌ Authentication test failed:', error.message);
  }
}

main().catch(console.error); 