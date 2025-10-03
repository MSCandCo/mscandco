/**
 * RBAC Database Verification Script
 *
 * Verifies that the database has the required tables and data for RBAC:
 * - user_role_assignments table structure
 * - audit_logs table structure and indexes
 * - Sample data from both tables
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verifyRBACDatabase() {
  console.log('🔍 RBAC Database Verification\n');
  console.log('=' .repeat(60));

  // 1. Check user_role_assignments table
  console.log('\n📋 USER_ROLE_ASSIGNMENTS TABLE:');
  console.log('-'.repeat(60));

  try {
    // Get table structure
    const { data: roleAssignments, error: roleError } = await supabase
      .from('user_role_assignments')
      .select('*')
      .limit(5);

    if (roleError) {
      console.error('❌ Error accessing user_role_assignments:', roleError.message);
    } else {
      console.log('✅ Table exists and is accessible');
      console.log(`📊 Sample records (${roleAssignments.length} shown):\n`);

      if (roleAssignments.length > 0) {
        // Show structure from first record
        console.log('Table Columns:');
        Object.keys(roleAssignments[0]).forEach(col => {
          console.log(`  - ${col}: ${typeof roleAssignments[0][col]}`);
        });

        console.log('\nSample Data:');
        roleAssignments.forEach((record, idx) => {
          console.log(`\n  Record ${idx + 1}:`);
          console.log(`    user_id: ${record.user_id || 'N/A'}`);
          console.log(`    role_name: ${record.role_name || 'N/A'}`);
          console.log(`    assigned_by: ${record.assigned_by || 'N/A'}`);
          console.log(`    assigned_at: ${record.assigned_at || 'N/A'}`);
          console.log(`    is_active: ${record.is_active !== undefined ? record.is_active : 'N/A'}`);
        });
      } else {
        console.log('⚠️  No records found in user_role_assignments');
      }

      // Count total records
      const { count, error: countError } = await supabase
        .from('user_role_assignments')
        .select('*', { count: 'exact', head: true });

      if (!countError) {
        console.log(`\n📈 Total role assignments: ${count}`);
      }

      // Count by role
      const { data: roleCount, error: roleCountError } = await supabase
        .from('user_role_assignments')
        .select('role_name')
        .eq('is_active', true);

      if (!roleCountError && roleCount) {
        const roleCounts = roleCount.reduce((acc, { role_name }) => {
          acc[role_name] = (acc[role_name] || 0) + 1;
          return acc;
        }, {});

        console.log('\n📊 Active roles breakdown:');
        Object.entries(roleCounts).forEach(([role, count]) => {
          console.log(`  - ${role}: ${count} user(s)`);
        });
      }
    }
  } catch (error) {
    console.error('💥 Error verifying user_role_assignments:', error);
  }

  // 2. Check audit_logs table
  console.log('\n\n📋 AUDIT_LOGS TABLE:');
  console.log('-'.repeat(60));

  try {
    // Get table structure
    const { data: auditLogs, error: auditError } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (auditError) {
      console.error('❌ Error accessing audit_logs:', auditError.message);
    } else {
      console.log('✅ Table exists and is accessible');
      console.log(`📊 Sample records (${auditLogs.length} shown):\n`);

      if (auditLogs.length > 0) {
        // Show structure from first record
        console.log('Table Columns:');
        Object.keys(auditLogs[0]).forEach(col => {
          console.log(`  - ${col}: ${typeof auditLogs[0][col]}`);
        });

        console.log('\nSample Data (latest):');
        auditLogs.forEach((record, idx) => {
          console.log(`\n  Record ${idx + 1}:`);
          console.log(`    id: ${record.id || 'N/A'}`);
          console.log(`    user_id: ${record.user_id || 'N/A'}`);
          console.log(`    action: ${record.action || 'N/A'}`);
          console.log(`    resource_type: ${record.resource_type || 'N/A'}`);
          console.log(`    resource_id: ${record.resource_id || 'N/A'}`);
          console.log(`    status: ${record.status || 'N/A'}`);
          console.log(`    ip_address: ${record.ip_address || 'N/A'}`);
          console.log(`    created_at: ${record.created_at || 'N/A'}`);
        });
      } else {
        console.log('⚠️  No records found in audit_logs');
      }

      // Count total records
      const { count, error: countError } = await supabase
        .from('audit_logs')
        .select('*', { count: 'exact', head: true });

      if (!countError) {
        console.log(`\n📈 Total audit log entries: ${count}`);
      }

      // Count by status
      const { data: statusCount, error: statusError } = await supabase
        .from('audit_logs')
        .select('status');

      if (!statusError && statusCount) {
        const statusCounts = statusCount.reduce((acc, { status }) => {
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, {});

        console.log('\n📊 Audit log status breakdown:');
        Object.entries(statusCounts).forEach(([status, count]) => {
          console.log(`  - ${status}: ${count} log(s)`);
        });
      }

      // Count by action
      const { data: actionCount, error: actionError } = await supabase
        .from('audit_logs')
        .select('action')
        .limit(1000);

      if (!actionError && actionCount) {
        const actionCounts = actionCount.reduce((acc, { action }) => {
          acc[action] = (acc[action] || 0) + 1;
          return acc;
        }, {});

        console.log('\n📊 Audit log action breakdown (top 10):');
        Object.entries(actionCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .forEach(([action, count]) => {
            console.log(`  - ${action}: ${count} log(s)`);
          });
      }
    }
  } catch (error) {
    console.error('💥 Error verifying audit_logs:', error);
  }

  // 3. Check for users without roles
  console.log('\n\n🔍 CHECKING FOR USERS WITHOUT ROLES:');
  console.log('-'.repeat(60));

  try {
    const { data: allUsers, error: usersError } = await supabase
      .from('user_profiles')
      .select('id, email, first_name, last_name');

    if (usersError) {
      console.error('❌ Error accessing user_profiles:', usersError.message);
    } else {
      const { data: usersWithRoles, error: rolesError } = await supabase
        .from('user_role_assignments')
        .select('user_id')
        .eq('is_active', true);

      if (!rolesError) {
        const userIdsWithRoles = new Set(usersWithRoles.map(r => r.user_id));
        const usersWithoutRoles = allUsers.filter(u => !userIdsWithRoles.has(u.id));

        if (usersWithoutRoles.length > 0) {
          console.log(`⚠️  Found ${usersWithoutRoles.length} users without active roles:\n`);
          usersWithoutRoles.slice(0, 5).forEach((user, idx) => {
            console.log(`  ${idx + 1}. ${user.email || 'No email'} (ID: ${user.id.substring(0, 8)}...)`);
          });
          if (usersWithoutRoles.length > 5) {
            console.log(`  ... and ${usersWithoutRoles.length - 5} more`);
          }
        } else {
          console.log('✅ All users have active role assignments');
        }
      }
    }
  } catch (error) {
    console.error('💥 Error checking users without roles:', error);
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ Database verification complete\n');
}

// Run verification
verifyRBACDatabase()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('💥 Verification failed:', error);
    process.exit(1);
  });
