const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

// Role assignments for test users
const userRoleAssignments = [
  {
    email: 'admin@yhwhmsc.com',
    roleName: 'Company Admin',
    roleId: 4
  },
  {
    email: 'admin@audiomsc.com',
    roleName: 'Company Admin',
    roleId: 4
  },
  {
    email: 'artist1@yhwhmsc.com',
    roleName: 'Artist',
    roleId: 5
  },
  {
    email: 'artist2@yhwhmsc.com',
    roleName: 'Artist',
    roleId: 5
  },
  {
    email: 'artist1@audiomsc.com',
    roleName: 'Artist',
    roleId: 5
  },
  {
    email: 'artist2@audiomsc.com',
    roleName: 'Artist',
    roleId: 5
  },
  {
    email: 'distadmin@mscandco.com',
    roleName: 'Distribution Partner Admin',
    roleId: 6
  },
  {
    email: 'distributor1@mscandco.com',
    roleName: 'Distributor',
    roleId: 7
  }
];

async function assignRoleToUser(userEmail, roleId) {
  try {
    console.log(`🔐 Assigning role to user: ${userEmail}`);
    
    // First get the user ID
    const getUserSql = `SELECT id FROM admin_users WHERE email = '${userEmail}';`;
    const getUserCommand = `docker exec msc-co-postgres psql -U msc_co_user -d msc_co_dev -t -c "${getUserSql}"`;
    const { stdout: userResult } = await execAsync(getUserCommand);
    
    const userId = userResult.trim();
    if (!userId) {
      console.log(`❌ User not found: ${userEmail}`);
      return;
    }
    
    // Check if role is already assigned
    const checkRoleSql = `SELECT COUNT(*) FROM admin_users_roles_links WHERE user_id = ${userId} AND role_id = ${roleId};`;
    const checkRoleCommand = `docker exec msc-co-postgres psql -U msc_co_user -d msc_co_dev -t -c "${checkRoleSql}"`;
    const { stdout: checkResult } = await execAsync(checkRoleCommand);
    
    const roleCount = parseInt(checkResult.trim());
    if (roleCount > 0) {
      console.log(`✅ Role already assigned to: ${userEmail}`);
      return;
    }
    
    // Assign the role
    const assignRoleSql = `INSERT INTO admin_users_roles_links (user_id, role_id) VALUES (${userId}, ${roleId});`;
    const assignRoleCommand = `docker exec msc-co-postgres psql -U msc_co_user -d msc_co_dev -c "${assignRoleSql}"`;
    await execAsync(assignRoleCommand);
    
    console.log(`✅ Role assigned to: ${userEmail}`);
  } catch (error) {
    console.log(`❌ Error assigning role to ${userEmail}: ${error.message}`);
  }
}

async function main() {
  console.log('🚀 Assigning roles to all test users...\n');

  for (const assignment of userRoleAssignments) {
    await assignRoleToUser(assignment.email, assignment.roleId);
  }

  console.log('\n🎉 Role assignment completed!');
  console.log('\n📋 Role assignments:');
  userRoleAssignments.forEach(assignment => {
    console.log(`- ${assignment.email} → ${assignment.roleName}`);
  });
  
  console.log('\n🔍 Verifying role assignments...');
  
  // Verify all role assignments
  const verifySql = `
    SELECT au.email, ar.name as role_name 
    FROM admin_users_roles_links aul 
    JOIN admin_users au ON aul.user_id = au.id 
    JOIN admin_roles ar ON aul.role_id = ar.id 
    ORDER BY au.email;
  `;
  
  const verifyCommand = `docker exec msc-co-postgres psql -U msc_co_user -d msc_co_dev -c "${verifySql}"`;
  const { stdout: verifyResult } = await execAsync(verifyCommand);
  
  console.log('\n📊 Current role assignments:');
  console.log(verifyResult);
}

main().catch(console.error); 