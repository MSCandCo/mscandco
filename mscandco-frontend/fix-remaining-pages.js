/**
 * Fix Remaining Permission Pages
 *
 * This script fixes the 15 remaining pages with permission issues:
 * - Add missing imports
 * - Remove client-side redirects
 * - Add missing getServerSideProps where needed
 */

const fs = require('fs');
const path = require('path');

const PAGES_TO_FIX = [
  // Missing import only
  { file: 'pages/artist/roster.js', issue: 'missing_import' },
  { file: 'pages/labeladmin/analytics.js', issue: 'missing_import' },
  { file: 'pages/labeladmin/releases.js', issue: 'missing_import' },
  { file: 'pages/labeladmin/roster.js', issue: 'missing_import' },

  // Client-side redirects to remove
  { file: 'pages/admin/settings.js', issue: 'client_redirect' },
  { file: 'pages/admin/profile/index.js', issue: 'client_redirect' },
  { file: 'pages/labeladmin/artists.js', issue: 'client_redirect' },
  { file: 'pages/labeladmin/profile/index.js', issue: 'client_redirect' },
  { file: 'pages/distribution/queue.js', issue: 'client_redirect' },
  { file: 'pages/distribution/revisions.js', issue: 'client_redirect' },
  { file: 'pages/superadmin/dashboard.js', issue: 'client_redirect' },

  // Multiple issues
  { file: 'pages/artist/settings.js', issue: 'missing_getServerSideProps' },
  { file: 'pages/labeladmin/settings.js', issue: 'missing_getServerSideProps' },
  { file: 'pages/distributionpartner/settings.js', issue: 'missing_getServerSideProps' },
  { file: 'pages/test-rbac.js', issue: 'skip' }, // Test page, low priority
];

console.log('🔧 Starting Permission Page Fixes...\n');

let fixed = 0;
let skipped = 0;
let errors = 0;

for (const page of PAGES_TO_FIX) {
  const filePath = path.join(__dirname, page.file);

  if (page.issue === 'skip') {
    console.log(`⏭️  Skipping: ${page.file} (test page)`);
    skipped++;
    continue;
  }

  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Fix 1: Add missing import
    if (page.issue === 'missing_import' || page.issue === 'missing_getServerSideProps') {
      // Check if import already exists
      if (!content.includes("from '@/lib/serverSidePermissions'") &&
          !content.includes('from "@/lib/serverSidePermissions"')) {

        // Find the last import statement
        const importLines = content.split('\n').filter(line => line.trim().startsWith('import '));
        const lastImport = importLines[importLines.length - 1];

        if (lastImport) {
          content = content.replace(
            lastImport,
            lastImport + "\nimport { requirePermission } from '@/lib/serverSidePermissions';"
          );
          modified = true;
          console.log(`✅ Added import to: ${page.file}`);
        }
      }
    }

    // Fix 2: Remove client-side permission redirects
    if (page.issue === 'client_redirect' || page.issue === 'missing_getServerSideProps') {
      // Pattern 1: useEffect with router.push and hasPermission check
      const pattern1 = /useEffect\(\(\) => \{[^}]*hasPermission[^}]*router\.push[^}]*\}, \[[^\]]*\]\);?\s*/g;
      if (pattern1.test(content)) {
        content = content.replace(pattern1, '');
        modified = true;
        console.log(`✅ Removed client-side redirect (useEffect) from: ${page.file}`);
      }

      // Pattern 2: useEffect with permissionsLoading check
      const pattern2 = /useEffect\(\(\) => \{[^}]*permissionsLoading[^}]*router\.push[^}]*\}, \[[^\]]*permissionsLoading[^\]]*\]\);?\s*/g;
      if (pattern2.test(content)) {
        content = content.replace(pattern2, '');
        modified = true;
        console.log(`✅ Removed permission loading check from: ${page.file}`);
      }

      // Pattern 3: Direct hasPermission checks before render
      const pattern3 = /if \(!permissionsLoading && user && !hasPermission\([^)]+\)\) \{\s*router\.push\([^)]+\);\s*\}/g;
      if (pattern3.test(content)) {
        content = content.replace(pattern3, '');
        modified = true;
        console.log(`✅ Removed direct permission check from: ${page.file}`);
      }
    }

    //  Fix 3: For pages missing getServerSideProps entirely, add a basic template
    if (page.issue === 'missing_getServerSideProps') {
      if (!content.includes('getServerSideProps')) {
        // Determine the permission based on the file path
        let permission = 'settings:access'; // default

        // Insert getServerSideProps before the export default
        const exportMatch = content.match(/export default function \w+/);
        if (exportMatch) {
          const getServerSidePropsCode = `\n// Server-side permission check BEFORE page renders
export async function getServerSideProps(context) {
  const auth = await requirePermission(context, '${permission}');

  if (auth.redirect) {
    return { redirect: auth.redirect };
  }

  return { props: { user: auth.user } };
}

`;
          content = content.replace(exportMatch[0], getServerSidePropsCode + exportMatch[0]);
          modified = true;
          console.log(`✅ Added getServerSideProps to: ${page.file}`);
        }
      }
    }

    // Write back if modified
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      fixed++;
      console.log(`✅ Fixed: ${page.file}\n`);
    } else {
      console.log(`⚠️  No changes needed: ${page.file}\n`);
    }

  } catch (error) {
    console.error(`❌ Error fixing ${page.file}:`, error.message);
    errors++;
  }
}

console.log('\n' + '='.repeat(60));
console.log('\n📊 FIX SUMMARY\n');
console.log(`Total Pages: ${PAGES_TO_FIX.length}`);
console.log(`✅ Fixed: ${fixed}`);
console.log(`⏭️  Skipped: ${skipped}`);
console.log(`❌ Errors: ${errors}`);
console.log(`\n✨ Run verification again: node verify-permission-implementation.js\n`);
