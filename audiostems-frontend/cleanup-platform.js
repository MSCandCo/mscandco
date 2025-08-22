#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧹 THOROUGH PLATFORM CLEANUP - REMOVING ALL JUNK');
console.log('===============================================\n');

// Files and directories to clean up
const cleanupTargets = {
  // Temporary SQL files (keep only essential ones)
  sqlFiles: [
    'CHECK_DISTRIBUTION_PARTNER_ROLE.sql',
    'CHECK_TABLE_STRUCTURE.sql', 
    'FIX_DISTRIBUTION_PARTNER_ROLE_CORRECT.sql',
    'SIMPLE_TABLE_CHECK.sql',
    'VIEW_USER_ROLE_ENUM.sql',
    'CHECK_WALLET_TABLE_STRUCTURE.sql',
    'FIX_DATABASE_SCHEMA_COLUMNS.sql'
  ],
  
  // Broken/backup/old files
  brokenFiles: [
    'lib/user-utils-old.js',
    'pages/labeladmin/artists-broken.js',
    'pages/labeladmin/artists-working.js', 
    'pages/admin/users-old.js',
    'pages/admin/content-old.js',
    'pages/artist/profile-broken.js',
    'pages/artist/profile-simplified.js',
    'pages/artist/profile-working.js',
    'pages/artist/analytics-simple.js',
    'pages/artist/analytics-simple-backup.js',
    'register-simple-backup.js',
    'vercel.json.backup'
  ],

  // Test and debug files
  testFiles: [
    'create-test-users-simple.js',
    'create-test-users.js',
    'test-login-debug.js',
    'test-all-fields.js',
    'test-sms-setup.js',
    'test-webhook-secret.js',
    'debug-profile-lookup.js',
    'debug-supabase-auth.js',
    'check-auth-hooks.sql',
    'check-database-objects.js',
    'check-database-tables.js',
    'check-missing-types.js',
    'check-table-structure.js',
    'check-table-structures.js',
    'simple-table-check.js',
    'quick-database-check.js'
  ],

  // Documentation files that are outdated
  outdatedDocs: [
    'CLEAN_DATABASE_GUIDE.md',
    'CLEAN_SETUP_NEXT_STEPS.md',
    'CORRECTED_BUSINESS_WORKFLOW.md',
    'FIX_LOGIN_INFINITE_LOADING.md',
    'FRONTEND_IMPLEMENTATION_SUMMARY.md',
    'PROFESSIONAL_SIZING_FIX.md',
    'STRAPI_CLEANUP_SUMMARY.md',
    'SUPABASE_EMAIL_REDIRECT_SETUP.md',
    'SUPABASE_SMS_SETUP.md',
    'URGENT_DATABASE_UPDATE.md',
    'URGENT_REGISTRATION_FIX.md'
  ],

  // Unused API files
  unusedApiFiles: [
    'pages/api/artist/get-profile.js',
    'pages/api/artist/profile-broken.js',
    'pages/api/artist/update-profile.js',
    'pages/api/profile/change-request-old.js'
  ]
};

let totalDeleted = 0;

function deleteFiles(fileList, category) {
  console.log(`\n📁 Cleaning ${category}:`);
  
  fileList.forEach(file => {
    if (fs.existsSync(file)) {
      try {
        fs.unlinkSync(file);
        console.log(`  ✅ Deleted: ${file}`);
        totalDeleted++;
      } catch (error) {
        console.log(`  ❌ Failed to delete: ${file} - ${error.message}`);
      }
    } else {
      console.log(`  ℹ️  Not found: ${file}`);
    }
  });
}

function cleanupDatabase() {
  console.log(`\n📁 Cleaning database directory:`);
  
  if (fs.existsSync('database')) {
    const dbFiles = fs.readdirSync('database');
    const temporaryFiles = dbFiles.filter(file => 
      file.includes('CHECK_') || 
      file.includes('FIX_') || 
      file.includes('SIMPLE_') ||
      file.includes('EMERGENCY_') ||
      file.includes('URGENT_') ||
      file.includes('TEMP_') ||
      file.includes('DEBUG_')
    );
    
    temporaryFiles.forEach(file => {
      try {
        fs.unlinkSync(path.join('database', file));
        console.log(`  ✅ Deleted: database/${file}`);
        totalDeleted++;
      } catch (error) {
        console.log(`  ❌ Failed to delete: database/${file}`);
      }
    });
  }
}

function cleanupRootFiles() {
  console.log(`\n📁 Cleaning root directory junk:`);
  
  const rootJunk = [
    'add-missing-functions.sql',
    'add-missing-rls-policies.sql', 
    'add-missing-types-and-policies.sql',
    'bypass-auth-triggers.js',
    'check-missing-types.js',
    'disable-all-triggers.sql',
    'disable-handle-new-user.sql',
    'fix-missing-database-elements.sql',
    'fix-missing-profiles.js',
    'Dockerfile',
    'Makefile',
    'dev.log'
  ];
  
  rootJunk.forEach(file => {
    if (fs.existsSync(file)) {
      try {
        fs.unlinkSync(file);
        console.log(`  ✅ Deleted: ${file}`);
        totalDeleted++;
      } catch (error) {
        console.log(`  ❌ Failed to delete: ${file}`);
      }
    }
  });
}

function cleanupEnvTemplates() {
  console.log(`\n📁 Cleaning environment templates (keeping essential ones):`);
  
  const envFilesToKeep = ['env.vercel.template'];
  const envFiles = ['env.example', 'env.local.template', 'env.staging.template'];
  
  envFiles.forEach(file => {
    if (!envFilesToKeep.includes(file) && fs.existsSync(file)) {
      try {
        fs.unlinkSync(file);
        console.log(`  ✅ Deleted: ${file}`);
        totalDeleted++;
      } catch (error) {
        console.log(`  ❌ Failed to delete: ${file}`);
      }
    }
  });
}

// Execute cleanup
console.log('Starting comprehensive cleanup...\n');

deleteFiles(cleanupTargets.sqlFiles, 'Temporary SQL Files');
deleteFiles(cleanupTargets.brokenFiles, 'Broken/Backup Files');
deleteFiles(cleanupTargets.testFiles, 'Test/Debug Files');
deleteFiles(cleanupTargets.outdatedDocs, 'Outdated Documentation');
deleteFiles(cleanupTargets.unusedApiFiles, 'Unused API Files');

cleanupDatabase();
cleanupRootFiles();
cleanupEnvTemplates();

console.log(`\n🎉 CLEANUP COMPLETE!`);
console.log(`📊 Total files deleted: ${totalDeleted}`);
console.log(`✨ Platform is now clean and optimized!`);
console.log(`\n🚀 Ready for production with no junk files!`);
