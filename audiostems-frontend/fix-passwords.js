const bcrypt = require('bcryptjs');
const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

// Test users with simple passwords
const TEST_USERS = [
  {
    email: 'admin@test.com',
    password: 'password123',
    role: 'Super Admin'
  },
  {
    email: 'artist@test.com',
    password: 'password123', 
    role: 'Artist'
  }
];

async function hashPassword(password) {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

async function createOrUpdateUser(userData) {
  try {
    console.log(`👤 Creating/updating user: ${userData.email}`);
    
    const hashedPassword = await hashPassword(userData.password);
    
    // Check if user exists
    const checkResult = await execAsync(`docker exec msc-co-postgres psql -U msc_co_user -d msc_co_dev -c "SELECT id FROM up_users WHERE email = '${userData.email}';"`);
    
    if (checkResult.stdout.includes('(0 rows)')) {
      // User doesn't exist, create new user
      const insertSql = `
        INSERT INTO up_users (
          username, email, password, provider, confirmed, blocked, 
          created_at, updated_at
        ) VALUES (
          '${userData.email.split('@')[0]}', '${userData.email}', '${hashedPassword}',
          'local', true, false, NOW(), NOW()
        );
      `;
      await execAsync(`docker exec msc-co-postgres psql -U msc_co_user -d msc_co_dev -c "${insertSql}"`);
      console.log(`✅ Created new user: ${userData.email}`);
    } else {
      // User exists, update password
      const updateSql = `
        UPDATE up_users 
        SET password = '${hashedPassword}', updated_at = NOW()
        WHERE email = '${userData.email}';
      `;
      await execAsync(`docker exec msc-co-postgres psql -U msc_co_user -d msc_co_dev -c "${updateSql}"`);
      console.log(`✅ Updated password for: ${userData.email}`);
    }

    // Get the user ID
    const userResult = await execAsync(`docker exec msc-co-postgres psql -U msc_co_user -d msc_co_dev -c "SELECT id FROM up_users WHERE email = '${userData.email}';"`);
    const userId = userResult.stdout.match(/\d+/)?.[0];

    if (userId) {
      // Get the role ID
      const roleResult = await execAsync(`docker exec msc-co-postgres psql -U msc_co_user -d msc_co_dev -c "SELECT id FROM up_roles WHERE name = '${userData.role}';"`);
      const roleId = roleResult.stdout.match(/\d+/)?.[0];

      if (roleId) {
        // Assign role to user
        const roleSql = `
          INSERT INTO up_users_role_links (user_id, role_id)
          VALUES (${userId}, ${roleId})
          ON CONFLICT DO NOTHING;
        `;
        await execAsync(`docker exec msc-co-postgres psql -U msc_co_user -d msc_co_dev -c "${roleSql}"`);
        console.log(`✅ Assigned role ${userData.role} to ${userData.email}`);
      }
    }

  } catch (error) {
    console.log(`❌ Error with user ${userData.email}: ${error.message}`);
  }
}

async function testAuthentication(email, password) {
  try {
    console.log(`🔐 Testing authentication for: ${email}`);
    
    const response = await fetch('http://localhost:1337/api/auth/local', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        identifier: email,
        password: password
      })
    });

    const data = await response.json();
    
    if (data.jwt) {
      console.log(`✅ Authentication successful for: ${email}`);
      return true;
    } else {
      console.log(`❌ Authentication failed for: ${email}: ${data.error?.message || 'Unknown error'}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Authentication test error for ${email}: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🚀 Fixing User Passwords...\n');

  // Create/update test users
  for (const userData of TEST_USERS) {
    await createOrUpdateUser(userData);
  }

  console.log('\n🔐 Testing Authentication...\n');

  // Test authentication
  for (const userData of TEST_USERS) {
    await testAuthentication(userData.email, userData.password);
  }

  console.log('\n📋 WORKING TEST CREDENTIALS:');
  console.log('============================');
  TEST_USERS.forEach(user => {
    console.log(`Email: ${user.email}`);
    console.log(`Password: ${user.password}`);
    console.log(`Role: ${user.role}`);
    console.log('---');
  });

  console.log('\n🔗 Test URLs:');
  console.log('- Frontend: http://localhost:3000');
  console.log('- Login: http://localhost:3000/login');
  console.log('- Strapi Admin: http://localhost:1337/admin');

  console.log('\n🎉 Password fix completed!');
  console.log('\n💡 IMPORTANT: Use these credentials to test the login system!');
}

main().catch(console.error); 