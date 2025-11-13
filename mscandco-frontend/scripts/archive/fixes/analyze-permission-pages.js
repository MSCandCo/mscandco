/**
 * Analyze Permission Pages
 *
 * Scans all pages to identify which ones:
 * 1. Use client-side permission checks (need fixing)
 * 2. Already have server-side checks (done)
 * 3. Don't have permission checks at all
 */

const fs = require('fs');
const path = require('path');

const PAGES_DIR = path.join(__dirname, 'pages');

// Recursively find all .js files in pages directory
function findJSFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Skip api and _* directories
      if (!file.startsWith('_') && file !== 'api') {
        findJSFiles(filePath, fileList);
      }
    } else if (file.endsWith('.js')) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

// Analyze a single file
function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const relativePath = path.relative(PAGES_DIR, filePath);

  const result = {
    path: relativePath,
    hasClientSideCheck: false,
    hasServerSideCheck: false,
    hasGetServerSideProps: false,
    usesUsePermissions: false,
    permissionCheckLine: null,
    permission: null
  };

  // Check for getServerSideProps
  if (content.includes('getServerSideProps')) {
    result.hasGetServerSideProps = true;
  }

  // Check for requirePermission (server-side check)
  if (content.includes('requirePermission')) {
    result.hasServerSideCheck = true;

    // Try to extract permission name
    const requirePermissionMatch = content.match(/requirePermission\(context,\s*['"]([^'"]+)['"]/);
    if (requirePermissionMatch) {
      result.permission = requirePermissionMatch[1];
    }
  }

  // Check for usePermissions hook (client-side check)
  if (content.includes('usePermissions')) {
    result.usesUsePermissions = true;
  }

  // Check for client-side permission checks in useEffect
  const lines = content.split('\n');
  lines.forEach((line, index) => {
    if (line.includes('hasPermission') && line.includes('useEffect')) {
      result.hasClientSideCheck = true;
      result.permissionCheckLine = index + 1;
    }

    // Try to extract permission name from hasPermission call
    if (!result.permission && line.includes('hasPermission(')) {
      const match = line.match(/hasPermission\(['"]([^'"]+)['"]\)/);
      if (match) {
        result.permission = match[1];
      }
    }
  });

  return result;
}

// Main analysis
function main() {
  console.log('🔍 Analyzing permission checks in pages...\n');

  const jsFiles = findJSFiles(PAGES_DIR);

  const needsFixing = [];
  const alreadyFixed = [];
  const noPermissionCheck = [];

  jsFiles.forEach(filePath => {
    const analysis = analyzeFile(filePath);

    if (analysis.hasServerSideCheck) {
      alreadyFixed.push(analysis);
    } else if (analysis.usesUsePermissions || analysis.hasClientSideCheck) {
      needsFixing.push(analysis);
    } else {
      // Page doesn't use permissions at all (may be public)
      noPermissionCheck.push(analysis);
    }
  });

  // Print results
  console.log('='.repeat(80));
  console.log(`✅ ALREADY FIXED (${alreadyFixed.length} pages) - Server-side checks implemented`);
  console.log('='.repeat(80));
  alreadyFixed.forEach(file => {
    console.log(`  ✅ ${file.path}`);
    if (file.permission) {
      console.log(`      Permission: ${file.permission}`);
    }
  });

  console.log('\n');
  console.log('='.repeat(80));
  console.log(`❌ NEEDS FIXING (${needsFixing.length} pages) - Client-side checks only`);
  console.log('='.repeat(80));
  needsFixing.forEach(file => {
    console.log(`  ❌ ${file.path}`);
    if (file.permission) {
      console.log(`      Permission: ${file.permission}`);
    }
    if (file.permissionCheckLine) {
      console.log(`      Check at line: ${file.permissionCheckLine}`);
    }
  });

  console.log('\n');
  console.log('='.repeat(80));
  console.log(`ℹ️  NO PERMISSION CHECK (${noPermissionCheck.length} pages) - May be public pages`);
  console.log('='.repeat(80));
  noPermissionCheck.slice(0, 10).forEach(file => {
    console.log(`  ℹ️  ${file.path}`);
  });
  if (noPermissionCheck.length > 10) {
    console.log(`  ... and ${noPermissionCheck.length - 10} more`);
  }

  console.log('\n');
  console.log('='.repeat(80));
  console.log('SUMMARY');
  console.log('='.repeat(80));
  console.log(`✅ Fixed: ${alreadyFixed.length}`);
  console.log(`❌ Needs Fixing: ${needsFixing.length}`);
  console.log(`ℹ️  No Checks: ${noPermissionCheck.length}`);
  console.log(`📊 Total Pages: ${jsFiles.length}`);
  console.log(`\n📈 Progress: ${((alreadyFixed.length / (alreadyFixed.length + needsFixing.length)) * 100).toFixed(1)}% complete`);

  // Write detailed report
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalPages: jsFiles.length,
      alreadyFixed: alreadyFixed.length,
      needsFixing: needsFixing.length,
      noChecks: noPermissionCheck.length,
      percentComplete: ((alreadyFixed.length / (alreadyFixed.length + needsFixing.length)) * 100).toFixed(1)
    },
    alreadyFixed,
    needsFixing,
    noPermissionCheck
  };

  fs.writeFileSync(
    path.join(__dirname, 'permission-pages-analysis.json'),
    JSON.stringify(report, null, 2)
  );

  console.log('\n📝 Detailed report saved to: permission-pages-analysis.json');
}

main();
