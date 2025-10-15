/**
 * Batch Fix Permission Pages
 *
 * Automatically applies server-side permission checks to all pages
 * that currently use client-side checks only.
 */

const fs = require('fs');
const path = require('path');

// Permission mapping from analysis
const PERMISSION_MAP = {
  'admin/earningsmanagement.js': 'finance:earnings_management:read',
  'admin/splitconfiguration.js': 'finance:split_configuration:read',
  'admin/platformanalytics.js': 'analytics:platform_analytics:read',
  'admin/assetlibrary.js': 'content:asset_library:read',
  'admin/masterroster.js': 'users_access:master_roster:read',
  'admin/permissions.js': 'users_access:permissions_roles:read',
  'admin/analyticsmanagement.js': 'analytics:analytics_management:read',
  'admin/requests.js': 'analytics:requests:read',
  'admin/messages.js': 'platform_messages:read',
  'admin/settings.js': '*:*:*',
  'admin/profile/index.js': '*:*:*',
  'artist/analytics.js': 'analytics:access',
  'artist/earnings.js': 'earnings:access',
  'artist/messages.js': 'messages:access',
  'artist/releases.js': 'releases:access',
  'artist/roster.js': 'roster:access',
  'artist/settings.js': 'settings:access',
  'labeladmin/analytics.js': 'analytics:access',
  'labeladmin/artists.js': 'roster:access',
  'labeladmin/earnings.js': 'earnings:access',
  'labeladmin/messages.js': 'messages:access',
  'labeladmin/profile/index.js': 'profile:read',
  'labeladmin/releases.js': 'releases:access',
  'labeladmin/roster.js': 'roster:access',
  'labeladmin/settings.js': 'settings:access',
  'distribution/queue.js': 'distribution:read:partner',
  'distribution/revisions.js': 'distribution:read:partner',
  'distributionpartner/settings.js': 'distribution:settings:access',
  'superadmin/dashboard.js': 'user:read:any',
  'superadmin/messages.js': 'messages:access'
};

function applyServerSideCheck(filePath, permission) {
  const content = fs.readFileSync(filePath, 'utf8');

  // Check if already has server-side check
  if (content.includes('requirePermission') || content.includes('getServerSideProps')) {
    console.log(`  ⏭️  Skipping ${filePath} - already has server-side check`);
    return false;
  }

  let newContent = content;

  // Step 1: Remove usePermissions import
  newContent = newContent.replace(
    /import\s+usePermissions\s+from\s+['"]@\/hooks\/usePermissions['"];?\n/g,
    ''
  );

  // Step 2: Add requirePermission import
  if (!newContent.includes('requirePermission')) {
    // Find the supabase import line and add after it
    const supabaseImportMatch = newContent.match(/(import.*from\s+['"]@\/lib\/supabase['"];?)/);
    if (supabaseImportMatch) {
      newContent = newContent.replace(
        supabaseImportMatch[0],
        `${supabaseImportMatch[0]}\nimport { requirePermission } from '@/lib/serverSidePermissions';`
      );
    }
  }

  // Step 3: Add getServerSideProps before export default
  const getServerSidePropsCode = `
// Server-side permission check BEFORE page renders
export async function getServerSideProps(context) {
  const auth = await requirePermission(context, '${permission}');

  if (auth.redirect) {
    return { redirect: auth.redirect };
  }

  return { props: { user: auth.user } };
}

`;

  // Find export default and insert getServerSideProps before it
  const exportDefaultMatch = newContent.match(/export\s+default\s+function/);
  if (exportDefaultMatch) {
    const insertIndex = newContent.indexOf(exportDefaultMatch[0]);
    newContent = newContent.slice(0, insertIndex) + getServerSidePropsCode + newContent.slice(insertIndex);
  }

  // Step 4: Remove usePermissions hook usage
  newContent = newContent.replace(
    /const\s+\{\s*hasPermission,\s*loading:\s*permissionsLoading\s*\}\s*=\s*usePermissions\(\);?\n?/g,
    ''
  );

  // Step 5: Remove client-side permission check useEffect
  newContent = newContent.replace(
    /\/\/\s*Check permission[^\n]*\n\s*useEffect\(\(\)\s*=>\s*\{[^}]*hasPermission[^}]*\}, \[[^\]]*permissionsLoading[^\]]*\]\);?\n?/gs,
    '// Permission already checked server-side\n'
  );

  // Alternative pattern for permission check
  newContent = newContent.replace(
    /useEffect\(\(\)\s*=>\s*\{\s*if\s*\(!permissionsLoading\s+&&\s+user\s+&&\s+!hasPermission\([^)]+\)\)\s*\{[^}]*\}\s*\},\s*\[[^\]]*\]\);?\n?/gs,
    ''
  );

  // Step 6: Update other useEffect that checks permissionsLoading
  newContent = newContent.replace(
    /if\s*\(!permissionsLoading\s+&&\s+user\s+&&\s+hasPermission\([^)]+\)\)\s*\{/g,
    'if (user) {'
  );

  newContent = newContent.replace(
    /\}, \[user, permissionsLoading\]/g,
    '}, [user]'
  );

  // Write back to file
  fs.writeFileSync(filePath, newContent, 'utf8');
  return true;
}

function main() {
  console.log('🔧 Batch fixing permission pages...\n');

  const PAGES_DIR = path.join(__dirname, 'pages');
  let fixedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  Object.entries(PERMISSION_MAP).forEach(([relativePath, permission]) => {
    const filePath = path.join(PAGES_DIR, relativePath);

    if (!fs.existsSync(filePath)) {
      console.log(`  ❌ File not found: ${relativePath}`);
      errorCount++;
      return;
    }

    console.log(`\n📝 Processing: ${relativePath}`);
    console.log(`   Permission: ${permission}`);

    try {
      const wasFixed = applyServerSideCheck(filePath, permission);
      if (wasFixed) {
        console.log(`  ✅ Fixed!`);
        fixedCount++;
      } else {
        skippedCount++;
      }
    } catch (error) {
      console.log(`  ❌ Error: ${error.message}`);
      errorCount++;
    }
  });

  console.log('\n' + '='.repeat(80));
  console.log('SUMMARY');
  console.log('='.repeat(80));
  console.log(`✅ Fixed: ${fixedCount}`);
  console.log(`⏭️  Skipped: ${skippedCount} (already fixed)`);
  console.log(`❌ Errors: ${errorCount}`);
  console.log(`📊 Total: ${Object.keys(PERMISSION_MAP).length}`);
  console.log('\n⚠️  IMPORTANT: Review changes before committing!');
  console.log('   Run: git diff pages/');
}

main();
